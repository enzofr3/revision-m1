/* ===========================================
   CEDEO Ride — Smart Routines (Feature 7)
   Détection automatique des habitudes de trajet
   =========================================== */

const Routines = (() => {
  const STORAGE_KEY = 'cedeoride_routines';

  function getRoutines() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveRoutines(routines) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  }

  function getUserRoutines(userId) {
    return getRoutines().filter(r => r.userId === userId);
  }

  function detectRoutines(userId) {
    const trips = CedeoStore.getTripsByDriver(userId);
    const bookings = CedeoStore.getBookingsByUser(userId)
      .map(b => CedeoStore.getTrip(b.tripId))
      .filter(Boolean);

    const allTrips = [...trips, ...bookings];
    const patterns = {};

    allTrips.forEach(t => {
      const day = new Date(t.departureTime).getDay();
      const hour = new Date(t.departureTime).getHours();
      const key = `${t.fromId || t.fromName}_${t.toId || t.toName}_${day}_${hour}`;

      if (!patterns[key]) {
        patterns[key] = {
          fromName: t.fromName,
          toName: t.toName,
          fromId: t.fromId,
          toId: t.toId,
          day,
          hour,
          count: 0,
          trips: []
        };
      }
      patterns[key].count++;
      patterns[key].trips.push(t);
    });

    // A routine is detected when 3+ similar trips exist
    return Object.values(patterns)
      .filter(p => p.count >= 3)
      .sort((a, b) => b.count - a.count)
      .map(p => ({
        id: Utils.generateId(),
        userId,
        fromName: p.fromName,
        toName: p.toName,
        fromId: p.fromId,
        toId: p.toId,
        day: p.day,
        hour: p.hour,
        frequency: p.count,
        autoPublish: false,
        detectedAt: new Date().toISOString()
      }));
  }

  function enableAutoPublish(routineId) {
    const routines = getRoutines();
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
      routine.autoPublish = true;
      saveRoutines(routines);
    }
  }

  function disableAutoPublish(routineId) {
    const routines = getRoutines();
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
      routine.autoPublish = false;
      saveRoutines(routines);
    }
  }

  function saveDetectedRoutines(userId) {
    const detected = detectRoutines(userId);
    const existing = getUserRoutines(userId);
    const routines = getRoutines();

    detected.forEach(d => {
      const exists = existing.find(e =>
        e.fromName === d.fromName && e.toName === d.toName && e.day === d.day && e.hour === d.hour
      );
      if (!exists) {
        routines.push(d);
      }
    });

    saveRoutines(routines);
    return detected;
  }

  function autoPublishRoutines(userId) {
    const routines = getUserRoutines(userId).filter(r => r.autoPublish);
    const today = new Date();
    const dayOfWeek = today.getDay();

    routines.forEach(routine => {
      if (routine.day !== dayOfWeek) return;

      // Check if a trip was already published today for this routine
      const existingToday = CedeoStore.getTripsByDriver(userId).find(t => {
        const tripDate = new Date(t.departureTime);
        return tripDate.toDateString() === today.toDateString() &&
               t.fromName === routine.fromName &&
               t.toName === routine.toName;
      });

      if (existingToday) return;

      // Auto-publish
      const departureTime = new Date();
      departureTime.setHours(routine.hour, 0, 0, 0);

      if (departureTime > today) {
        let distanceKm = 0;
        let durationMin = 0;
        if (routine.fromId && routine.toId) {
          distanceKm = Utils.getDistanceBetween(routine.fromId, routine.toId);
          durationMin = Utils.estimateDuration(distanceKm);
        }

        CedeoStore.createTrip({
          driverId: userId,
          fromName: routine.fromName,
          toName: routine.toName,
          fromId: routine.fromId,
          toId: routine.toId,
          departureTime: departureTime.toISOString(),
          seats: 3,
          distanceKm,
          durationMin,
          comment: 'Trajet auto-publié (routine)',
          recurring: false,
          tripType: 'routine'
        });
      }
    });
  }

  const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  function renderRoutinesPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) { window.App.navigate('/login'); return; }

    // Detect fresh routines
    const detected = detectRoutines(currentUser.id);
    const saved = getUserRoutines(currentUser.id);

    app.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4)">
        <div class="page-header">
          <h1 class="page-title">Mes Routines</h1>
          <p class="page-subtitle">Trajets détectés automatiquement selon vos habitudes</p>
        </div>

        ${detected.length > 0 ? `
          <div style="margin-bottom:var(--space-6)">
            <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Routines détectées</h2>
            <div style="display:flex;flex-direction:column;gap:var(--space-3)">
              ${detected.map(r => {
                const savedRoutine = saved.find(s =>
                  s.fromName === r.fromName && s.toName === r.toName && s.day === r.day
                );
                const isAuto = savedRoutine?.autoPublish || false;
                return `
                  <div class="card card-compact">
                    <div style="display:flex;align-items:center;gap:var(--space-4)">
                      <div style="width:48px;height:48px;border-radius:var(--radius-lg);background:var(--color-primary-bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🔄</div>
                      <div style="flex:1">
                        <div style="font-weight:var(--font-weight-semibold);font-size:var(--font-size-sm)">
                          ${Utils.escapeHtml(r.fromName)} → ${Utils.escapeHtml(r.toName)}
                        </div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">
                          ${DAY_NAMES[r.day]} · ~${r.hour}h · ${r.frequency} trajets détectés
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:var(--space-2)">
                        <label class="form-checkbox" style="font-size:var(--font-size-xs)">
                          <input type="checkbox" ${isAuto ? 'checked' : ''} onchange="Routines.toggleAutoPublish('${r.fromName}','${r.toName}',${r.day},${r.hour},this.checked)">
                          Auto-publier
                        </label>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <div class="card" style="margin-bottom:var(--space-6)">
            <div class="empty-state">
              <div style="font-size:48px;margin-bottom:var(--space-4)">🔍</div>
              <div class="empty-state-title">Pas encore de routine détectée</div>
              <div class="empty-state-text">Continuez à utiliser CEDEO Ride et vos habitudes seront détectées automatiquement après 3 trajets similaires.</div>
            </div>
          </div>
        `}

        <div class="card" style="background:var(--color-eco-bg);border-color:rgba(34,197,94,0.2)">
          <div style="display:flex;align-items:flex-start;gap:var(--space-3)">
            <span style="font-size:24px">💡</span>
            <div>
              <div style="font-weight:var(--font-weight-semibold);margin-bottom:var(--space-1)">Comment ça marche ?</div>
              <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary)">
                L'algorithme analyse vos trajets passés. Quand il détecte 3+ trajets similaires (même itinéraire, même jour, même heure), il vous propose de les automatiser. Activez l'auto-publication et vos trajets seront créés automatiquement chaque semaine.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function toggleAutoPublish(fromName, toName, day, hour, enabled) {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return;

    const routines = getRoutines();
    let routine = routines.find(r =>
      r.userId === currentUser.id && r.fromName === fromName && r.toName === toName && r.day === day
    );

    if (!routine) {
      routine = {
        id: Utils.generateId(),
        userId: currentUser.id,
        fromName,
        toName,
        day,
        hour,
        autoPublish: enabled,
        detectedAt: new Date().toISOString()
      };
      routines.push(routine);
    } else {
      routine.autoPublish = enabled;
    }

    saveRoutines(routines);
    window.App.showToast(enabled ? 'Auto-publication activée !' : 'Auto-publication désactivée', enabled ? 'success' : 'info');
  }

  return {
    renderRoutinesPage,
    detectRoutines,
    getUserRoutines,
    saveDetectedRoutines,
    autoPublishRoutines,
    enableAutoPublish,
    disableAutoPublish,
    toggleAutoPublish,
    DAY_NAMES
  };
})();
