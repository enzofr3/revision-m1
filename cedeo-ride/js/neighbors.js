/* ===========================================
   CEDEO Ride — Voisins CEDEO (Feature 1)
   Radar de proximité GPS, consentement mutuel
   =========================================== */

const Neighbors = (() => {
  const STORAGE_KEY = 'cedeoride_neighbors';

  function getNeighborData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }

  function saveNeighborData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getUserLocation(userId) {
    const data = getNeighborData();
    return data[userId] || null;
  }

  function setUserLocation(userId, location) {
    const data = getNeighborData();
    data[userId] = {
      ...location,
      updatedAt: new Date().toISOString()
    };
    saveNeighborData(data);
  }

  /**
   * Haversine formula
   */
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function findNearbyUsers(userId, radiusKm = 10) {
    const myLocation = getUserLocation(userId);
    if (!myLocation || !myLocation.lat) return [];

    const allData = getNeighborData();
    const users = CedeoStore.getUsers();
    const nearby = [];

    users.forEach(u => {
      if (u.id === userId) return;
      const loc = allData[u.id];
      if (!loc || !loc.lat || loc.privacyLevel === 'hidden') return;

      const distance = haversineDistance(myLocation.lat, myLocation.lng, loc.lat, loc.lng);
      if (distance <= radiusKm) {
        nearby.push({
          user: u,
          distance: Math.round(distance * 10) / 10,
          commune: loc.commune || 'Commune inconnue',
          privacyLevel: loc.privacyLevel || 'commune',
          isConsented: loc.consentedUsers?.includes(userId) || false
        });
      }
    });

    return nearby.sort((a, b) => a.distance - b.distance);
  }

  function requestConsent(fromUserId, toUserId) {
    CedeoStore.createNotification({
      userId: toUserId,
      type: 'neighbor_request',
      title: 'Demande de voisinage',
      message: `Un collègue proche de chez vous souhaite échanger pour du covoiturage !`,
      icon: 'pin',
      fromUserId
    });
  }

  function acceptConsent(userId, neighborId) {
    const data = getNeighborData();
    if (!data[userId]) return;
    if (!data[userId].consentedUsers) data[userId].consentedUsers = [];
    if (!data[userId].consentedUsers.includes(neighborId)) {
      data[userId].consentedUsers.push(neighborId);
    }
    saveNeighborData(data);
  }

  // Demo communes for Brittany area
  const DEMO_COMMUNES = [
    { name: 'Rennes', lat: 48.1173, lng: -1.6778 },
    { name: 'Cesson-Sévigné', lat: 48.1211, lng: -1.6025 },
    { name: 'Saint-Grégoire', lat: 48.1530, lng: -1.6880 },
    { name: 'Betton', lat: 48.1820, lng: -1.6430 },
    { name: 'Pacé', lat: 48.1460, lng: -1.7710 },
    { name: 'Bruz', lat: 48.0230, lng: -1.7450 },
    { name: 'Chantepie', lat: 48.0890, lng: -1.6120 },
    { name: 'Thorigné-Fouillard', lat: 48.1580, lng: -1.5780 },
    { name: 'Saint-Malo', lat: 48.6493, lng: -1.9890 },
    { name: 'Dinan', lat: 48.4520, lng: -2.0500 },
    { name: 'Fougères', lat: 48.3520, lng: -1.2050 },
    { name: 'Châteaubourg', lat: 48.1090, lng: -1.4020 }
  ];

  function loadDemoNeighborData() {
    const data = getNeighborData();
    if (Object.keys(data).length > 2) return;

    const users = CedeoStore.getUsers();
    users.forEach((u, i) => {
      const commune = DEMO_COMMUNES[i % DEMO_COMMUNES.length];
      const jitter = () => (Math.random() - 0.5) * 0.02;
      data[u.id] = {
        lat: commune.lat + jitter(),
        lng: commune.lng + jitter(),
        commune: commune.name,
        privacyLevel: 'commune',
        consentedUsers: [],
        updatedAt: new Date().toISOString()
      };
    });
    saveNeighborData(data);
  }

  function renderNeighborsPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) { window.App.navigate('/login'); return; }

    loadDemoNeighborData();

    const myLocation = getUserLocation(currentUser.id);
    const nearby5 = findNearbyUsers(currentUser.id, 5);
    const nearby10 = findNearbyUsers(currentUser.id, 10);
    const nearby20 = findNearbyUsers(currentUser.id, 20);

    app.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4)">
        <div class="page-header">
          <h1 class="page-title">Voisins CEDEO</h1>
          <p class="page-subtitle">Trouvez des collègues proches pour covoiturer au quotidien</p>
        </div>

        <!-- Mon adresse -->
        <div class="card" style="margin-bottom:var(--space-6)">
          <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4)">
            <div style="width:48px;height:48px;border-radius:var(--radius-full);background:var(--color-primary-bg);display:flex;align-items:center;justify-content:center">${AppIcons.i('pin', 24, 'var(--color-primary)')}</div>
            <div>
              <div style="font-weight:var(--font-weight-semibold)">Ma localisation</div>
              <div style="font-size:var(--font-size-sm);color:var(--color-text-secondary)">${myLocation ? myLocation.commune : 'Non définie'}</div>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:var(--space-3)">
            <label class="form-label">Ma commune</label>
            <select class="form-select" id="neighbor-commune">
              <option value="">Sélectionnez votre commune</option>
              ${DEMO_COMMUNES.map(c => `<option value="${c.name}" ${myLocation?.commune === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:var(--space-3)">
            <label class="form-label">Niveau de visibilité</label>
            <select class="form-select" id="neighbor-privacy">
              <option value="commune" ${myLocation?.privacyLevel === 'commune' ? 'selected' : ''}>Commune uniquement (recommandé)</option>
              <option value="approximate" ${myLocation?.privacyLevel === 'approximate' ? 'selected' : ''}>Zone approximative (~1km)</option>
              <option value="hidden" ${myLocation?.privacyLevel === 'hidden' ? 'selected' : ''}>Masqué</option>
            </select>
            <span class="form-hint">Votre adresse exacte n'est jamais partagée</span>
          </div>
          <button class="btn btn-primary btn-sm" id="save-location-btn">Enregistrer</button>
        </div>

        <!-- Radar -->
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--space-4);margin-bottom:var(--space-6)">
          <div class="card card-compact" style="text-align:center">
            <div style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);color:var(--color-primary)">${nearby5.length}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">< 5 km</div>
          </div>
          <div class="card card-compact" style="text-align:center">
            <div style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);color:var(--color-primary)">${nearby10.length}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">< 10 km</div>
          </div>
          <div class="card card-compact" style="text-align:center">
            <div style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);color:var(--color-primary)">${nearby20.length}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">< 20 km</div>
          </div>
        </div>

        <!-- Liste des voisins -->
        <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Collègues proches</h2>
        ${nearby20.length === 0 ? `
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-title">Aucun voisin trouvé</div>
              <div class="empty-state-text">Renseignez votre commune pour découvrir des collègues proches</div>
            </div>
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${nearby20.map(n => {
              const agency = Utils.getAgencyById(n.user.agencyId);
              const trust = typeof TrustSystem !== 'undefined' ? TrustSystem.getUserTrustLevel(n.user.id) : null;
              return `
                <div class="card card-clickable card-compact" onclick="App.navigate('/profile/${n.user.id}')">
                  <div style="display:flex;align-items:center;gap:var(--space-3)">
                    <div class="avatar avatar-md" style="background-color:${Utils.getAvatarColor(n.user.id)}">${Utils.getInitials(n.user.firstName, n.user.lastName)}</div>
                    <div style="flex:1">
                      <div style="display:flex;align-items:center;gap:var(--space-2)">
                        <span style="font-weight:var(--font-weight-semibold)">${Utils.escapeHtml(n.user.firstName)} ${Utils.escapeHtml(n.user.lastName.charAt(0))}.</span>
                        ${trust ? TrustSystem.renderTrustBadge(n.user.id) : ''}
                      </div>
                      <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">
                        ${agency ? agency.shortName : ''} · ${n.commune}
                      </div>
                    </div>
                    <div style="text-align:right">
                      <div style="font-weight:var(--font-weight-bold);color:var(--color-primary)">${n.distance} km</div>
                      <div style="font-size:var(--font-size-xs);color:var(--color-text-light)">de chez vous</div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    document.getElementById('save-location-btn')?.addEventListener('click', () => {
      const commune = document.getElementById('neighbor-commune').value;
      const privacy = document.getElementById('neighbor-privacy').value;
      if (!commune) { window.App.showToast('Sélectionnez votre commune', 'warning'); return; }

      const communeData = DEMO_COMMUNES.find(c => c.name === commune);
      if (communeData) {
        const jitter = () => (Math.random() - 0.5) * 0.015;
        setUserLocation(currentUser.id, {
          lat: communeData.lat + jitter(),
          lng: communeData.lng + jitter(),
          commune: communeData.name,
          privacyLevel: privacy,
          consentedUsers: getUserLocation(currentUser.id)?.consentedUsers || []
        });
        window.App.showToast('Localisation mise à jour !', 'success');
        renderNeighborsPage();
      }
    });
  }

  return {
    renderNeighborsPage,
    findNearbyUsers,
    getUserLocation,
    setUserLocation,
    loadDemoNeighborData,
    requestConsent,
    acceptConsent,
    haversineDistance
  };
})();
