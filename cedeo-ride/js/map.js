/* ===========================================
   CEDEO Ride — Module Carte Interactive
   Carte Leaflet.js avec agences, trajets actifs
   et météo intégrée pour la région Ouest
   =========================================== */

const MapModule = (() => {

  let mapInstance = null;

  /**
   * Page de la carte interactive
   */
  function renderMapPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    const trips = CedeoStore.searchTrips({});
    const users = CedeoStore.getUsers();

    app.innerHTML = `
      <div class="map-page">
        <div class="map-sidebar">
          <div class="map-sidebar-header">
            <h2>Carte Région Ouest</h2>
            <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);margin-top:var(--space-1)">
              ${Utils.AGENCIES.length} agences · ${trips.length} trajets actifs
            </p>
          </div>

          <!-- Filtres -->
          <div class="map-filters">
            <button class="map-filter-btn active" data-filter="all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
              Tout
            </button>
            <button class="map-filter-btn" data-filter="agencies">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              Agences
            </button>
            <button class="map-filter-btn" data-filter="trips">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Trajets
            </button>
          </div>

          <!-- Météo régionale -->
          <div class="map-weather-section">
            <h3 class="map-section-title">Météo Bretagne</h3>
            <div class="map-weather-grid" id="map-weather-grid">
              ${renderWeatherCards()}
            </div>
          </div>

          <!-- Liste des agences -->
          <div class="map-agencies-section">
            <h3 class="map-section-title">Agences (${Utils.AGENCIES.length})</h3>
            <div class="map-agency-list">
              ${Utils.AGENCIES.map(agency => {
                const agencyUsers = users.filter(u => u.agencyId === agency.id);
                const agencyTrips = trips.filter(t => t.fromId === agency.id || t.toId === agency.id);
                return `
                  <div class="map-agency-item" data-agency-id="${agency.id}">
                    <div class="map-agency-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div class="map-agency-info">
                      <div class="map-agency-name">${Utils.escapeHtml(agency.shortName)}</div>
                      <div class="map-agency-detail">${agencyUsers.length} membre${agencyUsers.length > 1 ? 's' : ''} · ${agencyTrips.length} trajet${agencyTrips.length > 1 ? 's' : ''}</div>
                    </div>
                    <div class="map-agency-weather">${getWeatherEmoji(agency.id)}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Prochains départs -->
          <div class="map-departures-section">
            <h3 class="map-section-title">Prochains départs</h3>
            ${trips.slice(0, 5).map(trip => {
              const driver = CedeoStore.getUser(trip.driverId);
              if (!driver) return '';
              return `
                <div class="map-departure-item" onclick="App.navigate('/trip/${trip.id}')" data-from="${trip.fromId}" data-to="${trip.toId}">
                  <div class="map-departure-time">${Utils.formatTime(trip.departureTime)}</div>
                  <div class="map-departure-route">
                    <div class="map-departure-from">${Utils.escapeHtml(trip.fromName.replace('CEDEO ', ''))}</div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <div class="map-departure-to">${Utils.escapeHtml(trip.toName.replace('CEDEO ', ''))}</div>
                  </div>
                  <div class="map-departure-driver">${Utils.escapeHtml(driver.firstName)} ${driver.lastName.charAt(0)}.</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="map-container" id="leaflet-map"></div>
      </div>
    `;

    initMap(trips);
    setupMapEvents(trips);
  }

  /**
   * Initialise la carte Leaflet
   */
  function initMap(trips) {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }

    // Centrer sur la Bretagne
    const centerLat = 48.0;
    const centerLng = -1.7;

    mapInstance = L.map('leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([centerLat, centerLng], 8);

    // Tiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(mapInstance);

    // Marqueurs des agences
    const agencyMarkers = {};
    Utils.AGENCIES.forEach(agency => {
      const users = CedeoStore.getUsers().filter(u => u.agencyId === agency.id);
      const agencyTrips = trips.filter(t => t.fromId === agency.id || t.toId === agency.id);

      const icon = L.divIcon({
        className: 'map-marker-agency',
        html: `<div class="map-marker-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#003DA5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <span class="map-marker-label">${agency.shortName}</span>
        </div>`,
        iconSize: [0, 0],
        iconAnchor: [12, 36]
      });

      const marker = L.marker([agency.lat, agency.lng], { icon }).addTo(mapInstance);

      marker.bindPopup(`
        <div class="map-popup">
          <div class="map-popup-title">${Utils.escapeHtml(agency.name)}</div>
          <div class="map-popup-stats">
            <span>👥 ${users.length} membre${users.length > 1 ? 's' : ''}</span>
            <span>🚗 ${agencyTrips.length} trajet${agencyTrips.length > 1 ? 's' : ''}</span>
          </div>
          <div class="map-popup-weather">${getWeatherEmoji(agency.id)} ${getWeatherTemp(agency.id)}°C — ${getWeatherDesc(agency.id)}</div>
          <a href="#/search?to=${agency.id}" class="map-popup-link">Voir les trajets →</a>
        </div>
      `);

      agencyMarkers[agency.id] = marker;
    });

    // Lignes des trajets actifs
    trips.forEach(trip => {
      const fromAgency = Utils.getAgencyById(trip.fromId);
      const toAgency = Utils.getAgencyById(trip.toId);
      if (!fromAgency || !toAgency) return;

      const driver = CedeoStore.getUser(trip.driverId);
      const availableSeats = CedeoStore.getAvailableSeats(trip.id);

      const polyline = L.polyline(
        [[fromAgency.lat, fromAgency.lng], [toAgency.lat, toAgency.lng]],
        {
          color: availableSeats > 0 ? '#003DA5' : '#9CA3AF',
          weight: 3,
          opacity: 0.6,
          dashArray: '8, 6',
          className: 'map-trip-line'
        }
      ).addTo(mapInstance);

      polyline.bindPopup(`
        <div class="map-popup">
          <div class="map-popup-title">${Utils.escapeHtml(trip.fromName.replace('CEDEO ', ''))} → ${Utils.escapeHtml(trip.toName.replace('CEDEO ', ''))}</div>
          <div class="map-popup-stats">
            <span>🕐 ${Utils.formatDateShort(trip.departureTime)} à ${Utils.formatTime(trip.departureTime)}</span>
            <span>💺 ${availableSeats} place${availableSeats > 1 ? 's' : ''}</span>
          </div>
          ${driver ? `<div style="font-size:12px;margin-top:4px">Conducteur : ${Utils.escapeHtml(driver.firstName)} ${driver.lastName.charAt(0)}.</div>` : ''}
          <a href="#/trip/${trip.id}" class="map-popup-link">Réserver →</a>
        </div>
      `);
    });

    // Ajuster les bounds
    const bounds = L.latLngBounds(Utils.AGENCIES.map(a => [a.lat, a.lng]));
    mapInstance.fitBounds(bounds.pad(0.15));
  }

  /**
   * Événements de la sidebar
   */
  function setupMapEvents(trips) {
    // Filtres
    document.querySelectorAll('.map-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Les filtres pourraient masquer/afficher des layers
      });
    });

    // Clic sur une agence dans la sidebar
    document.querySelectorAll('.map-agency-item').forEach(item => {
      item.addEventListener('click', () => {
        const agencyId = item.dataset.agencyId;
        const agency = Utils.getAgencyById(agencyId);
        if (agency && mapInstance) {
          mapInstance.setView([agency.lat, agency.lng], 12, { animate: true });
        }
      });
    });

    // Survol d'un départ
    document.querySelectorAll('.map-departure-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const fromId = item.dataset.from;
        const toId = item.dataset.to;
        const from = Utils.getAgencyById(fromId);
        const to = Utils.getAgencyById(toId);
        if (from && to && mapInstance) {
          const bounds = L.latLngBounds([[from.lat, from.lng], [to.lat, to.lng]]);
          mapInstance.fitBounds(bounds.pad(0.3), { animate: true });
        }
      });
    });
  }

  /**
   * Météo simulée réaliste pour la Bretagne
   */
  function getWeatherData() {
    const now = new Date();
    const month = now.getMonth(); // 0-11

    // Météo typique bretonne par saison
    const seasonal = {
      winter: { temps: [5, 8, 6, 7, 4, 9, 5, 6, 7, 8], conditions: ['Pluie', 'Couvert', 'Éclaircies', 'Pluie fine', 'Brouillard'] },
      spring: { temps: [12, 14, 11, 13, 15, 10, 12, 14, 13, 11], conditions: ['Ensoleillé', 'Éclaircies', 'Nuageux', 'Averses', 'Variable'] },
      summer: { temps: [20, 22, 19, 24, 21, 18, 23, 20, 22, 21], conditions: ['Ensoleillé', 'Beau temps', 'Éclaircies', 'Nuageux', 'Chaud'] },
      autumn: { temps: [14, 12, 10, 11, 13, 9, 12, 10, 11, 13], conditions: ['Pluie', 'Couvert', 'Brouillard', 'Éclaircies', 'Venteux'] }
    };

    let season;
    if (month >= 2 && month <= 4) season = seasonal.spring;
    else if (month >= 5 && month <= 7) season = seasonal.summer;
    else if (month >= 8 && month <= 10) season = seasonal.autumn;
    else season = seasonal.winter;

    const weatherByAgency = {};
    Utils.AGENCIES.forEach((agency, i) => {
      const temp = season.temps[i % season.temps.length] + Math.floor(Math.random() * 3) - 1;
      const condition = season.conditions[i % season.conditions.length];
      weatherByAgency[agency.id] = { temp, condition };
    });

    return weatherByAgency;
  }

  // Cache la météo pour la session
  let weatherCache = null;
  function getWeather() {
    if (!weatherCache) weatherCache = getWeatherData();
    return weatherCache;
  }

  function getWeatherEmoji(agencyId) {
    const weather = getWeather()[agencyId];
    if (!weather) return '☁️';
    const map = {
      'Ensoleillé': '☀️', 'Beau temps': '☀️', 'Chaud': '🌡️',
      'Éclaircies': '⛅', 'Variable': '🌤️',
      'Nuageux': '☁️', 'Couvert': '☁️',
      'Pluie': '🌧️', 'Pluie fine': '🌦️', 'Averses': '🌧️',
      'Brouillard': '🌫️', 'Venteux': '💨'
    };
    return map[weather.condition] || '☁️';
  }

  function getWeatherTemp(agencyId) {
    const weather = getWeather()[agencyId];
    return weather ? weather.temp : '--';
  }

  function getWeatherDesc(agencyId) {
    const weather = getWeather()[agencyId];
    return weather ? weather.condition : 'N/A';
  }

  function renderWeatherCards() {
    const keyAgencies = ['rennes-lorient', 'saint-malo', 'dinan', 'la-roche'];
    return keyAgencies.map(id => {
      const agency = Utils.getAgencyById(id);
      if (!agency) return '';
      return `
        <div class="map-weather-card">
          <div class="map-weather-emoji">${getWeatherEmoji(id)}</div>
          <div class="map-weather-info">
            <div class="map-weather-city">${agency.shortName}</div>
            <div class="map-weather-temp">${getWeatherTemp(id)}°C</div>
          </div>
          <div class="map-weather-desc">${getWeatherDesc(id)}</div>
        </div>
      `;
    }).join('');
  }

  return {
    renderMapPage,
    getWeatherEmoji,
    getWeatherTemp,
    getWeatherDesc
  };
})();
