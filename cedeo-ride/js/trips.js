/* ===========================================
   CEDEO Ride — Module Trajets
   Publication, recherche, détail, réservation
   =========================================== */

const Trips = (() => {

  /**
   * Page d'accueil avec hero et recherche
   */
  // Images Unsplash pour les destinations
  const CITY_IMAGES = {
    'rennes-lorient': 'https://images.unsplash.com/photo-1560983073-c29bff7438ef?w=400&q=80',
    'rennes-stgregoire': 'https://images.unsplash.com/photo-1560983073-c29bff7438ef?w=400&q=80',
    'cesson-bray': 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=400&q=80',
    'cesson-chene': 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=400&q=80',
    'chateaubourg': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    'derval': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
    'saint-malo': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
    'dinan': 'https://images.unsplash.com/photo-1590099033615-be195f8d575c?w=400&q=80',
    'fougeres': 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&q=80',
    'la-roche': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80'
  };

  function renderHomePage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    // Trajets à venir avec places disponibles
    const upcomingTrips = CedeoStore.searchTrips({}).slice(0, 6);

    // Matchs suggérés pour l'utilisateur connecté
    let matches = [];
    if (currentUser) {
      matches = Matching.findMatchesForUser(currentUser.id);
    }

    // Stats pour eco-banner
    const bookings = CedeoStore.getBookings().filter(b => b.status === 'confirmed');
    let totalCO2 = 0;
    let totalDistance = 0;
    bookings.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip && trip.distanceKm) {
        totalCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
        totalDistance += trip.distanceKm;
      }
    });

    // Compter les trajets par destination pour les cards destinations
    const tripCounts = {};
    CedeoStore.getTrips().filter(t => t.status === 'active').forEach(t => {
      if (t.toId) tripCounts[t.toId] = (tripCounts[t.toId] || 0) + 1;
      if (t.fromId) tripCounts[t.fromId] = (tripCounts[t.fromId] || 0) + 1;
    });

    app.innerHTML = `
      <!-- ===== HERO — Style BlaBlaCar ===== -->
      <div class="hero">
        <div class="hero-inner">
          <div class="hero-text">
            <h1 class="hero-title">
              Covoiturez entre<br><span class="highlight">collègues CEDEO</span>
            </h1>
            <p class="hero-subtitle">
              Partagez vos trajets professionnels en région Ouest. Économisez du temps, de l'argent et réduisez votre empreinte carbone.
            </p>

            <!-- Search bar -->
            <div class="search-bar" id="home-search-bar">
              <div class="search-field autocomplete-wrapper">
                <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/></svg>
                <input class="form-input" type="text" id="search-from" placeholder="D'où partez-vous ?" autocomplete="off">
                <div class="autocomplete-list" id="ac-from" style="display:none"></div>
              </div>
              <div class="search-field autocomplete-wrapper">
                <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/></svg>
                <input class="form-input" type="text" id="search-to" placeholder="Où allez-vous ?" autocomplete="off">
                <div class="autocomplete-list" id="ac-to" style="display:none"></div>
              </div>
              <div class="search-field">
                <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <input class="form-input" type="date" id="search-date" min="${new Date().toISOString().split('T')[0]}">
              </div>
              <button class="btn btn-primary btn-search" id="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Rechercher
              </button>
            </div>

            <div class="hero-trust">
              <div class="hero-trust-item">
                <span style="font-size:20px">👥</span>
                <span><strong>${CedeoStore.getUsers().length}</strong> collaborateurs</span>
              </div>
              <div class="hero-trust-item">
                <span style="font-size:20px">🏢</span>
                <span><strong>10</strong> agences</span>
              </div>
              <div class="hero-trust-item">
                <span style="font-size:20px">🌱</span>
                <span><strong>${Math.round(totalCO2)} kg</strong> CO2 économisé</span>
              </div>
            </div>
          </div>

          <div class="hero-image">
            <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80" alt="Collègues en covoiturage" loading="eager">
          </div>
        </div>
      </div>

      <!-- ===== Destinations populaires ===== -->
      <div class="container" style="padding-top:var(--space-10)">
        <h2 class="section-title">Destinations populaires</h2>
        <p class="section-subtitle">Trouvez un covoiturage vers nos agences de la région Ouest</p>
        <div class="destinations-grid">
          ${[
            { id: 'saint-malo', label: 'Saint-Malo' },
            { id: 'rennes-lorient', label: 'Rennes' },
            { id: 'dinan', label: 'Dinan' },
            { id: 'fougeres', label: 'Fougères' },
            { id: 'la-roche', label: 'La Roche-sur-Yon' },
            { id: 'chateaubourg', label: 'Châteaubourg' }
          ].map(d => `
            <div class="destination-card" onclick="document.getElementById('search-to').value='${Utils.getAgencyById(d.id)?.name || ''}';document.getElementById('search-btn').click();">
              <img src="${CITY_IMAGES[d.id]}" alt="${d.label}" loading="lazy">
              <div class="destination-card-overlay">
                <div class="destination-card-name">${d.label}</div>
                <div class="destination-card-count">${tripCounts[d.id] || 0} trajet${(tripCounts[d.id] || 0) > 1 ? 's' : ''} disponible${(tripCounts[d.id] || 0) > 1 ? 's' : ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${matches.length > 0 ? `
        <!-- ===== Matchs ===== -->
        <div class="container" style="padding-top:var(--space-10)">
          <h2 class="section-title">Recommandés pour vous</h2>
          <p class="section-subtitle">Ces trajets correspondent à votre profil et vos habitudes</p>
          <div class="search-results-list">
            ${matches.slice(0, 3).map(m => renderTripCard(m.trip, true)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- ===== Prochains trajets ===== -->
      <div class="container" style="padding-top:var(--space-10)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2)">
          <h2 class="section-title" style="margin-bottom:0">Prochains trajets</h2>
          ${currentUser ? '<a href="#/publish" class="btn btn-primary btn-sm">+ Publier un trajet</a>' : ''}
        </div>
        <p class="section-subtitle">Les prochains départs proposés par vos collègues</p>
        ${upcomingTrips.length === 0 ? `
          <div class="card">
            <div class="empty-state">
              ${window.AppIcons.emptyTrips()}
              <div class="empty-state-title">Aucun trajet disponible</div>
              <div class="empty-state-text">Soyez le premier à publier un trajet !</div>
              ${currentUser ? '<a href="#/publish" class="btn btn-primary">Publier un trajet</a>' : '<a href="#/login" class="btn btn-primary">Se connecter</a>'}
            </div>
          </div>
        ` : `
          <div class="search-results-list">
            ${upcomingTrips.map(t => renderTripCard(t)).join('')}
          </div>
        `}
      </div>

      <!-- ===== Comment ça marche ===== -->
      <div class="how-it-works">
        <div class="container" style="text-align:center">
          <h2 class="section-title">Comment ça marche ?</h2>
          <p class="section-subtitle" style="max-width:500px;margin:0 auto var(--space-8)">Un covoiturage simple et rapide en 3 étapes</p>
          <div class="how-it-works-grid">
            <div class="how-step">
              <div class="how-step-img">
                <img src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&q=80" alt="Recherche" loading="lazy">
              </div>
              <div class="how-step-number">1</div>
              <div class="how-step-title">Recherchez</div>
              <div class="how-step-desc">Entrez votre destination et la date de votre déplacement professionnel.</div>
            </div>
            <div class="how-step">
              <div class="how-step-img">
                <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80" alt="Réservez" loading="lazy">
              </div>
              <div class="how-step-number">2</div>
              <div class="how-step-title">Réservez</div>
              <div class="how-step-desc">Choisissez un trajet avec un collègue et réservez votre place en un clic.</div>
            </div>
            <div class="how-step">
              <div class="how-step-img">
                <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=80" alt="Voyagez" loading="lazy">
              </div>
              <div class="how-step-number">3</div>
              <div class="how-step-title">Voyagez</div>
              <div class="how-step-desc">Retrouvez votre conducteur, partagez la route et renforcez les liens d'équipe.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Eco Banner ===== -->
      <div class="container" style="padding:var(--space-10) var(--space-4)">
        <div class="eco-banner">
          <div class="eco-banner-bg">
            <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&q=80" alt="Nature" loading="lazy">
          </div>
          <div class="eco-banner-content">
            <div class="eco-banner-title">Notre impact positif, ensemble.</div>
            <div class="eco-banner-text">
              Chaque covoiturage compte. Ensemble, les collaborateurs de la région Ouest CEDEO contribuent à réduire l'empreinte carbone de Saint-Gobain.
            </div>
            <div class="eco-stats-row">
              <div class="eco-stat">
                <div class="eco-stat-value">${bookings.length}</div>
                <div class="eco-stat-label">Covoiturages</div>
              </div>
              <div class="eco-stat">
                <div class="eco-stat-value">${Math.round(totalCO2)} kg</div>
                <div class="eco-stat-label">CO2 économisé</div>
              </div>
              <div class="eco-stat">
                <div class="eco-stat-value">${Math.round(totalDistance)} km</div>
                <div class="eco-stat-label">Km partagés</div>
              </div>
              <div class="eco-stat">
                <div class="eco-stat-value">${Utils.co2ToTrees(totalCO2)}</div>
                <div class="eco-stat-label">Arbres équivalents</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setupSearchAutocomplete();
    setupSearchButton();
  }

  /**
   * Rendu d'une card de trajet
   */
  function renderTripCard(trip, isMatch = false) {
    const driver = CedeoStore.getUser(trip.driverId);
    if (!driver) return '';

    const ratingData = CedeoStore.getUserAverageRating(driver.id);
    const availableSeats = CedeoStore.getAvailableSeats(trip.id);
    const durationMin = trip.durationMin || Utils.estimateDuration(trip.distanceKm || 0);
    const departureTime = Utils.formatTime(trip.departureTime);
    const arrivalTime = Utils.formatTime(Utils.estimateArrival(trip.departureTime, durationMin));

    return `
      <div class="card card-clickable trip-card ${isMatch ? 'match-card' : ''}" onclick="App.navigate('/trip/${trip.id}')">
        ${isMatch ? '<div class="match-badge">✨ Match</div>' : ''}
        <div class="trip-card-header">
          <div class="avatar avatar-md" style="background-color:${Utils.getAvatarColor(driver.id)}">${Utils.getInitials(driver.firstName, driver.lastName)}</div>
          <div class="trip-card-driver-info">
            <div class="trip-card-driver-name">${Utils.escapeHtml(driver.firstName)} ${Utils.escapeHtml(driver.lastName.charAt(0))}.</div>
            <div class="trip-card-driver-rating">
              ${ratingData.count > 0 ? `${Utils.renderStars(ratingData.average)} <span>(${ratingData.average})</span>` : '<span style="color:var(--color-text-light)">Nouveau</span>'}
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:var(--font-size-xs);color:var(--color-text-light)">${Utils.formatDateShort(trip.departureTime)}</div>
            <span class="badge ${availableSeats > 0 ? 'badge-success' : 'badge-error'}">${availableSeats > 0 ? `${availableSeats} place${availableSeats > 1 ? 's' : ''}` : 'Complet'}</span>
          </div>
        </div>

        <div class="trip-card-route">
          <div class="trip-card-stop">
            <div class="trip-card-time">${departureTime}</div>
            <div class="trip-card-timeline">
              <div class="trip-card-dot"></div>
              <div class="trip-card-line-v"></div>
            </div>
            <div class="trip-card-place">${Utils.escapeHtml(trip.fromName)}</div>
          </div>
          <div class="trip-card-stop">
            <div class="trip-card-time">${arrivalTime}</div>
            <div class="trip-card-timeline">
              <div class="trip-card-dot filled"></div>
            </div>
            <div class="trip-card-place">${Utils.escapeHtml(trip.toName)}</div>
          </div>
        </div>

        <div class="trip-card-meta">
          <div class="trip-card-info">
            ${trip.distanceKm ? `<div class="trip-card-info-item">📏 ${trip.distanceKm} km</div>` : ''}
            <div class="trip-card-info-item">⏱ ${durationMin} min</div>
            ${trip.distanceKm ? `<div class="trip-card-info-item">🌱 ${Utils.calculateCO2Saved(trip.distanceKm, 1)} kg CO2</div>` : ''}
          </div>
          ${driver.preferences ? Utils.renderPrefIcons(driver.preferences) : ''}
        </div>
      </div>
    `;
  }

  /**
   * Page de détail d'un trajet
   */
  function renderTripDetailPage(tripId) {
    const app = document.getElementById('app-content');
    const trip = CedeoStore.getTrip(tripId);
    const currentUser = CedeoStore.getCurrentUser();

    if (!trip) {
      app.innerHTML = '<div class="container"><div class="empty-state"><div class="empty-state-title">Trajet introuvable</div><a href="#/" class="btn btn-primary">Retour</a></div></div>';
      return;
    }

    const driver = CedeoStore.getUser(trip.driverId);
    if (!driver) return;

    const ratingData = CedeoStore.getUserAverageRating(driver.id);
    const availableSeats = CedeoStore.getAvailableSeats(trip.id);
    const bookings = CedeoStore.getBookingsByTrip(trip.id);
    const durationMin = trip.durationMin || Utils.estimateDuration(trip.distanceKm || 0);
    const departureTime = Utils.formatTime(trip.departureTime);
    const arrivalTime = Utils.formatTime(Utils.estimateArrival(trip.departureTime, durationMin));

    const isDriver = currentUser && trip.driverId === currentUser.id;
    const existingBooking = currentUser && CedeoStore.getBookings().find(b =>
      b.tripId === tripId && b.userId === currentUser.id && b.status === 'confirmed'
    );
    const isPast = new Date(trip.departureTime) < new Date();

    app.innerHTML = `
      <div class="container trip-detail">
        <div class="trip-detail-header">
          <button class="trip-detail-back" onclick="history.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 class="page-title">${Utils.escapeHtml(trip.fromName)} → ${Utils.escapeHtml(trip.toName)}</h1>
            <p class="page-subtitle">${Utils.formatDate(trip.departureTime)}</p>
          </div>
        </div>

        <div class="trip-detail-grid">
          <div>
            <!-- Itinéraire -->
            <div class="card" style="margin-bottom:var(--space-6)">
              <h3 style="margin-bottom:var(--space-4)">Itinéraire</h3>
              <div class="trip-card-route">
                <div class="trip-card-stop">
                  <div class="trip-card-time">${departureTime}</div>
                  <div class="trip-card-timeline">
                    <div class="trip-card-dot"></div>
                    <div class="trip-card-line-v" style="height:40px"></div>
                  </div>
                  <div class="trip-card-place">
                    <strong>${Utils.escapeHtml(trip.fromName)}</strong>
                  </div>
                </div>
                <div class="trip-card-stop">
                  <div class="trip-card-time">${arrivalTime}</div>
                  <div class="trip-card-timeline">
                    <div class="trip-card-dot filled"></div>
                  </div>
                  <div class="trip-card-place">
                    <strong>${Utils.escapeHtml(trip.toName)}</strong>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <div style="display:flex;gap:var(--space-6);flex-wrap:wrap">
                ${trip.distanceKm ? `<div><div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">Distance</div><div style="font-weight:var(--font-weight-semibold)">${trip.distanceKm} km</div></div>` : ''}
                <div><div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">Durée estimée</div><div style="font-weight:var(--font-weight-semibold)">${durationMin} min</div></div>
                <div><div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">Places disponibles</div><div style="font-weight:var(--font-weight-semibold)">${availableSeats} / ${trip.seats}</div></div>
                ${trip.distanceKm ? `<div><div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">CO2 économisé/passager</div><div style="font-weight:var(--font-weight-semibold);color:var(--color-eco)">${Utils.calculateCO2Saved(trip.distanceKm, 1)} kg</div></div>` : ''}
              </div>

              ${trip.comment ? `
                <div class="divider"></div>
                <div>
                  <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary);margin-bottom:var(--space-1)">Commentaire</div>
                  <p style="font-size:var(--font-size-sm)">${Utils.escapeHtml(trip.comment)}</p>
                </div>
              ` : ''}

              ${trip.detourKm ? `
                <div style="margin-top:var(--space-3)">
                  <span class="badge badge-primary">Détour accepté : ${trip.detourKm} km</span>
                </div>
              ` : ''}

              ${trip.recurring ? `
                <div style="margin-top:var(--space-3)">
                  <span class="badge badge-primary">🔄 Trajet récurrent : ${trip.recurringDays?.map(d => ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][d]).join(', ') || 'Tous les jours'}</span>
                </div>
              ` : ''}
            </div>

            <!-- Passagers -->
            ${bookings.length > 0 ? `
              <div class="card" style="margin-bottom:var(--space-6)">
                <h3 style="margin-bottom:var(--space-4)">Passagers (${bookings.length})</h3>
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  ${bookings.map(b => {
                    const passenger = CedeoStore.getUser(b.userId);
                    if (!passenger) return '';
                    return `
                      <div style="display:flex;align-items:center;gap:var(--space-3);cursor:pointer" onclick="App.navigate('/profile/${passenger.id}')">
                        <div class="avatar avatar-sm" style="background-color:${Utils.getAvatarColor(passenger.id)}">${Utils.getInitials(passenger.firstName, passenger.lastName)}</div>
                        <div style="flex:1">
                          <div style="font-weight:var(--font-weight-medium);font-size:var(--font-size-sm)">${Utils.escapeHtml(passenger.firstName)} ${Utils.escapeHtml(passenger.lastName)}</div>
                          <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${b.seats || 1} place${(b.seats || 1) > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <div>
            <!-- Conducteur -->
            <div class="card" style="margin-bottom:var(--space-6)">
              <h3 style="margin-bottom:var(--space-4)">Conducteur</h3>
              <div style="display:flex;align-items:center;gap:var(--space-3);cursor:pointer" onclick="App.navigate('/profile/${driver.id}')">
                <div class="avatar avatar-lg" style="background-color:${Utils.getAvatarColor(driver.id)}">${Utils.getInitials(driver.firstName, driver.lastName)}</div>
                <div>
                  <div style="font-weight:var(--font-weight-semibold)">${Utils.escapeHtml(driver.firstName)} ${Utils.escapeHtml(driver.lastName)}</div>
                  ${ratingData.count > 0 ? `
                    <div style="display:flex;align-items:center;gap:var(--space-1)">
                      ${Utils.renderStars(ratingData.average)}
                      <span style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">(${ratingData.count})</span>
                    </div>
                  ` : '<span style="font-size:var(--font-size-xs);color:var(--color-text-light)">Nouveau membre</span>'}
                </div>
              </div>

              ${driver.vehicle ? `
                <div class="divider"></div>
                <div style="font-size:var(--font-size-sm)">
                  <div style="color:var(--color-text-secondary);font-size:var(--font-size-xs);margin-bottom:var(--space-1)">Véhicule</div>
                  ${Utils.escapeHtml(driver.vehicle.brand)} ${Utils.escapeHtml(driver.vehicle.model)} — ${Utils.escapeHtml(driver.vehicle.color)}
                </div>
              ` : ''}

              ${driver.preferences ? `
                <div class="divider"></div>
                <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary);margin-bottom:var(--space-2)">Préférences</div>
                ${Utils.renderPrefIcons(driver.preferences)}
              ` : ''}
            </div>

            <!-- Actions -->
            <div class="card">
              ${isPast ? `
                <div style="text-align:center;color:var(--color-text-secondary);padding:var(--space-4)">
                  Ce trajet est terminé.
                </div>
              ` : isDriver ? `
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  <div style="text-align:center;color:var(--color-text-secondary);font-size:var(--font-size-sm)">C'est votre trajet</div>
                  <button class="btn btn-accent" id="cancel-trip-btn" style="width:100%">Annuler ce trajet</button>
                </div>
              ` : existingBooking ? `
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  <div style="text-align:center">
                    <span class="badge badge-success" style="font-size:var(--font-size-sm);padding:var(--space-2) var(--space-4)">✓ Réservé</span>
                  </div>
                  <button class="btn btn-ghost" id="cancel-booking-btn" style="width:100%">Annuler ma réservation</button>
                  <button class="btn btn-primary" onclick="App.navigate('/messages/${driver.id}')" style="width:100%">Contacter le conducteur</button>
                </div>
              ` : availableSeats > 0 && currentUser ? `
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  <div class="form-group">
                    <label class="form-label">Nombre de places</label>
                    <select class="form-select" id="booking-seats">
                      ${Array.from({length: Math.min(availableSeats, 4)}, (_, i) => `<option value="${i+1}">${i+1} place${i > 0 ? 's' : ''}</option>`).join('')}
                    </select>
                  </div>
                  <button class="btn btn-primary btn-lg" id="book-trip-btn" style="width:100%">Réserver</button>
                </div>
              ` : availableSeats === 0 ? `
                <div style="text-align:center;color:var(--color-text-secondary);padding:var(--space-4)">
                  Ce trajet est complet.
                </div>
              ` : `
                <div style="text-align:center">
                  <a href="#/login" class="btn btn-primary" style="width:100%">Se connecter pour réserver</a>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    // Gérer les actions
    document.getElementById('book-trip-btn')?.addEventListener('click', () => bookTrip(trip));
    document.getElementById('cancel-trip-btn')?.addEventListener('click', () => cancelTrip(trip));
    document.getElementById('cancel-booking-btn')?.addEventListener('click', () => cancelBooking(existingBooking));
  }

  /**
   * Réserver un trajet
   */
  function bookTrip(trip) {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return;

    const seats = parseInt(document.getElementById('booking-seats')?.value || '1');

    const booking = CedeoStore.createBooking({
      tripId: trip.id,
      userId: currentUser.id,
      driverId: trip.driverId,
      seats: seats
    });

    // Notification au conducteur
    CedeoStore.createNotification({
      userId: trip.driverId,
      type: 'new_booking',
      tripId: trip.id,
      title: 'Nouvelle réservation',
      message: `${currentUser.firstName} a réservé ${seats} place${seats > 1 ? 's' : ''} pour votre trajet ${trip.fromName} → ${trip.toName}.`,
      icon: '🎫'
    });

    // Notification au passager
    CedeoStore.createNotification({
      userId: currentUser.id,
      type: 'booking_confirmed',
      tripId: trip.id,
      title: 'Réservation confirmée',
      message: `Votre place est réservée pour le trajet ${trip.fromName} → ${trip.toName} le ${Utils.formatDateShort(trip.departureTime)}.`,
      icon: '✅'
    });

    window.App.showToast('Réservation confirmée !', 'success');
    window.App.updateNotificationBadge();
    renderTripDetailPage(trip.id);
  }

  /**
   * Annuler un trajet (conducteur)
   */
  function cancelTrip(trip) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce trajet ?')) return;

    CedeoStore.updateTrip(trip.id, { status: 'cancelled' });

    // Notifier les passagers
    const bookings = CedeoStore.getBookingsByTrip(trip.id);
    bookings.forEach(b => {
      CedeoStore.updateBooking(b.id, { status: 'cancelled' });
      CedeoStore.createNotification({
        userId: b.userId,
        type: 'trip_cancelled',
        tripId: trip.id,
        title: 'Trajet annulé',
        message: `Le trajet ${trip.fromName} → ${trip.toName} du ${Utils.formatDateShort(trip.departureTime)} a été annulé par le conducteur.`,
        icon: '❌'
      });
    });

    window.App.showToast('Trajet annulé.', 'warning');
    window.App.navigate('/dashboard');
  }

  /**
   * Annuler une réservation (passager)
   */
  function cancelBooking(booking) {
    if (!confirm('Annuler votre réservation ?')) return;

    CedeoStore.updateBooking(booking.id, { status: 'cancelled' });

    const trip = CedeoStore.getTrip(booking.tripId);
    const currentUser = CedeoStore.getCurrentUser();

    if (trip) {
      CedeoStore.createNotification({
        userId: trip.driverId,
        type: 'booking_cancelled',
        tripId: trip.id,
        title: 'Réservation annulée',
        message: `${currentUser.firstName} a annulé sa réservation pour ${trip.fromName} → ${trip.toName}.`,
        icon: '↩️'
      });
    }

    window.App.showToast('Réservation annulée.', 'warning');
    renderTripDetailPage(booking.tripId);
  }

  /**
   * Page de publication de trajet
   */
  function renderPublishPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    if (!currentUser) {
      window.App.navigate('/login');
      return;
    }

    app.innerHTML = `
      <div class="publish-form">
        <div class="page-header">
          <h1 class="page-title">Publier un trajet</h1>
          <p class="page-subtitle">Proposez des places dans votre véhicule</p>
        </div>

        <form id="publish-form" novalidate>
          <div class="card" style="margin-bottom:var(--space-4)">
            <div class="publish-section-title">📍 Itinéraire</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-4)">
              <div class="form-group autocomplete-wrapper">
                <label class="form-label">Lieu de départ *</label>
                <input class="form-input" type="text" id="pub-from" placeholder="Sélectionnez une agence ou saisissez une adresse" autocomplete="off" required>
                <input type="hidden" id="pub-from-id">
                <div class="autocomplete-list" id="pub-ac-from" style="display:none"></div>
              </div>
              <div class="form-group autocomplete-wrapper">
                <label class="form-label">Lieu d'arrivée *</label>
                <input class="form-input" type="text" id="pub-to" placeholder="Sélectionnez une agence ou saisissez une adresse" autocomplete="off" required>
                <input type="hidden" id="pub-to-id">
                <div class="autocomplete-list" id="pub-ac-to" style="display:none"></div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom:var(--space-4)">
            <div class="publish-section-title">🕐 Date et horaire</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-4)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Date de départ *</label>
                  <input class="form-input" type="date" id="pub-date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                  <label class="form-label">Heure de départ *</label>
                  <input class="form-input" type="time" id="pub-time" required value="08:00">
                </div>
              </div>
              <div class="form-group">
                <label class="form-checkbox">
                  <input type="checkbox" id="pub-recurring"> Trajet récurrent
                </label>
              </div>
              <div id="recurring-days" style="display:none">
                <label class="form-label" style="margin-bottom:var(--space-2)">Jours de récurrence</label>
                <div class="days-picker">
                  <div class="day-chip" data-day="1">L</div>
                  <div class="day-chip" data-day="2">M</div>
                  <div class="day-chip" data-day="3">M</div>
                  <div class="day-chip" data-day="4">J</div>
                  <div class="day-chip" data-day="5">V</div>
                  <div class="day-chip" data-day="6">S</div>
                  <div class="day-chip" data-day="0">D</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom:var(--space-4)">
            <div class="publish-section-title">🚗 Détails</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-4)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Places disponibles *</label>
                  <select class="form-select" id="pub-seats">
                    <option value="1">1 place</option>
                    <option value="2">2 places</option>
                    <option value="3" selected>3 places</option>
                    <option value="4">4 places</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Détour accepté (km)</label>
                  <input class="form-input" type="number" id="pub-detour" min="0" max="50" value="10" placeholder="0">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Commentaire (optionnel)</label>
                <textarea class="form-textarea" id="pub-comment" placeholder="Informations supplémentaires..." rows="3"></textarea>
              </div>
            </div>
          </div>

          <div id="pub-estimate" style="display:none">
            <div class="publish-estimate">
              <div class="publish-estimate-item">
                <div class="publish-estimate-value" id="est-distance">--</div>
                <div class="publish-estimate-label">km</div>
              </div>
              <div class="publish-estimate-item">
                <div class="publish-estimate-value" id="est-duration">--</div>
                <div class="publish-estimate-label">min</div>
              </div>
              <div class="publish-estimate-item">
                <div class="publish-estimate-value" id="est-co2">--</div>
                <div class="publish-estimate-label">kg CO2 économisé</div>
              </div>
            </div>
          </div>

          <div id="pub-error" class="form-error" style="display:none;margin:var(--space-4) 0"></div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:var(--space-4)">Publier le trajet</button>
        </form>
      </div>
    `;

    setupPublishForm();
  }

  /**
   * Configurer le formulaire de publication
   */
  function setupPublishForm() {
    // Autocomplete départ
    setupAutocomplete('pub-from', 'pub-ac-from', 'pub-from-id', () => updateEstimate());
    setupAutocomplete('pub-to', 'pub-ac-to', 'pub-to-id', () => updateEstimate());

    // Récurrence
    document.getElementById('pub-recurring').addEventListener('change', (e) => {
      document.getElementById('recurring-days').style.display = e.target.checked ? 'block' : 'none';
    });

    // Sélection des jours
    document.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', () => chip.classList.toggle('selected'));
    });

    // Soumission
    document.getElementById('publish-form').addEventListener('submit', handlePublish);
  }

  /**
   * Mise à jour des estimations (distance, durée, CO2)
   */
  function updateEstimate() {
    const fromId = document.getElementById('pub-from-id').value;
    const toId = document.getElementById('pub-to-id').value;

    if (fromId && toId) {
      const distance = Utils.getDistanceBetween(fromId, toId);
      const duration = Utils.estimateDuration(distance);
      const co2 = Utils.calculateCO2Saved(distance, 1);

      document.getElementById('est-distance').textContent = distance;
      document.getElementById('est-duration').textContent = duration;
      document.getElementById('est-co2').textContent = co2;
      document.getElementById('pub-estimate').style.display = 'block';
    }
  }

  /**
   * Gère la soumission du formulaire de publication
   */
  function handlePublish(e) {
    e.preventDefault();
    const currentUser = CedeoStore.getCurrentUser();
    const errorEl = document.getElementById('pub-error');

    const fromName = document.getElementById('pub-from').value.trim();
    const toName = document.getElementById('pub-to').value.trim();
    const fromId = document.getElementById('pub-from-id').value;
    const toId = document.getElementById('pub-to-id').value;
    const date = document.getElementById('pub-date').value;
    const time = document.getElementById('pub-time').value;
    const seats = parseInt(document.getElementById('pub-seats').value);
    const detourKm = parseInt(document.getElementById('pub-detour').value) || 0;
    const comment = document.getElementById('pub-comment').value.trim();
    const recurring = document.getElementById('pub-recurring').checked;

    if (!fromName || !toName || !date || !time) {
      errorEl.textContent = 'Veuillez remplir tous les champs obligatoires.';
      errorEl.style.display = 'block';
      return;
    }

    const departureTime = new Date(`${date}T${time}:00`).toISOString();
    let distanceKm = 0;
    let durationMin = 0;

    if (fromId && toId) {
      distanceKm = Utils.getDistanceBetween(fromId, toId);
      durationMin = Utils.estimateDuration(distanceKm);
    }

    const recurringDays = recurring ?
      Array.from(document.querySelectorAll('.day-chip.selected')).map(c => parseInt(c.dataset.day)) :
      null;

    const trip = CedeoStore.createTrip({
      driverId: currentUser.id,
      fromName,
      toName,
      fromId: fromId || null,
      toId: toId || null,
      departureTime,
      seats,
      detourKm,
      comment,
      recurring,
      recurringDays,
      distanceKm,
      durationMin
    });

    // Vérifier les matchs automatiques
    const matches = Matching.findMatchesForTrip(trip);
    if (matches.length > 0) {
      matches.forEach(match => {
        CedeoStore.createNotification({
          userId: match.userId,
          type: 'match',
          tripId: trip.id,
          title: 'Trajet compatible trouvé !',
          message: `Un nouveau trajet ${trip.fromName} → ${trip.toName} correspond à vos recherches.`,
          icon: '✨'
        });
      });

      // Notification au conducteur aussi
      CedeoStore.createNotification({
        userId: currentUser.id,
        type: 'match',
        tripId: trip.id,
        title: `${matches.length} match${matches.length > 1 ? 's' : ''} trouvé${matches.length > 1 ? 's' : ''} !`,
        message: `Des collègues cherchent un trajet compatible avec le vôtre.`,
        icon: '✨'
      });
    }

    // Afficher la confirmation
    showPublishSuccess(trip);
  }

  /**
   * Animation de succès après publication
   */
  function showPublishSuccess(trip) {
    const app = document.getElementById('app-content');
    app.innerHTML = `
      <div class="container">
        <div class="success-animation">
          <div class="success-checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2>Trajet publié avec succès !</h2>
          <p style="color:var(--color-text-secondary)">${Utils.escapeHtml(trip.fromName)} → ${Utils.escapeHtml(trip.toName)}<br>${Utils.formatDate(trip.departureTime)} à ${Utils.formatTime(trip.departureTime)}</p>
          <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4)">
            <a href="#/trip/${trip.id}" class="btn btn-primary">Voir le trajet</a>
            <a href="#/dashboard" class="btn btn-outline">Mon dashboard</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Page de résultats de recherche
   */
  function renderSearchResults(params) {
    const app = document.getElementById('app-content');
    const results = CedeoStore.searchTrips(params);

    app.innerHTML = `
      <div class="container search-results">
        <div class="search-results-header">
          <div>
            <h1 class="page-title">Résultats de recherche</h1>
            <p class="page-subtitle">${results.length} trajet${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}</p>
          </div>
          <div class="search-filters">
            <button class="filter-chip active" data-sort="time">Par heure</button>
            <button class="filter-chip" data-sort="distance">Par distance</button>
            <button class="filter-chip" data-sort="rating">Par note</button>
          </div>
        </div>

        ${results.length === 0 ? `
          <div class="card">
            <div class="empty-state">
              ${window.AppIcons.emptySearch()}
              <div class="empty-state-title">Aucun trajet trouvé</div>
              <div class="empty-state-text">Essayez de modifier vos critères de recherche ou publiez votre propre trajet.</div>
              <a href="#/publish" class="btn btn-primary">Publier un trajet</a>
            </div>
          </div>
        ` : `
          <div class="search-results-list" id="results-list">
            ${results.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))
              .map(t => renderTripCard(t)).join('')}
          </div>
        `}
      </div>
    `;

    // Tri
    app.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        app.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        let sorted = [...results];
        switch (chip.dataset.sort) {
          case 'time':
            sorted.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
            break;
          case 'distance':
            sorted.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
            break;
          case 'rating':
            sorted.sort((a, b) => {
              const ra = CedeoStore.getUserAverageRating(b.driverId);
              const rb = CedeoStore.getUserAverageRating(a.driverId);
              return ra.average - rb.average;
            });
            break;
        }
        document.getElementById('results-list').innerHTML = sorted.map(t => renderTripCard(t)).join('');
      });
    });
  }

  /**
   * Dashboard personnel
   */
  function renderDashboard() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    if (!currentUser) {
      window.App.navigate('/login');
      return;
    }

    const now = new Date();
    const myTrips = CedeoStore.getTripsByDriver(currentUser.id);
    const myBookings = CedeoStore.getBookingsByUser(currentUser.id);

    // Trajets à venir (conducteur)
    const upcomingDriverTrips = myTrips
      .filter(t => t.status === 'active' && new Date(t.departureTime) > now)
      .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

    // Réservations à venir (passager)
    const upcomingBookings = myBookings
      .filter(b => b.status === 'confirmed')
      .map(b => ({ ...b, trip: CedeoStore.getTrip(b.tripId) }))
      .filter(b => b.trip && new Date(b.trip.departureTime) > now)
      .sort((a, b) => new Date(a.trip.departureTime) - new Date(b.trip.departureTime));

    // Historique
    const pastTrips = myTrips
      .filter(t => new Date(t.departureTime) <= now || t.status === 'cancelled')
      .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));

    const pastBookings = myBookings
      .filter(b => {
        const trip = CedeoStore.getTrip(b.tripId);
        return trip && (new Date(trip.departureTime) <= now || b.status === 'cancelled');
      })
      .map(b => ({ ...b, trip: CedeoStore.getTrip(b.tripId) }))
      .sort((a, b) => new Date(b.trip.departureTime) - new Date(a.trip.departureTime));

    // Matchs
    const matches = Matching.findMatchesForUser(currentUser.id);

    app.innerHTML = `
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">Bonjour ${Utils.escapeHtml(currentUser.firstName)} !</h1>
          <p class="page-subtitle">Votre tableau de bord CEDEO Ride</p>
        </div>

        ${matches.length > 0 ? `
          <div style="margin-bottom:var(--space-6)">
            <h2 class="dashboard-section-title">🎯 Matchs suggérés</h2>
            <div class="search-results-list">
              ${matches.slice(0, 2).map(m => renderTripCard(m.trip, true)).join('')}
            </div>
          </div>
        ` : ''}

        <div class="dashboard-grid">
          <div>
            <!-- Prochains trajets conducteur -->
            <div style="margin-bottom:var(--space-6)">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
                <h2 class="dashboard-section-title" style="margin:0">🚗 Mes trajets (conducteur)</h2>
                <a href="#/publish" class="btn btn-primary btn-sm">+ Nouveau</a>
              </div>
              ${upcomingDriverTrips.length === 0 ? `
                <div class="card card-flat" style="text-align:center;padding:var(--space-6)">
                  <p style="color:var(--color-text-secondary)">Aucun trajet à venir</p>
                  <a href="#/publish" class="btn btn-outline btn-sm" style="margin-top:var(--space-3)">Publier un trajet</a>
                </div>
              ` : upcomingDriverTrips.map(t => renderTripCard(t)).join('')}
            </div>

            <!-- Prochains trajets passager -->
            <div style="margin-bottom:var(--space-6)">
              <h2 class="dashboard-section-title">🎫 Mes réservations (passager)</h2>
              ${upcomingBookings.length === 0 ? `
                <div class="card card-flat" style="text-align:center;padding:var(--space-6)">
                  <p style="color:var(--color-text-secondary)">Aucune réservation à venir</p>
                  <a href="#/" class="btn btn-outline btn-sm" style="margin-top:var(--space-3)">Rechercher un trajet</a>
                </div>
              ` : upcomingBookings.map(b => renderTripCard(b.trip)).join('')}
            </div>
          </div>

          <div>
            <!-- Historique -->
            <div>
              <h2 class="dashboard-section-title">📋 Historique</h2>
              <div class="card card-flat" style="padding:0;max-height:400px;overflow-y:auto">
                ${(pastTrips.length + pastBookings.length) === 0 ? `
                  <div style="text-align:center;padding:var(--space-6);color:var(--color-text-secondary)">Aucun trajet passé</div>
                ` : `
                  ${pastTrips.slice(0, 5).map(t => `
                    <div class="notification-item" onclick="App.navigate('/trip/${t.id}')" style="cursor:pointer">
                      <div class="notification-icon" style="background:${t.status === 'cancelled' ? 'var(--color-error-bg)' : 'var(--color-primary-bg)'}">
                        ${t.status === 'cancelled' ? '❌' : '🚗'}
                      </div>
                      <div class="notification-content">
                        <div class="notification-text">${Utils.escapeHtml(t.fromName)} → ${Utils.escapeHtml(t.toName)}</div>
                        <div class="notification-time">${Utils.formatDateShort(t.departureTime)} — ${t.status === 'cancelled' ? 'Annulé' : 'Terminé'}</div>
                      </div>
                    </div>
                  `).join('')}
                  ${pastBookings.slice(0, 5).map(b => `
                    <div class="notification-item" onclick="App.navigate('/trip/${b.trip.id}')" style="cursor:pointer">
                      <div class="notification-icon" style="background:${b.status === 'cancelled' ? 'var(--color-error-bg)' : 'var(--color-success-bg)'}">
                        ${b.status === 'cancelled' ? '↩️' : '🎫'}
                      </div>
                      <div class="notification-content">
                        <div class="notification-text">${Utils.escapeHtml(b.trip.fromName)} → ${Utils.escapeHtml(b.trip.toName)}</div>
                        <div class="notification-time">${Utils.formatDateShort(b.trip.departureTime)} — ${b.status === 'cancelled' ? 'Annulé' : 'Passager'}</div>
                      </div>
                    </div>
                  `).join('')}
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- Helpers autocomplete ---

  function setupSearchAutocomplete() {
    setupAutocomplete('search-from', 'ac-from', null);
    setupAutocomplete('search-to', 'ac-to', null);
  }

  function setupAutocomplete(inputId, listId, hiddenId, onSelect) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (!input || !list) return;

    const handleInput = Utils.debounce(() => {
      const query = input.value.trim();
      const results = Utils.searchAgencies(query);

      if (results.length === 0 || !query) {
        list.style.display = 'none';
        return;
      }

      list.innerHTML = results.map(a => `
        <div class="autocomplete-item" data-id="${a.id}" data-name="${a.name}">
          <span>📍</span> ${a.name}
        </div>
      `).join('');
      list.style.display = 'block';

      list.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          input.value = item.dataset.name;
          if (hiddenId) document.getElementById(hiddenId).value = item.dataset.id;
          list.style.display = 'none';
          if (onSelect) onSelect(item.dataset.id);
        });
      });
    }, 200);

    input.addEventListener('input', handleInput);
    input.addEventListener('focus', handleInput);

    // Fermer le dropdown quand on clique ailleurs
    document.addEventListener('click', (e) => {
      if (!e.target.closest(`#${inputId}`) && !e.target.closest(`#${listId}`)) {
        list.style.display = 'none';
      }
    });
  }

  function setupSearchButton() {
    document.getElementById('search-btn')?.addEventListener('click', () => {
      const from = document.getElementById('search-from').value.trim();
      const to = document.getElementById('search-to').value.trim();
      const date = document.getElementById('search-date').value;

      // Trouver l'ID de l'agence si possible
      const fromAgency = Utils.AGENCIES.find(a => a.name === from);
      const toAgency = Utils.AGENCIES.find(a => a.name === to);

      const params = {};
      if (fromAgency) params.from = fromAgency.id;
      else if (from) params.from = from;
      if (toAgency) params.to = toAgency.id;
      else if (to) params.to = to;
      if (date) params.date = date;

      // Encoder les paramètres dans le hash
      const searchStr = new URLSearchParams(params).toString();
      window.App.navigate(`/search?${searchStr}`);
    });
  }

  return {
    renderHomePage,
    renderTripCard,
    renderTripDetailPage,
    renderPublishPage,
    renderSearchResults,
    renderDashboard
  };
})();
