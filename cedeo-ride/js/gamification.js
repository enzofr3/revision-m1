/* ===========================================
   CEDEO Ride — Module Gamification
   Challenges, achievements, compétitions inter-agences
   =========================================== */

const Gamification = (() => {

  // Définition des achievements
  const ACHIEVEMENTS = [
    { id: 'first_ride', name: 'Premier Pas', desc: 'Effectuer votre premier covoiturage', iconName: 'confetti', requirement: ctx => ctx.totalRides >= 1 },
    { id: 'eco_starter', name: 'Éco-Débutant', desc: 'Économiser 5 kg de CO2', iconName: 'seedling', requirement: ctx => ctx.totalCO2 >= 5 },
    { id: 'eco_warrior', name: 'Éco-Guerrier', desc: 'Économiser 50 kg de CO2', iconName: 'sprout', requirement: ctx => ctx.totalCO2 >= 50 },
    { id: 'eco_hero', name: 'Héros Vert', desc: 'Économiser 200 kg de CO2', iconName: 'tree-deciduous', requirement: ctx => ctx.totalCO2 >= 200 },
    { id: 'social_5', name: 'Sociable', desc: 'Covoiturer avec 5 collègues différents', iconName: 'handshake', requirement: ctx => ctx.uniquePeople >= 5 },
    { id: 'social_10', name: 'Fédérateur', desc: 'Covoiturer avec 10 collègues différents', iconName: 'users', requirement: ctx => ctx.uniquePeople >= 10 },
    { id: 'driver_5', name: 'Chauffeur Confirmé', desc: 'Proposer 5 trajets en tant que conducteur', iconName: 'car', requirement: ctx => ctx.tripsAsDriver >= 5 },
    { id: 'driver_20', name: 'Pilote Expert', desc: 'Proposer 20 trajets en tant que conducteur', iconName: 'speed', requirement: ctx => ctx.tripsAsDriver >= 20 },
    { id: 'star_rating', name: 'Étoile Montante', desc: 'Obtenir une note moyenne de 4.5+', iconName: 'star', requirement: ctx => ctx.avgRating >= 4.5 && ctx.ratingCount >= 3 },
    { id: 'all_agencies', name: 'Globe-Trotter Ouest', desc: 'Visiter les 10 agences de la région', iconName: 'map', requirement: ctx => ctx.visitedAgencies >= 10 },
    { id: 'km_100', name: 'Centenaire', desc: 'Parcourir 100 km en covoiturage', iconName: 'ruler', requirement: ctx => ctx.totalKm >= 100 },
    { id: 'km_500', name: 'Routard', desc: 'Parcourir 500 km en covoiturage', iconName: 'road', requirement: ctx => ctx.totalKm >= 500 },
    { id: 'km_1000', name: 'Marathonien', desc: 'Parcourir 1 000 km en covoiturage', iconName: 'medal', requirement: ctx => ctx.totalKm >= 1000 },
    { id: 'streak_5', name: 'Régulier', desc: 'Covoiturer 5 jours consécutifs', iconName: 'flame', requirement: ctx => ctx.streak >= 5 },
    { id: 'money_50', name: 'Économe', desc: 'Économiser 50€ en covoiturage', iconName: 'money', requirement: ctx => ctx.moneySaved >= 50 },
    { id: 'early_bird', name: 'Lève-tôt', desc: 'Prendre un covoiturage avant 7h00', iconName: 'sunrise', requirement: ctx => ctx.earlyRides >= 1 }
  ];

  // Challenges mensuels
  const MONTHLY_CHALLENGES = [
    { id: 'ch_rides_10', name: 'Objectif 10 trajets', desc: '10 covoiturages ce mois-ci', iconName: 'target', target: 10, type: 'rides' },
    { id: 'ch_co2_30', name: 'Défi CO2', desc: 'Économiser 30 kg de CO2 ce mois-ci', iconName: 'globe', target: 30, type: 'co2' },
    { id: 'ch_new_people', name: 'Nouveaux Contacts', desc: 'Covoiturer avec 3 nouvelles personnes', iconName: 'handshake', target: 3, type: 'new_people' },
    { id: 'ch_km_200', name: 'Challenge Distance', desc: 'Parcourir 200 km partagés ce mois-ci', iconName: 'road', target: 200, type: 'km' }
  ];

  /**
   * Calcule le contexte de gamification pour un utilisateur
   */
  function getUserContext(userId) {
    const bookings = CedeoStore.getBookings().filter(b => b.status === 'confirmed');
    const trips = CedeoStore.getTrips();
    const ratings = CedeoStore.getRatings();

    const myBookingsAsPassenger = bookings.filter(b => b.userId === userId);
    const myBookingsAsDriver = bookings.filter(b => b.driverId === userId);
    const myTripsAsDriver = trips.filter(t => t.driverId === userId);

    // Total rides
    const totalRides = myBookingsAsPassenger.length + myBookingsAsDriver.length;

    // CO2 & km
    let totalCO2 = 0;
    let totalKm = 0;
    const visitedAgencyIds = new Set();

    myBookingsAsPassenger.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip?.distanceKm) {
        totalCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
        totalKm += trip.distanceKm;
        if (trip.fromId) visitedAgencyIds.add(trip.fromId);
        if (trip.toId) visitedAgencyIds.add(trip.toId);
      }
    });

    myBookingsAsDriver.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip?.distanceKm) {
        totalCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
        if (trip.fromId) visitedAgencyIds.add(trip.fromId);
        if (trip.toId) visitedAgencyIds.add(trip.toId);
      }
    });

    myTripsAsDriver.forEach(t => {
      if (t.fromId) visitedAgencyIds.add(t.fromId);
      if (t.toId) visitedAgencyIds.add(t.toId);
    });

    // Unique people
    const uniquePeople = new Set();
    myBookingsAsPassenger.forEach(b => uniquePeople.add(b.driverId));
    myBookingsAsDriver.forEach(b => uniquePeople.add(b.userId));

    // Rating
    const userRatings = ratings.filter(r => r.toUserId === userId);
    const avgRating = userRatings.length > 0 ?
      userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length : 0;

    // Early rides (before 7am)
    let earlyRides = 0;
    myBookingsAsPassenger.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip && new Date(trip.departureTime).getHours() < 7) earlyRides++;
    });

    // Streak calculation (simplified)
    let streak = Math.min(totalRides, 7);

    // Money saved
    const moneySaved = totalKm * 0.15;

    return {
      totalRides,
      totalCO2,
      totalKm,
      uniquePeople: uniquePeople.size,
      tripsAsDriver: myTripsAsDriver.length,
      avgRating,
      ratingCount: userRatings.length,
      visitedAgencies: visitedAgencyIds.size,
      streak,
      earlyRides,
      moneySaved
    };
  }

  /**
   * Retourne les achievements débloqués et verrouillés
   */
  function getUserAchievements(userId) {
    const ctx = getUserContext(userId);
    const unlocked = [];
    const locked = [];

    ACHIEVEMENTS.forEach(ach => {
      if (ach.requirement(ctx)) {
        unlocked.push(ach);
      } else {
        locked.push(ach);
      }
    });

    return { unlocked, locked, ctx };
  }

  /**
   * Calcule la progression des challenges mensuels
   */
  function getMonthlyChallengeProgress(userId) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const bookings = CedeoStore.getBookings().filter(b => {
      if (b.status !== 'confirmed') return false;
      const d = new Date(b.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const myBookingsPassenger = bookings.filter(b => b.userId === userId);
    const myBookingsDriver = bookings.filter(b => b.driverId === userId);
    const totalMonthRides = myBookingsPassenger.length + myBookingsDriver.length;

    let monthCO2 = 0;
    let monthKm = 0;
    const newPeople = new Set();

    myBookingsPassenger.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip?.distanceKm) {
        monthCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
        monthKm += trip.distanceKm;
      }
      newPeople.add(b.driverId);
    });

    myBookingsDriver.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip?.distanceKm) {
        monthCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
      }
      newPeople.add(b.userId);
    });

    return MONTHLY_CHALLENGES.map(ch => {
      let current = 0;
      switch (ch.type) {
        case 'rides': current = totalMonthRides; break;
        case 'co2': current = Math.round(monthCO2); break;
        case 'new_people': current = newPeople.size; break;
        case 'km': current = Math.round(monthKm); break;
      }
      return {
        ...ch,
        current,
        progress: Math.min(100, Math.round((current / ch.target) * 100)),
        completed: current >= ch.target
      };
    });
  }

  /**
   * Classement inter-agences
   */
  function getAgencyRanking() {
    const bookings = CedeoStore.getBookings().filter(b => b.status === 'confirmed');
    const trips = CedeoStore.getTrips();
    const users = CedeoStore.getUsers();

    const stats = {};
    Utils.AGENCIES.forEach(a => {
      stats[a.id] = { name: a.shortName, rides: 0, co2: 0, members: 0, score: 0 };
    });

    // Compter les membres par agence
    users.forEach(u => {
      if (u.agencyId && stats[u.agencyId]) {
        stats[u.agencyId].members++;
      }
    });

    // Compter les covoiturages par agence
    bookings.forEach(b => {
      const user = CedeoStore.getUser(b.userId);
      const driver = CedeoStore.getUser(b.driverId);
      const trip = CedeoStore.getTrip(b.tripId);

      if (user?.agencyId && stats[user.agencyId]) {
        stats[user.agencyId].rides++;
        if (trip?.distanceKm) {
          stats[user.agencyId].co2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
        }
      }
      if (driver?.agencyId && stats[driver.agencyId]) {
        stats[driver.agencyId].rides++;
      }
    });

    // Score = rides par membre (pour normaliser)
    Object.values(stats).forEach(s => {
      s.score = s.members > 0 ? Math.round((s.rides / s.members) * 100) / 100 : 0;
      s.co2 = Math.round(s.co2 * 10) / 10;
    });

    return Object.values(stats).sort((a, b) => b.score - a.score);
  }

  /**
   * Niveau de l'utilisateur basé sur les achievements
   */
  function getUserLevel(userId) {
    const { unlocked } = getUserAchievements(userId);
    const count = unlocked.length;
    if (count >= 12) return { level: 5, name: 'Expert Covoitureur', color: '#7c3aed', nextAt: null };
    if (count >= 8) return { level: 4, name: 'Covoitureur Confirmé', color: '#003DA5', nextAt: 12 };
    if (count >= 5) return { level: 3, name: 'Covoitureur Régulier', color: '#16a34a', nextAt: 8 };
    if (count >= 2) return { level: 2, name: 'Apprenti Covoitureur', color: '#f59e0b', nextAt: 5 };
    return { level: 1, name: 'Débutant', color: '#6B7280', nextAt: 2 };
  }

  /**
   * Rendu de la page Challenges
   */
  function renderChallengesPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    if (!currentUser) {
      window.App.navigate('/login');
      return;
    }

    const { unlocked, locked, ctx } = getUserAchievements(currentUser.id);
    const challenges = getMonthlyChallengeProgress(currentUser.id);
    const agencyRanking = getAgencyRanking();
    const level = getUserLevel(currentUser.id);

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const currentMonth = monthNames[new Date().getMonth()];

    app.innerHTML = `
      <div class="container" style="padding-bottom:var(--space-10)">
        <div class="page-header">
          <h1 class="page-title">Challenges & Achievements</h1>
          <p class="page-subtitle">Relevez les défis et gagnez des badges !</p>
        </div>

        <!-- Niveau utilisateur -->
        <div class="card gamif-level-card" style="margin-bottom:var(--space-8)">
          <div class="gamif-level-header">
            <div class="gamif-level-badge" style="background:${level.color}">
              <span class="gamif-level-number">${level.level}</span>
            </div>
            <div class="gamif-level-info">
              <div class="gamif-level-name">${level.name}</div>
              <div class="gamif-level-progress-text">${unlocked.length} / ${ACHIEVEMENTS.length} achievements débloqués</div>
              ${level.nextAt ? `
                <div class="gamif-level-bar">
                  <div class="gamif-level-bar-fill" style="width:${Math.round((unlocked.length / level.nextAt) * 100)}%"></div>
                </div>
                <div class="gamif-level-next">Prochain niveau : ${level.nextAt} achievements</div>
              ` : '<div class="gamif-level-next" style="color:var(--color-success)">Niveau maximum atteint !</div>'}
            </div>
          </div>
          <div class="gamif-user-stats">
            <div class="gamif-stat"><span class="gamif-stat-value">${ctx.totalRides}</span><span class="gamif-stat-label">Trajets</span></div>
            <div class="gamif-stat"><span class="gamif-stat-value">${Math.round(ctx.totalCO2)}</span><span class="gamif-stat-label">kg CO2</span></div>
            <div class="gamif-stat"><span class="gamif-stat-value">${Math.round(ctx.totalKm)}</span><span class="gamif-stat-label">km</span></div>
            <div class="gamif-stat"><span class="gamif-stat-value">${ctx.uniquePeople}</span><span class="gamif-stat-label">Collègues</span></div>
          </div>
        </div>

        <!-- Challenges du mois -->
        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4)">${AppIcons.i('target', 18)} Challenges de ${currentMonth}</h2>
        <div class="gamif-challenges-grid" style="margin-bottom:var(--space-8)">
          ${challenges.map(ch => `
            <div class="card gamif-challenge ${ch.completed ? 'completed' : ''}">
              <div class="gamif-challenge-header">
                <span class="gamif-challenge-icon">${AppIcons.i(ch.iconName, 24)}</span>
                <div class="gamif-challenge-info">
                  <div class="gamif-challenge-name">${ch.name}</div>
                  <div class="gamif-challenge-desc">${ch.desc}</div>
                </div>
                ${ch.completed ? '<span class="gamif-challenge-check">' + AppIcons.i('check', 18, '#22c55e') + '</span>' : ''}
              </div>
              <div class="gamif-progress-bar">
                <div class="gamif-progress-fill ${ch.completed ? 'complete' : ''}" style="width:${ch.progress}%"></div>
              </div>
              <div class="gamif-progress-text">${ch.current} / ${ch.target} — ${ch.progress}%</div>
            </div>
          `).join('')}
        </div>

        <!-- Achievements -->
        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4)">${AppIcons.i('trophy', 18)} Achievements (${unlocked.length}/${ACHIEVEMENTS.length})</h2>
        <div class="gamif-achievements-grid" style="margin-bottom:var(--space-8)">
          ${unlocked.map(a => `
            <div class="gamif-achievement unlocked">
              <div class="gamif-achievement-icon">${AppIcons.i(a.iconName, 28)}</div>
              <div class="gamif-achievement-name">${a.name}</div>
              <div class="gamif-achievement-desc">${a.desc}</div>
            </div>
          `).join('')}
          ${locked.map(a => `
            <div class="gamif-achievement locked">
              <div class="gamif-achievement-icon">${AppIcons.i('lock', 28)}</div>
              <div class="gamif-achievement-name">${a.name}</div>
              <div class="gamif-achievement-desc">${a.desc}</div>
            </div>
          `).join('')}
        </div>

        <!-- Compétition inter-agences -->
        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4)">${AppIcons.i('medal', 18)} Compétition Inter-Agences</h2>
        <p style="color:var(--color-text-secondary);font-size:var(--font-size-sm);margin-bottom:var(--space-4)">
          Score = covoiturages par membre (pour une compétition équitable)
        </p>
        <div class="card" style="padding:var(--space-6)">
          <div class="gamif-agency-ranking">
            ${agencyRanking.map((agency, i) => `
              <div class="gamif-agency-rank-item ${i < 3 ? 'top-3' : ''}">
                <span class="gamif-rank-position ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</span>
                <div class="gamif-rank-info">
                  <div class="gamif-rank-name">${Utils.escapeHtml(agency.name)}</div>
                  <div class="gamif-rank-detail">${agency.rides} covoiturages · ${agency.members} membres · ${agency.co2} kg CO2</div>
                </div>
                <div class="gamif-rank-score">
                  <div class="gamif-rank-score-value">${agency.score}</div>
                  <div class="gamif-rank-score-label">score</div>
                </div>
                <div class="gamif-rank-bar-bg">
                  <div class="gamif-rank-bar" style="width:${agencyRanking[0].score > 0 ? Math.round((agency.score / agencyRanking[0].score) * 100) : 0}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  return {
    getUserAchievements,
    getUserLevel,
    getMonthlyChallengeProgress,
    getAgencyRanking,
    renderChallengesPage,
    ACHIEVEMENTS
  };
})();
