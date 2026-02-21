/* ===========================================
   CEDEO Ride — Module Événements
   Événements régionaux, éco-challenges,
   itinéraires favoris, modèles de trajets
   =========================================== */

const Events = (() => {

  // Clés localStorage
  const KEYS = {
    favorites: 'cedeoride_favorites',
    events: 'cedeoride_events'
  };

  // --- Itinéraires favoris ---

  function getFavorites(userId) {
    try {
      const all = JSON.parse(localStorage.getItem(KEYS.favorites)) || [];
      return all.filter(f => f.userId === userId);
    } catch {
      return [];
    }
  }

  function addFavorite(userId, route) {
    const favorites = JSON.parse(localStorage.getItem(KEYS.favorites) || '[]');
    const fav = {
      id: Utils.generateId(),
      userId,
      fromId: route.fromId,
      fromName: route.fromName,
      toId: route.toId,
      toName: route.toName,
      defaultTime: route.defaultTime || '08:00',
      defaultSeats: route.defaultSeats || 3,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    favorites.push(fav);
    localStorage.setItem(KEYS.favorites, JSON.stringify(favorites));
    return fav;
  }

  function removeFavorite(favId) {
    const favorites = JSON.parse(localStorage.getItem(KEYS.favorites) || '[]');
    const filtered = favorites.filter(f => f.id !== favId);
    localStorage.setItem(KEYS.favorites, JSON.stringify(filtered));
  }

  function incrementFavoriteUsage(favId) {
    const favorites = JSON.parse(localStorage.getItem(KEYS.favorites) || '[]');
    const fav = favorites.find(f => f.id === favId);
    if (fav) {
      fav.usageCount = (fav.usageCount || 0) + 1;
      localStorage.setItem(KEYS.favorites, JSON.stringify(favorites));
    }
  }

  // --- Événements régionaux ---

  function getEvents() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.events)) || [];
    } catch {
      return [];
    }
  }

  function getUpcomingEvents() {
    const now = new Date();
    return getEvents()
      .filter(e => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function getEventParticipants(eventId) {
    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    return event ? (event.participants || []) : [];
  }

  function joinEvent(eventId, userId) {
    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    if (event && !event.participants.includes(userId)) {
      event.participants.push(userId);
      localStorage.setItem(KEYS.events, JSON.stringify(events));
    }
  }

  function leaveEvent(eventId, userId) {
    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    if (event) {
      event.participants = event.participants.filter(id => id !== userId);
      localStorage.setItem(KEYS.events, JSON.stringify(events));
    }
  }

  /**
   * Charge les événements de démonstration
   */
  function loadDemoEvents() {
    if (getEvents().length > 0) return;

    const now = new Date();

    const events = [
      {
        id: 'evt_01',
        title: 'Semaine de la Mobilité Durable',
        description: 'Tous les collaborateurs sont invités à privilégier le covoiturage pendant cette semaine. Objectif : doubler le nombre de covoiturages ! Des récompenses spéciales attendent les plus actifs.',
        date: futureDate(7),
        endDate: futureDate(14),
        type: 'challenge',
        icon: '🌍',
        location: 'Toutes les agences',
        organizer: 'Direction Régionale Ouest',
        participants: ['usr_sophie', 'usr_thomas', 'usr_marie', 'usr_pierre'],
        maxParticipants: null,
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80',
        tags: ['écologie', 'challenge', 'tous'],
        reward: 'Badge "Semaine Verte" + tirage au sort pour une carte cadeau'
      },
      {
        id: 'evt_02',
        title: 'Petit-Déjeuner Covoitureurs — Rennes',
        description: 'Venez partager un petit-déjeuner convivial avec les covoitureurs de la zone rennaise ! C\'est l\'occasion de rencontrer vos collègues et d\'échanger sur vos trajets.',
        date: futureDate(10),
        endDate: null,
        type: 'social',
        icon: '☕',
        location: 'CEDEO Rennes Route de Lorient',
        organizer: 'Sophie Martin',
        participants: ['usr_sophie', 'usr_maxime', 'usr_camille'],
        maxParticipants: 20,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
        tags: ['social', 'rennes', 'convivialité'],
        reward: null
      },
      {
        id: 'evt_03',
        title: 'Challenge Inter-Agences — Février',
        description: 'Quelle agence cumule le plus de covoiturages ce mois-ci ? Classement en temps réel dans le Dashboard. L\'agence gagnante remporte un déjeuner d\'équipe offert !',
        date: futureDate(1),
        endDate: futureDate(30),
        type: 'competition',
        icon: '🏆',
        location: 'Toutes les agences',
        organizer: 'CEDEO Ride',
        participants: ['usr_sophie', 'usr_thomas', 'usr_julie', 'usr_nicolas', 'usr_pierre', 'usr_lea'],
        maxParticipants: null,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
        tags: ['compétition', 'inter-agences', 'mensuel'],
        reward: 'Déjeuner d\'équipe offert pour l\'agence gagnante'
      },
      {
        id: 'evt_04',
        title: 'Covoiturage & Randonnée — Côte d\'Émeraude',
        description: 'Un covoiturage collectif vers Saint-Malo suivi d\'une randonnée le long de la Côte d\'Émeraude. Venez profiter des paysages bretons entre collègues !',
        date: futureDate(21),
        endDate: null,
        type: 'social',
        icon: '🥾',
        location: 'Départ : CEDEO Rennes → Saint-Malo',
        organizer: 'Julie Moreau',
        participants: ['usr_julie', 'usr_sophie'],
        maxParticipants: 15,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
        tags: ['social', 'nature', 'bretagne'],
        reward: null
      },
      {
        id: 'evt_05',
        title: 'Journée Zéro Voiture Solo',
        description: 'Le défi : zéro trajet en voiture seul pendant une journée ! Covoiturez, prenez les transports en commun ou le vélo. Chaque participant reçoit le badge "Zéro Solo".',
        date: futureDate(14),
        endDate: null,
        type: 'challenge',
        icon: '🚫🚗',
        location: 'Toutes les agences',
        organizer: 'CEDEO Ride',
        participants: ['usr_thomas', 'usr_marie'],
        maxParticipants: null,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
        tags: ['challenge', 'écologie', 'tous'],
        reward: 'Badge "Zéro Solo"'
      }
    ];

    localStorage.setItem(KEYS.events, JSON.stringify(events));
  }

  function futureDate(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  }

  /**
   * Rendu de la page Événements
   */
  function renderEventsPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    if (!currentUser) {
      window.App.navigate('/login');
      return;
    }

    // Charger les données de démo si nécessaire
    loadDemoEvents();

    const events = getUpcomingEvents();
    const favorites = getFavorites(currentUser.id);

    app.innerHTML = `
      <div class="container" style="padding-bottom:var(--space-10)">
        <div class="page-header">
          <h1 class="page-title">Événements & Favoris</h1>
          <p class="page-subtitle">Événements régionaux et vos itinéraires favoris</p>
        </div>

        <!-- Itinéraires favoris -->
        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4)">⭐ Mes itinéraires favoris</h2>
        <div style="margin-bottom:var(--space-8)">
          ${favorites.length === 0 ? `
            <div class="card" style="text-align:center;padding:var(--space-8)">
              <div style="font-size:48px;margin-bottom:var(--space-4)">⭐</div>
              <div style="font-weight:var(--font-weight-semibold);margin-bottom:var(--space-2)">Aucun itinéraire favori</div>
              <p style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-bottom:var(--space-4)">
                Sauvegardez vos trajets fréquents pour publier plus rapidement.
              </p>
              <button class="btn btn-primary" id="add-fav-btn">+ Ajouter un favori</button>
            </div>
          ` : `
            <div class="favorites-grid">
              ${favorites.map(fav => {
                const distance = Utils.getDistanceBetween(fav.fromId, fav.toId);
                return `
                  <div class="card favorite-card">
                    <div class="favorite-header">
                      <div class="favorite-route">
                        <div class="favorite-from">${Utils.escapeHtml(fav.fromName.replace('CEDEO ', ''))}</div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        <div class="favorite-to">${Utils.escapeHtml(fav.toName.replace('CEDEO ', ''))}</div>
                      </div>
                      <button class="btn btn-ghost btn-sm fav-remove-btn" data-id="${fav.id}" title="Supprimer">✕</button>
                    </div>
                    <div class="favorite-meta">
                      <span>📏 ${distance} km</span>
                      <span>🕐 ${fav.defaultTime}</span>
                      <span>💺 ${fav.defaultSeats} places</span>
                      <span>📊 ${fav.usageCount || 0} utilisation${(fav.usageCount || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <button class="btn btn-primary btn-sm fav-publish-btn" data-id="${fav.id}" style="width:100%;margin-top:var(--space-3)">
                      Publier ce trajet rapidement
                    </button>
                  </div>
                `;
              }).join('')}
              <div class="card favorite-card favorite-add" id="add-fav-btn">
                <div style="font-size:36px;margin-bottom:var(--space-2)">+</div>
                <div style="font-weight:var(--font-weight-medium)">Ajouter un favori</div>
              </div>
            </div>
          `}
        </div>

        <!-- Événements -->
        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4)">📅 Événements à venir</h2>
        <div class="events-list">
          ${events.length === 0 ? `
            <div class="card" style="text-align:center;padding:var(--space-8)">
              <div style="font-size:48px;margin-bottom:var(--space-4)">📅</div>
              <div style="font-weight:var(--font-weight-semibold)">Aucun événement à venir</div>
            </div>
          ` : events.map(evt => {
            const isParticipant = evt.participants.includes(currentUser.id);
            const participantCount = evt.participants.length;
            const typeColors = {
              challenge: '#f59e0b',
              social: '#16a34a',
              competition: '#7c3aed'
            };
            const typeLabels = {
              challenge: 'Challenge',
              social: 'Social',
              competition: 'Compétition'
            };
            return `
              <div class="card event-card">
                <div class="event-card-image">
                  <img src="${evt.image}" alt="${Utils.escapeHtml(evt.title)}" loading="lazy">
                  <div class="event-card-type" style="background:${typeColors[evt.type] || '#003DA5'}">${typeLabels[evt.type] || evt.type}</div>
                </div>
                <div class="event-card-body">
                  <div class="event-card-header">
                    <span class="event-icon">${evt.icon}</span>
                    <div>
                      <h3 class="event-card-title">${Utils.escapeHtml(evt.title)}</h3>
                      <div class="event-card-date">
                        📅 ${Utils.formatDate(evt.date)}
                        ${evt.endDate ? ` → ${Utils.formatDate(evt.endDate)}` : ''}
                      </div>
                    </div>
                  </div>
                  <p class="event-card-desc">${Utils.escapeHtml(evt.description)}</p>
                  <div class="event-card-meta">
                    <span>📍 ${Utils.escapeHtml(evt.location)}</span>
                    <span>👥 ${participantCount} participant${participantCount > 1 ? 's' : ''}${evt.maxParticipants ? ` / ${evt.maxParticipants}` : ''}</span>
                    <span>🏷️ ${evt.tags.map(t => `<span class="event-tag">${t}</span>`).join(' ')}</span>
                  </div>
                  ${evt.reward ? `<div class="event-reward">🎁 ${Utils.escapeHtml(evt.reward)}</div>` : ''}
                  <div class="event-card-actions">
                    ${isParticipant ? `
                      <button class="btn btn-outline btn-sm event-leave-btn" data-id="${evt.id}">Quitter</button>
                      <span class="badge badge-success">✓ Inscrit</span>
                    ` : `
                      <button class="btn btn-primary btn-sm event-join-btn" data-id="${evt.id}"${evt.maxParticipants && participantCount >= evt.maxParticipants ? ' disabled' : ''}>
                        ${evt.maxParticipants && participantCount >= evt.maxParticipants ? 'Complet' : 'Participer'}
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    setupEventsListeners(currentUser);
  }

  /**
   * Configure les listeners de la page
   */
  function setupEventsListeners(currentUser) {
    // Join event
    document.querySelectorAll('.event-join-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        joinEvent(btn.dataset.id, currentUser.id);
        window.App.showToast('Inscription confirmée !', 'success');
        renderEventsPage();
      });
    });

    // Leave event
    document.querySelectorAll('.event-leave-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        leaveEvent(btn.dataset.id, currentUser.id);
        window.App.showToast('Désinscription effectuée.', 'info');
        renderEventsPage();
      });
    });

    // Remove favorite
    document.querySelectorAll('.fav-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFavorite(btn.dataset.id);
        window.App.showToast('Favori supprimé.', 'info');
        renderEventsPage();
      });
    });

    // Quick publish from favorite
    document.querySelectorAll('.fav-publish-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const favId = btn.dataset.id;
        const favorites = getFavorites(currentUser.id);
        const fav = favorites.find(f => f.id === favId);
        if (fav) {
          incrementFavoriteUsage(favId);
          quickPublishFromFavorite(fav);
        }
      });
    });

    // Add favorite button
    document.getElementById('add-fav-btn')?.addEventListener('click', () => {
      showAddFavoriteModal(currentUser);
    });
  }

  /**
   * Publication rapide depuis un favori
   */
  function quickPublishFromFavorite(fav) {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const departureTime = new Date(`${dateStr}T${fav.defaultTime}:00`).toISOString();
    const distanceKm = Utils.getDistanceBetween(fav.fromId, fav.toId);
    const durationMin = Utils.estimateDuration(distanceKm);

    const trip = CedeoStore.createTrip({
      driverId: currentUser.id,
      fromName: fav.fromName,
      toName: fav.toName,
      fromId: fav.fromId,
      toId: fav.toId,
      departureTime,
      seats: fav.defaultSeats,
      detourKm: 10,
      comment: 'Trajet publié depuis mes favoris',
      recurring: false,
      recurringDays: null,
      distanceKm,
      durationMin
    });

    window.App.showToast('Trajet publié pour demain !', 'success');
    window.App.navigate(`/trip/${trip.id}`);
  }

  /**
   * Modal d'ajout de favori
   */
  function showAddFavoriteModal(currentUser) {
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const modal = Utils.createElement(`
      <div class="modal-overlay" style="display:flex">
        <div class="modal" style="max-width:480px;width:90%">
          <div class="modal-header">
            <h3>Ajouter un itinéraire favori</h3>
            <button class="modal-close" id="close-fav-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group autocomplete-wrapper" style="margin-bottom:var(--space-4)">
              <label class="form-label">Départ</label>
              <input class="form-input" type="text" id="fav-from" placeholder="Agence de départ" autocomplete="off">
              <input type="hidden" id="fav-from-id">
              <div class="autocomplete-list" id="fav-ac-from" style="display:none"></div>
            </div>
            <div class="form-group autocomplete-wrapper" style="margin-bottom:var(--space-4)">
              <label class="form-label">Arrivée</label>
              <input class="form-input" type="text" id="fav-to" placeholder="Agence d'arrivée" autocomplete="off">
              <input type="hidden" id="fav-to-id">
              <div class="autocomplete-list" id="fav-ac-to" style="display:none"></div>
            </div>
            <div style="display:flex;gap:var(--space-4)">
              <div class="form-group" style="flex:1">
                <label class="form-label">Heure habituelle</label>
                <input class="form-input" type="time" id="fav-time" value="08:00">
              </div>
              <div class="form-group" style="flex:1">
                <label class="form-label">Places</label>
                <select class="form-select" id="fav-seats">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3" selected>3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" id="cancel-fav-modal">Annuler</button>
            <button class="btn btn-primary" id="save-fav-btn">Sauvegarder</button>
          </div>
        </div>
      </div>
    `);

    document.body.appendChild(modal);

    // Autocomplete setup
    setupFavAutocomplete('fav-from', 'fav-ac-from', 'fav-from-id');
    setupFavAutocomplete('fav-to', 'fav-ac-to', 'fav-to-id');

    // Events
    document.getElementById('close-fav-modal').addEventListener('click', () => modal.remove());
    document.getElementById('cancel-fav-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    document.getElementById('save-fav-btn').addEventListener('click', () => {
      const fromName = document.getElementById('fav-from').value.trim();
      const toName = document.getElementById('fav-to').value.trim();
      const fromId = document.getElementById('fav-from-id').value;
      const toId = document.getElementById('fav-to-id').value;
      const time = document.getElementById('fav-time').value;
      const seats = parseInt(document.getElementById('fav-seats').value);

      if (!fromName || !toName || !fromId || !toId) {
        window.App.showToast('Veuillez sélectionner deux agences.', 'error');
        return;
      }

      addFavorite(currentUser.id, { fromId, fromName, toId, toName, defaultTime: time, defaultSeats: seats });
      modal.remove();
      window.App.showToast('Itinéraire favori ajouté !', 'success');
      renderEventsPage();
    });
  }

  function setupFavAutocomplete(inputId, listId, hiddenId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (!input || !list) return;

    const handleInput = Utils.debounce(() => {
      const query = input.value.trim();
      const results = Utils.searchAgencies(query);
      if (results.length === 0 || !query) { list.style.display = 'none'; return; }
      list.innerHTML = results.map(a => `
        <div class="autocomplete-item" data-id="${a.id}" data-name="${a.name}">📍 ${a.name}</div>
      `).join('');
      list.style.display = 'block';
      list.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          input.value = item.dataset.name;
          document.getElementById(hiddenId).value = item.dataset.id;
          list.style.display = 'none';
        });
      });
    }, 200);

    input.addEventListener('input', handleInput);
    input.addEventListener('focus', handleInput);
  }

  return {
    getFavorites,
    addFavorite,
    removeFavorite,
    loadDemoEvents,
    getUpcomingEvents,
    joinEvent,
    leaveEvent,
    renderEventsPage
  };
})();
