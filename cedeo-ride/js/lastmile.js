/* ===========================================
   CEDEO Ride — Dernier Kilomètre (Feature 10)
   Connexion gare/transport → agence
   =========================================== */

const LastMile = (() => {
  const STATIONS = [
    { id: 'gare-rennes', name: 'Gare de Rennes', lat: 48.1035, lng: -1.6726, type: 'train' },
    { id: 'gare-stmalo', name: 'Gare de Saint-Malo', lat: 48.6443, lng: -1.9952, type: 'train' },
    { id: 'gare-dinan', name: 'Gare de Dinan', lat: 48.4500, lng: -2.0550, type: 'train' },
    { id: 'gare-fougeres', name: 'Gare routière de Fougères', lat: 48.3530, lng: -1.2090, type: 'bus' },
    { id: 'gare-vitré', name: 'Gare de Vitré', lat: 48.1230, lng: -1.2150, type: 'train' },
    { id: 'gare-redon', name: 'Gare de Redon', lat: 47.6515, lng: -2.0845, type: 'train' },
    { id: 'gare-laroche', name: 'Gare de La Roche-sur-Yon', lat: 46.6720, lng: -1.4340, type: 'train' }
  ];

  function findNearestStation(agencyId) {
    const agency = Utils.getAgencyById(agencyId);
    if (!agency) return null;

    let nearest = null;
    let minDist = Infinity;

    STATIONS.forEach(s => {
      const dist = Utils.calculateDistance(agency.lat, agency.lng, s.lat, s.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = { ...s, distance: Math.round(dist * 10) / 10 };
      }
    });

    return nearest;
  }

  function searchLastMileTrips(stationId) {
    return CedeoStore.getTrips().filter(t =>
      t.status === 'active' &&
      t.tripType === 'last_mile' &&
      new Date(t.departureTime) > new Date()
    );
  }

  function renderLastMilePage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) { window.App.navigate('/login'); return; }

    const nearestStation = findNearestStation(currentUser.agencyId);
    const lastMileTrips = CedeoStore.getTrips().filter(t =>
      t.status === 'active' &&
      t.tripType === 'last_mile' &&
      new Date(t.departureTime) > new Date()
    );

    app.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4)">
        <div class="page-header">
          <h1 class="page-title">Dernier Kilomètre</h1>
          <p class="page-subtitle">Connexion gare/transport en commun → agence CEDEO</p>
        </div>

        <!-- Photo banner -->
        <div class="photo-card" style="margin-bottom:var(--space-6);aspect-ratio:21/9">
          <img src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80" alt="Gare" loading="lazy">
          <div class="photo-card-overlay">
            <div style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold)">Arrivez en train, repartez avec un collègue</div>
            <div style="font-size:var(--font-size-sm);opacity:0.9">Le dernier kilomètre n'est plus un problème</div>
          </div>
        </div>

        <!-- Nearest station -->
        ${nearestStation ? `
          <div class="card" style="margin-bottom:var(--space-6)">
            <div style="display:flex;align-items:center;gap:var(--space-4)">
              <div style="width:48px;height:48px;border-radius:var(--radius-full);background:var(--color-primary-bg);display:flex;align-items:center;justify-content:center;font-size:24px">
                ${nearestStation.type === 'train' ? AppIcons.i('train', 24, 'var(--color-primary)') : AppIcons.i('bus', 24, 'var(--color-primary)')}
              </div>
              <div style="flex:1">
                <div style="font-weight:var(--font-weight-semibold)">${nearestStation.name}</div>
                <div style="font-size:var(--font-size-sm);color:var(--color-text-secondary)">${nearestStation.distance} km de votre agence</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Proposer un trajet dernier km -->
        <div class="card" style="margin-bottom:var(--space-6)">
          <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Proposer un trajet dernier km</h2>
          <form id="lastmile-form">
            <div style="display:flex;flex-direction:column;gap:var(--space-4)">
              <div class="form-group">
                <label class="form-label">Gare / Station de départ *</label>
                <select class="form-select" id="lm-station" required>
                  <option value="">Sélectionnez...</option>
                  ${STATIONS.map(s => `<option value="${s.id}">${s.name} (${s.type === 'train' ? 'Train' : 'Bus'})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Destination (agence) *</label>
                <select class="form-select" id="lm-agency" required>
                  <option value="">Sélectionnez...</option>
                  ${Utils.AGENCIES.map(a => `<option value="${a.id}" ${a.id === currentUser.agencyId ? 'selected' : ''}>${a.shortName}</option>`).join('')}
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Date d'arrivée du train</label>
                  <input class="form-input" type="date" id="lm-date" min="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Heure d'arrivée</label>
                  <input class="form-input" type="time" id="lm-time" value="09:00" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Places disponibles</label>
                <select class="form-select" id="lm-seats">
                  <option value="1">1 place</option>
                  <option value="2" selected>2 places</option>
                  <option value="3">3 places</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%">Proposer ce trajet</button>
            </div>
          </form>
        </div>

        <!-- Gares disponibles -->
        <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Gares et stations</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(250px, 1fr));gap:var(--space-3);margin-bottom:var(--space-6)">
          ${STATIONS.map(s => {
            const nearestAgency = Utils.AGENCIES.reduce((closest, a) => {
              const dist = Utils.calculateDistance(s.lat, s.lng, a.lat, a.lng);
              return dist < (closest.dist || Infinity) ? { agency: a, dist } : closest;
            }, {});
            return `
              <div class="card card-compact">
                <div style="display:flex;align-items:center;gap:var(--space-3)">
                  <span>${s.type === 'train' ? AppIcons.i('train', 24, 'var(--color-primary)') : AppIcons.i('bus', 24, '#16a34a')}</span>
                  <div>
                    <div style="font-weight:var(--font-weight-medium);font-size:var(--font-size-sm)">${s.name}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">
                      → ${nearestAgency.agency?.shortName || ''} (${Math.round(nearestAgency.dist)} km)
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${lastMileTrips.length > 0 ? `
          <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Trajets derniers km disponibles</h2>
          <div class="search-results-list">
            ${lastMileTrips.map(t => Trips.renderTripCard(t)).join('')}
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('lastmile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const stationId = document.getElementById('lm-station').value;
      const agencyId = document.getElementById('lm-agency').value;
      const date = document.getElementById('lm-date').value;
      const time = document.getElementById('lm-time').value;
      const seats = parseInt(document.getElementById('lm-seats').value);

      if (!stationId || !agencyId || !date || !time) {
        window.App.showToast('Remplissez tous les champs', 'warning');
        return;
      }

      const station = STATIONS.find(s => s.id === stationId);
      const agency = Utils.getAgencyById(agencyId);
      const dist = station && agency ?
        Math.round(Utils.calculateDistance(station.lat, station.lng, agency.lat, agency.lng)) : 0;

      CedeoStore.createTrip({
        driverId: currentUser.id,
        fromName: station.name,
        toName: agency.name,
        fromId: stationId,
        toId: agencyId,
        departureTime: new Date(`${date}T${time}:00`).toISOString(),
        seats,
        distanceKm: dist,
        durationMin: Utils.estimateDuration(dist),
        tripType: 'last_mile',
        comment: 'Trajet dernier kilomètre gare → agence'
      });

      window.App.showToast('Trajet dernier km publié !', 'success');
      window.App.navigate('/last-mile');
    });
  }

  return {
    renderLastMilePage,
    findNearestStation,
    searchLastMileTrips,
    STATIONS
  };
})();
