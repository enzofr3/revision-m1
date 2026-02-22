/* ===========================================
   CEDEO Ride — Système de confiance progressif (Feature 12)
   4 niveaux : Nouveau → Vérifié → Confirmé → Ambassadeur
   =========================================== */

const TrustSystem = (() => {
  const STORAGE_KEY = 'cedeoride_trust_levels';

  const LEVELS = [
    {
      id: 'nouveau',
      name: 'Nouveau',
      iconName: 'seedling',
      color: '#94A3B8',
      minTrips: 0,
      minRating: 0,
      description: 'Vous débutez sur CEDEO Ride',
      perks: ['Accès basique', 'Publication de trajets']
    },
    {
      id: 'verifie',
      name: 'Vérifié',
      iconName: 'check-circle',
      color: '#003DA5',
      minTrips: 3,
      minRating: 3.5,
      description: 'Votre profil est vérifié par la communauté',
      perks: ['Badge vérifié', 'Priorité dans les résultats', 'Accès Pool Fixe']
    },
    {
      id: 'confirme',
      name: 'Confirmé',
      iconName: 'star',
      color: '#16a34a',
      minTrips: 10,
      minRating: 4.0,
      description: 'Un membre de confiance de la communauté',
      perks: ['Badge confirmé', 'Création de pools', 'Parrainage', 'Priorité SOS']
    },
    {
      id: 'ambassadeur',
      name: 'Ambassadeur',
      iconName: 'crown',
      color: '#d97706',
      minTrips: 25,
      minRating: 4.5,
      description: 'Ambassadeur CEDEO Ride de la région Ouest',
      perks: ['Badge ambassadeur doré', 'Modération communauté', 'Événements VIP', 'Parrainage illimité']
    }
  ];

  function getUserTrustLevel(userId) {
    const bookings = CedeoStore.getBookings().filter(b =>
      (b.userId === userId || b.driverId === userId) && b.status === 'confirmed'
    );
    const trips = CedeoStore.getTripsByDriver(userId);
    const totalTrips = bookings.length + trips.length;
    const ratingData = CedeoStore.getUserAverageRating(userId);
    const avgRating = ratingData.count > 0 ? ratingData.average : 0;

    let level = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalTrips >= LEVELS[i].minTrips && (avgRating >= LEVELS[i].minRating || ratingData.count === 0 && LEVELS[i].minRating <= 3.5)) {
        level = LEVELS[i];
        break;
      }
    }

    const nextLevel = LEVELS[LEVELS.indexOf(level) + 1] || null;
    const progress = nextLevel ?
      Math.min(100, Math.round((totalTrips / nextLevel.minTrips) * 100)) : 100;

    return {
      ...level,
      totalTrips,
      avgRating,
      progress,
      nextLevel
    };
  }

  function getUserSponsorships(userId) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return data[userId]?.sponsorships || [];
    } catch { return []; }
  }

  function addSponsorship(sponsorId, sponsoredId) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      if (!data[sponsorId]) data[sponsorId] = { sponsorships: [] };
      if (!data[sponsorId].sponsorships.includes(sponsoredId)) {
        data[sponsorId].sponsorships.push(sponsoredId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        CedeoStore.createNotification({
          userId: sponsoredId,
          type: 'sponsorship',
          title: 'Parrainage reçu !',
          message: `Un membre confirmé vous a parrainé. Votre niveau de confiance augmente !`,
          icon: 'handshake'
        });
      }
    } catch { /* ignore */ }
  }

  function getAmbassadors() {
    return CedeoStore.getUsers()
      .map(u => ({ user: u, trust: getUserTrustLevel(u.id) }))
      .filter(u => u.trust.id === 'ambassadeur')
      .sort((a, b) => b.trust.totalTrips - a.trust.totalTrips);
  }

  function renderTrustBadge(userId, size = 'sm') {
    const trust = getUserTrustLevel(userId);
    const sizes = { sm: '20px', md: '24px', lg: '32px' };
    const s = sizes[size] || sizes.sm;

    if (trust.id === 'nouveau') return '';

    return `<span class="badge badge-trust-${trust.id}" style="font-size:${s === '20px' ? '10px' : '11px'};display:inline-flex;align-items:center;gap:4px" title="${trust.name}">${AppIcons.i(trust.iconName, 14, trust.color)} ${trust.name}</span>`;
  }

  function renderAmbassadorsPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    const userTrust = currentUser ? getUserTrustLevel(currentUser.id) : null;
    const ambassadors = getAmbassadors();
    const allUsers = CedeoStore.getUsers().map(u => ({
      user: u,
      trust: getUserTrustLevel(u.id)
    })).sort((a, b) => b.trust.totalTrips - a.trust.totalTrips);

    app.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4)">
        <div class="page-header">
          <h1 class="page-title">Système de Confiance</h1>
          <p class="page-subtitle">Progressez et devenez ambassadeur CEDEO Ride</p>
        </div>

        ${currentUser ? `
          <div class="card" style="margin-bottom:var(--space-6);overflow:hidden;padding:0">
            <div style="background:linear-gradient(135deg, ${userTrust.color}15, ${userTrust.color}05);padding:var(--space-6)">
              <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4)">
                <div style="width:64px;height:64px;border-radius:var(--radius-full);background:${userTrust.color};display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px ${userTrust.color}40">
                  ${AppIcons.i(userTrust.iconName, 28, '#fff')}
                </div>
                <div>
                  <div style="font-size:var(--font-size-xl);font-weight:var(--font-weight-bold)">${userTrust.name}</div>
                  <div style="font-size:var(--font-size-sm);color:var(--color-text-secondary)">${userTrust.description}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--color-text-light);margin-top:var(--space-1)">${userTrust.totalTrips} trajets · Note ${userTrust.avgRating}/5</div>
                </div>
              </div>
              ${userTrust.nextLevel ? `
                <div style="margin-bottom:var(--space-2)">
                  <div style="display:flex;justify-content:space-between;font-size:var(--font-size-xs);margin-bottom:var(--space-1)">
                    <span>Progression vers ${userTrust.nextLevel.name}</span>
                    <span>${userTrust.progress}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-bar-fill" style="width:${userTrust.progress}%"></div>
                  </div>
                  <div style="font-size:var(--font-size-xs);color:var(--color-text-light);margin-top:var(--space-1)">
                    Encore ${userTrust.nextLevel.minTrips - userTrust.totalTrips} trajets pour atteindre le niveau suivant
                  </div>
                </div>
              ` : '<div style="font-size:var(--font-size-sm);color:var(--color-success);font-weight:var(--font-weight-semibold)">Niveau maximum atteint !</div>'}
            </div>
            <div style="padding:var(--space-4) var(--space-6)">
              <div style="font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-2)">Avantages de votre niveau</div>
              <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">
                ${userTrust.perks.map(p => `<span class="badge badge-primary">${p}</span>`).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Niveaux de confiance -->
        <div style="margin-bottom:var(--space-8)">
          <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Les 4 niveaux</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:var(--space-4)">
            ${LEVELS.map(l => `
              <div class="card card-compact" style="border-left:4px solid ${l.color}">
                <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
                  <div style="width:40px;height:40px;border-radius:var(--radius-full);background:${l.color}15;display:flex;align-items:center;justify-content:center">${AppIcons.i(l.iconName, 20, l.color)}</div>
                  <div>
                    <div style="font-weight:var(--font-weight-semibold)">${l.name}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-light)">${l.minTrips}+ trajets · ${l.minRating}+ ★</div>
                  </div>
                </div>
                <p style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${l.description}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Ambassadeurs -->
        ${ambassadors.length > 0 ? `
          <div>
            <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Nos Ambassadeurs</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:var(--space-4)">
              ${ambassadors.map(a => {
                const agency = Utils.getAgencyById(a.user.agencyId);
                return `
                  <div class="card card-clickable card-compact" onclick="App.navigate('/profile/${a.user.id}')">
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                      <div class="avatar avatar-lg" style="background-color:${Utils.getAvatarColor(a.user.id)}">${Utils.getInitials(a.user.firstName, a.user.lastName)}</div>
                      <div>
                        <div style="font-weight:var(--font-weight-semibold)">${Utils.escapeHtml(a.user.firstName)} ${Utils.escapeHtml(a.user.lastName)}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${agency ? agency.shortName : ''}</div>
                        <span class="badge badge-trust-ambassadeur" style="margin-top:var(--space-1);display:inline-flex;align-items:center;gap:4px">${AppIcons.i('crown', 14, '#d97706')} Ambassadeur</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Classement communauté -->
        <div style="margin-top:var(--space-8)">
          <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Classement communauté</h2>
          <div class="card" style="padding:0;overflow:hidden">
            ${allUsers.slice(0, 10).map((u, i) => `
              <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-divider);cursor:pointer" onclick="App.navigate('/profile/${u.user.id}')">
                <div style="width:28px;text-align:center;font-weight:var(--font-weight-bold);color:${i < 3 ? ['#d97706','#6b7280','#c2410c'][i] : 'var(--color-text-light)'}">${i + 1}</div>
                <div class="avatar avatar-sm" style="background-color:${Utils.getAvatarColor(u.user.id)}">${Utils.getInitials(u.user.firstName, u.user.lastName)}</div>
                <div style="flex:1">
                  <div style="font-weight:var(--font-weight-medium);font-size:var(--font-size-sm)">${Utils.escapeHtml(u.user.firstName)} ${Utils.escapeHtml(u.user.lastName)}</div>
                </div>
                <span class="badge badge-trust-${u.trust.id}" style="display:inline-flex;align-items:center;gap:4px">${AppIcons.i(u.trust.iconName, 14, u.trust.color)} ${u.trust.name}</span>
                <span style="font-size:var(--font-size-xs);color:var(--color-text-light)">${u.trust.totalTrips} trajets</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  return {
    getUserTrustLevel,
    renderTrustBadge,
    getAmbassadors,
    addSponsorship,
    getUserSponsorships,
    renderAmbassadorsPage,
    LEVELS
  };
})();
