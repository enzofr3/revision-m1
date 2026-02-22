/* ===========================================
   CEDEO Ride — SOS Trajet (Feature 6)
   Bouton d'urgence, alertes broadcast
   =========================================== */

const SOS = (() => {
  const STORAGE_KEY = 'cedeoride_sos';

  function getSOSAlerts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveSOSAlerts(alerts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }

  function createSOSAlert(alertData) {
    const alerts = getSOSAlerts();
    const alert = {
      id: Utils.generateId(),
      createdAt: new Date().toISOString(),
      status: 'active',
      responses: [],
      ...alertData
    };
    alerts.push(alert);
    saveSOSAlerts(alerts);

    // Broadcast to nearby users
    broadcastSOS(alert);
    return alert;
  }

  function respondToSOS(alertId, userId, message) {
    const alerts = getSOSAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    alert.responses.push({
      userId,
      message,
      respondedAt: new Date().toISOString()
    });

    if (alert.status === 'active') {
      alert.status = 'responded';
    }

    saveSOSAlerts(alerts);

    // Notify the person who sent SOS
    const responder = CedeoStore.getUser(userId);
    CedeoStore.createNotification({
      userId: alert.userId,
      type: 'sos_response',
      title: 'Réponse SOS !',
      message: `${responder ? responder.firstName : 'Un collègue'} peut vous dépanner${message ? ': ' + message : ''} !`,
      icon: 'hero'
    });

    // Give "Sauveteur" achievement
    CedeoStore.createNotification({
      userId,
      type: 'sos_hero',
      title: 'Badge Sauveteur !',
      message: 'Merci d\'avoir répondu à un SOS. Vous avez le badge Sauveteur !',
      icon: 'hero'
    });
  }

  function resolveSOSAlert(alertId) {
    const alerts = getSOSAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      saveSOSAlerts(alerts);
    }
  }

  function broadcastSOS(alert) {
    const users = CedeoStore.getUsers();
    const sender = CedeoStore.getUser(alert.userId);
    const agency = Utils.getAgencyById(alert.agencyId);

    users.forEach(u => {
      if (u.id === alert.userId) return;
      // Only notify users from same or nearby agencies
      if (alert.agencyId && u.agencyId !== alert.agencyId) {
        // Check distance between agencies
        const userAgency = Utils.getAgencyById(u.agencyId);
        if (userAgency && agency) {
          const dist = Utils.calculateDistance(
            agency.lat, agency.lng,
            userAgency.lat, userAgency.lng
          );
          if (dist > 50) return; // Only within 50km
        }
      }

      CedeoStore.createNotification({
        userId: u.id,
        type: 'sos_alert',
        title: 'SOS Trajet !',
        message: `${sender ? sender.firstName : 'Un collègue'}${agency ? ' (' + agency.shortName + ')' : ''} a besoin d'un trajet d'urgence${alert.destination ? ' vers ' + alert.destination : ''} !`,
        icon: 'siren',
        sosAlertId: alert.id
      });
    });
  }

  function getActiveAlerts() {
    return getSOSAlerts().filter(a => a.status === 'active' || a.status === 'responded');
  }

  function showSOSModal() {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) { window.App.navigate('/login'); return; }

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal" style="border-top:4px solid var(--color-error)">
        <div class="modal-header">
          <div class="modal-title" style="color:var(--color-error)">${AppIcons.i('siren', 20, 'var(--color-error)')} SOS Trajet</div>
          <button class="modal-close" id="close-sos-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4)">
            Envoyez une alerte à vos collègues proches. Un trajet d'urgence sera diffusé.
          </p>
          <div class="form-group" style="margin-bottom:var(--space-4)">
            <label class="form-label">Destination souhaitée *</label>
            <select class="form-select" id="sos-destination">
              <option value="">Sélectionnez...</option>
              ${Utils.AGENCIES.map(a => `<option value="${a.name}" ${a.id === currentUser.agencyId ? 'selected' : ''}>${a.shortName}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:var(--space-4)">
            <label class="form-label">Situation</label>
            <select class="form-select" id="sos-reason">
              <option value="panne">Panne de véhicule</option>
              <option value="urgence">Urgence personnelle</option>
              <option value="greve">Grève transports</option>
              <option value="retard">Retard / raté le covoiturage</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:var(--space-4)">
            <label class="form-label">Message (optionnel)</label>
            <textarea class="form-textarea" id="sos-message" placeholder="Donnez plus de détails..." rows="2"></textarea>
          </div>
          <button class="btn btn-accent btn-lg" id="send-sos-btn" style="width:100%">
            ${AppIcons.i('siren', 18)} Envoyer l'alerte SOS
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    backdrop.querySelector('#close-sos-modal').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

    backdrop.querySelector('#send-sos-btn').addEventListener('click', () => {
      const destination = document.getElementById('sos-destination').value;
      const reason = document.getElementById('sos-reason').value;
      const message = document.getElementById('sos-message').value.trim();

      if (!destination) {
        window.App.showToast('Sélectionnez une destination', 'warning');
        return;
      }

      createSOSAlert({
        userId: currentUser.id,
        agencyId: currentUser.agencyId,
        destination,
        reason,
        message
      });

      backdrop.remove();
      window.App.showToast('Alerte SOS envoyée ! Vos collègues sont notifiés.', 'success');
    });
  }

  function renderSOSFAB() {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return '';

    const activeAlerts = getActiveAlerts();
    const hasActive = activeAlerts.some(a => a.userId !== currentUser.id);

    return `
      <div class="fab fab-sos" onclick="SOS.showSOSModal()" title="SOS Trajet">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        ${hasActive ? '<span class="fab-badge">!</span>' : ''}
      </div>
    `;
  }

  return {
    showSOSModal,
    createSOSAlert,
    respondToSOS,
    resolveSOSAlert,
    getActiveAlerts,
    getSOSAlerts,
    renderSOSFAB
  };
})();
