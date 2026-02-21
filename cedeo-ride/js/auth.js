/* ===========================================
   CEDEO Ride — Module d'authentification
   Connexion, inscription, profil utilisateur
   =========================================== */

const Auth = (() => {

  /**
   * Affiche la page de connexion / inscription
   */
  function renderLoginPage() {
    const app = document.getElementById('app-content');
    app.innerHTML = `
      <div class="login-page">
        <div class="login-image">
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80" alt="Covoiturage" loading="lazy">
          <div class="login-image-text">
            <h2>Partagez la route, pas les frais.</h2>
            <p>Rejoignez vos collègues CEDEO pour des trajets plus économiques, plus écologiques et plus conviviaux.</p>
          </div>
        </div>
        <div class="login-form-side">
          <div class="login-card">
            <div class="login-logo">
              ${window.AppIcons.logoFull()}
              <h1>Bienvenue</h1>
              <p>Connectez-vous pour accéder au covoiturage interne</p>
            </div>
            <form id="login-form" novalidate>
              <div style="display:flex;flex-direction:column;gap:var(--space-4)">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="login-firstname">Prénom *</label>
                    <input class="form-input" type="text" id="login-firstname" placeholder="Votre prénom" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="login-lastname">Nom *</label>
                    <input class="form-input" type="text" id="login-lastname" placeholder="Votre nom" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="login-email">Email professionnel *</label>
                  <input class="form-input" type="email" id="login-email" placeholder="prenom.nom@cedeo.fr" required>
                  <span class="form-hint">@cedeo.fr ou @saint-gobain.com</span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="login-agency">Agence de rattachement *</label>
                  <select class="form-select" id="login-agency" required>
                    <option value="">Sélectionnez votre agence</option>
                    ${Utils.AGENCIES.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="login-phone">Téléphone (optionnel)</label>
                  <input class="form-input" type="tel" id="login-phone" placeholder="06 XX XX XX XX">
                </div>
                <div id="login-error" class="form-error" style="display:none"></div>
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%">
                  Se connecter / S'inscrire
                </button>
              </div>
            </form>
            <div style="text-align:center;margin-top:var(--space-6)">
              <p style="font-size:var(--font-size-xs);color:var(--color-text-light)">
                En vous connectant, vous accédez à la plateforme de covoiturage<br>de la région Ouest CEDEO (Saint-Gobain).
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
  }

  /**
   * Gère la soumission du formulaire de connexion
   */
  function handleLogin(e) {
    e.preventDefault();
    const firstName = document.getElementById('login-firstname').value.trim();
    const lastName = document.getElementById('login-lastname').value.trim();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const agencyId = document.getElementById('login-agency').value;
    const phone = document.getElementById('login-phone').value.trim();
    const errorEl = document.getElementById('login-error');

    // Validation
    if (!firstName || !lastName || !email || !agencyId) {
      errorEl.textContent = 'Veuillez remplir tous les champs obligatoires.';
      errorEl.style.display = 'block';
      return;
    }

    if (!email.endsWith('@cedeo.fr') && !email.endsWith('@saint-gobain.com')) {
      errorEl.textContent = 'Veuillez utiliser une adresse @cedeo.fr ou @saint-gobain.com.';
      errorEl.style.display = 'block';
      return;
    }

    // Chercher l'utilisateur existant
    let user = CedeoStore.findUserByEmail(email);

    if (user) {
      // Connexion : mise à jour éventuelle
      CedeoStore.updateUser(user.id, { firstName, lastName, agencyId, phone });
    } else {
      // Inscription
      user = CedeoStore.createUser({
        firstName,
        lastName,
        email,
        agencyId,
        phone,
        vehicle: null,
        preferences: { music: true, chat: true, smoking: false, pets: false }
      });

      // Notification de bienvenue
      CedeoStore.createNotification({
        userId: user.id,
        type: 'welcome',
        title: 'Bienvenue sur CEDEO Ride !',
        message: 'Commencez par publier un trajet ou recherchez un covoiturage.',
        icon: '🎉'
      });
    }

    CedeoStore.setCurrentUser(user.id);
    window.App.navigate('/');
  }

  /**
   * Affiche la page de profil (propre ou public)
   */
  function renderProfilePage(userId) {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    const isOwn = !userId || userId === currentUser?.id;
    const user = isOwn ? currentUser : CedeoStore.getUser(userId);

    if (!user) {
      app.innerHTML = '<div class="container"><div class="empty-state"><div class="empty-state-title">Utilisateur introuvable</div></div></div>';
      return;
    }

    const agency = Utils.getAgencyById(user.agencyId);
    const ratingData = CedeoStore.getUserAverageRating(user.id);
    const badges = Utils.getUserBadges(user.id);
    const ratings = CedeoStore.getUserRatings(user.id);

    app.innerHTML = `
      <div class="profile-header">
        <div class="avatar avatar-2xl" style="background-color:${Utils.getAvatarColor(user.id)};margin:0 auto var(--space-4)">${Utils.getInitials(user.firstName, user.lastName)}</div>
        <div class="profile-name">${Utils.escapeHtml(user.firstName)} ${Utils.escapeHtml(user.lastName)}</div>
        <div class="profile-email">${Utils.escapeHtml(user.email)}</div>
        ${ratingData.count > 0 ? `
          <div style="margin-top:var(--space-2);display:flex;align-items:center;justify-content:center;gap:var(--space-2)">
            ${Utils.renderStars(ratingData.average)}
            <span style="opacity:0.8;font-size:var(--font-size-sm)">${ratingData.average}/5 (${ratingData.count} avis)</span>
          </div>
        ` : ''}
        ${badges.length > 0 ? `
          <div class="profile-badges">
            ${badges.map(b => `<span class="badge badge-success">${b.emoji} ${b.label}</span>`).join('')}
          </div>
        ` : ''}
        ${typeof Gamification !== 'undefined' ? (() => {
          const level = Gamification.getUserLevel(user.id);
          const { unlocked } = Gamification.getUserAchievements(user.id);
          return `
            <div style="margin-top:var(--space-4);display:flex;align-items:center;justify-content:center;gap:var(--space-3)">
              <div style="width:32px;height:32px;border-radius:50%;background:${level.color};display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;font-size:14px">${level.level}</div>
              <span style="opacity:0.9;font-size:var(--font-size-sm)">${level.name} · ${unlocked.length} achievements</span>
            </div>
          `;
        })() : ''}
      </div>
      <div class="container">
        <div class="profile-section">
          <div class="profile-section-title">Informations</div>
          <div class="card card-flat">
            <div class="profile-info-grid" style="padding:var(--space-4)">
              <div class="profile-info-item">
                <span class="profile-info-label">Agence</span>
                <span class="profile-info-value">${agency ? agency.shortName : 'Non définie'}</span>
              </div>
              <div class="profile-info-item">
                <span class="profile-info-label">Téléphone</span>
                <span class="profile-info-value">${user.phone ? Utils.escapeHtml(user.phone) : 'Non renseigné'}</span>
              </div>
              <div class="profile-info-item">
                <span class="profile-info-label">Membre depuis</span>
                <span class="profile-info-value">${Utils.formatDate(user.createdAt)}</span>
              </div>
              <div class="profile-info-item">
                <span class="profile-info-label">Véhicule</span>
                <span class="profile-info-value">${user.vehicle ? `${Utils.escapeHtml(user.vehicle.brand)} ${Utils.escapeHtml(user.vehicle.model)} (${Utils.escapeHtml(user.vehicle.color)})` : 'Non renseigné'}</span>
              </div>
            </div>
          </div>
        </div>

        ${user.preferences ? `
          <div class="profile-section">
            <div class="profile-section-title">Préférences de trajet</div>
            <div class="card card-flat" style="padding:var(--space-4)">
              ${Utils.renderPrefIcons(user.preferences)}
            </div>
          </div>
        ` : ''}

        ${isOwn ? `
          <div class="profile-section">
            <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
              <a href="#/challenges" class="btn btn-outline btn-sm">🏆 Mes challenges</a>
              <a href="#/events" class="btn btn-outline btn-sm">⭐ Mes favoris</a>
              <a href="#/map" class="btn btn-outline btn-sm">🗺️ Carte</a>
              <button class="btn btn-ghost btn-sm" onclick="CedeoStore.logout();App.navigate('/');App.renderShell();">Déconnexion</button>
            </div>
          </div>
          <div class="profile-section">
            <div class="profile-section-title">Modifier mon profil</div>
            <div class="card card-flat" style="padding:var(--space-4)">
              <form id="profile-edit-form">
                <div style="display:flex;flex-direction:column;gap:var(--space-4)">
                  <div class="form-group">
                    <label class="form-label">Téléphone</label>
                    <input class="form-input" type="tel" id="edit-phone" value="${user.phone || ''}" placeholder="06 XX XX XX XX">
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Marque du véhicule</label>
                      <input class="form-input" type="text" id="edit-vehicle-brand" value="${user.vehicle?.brand || ''}" placeholder="Ex: Renault">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Modèle</label>
                      <input class="form-input" type="text" id="edit-vehicle-model" value="${user.vehicle?.model || ''}" placeholder="Ex: Mégane">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Couleur du véhicule</label>
                    <input class="form-input" type="text" id="edit-vehicle-color" value="${user.vehicle?.color || ''}" placeholder="Ex: Gris">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Préférences</label>
                    <div style="display:flex;flex-direction:column;gap:var(--space-2)">
                      <label class="form-checkbox">
                        <input type="checkbox" id="pref-music" ${user.preferences?.music ? 'checked' : ''}> Musique dans la voiture
                      </label>
                      <label class="form-checkbox">
                        <input type="checkbox" id="pref-chat" ${user.preferences?.chat ? 'checked' : ''}> Discussion bienvenue
                      </label>
                      <label class="form-checkbox">
                        <input type="checkbox" id="pref-smoking" ${user.preferences?.smoking ? 'checked' : ''}> Fumeur
                      </label>
                      <label class="form-checkbox">
                        <input type="checkbox" id="pref-pets" ${user.preferences?.pets ? 'checked' : ''}> Animaux acceptés
                      </label>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        ` : `
          <div class="profile-section" style="text-align:center">
            <button class="btn btn-primary" onclick="App.navigate('/messages/${user.id}')">Envoyer un message</button>
          </div>
        `}

        ${ratings.length > 0 ? `
          <div class="profile-section">
            <div class="profile-section-title">Avis reçus (${ratings.length})</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-3)">
              ${ratings.slice(0, 5).map(r => {
                const reviewer = CedeoStore.getUser(r.fromUserId);
                return `
                  <div class="card card-flat card-compact">
                    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2)">
                      <div class="avatar avatar-sm" style="background-color:${reviewer ? Utils.getAvatarColor(reviewer.id) : '#ccc'}">${reviewer ? Utils.getInitials(reviewer.firstName, reviewer.lastName) : '?'}</div>
                      <div>
                        <div style="font-weight:var(--font-weight-medium);font-size:var(--font-size-sm)">${reviewer ? Utils.escapeHtml(reviewer.firstName) : 'Anonyme'}</div>
                        ${Utils.renderStars(r.rating)}
                      </div>
                      <div style="margin-left:auto;font-size:var(--font-size-xs);color:var(--color-text-light)">${Utils.timeAgo(r.createdAt)}</div>
                    </div>
                    ${r.comment ? `<p style="font-size:var(--font-size-sm);color:var(--color-text-secondary)">${Utils.escapeHtml(r.comment)}</p>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Gestion du formulaire d'édition
    if (isOwn) {
      document.getElementById('profile-edit-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const updates = {
          phone: document.getElementById('edit-phone').value.trim(),
          vehicle: {
            brand: document.getElementById('edit-vehicle-brand').value.trim(),
            model: document.getElementById('edit-vehicle-model').value.trim(),
            color: document.getElementById('edit-vehicle-color').value.trim()
          },
          preferences: {
            music: document.getElementById('pref-music').checked,
            chat: document.getElementById('pref-chat').checked,
            smoking: document.getElementById('pref-smoking').checked,
            pets: document.getElementById('pref-pets').checked
          }
        };
        CedeoStore.updateUser(currentUser.id, updates);
        window.App.showToast('Profil mis à jour !', 'success');
      });
    }
  }

  return {
    renderLoginPage,
    renderProfilePage,
    handleLogin
  };
})();
