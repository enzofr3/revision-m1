/* ===========================================
   CEDEO Ride — Module Statistiques
   Dashboard impact, graphiques, leaderboard
   =========================================== */

const Stats = (() => {

  /**
   * Affiche la page de statistiques / impact
   */
  function renderStatsPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    if (!currentUser) {
      window.App.navigate('/login');
      return;
    }

    const allBookings = CedeoStore.getBookings().filter(b => b.status === 'confirmed');
    const allTrips = CedeoStore.getTrips();
    const allUsers = CedeoStore.getUsers();

    // --- Statistiques individuelles ---
    const myBookingsAsPassenger = allBookings.filter(b => b.userId === currentUser.id);
    const myTripsAsDriver = allTrips.filter(t => t.driverId === currentUser.id);
    const myBookingsAsDriver = allBookings.filter(b => b.driverId === currentUser.id);
    const myTotalRides = myBookingsAsPassenger.length + myBookingsAsDriver.length;

    let myTotalDistance = 0;
    let myTotalCO2 = 0;

    myBookingsAsPassenger.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip?.distanceKm) {
        myTotalDistance += trip.distanceKm;
        myTotalCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
      }
    });

    myBookingsAsDriver.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip?.distanceKm) {
        myTotalCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
      }
    });

    const myMoneySaved = myTotalDistance * 0.15;
    const myTrees = Utils.co2ToTrees(myTotalCO2);

    // --- Statistiques collectives ---
    let totalCO2 = 0;
    let totalDistance = 0;

    allBookings.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip?.distanceKm) {
        totalCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
        totalDistance += trip.distanceKm;
      }
    });

    // --- Classement des agences ---
    const agencyStats = {};
    Utils.AGENCIES.forEach(a => { agencyStats[a.id] = { name: a.shortName, count: 0 }; });

    allBookings.forEach(b => {
      const user = CedeoStore.getUser(b.userId);
      if (user?.agencyId && agencyStats[user.agencyId]) {
        agencyStats[user.agencyId].count++;
      }
    });

    allTrips.forEach(t => {
      const user = CedeoStore.getUser(t.driverId);
      if (user?.agencyId && agencyStats[user.agencyId]) {
        agencyStats[user.agencyId].count++;
      }
    });

    const sortedAgencies = Object.values(agencyStats).sort((a, b) => b.count - a.count).slice(0, 6);
    const maxAgencyCount = Math.max(...sortedAgencies.map(a => a.count), 1);

    // --- Top covoitureurs ---
    const userRideCount = {};
    allBookings.forEach(b => {
      userRideCount[b.userId] = (userRideCount[b.userId] || 0) + 1;
      if (b.driverId) userRideCount[b.driverId] = (userRideCount[b.driverId] || 0) + 1;
    });

    const topUsers = Object.entries(userRideCount)
      .map(([userId, count]) => ({ user: CedeoStore.getUser(userId), count }))
      .filter(item => item.user)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // --- Trajets les plus populaires ---
    const routeCount = {};
    allTrips.forEach(t => {
      const key = `${t.fromName} → ${t.toName}`;
      routeCount[key] = (routeCount[key] || 0) + 1;
    });
    const topRoutes = Object.entries(routeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // --- Données mensuelles (3 derniers mois) ---
    const monthlyData = getMonthlyData(allBookings);

    app.innerHTML = `
      <div class="container" style="padding-bottom:var(--space-8)">
        <div class="page-header">
          <h1 class="page-title">Dashboard Impact</h1>
          <p class="page-subtitle">Mesurez l'impact positif du covoiturage en région Ouest</p>
        </div>

        <!-- Mon impact -->
        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4)">📊 Mon impact personnel</h2>
        <div class="stats-grid" style="margin-bottom:var(--space-8)">
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-primary-bg);color:var(--color-primary)">🚗</div>
            <div>
              <div class="stat-value">${myTotalRides}</div>
              <div class="stat-label">Covoiturages</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-warning-bg);color:var(--color-warning)">📏</div>
            <div>
              <div class="stat-value">${Math.round(myTotalDistance)} km</div>
              <div class="stat-label">Distance partagée</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-eco-bg);color:var(--color-eco)">🌱</div>
            <div>
              <div class="stat-value">${Math.round(myTotalCO2 * 10) / 10} kg</div>
              <div class="stat-label">CO2 économisé</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-success-bg);color:var(--color-success)">🌳</div>
            <div>
              <div class="stat-value">${myTrees}</div>
              <div class="stat-label">Arbres équivalents</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:#ede9fe;color:#7c3aed">💰</div>
            <div>
              <div class="stat-value">${Math.round(myMoneySaved)}€</div>
              <div class="stat-label">Économie estimée</div>
            </div>
          </div>
        </div>

        <!-- Impact collectif -->
        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4)">🌍 Impact collectif — Région Ouest</h2>
        <div class="stats-grid" style="margin-bottom:var(--space-8)">
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-primary-bg);color:var(--color-primary)">🚗</div>
            <div>
              <div class="stat-value">${allBookings.length}</div>
              <div class="stat-label">Covoiturages total</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-eco-bg);color:var(--color-eco)">🌱</div>
            <div>
              <div class="stat-value">${Math.round(totalCO2)} kg</div>
              <div class="stat-label">CO2 économisé total</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-warning-bg);color:var(--color-warning)">📏</div>
            <div>
              <div class="stat-value">${Math.round(totalDistance)} km</div>
              <div class="stat-label">Km partagés total</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-success-bg);color:var(--color-success)">👥</div>
            <div>
              <div class="stat-value">${allUsers.length}</div>
              <div class="stat-label">Membres actifs</div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:var(--space-6);margin-bottom:var(--space-8)">
          ${window.chartJsLoaded ? `
            <!-- Graphique évolution mensuelle -->
            <div class="card chart-container">
              <div class="chart-title">Évolution mensuelle des covoiturages</div>
              <canvas id="monthly-chart"></canvas>
            </div>
          ` : `
            <!-- Graphique évolution mensuelle (CSS) -->
            <div class="card" style="padding:var(--space-6)">
              <div class="chart-title">Évolution mensuelle des covoiturages</div>
              <div class="bar-chart">
                ${monthlyData.map(m => `
                  <div class="bar-chart-item">
                    <div class="bar-chart-value">${m.count}</div>
                    <div class="bar-chart-bar" style="height:${Math.max(5, (m.count / Math.max(...monthlyData.map(d => d.count), 1)) * 100)}%"></div>
                    <div class="bar-chart-label">${m.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `}

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--space-6)">
            <!-- Classement agences -->
            <div class="card" style="padding:var(--space-6)">
              <div class="chart-title">Agences les plus actives</div>
              <div class="bar-chart" style="height:180px">
                ${sortedAgencies.map(a => `
                  <div class="bar-chart-item">
                    <div class="bar-chart-value">${a.count}</div>
                    <div class="bar-chart-bar" style="height:${Math.max(5, (a.count / maxAgencyCount) * 100)}%"></div>
                    <div class="bar-chart-label">${a.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Top trajets -->
            <div class="card" style="padding:var(--space-6)">
              <div class="chart-title">Top 5 des trajets</div>
              ${topRoutes.length === 0 ? '<p style="color:var(--color-text-secondary)">Aucun trajet</p>' : `
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  ${topRoutes.map(([ route, count], i) => `
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                      <span class="leaderboard-rank" style="width:24px;height:24px;font-size:11px">${i + 1}</span>
                      <div style="flex:1;font-size:var(--font-size-sm)">${Utils.escapeHtml(route)}</div>
                      <span class="badge badge-primary">${count}</span>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Leaderboard -->
        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4)">🏆 Classement des covoitureurs</h2>
        <div class="card" style="padding:var(--space-6);margin-bottom:var(--space-8)">
          ${topUsers.length === 0 ? '<p style="color:var(--color-text-secondary);text-align:center">Aucun covoiturage réalisé</p>' : `
            <div class="leaderboard-list">
              ${topUsers.map((item, i) => {
                const badges = Utils.getUserBadges(item.user.id);
                const rating = CedeoStore.getUserAverageRating(item.user.id);
                return `
                  <div class="leaderboard-item" style="cursor:pointer" onclick="App.navigate('/profile/${item.user.id}')">
                    <span class="leaderboard-rank">${i + 1}</span>
                    <div class="avatar avatar-sm" style="background-color:${Utils.getAvatarColor(item.user.id)}">${Utils.getInitials(item.user.firstName, item.user.lastName)}</div>
                    <div class="leaderboard-info">
                      <div class="leaderboard-name">${Utils.escapeHtml(item.user.firstName)} ${Utils.escapeHtml(item.user.lastName)}</div>
                      <div class="leaderboard-stat">
                        ${item.count} covoiturages
                        ${rating.count > 0 ? ` · ${Utils.renderStars(rating.average)}` : ''}
                        ${badges.map(b => ` <span title="${b.label}">${b.emoji}</span>`).join('')}
                      </div>
                    </div>
                    <span class="badge badge-eco">${item.count}</span>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    // Initialiser Chart.js si disponible
    if (window.chartJsLoaded) {
      initChartJS(monthlyData);
    }
  }

  /**
   * Calcule les données mensuelles sur les 6 derniers mois
   */
  function getMonthlyData(bookings) {
    const months = [];
    const now = new Date();
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();

      const count = bookings.filter(b => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === month && bd.getFullYear() === year;
      }).length;

      months.push({
        label: monthNames[month],
        month,
        year,
        count
      });
    }

    return months;
  }

  /**
   * Initialise les graphiques Chart.js
   */
  function initChartJS(monthlyData) {
    const canvas = document.getElementById('monthly-chart');
    if (!canvas || !window.Chart) return;

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: monthlyData.map(m => m.label),
        datasets: [{
          label: 'Covoiturages',
          data: monthlyData.map(m => m.count),
          borderColor: '#003DA5',
          backgroundColor: 'rgba(0, 61, 165, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#003DA5',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * Page d'administration
   */
  function renderAdminPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    if (!currentUser) {
      window.App.navigate('/login');
      return;
    }

    const users = CedeoStore.getUsers();
    const trips = CedeoStore.getTrips();
    const bookings = CedeoStore.getBookings();

    app.innerHTML = `
      <div class="container" style="padding-bottom:var(--space-8)">
        <div class="page-header">
          <h1 class="page-title">Administration</h1>
          <p class="page-subtitle">Vue globale de la plateforme</p>
        </div>

        <!-- Stats rapides -->
        <div class="stats-grid" style="margin-bottom:var(--space-6)">
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-primary-bg);color:var(--color-primary)">👥</div>
            <div><div class="stat-value">${users.length}</div><div class="stat-label">Utilisateurs</div></div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-success-bg);color:var(--color-success)">🚗</div>
            <div><div class="stat-value">${trips.length}</div><div class="stat-label">Trajets</div></div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background:var(--color-warning-bg);color:var(--color-warning)">🎫</div>
            <div><div class="stat-value">${bookings.length}</div><div class="stat-label">Réservations</div></div>
          </div>
        </div>

        <!-- Export -->
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-bottom:var(--space-6)">
          <button class="btn btn-outline btn-sm" id="export-users">📥 Export utilisateurs (CSV)</button>
          <button class="btn btn-outline btn-sm" id="export-trips">📥 Export trajets (CSV)</button>
          <button class="btn btn-outline btn-sm" id="export-bookings">📥 Export réservations (CSV)</button>
          <button class="btn btn-accent btn-sm" id="reset-data">🗑 Réinitialiser les données</button>
        </div>

        <!-- Tabs -->
        <div class="tabs admin-tabs" id="admin-tabs">
          <button class="tab active" data-tab="users">Utilisateurs</button>
          <button class="tab" data-tab="trips">Trajets</button>
        </div>

        <div id="admin-content">
          ${renderAdminUsersTable(users)}
        </div>
      </div>
    `;

    // Tabs
    document.querySelectorAll('#admin-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#admin-tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const content = document.getElementById('admin-content');
        if (tab.dataset.tab === 'users') {
          content.innerHTML = renderAdminUsersTable(users);
          setupAdminUserActions();
        } else {
          content.innerHTML = renderAdminTripsTable(trips);
          setupAdminTripActions();
        }
      });
    });

    setupAdminUserActions();

    // Export CSV
    document.getElementById('export-users').addEventListener('click', () => downloadCSV('users'));
    document.getElementById('export-trips').addEventListener('click', () => downloadCSV('trips'));
    document.getElementById('export-bookings').addEventListener('click', () => downloadCSV('bookings'));

    // Reset
    document.getElementById('reset-data').addEventListener('click', () => {
      if (confirm('Réinitialiser toutes les données ? Cette action est irréversible.')) {
        CedeoStore.resetAll();
        window.location.reload();
      }
    });
  }

  function renderAdminUsersTable(users) {
    return `
      <div class="card card-flat" style="overflow-x:auto;padding:0">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Agence</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              const agency = Utils.getAgencyById(u.agencyId);
              return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:var(--space-2)">
                      <div class="avatar avatar-xs" style="background-color:${Utils.getAvatarColor(u.id)}">${Utils.getInitials(u.firstName, u.lastName)}</div>
                      ${Utils.escapeHtml(u.firstName)} ${Utils.escapeHtml(u.lastName)}
                    </div>
                  </td>
                  <td>${Utils.escapeHtml(u.email)}</td>
                  <td>${agency ? agency.shortName : '-'}</td>
                  <td>${Utils.formatDateShort(u.createdAt)}</td>
                  <td>
                    <button class="btn btn-ghost btn-sm delete-user-btn" data-id="${u.id}">Supprimer</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderAdminTripsTable(trips) {
    return `
      <div class="card card-flat" style="overflow-x:auto;padding:0">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Conducteur</th>
              <th>Trajet</th>
              <th>Date</th>
              <th>Places</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${trips.map(t => {
              const driver = CedeoStore.getUser(t.driverId);
              return `
                <tr>
                  <td>${driver ? `${Utils.escapeHtml(driver.firstName)} ${Utils.escapeHtml(driver.lastName.charAt(0))}.` : 'Inconnu'}</td>
                  <td>${Utils.escapeHtml(t.fromName)} → ${Utils.escapeHtml(t.toName)}</td>
                  <td>${Utils.formatDateShort(t.departureTime)}</td>
                  <td>${CedeoStore.getAvailableSeats(t.id)} / ${t.seats}</td>
                  <td><span class="badge ${t.status === 'active' ? 'badge-success' : 'badge-error'}">${t.status === 'active' ? 'Actif' : 'Annulé'}</span></td>
                  <td>
                    <button class="btn btn-ghost btn-sm delete-trip-btn" data-id="${t.id}">Supprimer</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function setupAdminUserActions() {
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Supprimer cet utilisateur ?')) {
          CedeoStore.deleteUser(btn.dataset.id);
          renderAdminPage();
        }
      });
    });
  }

  function setupAdminTripActions() {
    document.querySelectorAll('.delete-trip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Supprimer ce trajet ?')) {
          CedeoStore.deleteTrip(btn.dataset.id);
          renderAdminPage();
        }
      });
    });
  }

  function downloadCSV(type) {
    const csv = CedeoStore.exportCSV(type);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cedeo-ride-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return {
    renderStatsPage,
    renderAdminPage
  };
})();
