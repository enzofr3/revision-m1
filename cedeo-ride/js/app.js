/* ===========================================
   CEDEO Ride — Application principale
   Router SPA, initialisation, navigation
   =========================================== */

const App = (() => {

  /**
   * Initialise l'application
   */
  function init() {
    // Charger les données de démo si première fois
    if (!CedeoStore.isInitialized()) {
      DemoData.load();
      CedeoStore.setInitialized();
    }

    // Rendu initial
    renderShell();
    handleRoute();

    // Écouter les changements de hash
    window.addEventListener('hashchange', handleRoute);

    // Vérifier les notifications automatiques
    Notifications.checkAutoNotifications();

    // Vérification périodique (toutes les 60s)
    setInterval(() => {
      Notifications.checkAutoNotifications();
      updateNotificationBadge();
      updateMessageBadge();
    }, 60000);
  }

  /**
   * Structure principale (header, contenu, nav mobile)
   */
  function renderShell() {
    const currentUser = CedeoStore.getCurrentUser();

    document.getElementById('app').innerHTML = `
      <!-- Header -->
      <header class="header">
        <div class="header-inner">
          <div class="header-logo" onclick="App.navigate('/')">
            ${window.AppIcons.logoSmall()}
            <span>CEDEO Ride</span>
          </div>

          ${currentUser ? `
            <nav class="header-nav">
              <a class="header-nav-link" href="#/" data-route="/">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Rechercher
              </a>
              <a class="header-nav-link" href="#/publish" data-route="/publish">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Publier
              </a>
              <a class="header-nav-link" href="#/dashboard" data-route="/dashboard">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Dashboard
              </a>
              <a class="header-nav-link" href="#/map" data-route="/map">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                Carte
              </a>
              <a class="header-nav-link" href="#/challenges" data-route="/challenges">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>
                Challenges
              </a>
              <a class="header-nav-link" href="#/stats" data-route="/stats">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Impact
              </a>
            </nav>

            <div class="header-actions">
              <a href="#/messages" class="btn btn-icon btn-ghost header-notif" title="Messages">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span class="badge-count msg-badge-count" style="display:none">0</span>
              </a>
              <a href="#/notifications" class="btn btn-icon btn-ghost header-notif" title="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="badge-count notif-badge-count" style="display:none">0</span>
              </a>
              <a href="#/profile" class="avatar avatar-sm" style="background-color:${Utils.getAvatarColor(currentUser.id)}" title="Mon profil">
                ${Utils.getInitials(currentUser.firstName, currentUser.lastName)}
              </a>
            </div>
          ` : `
            <div class="header-actions">
              <a href="#/login" class="btn btn-primary btn-sm">Se connecter</a>
            </div>
          `}
        </div>
      </header>

      <!-- Contenu principal -->
      <main class="main-content" id="app-content"></main>

      <!-- Navigation mobile -->
      ${currentUser ? `
        <nav class="bottom-nav">
          <div class="bottom-nav-inner">
            <a class="bottom-nav-item" href="#/" data-route="/">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span>Rechercher</span>
            </a>
            <a class="bottom-nav-item" href="#/publish" data-route="/publish">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>Publier</span>
            </a>
            <a class="bottom-nav-item" href="#/map" data-route="/map">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              <span>Carte</span>
            </a>
            <a class="bottom-nav-item" href="#/dashboard" data-route="/dashboard">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>Dashboard</span>
            </a>
            <a class="bottom-nav-item" href="#/notifications" data-route="/notifications">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>Notifs</span>
              <span class="badge-count notif-badge-count" style="display:none">0</span>
            </a>
          </div>
        </nav>
      ` : ''}

      <!-- Toast container -->
      <div class="toast-container" id="toast-container"></div>
    `;

    updateNotificationBadge();
    updateMessageBadge();
    updateActiveNav();
  }

  /**
   * Router : gère les changements de hash
   */
  function handleRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '');

    // Arrêter le polling chat si on quitte la page messages
    Chat.stopMessageCheck();

    // Parser la route
    let route, params;
    if (path.startsWith('/search')) {
      route = '/search';
      const queryString = path.split('?')[1] || '';
      params = Object.fromEntries(new URLSearchParams(queryString));
    } else if (path.startsWith('/trip/')) {
      route = '/trip';
      params = path.split('/')[2];
    } else if (path.startsWith('/profile/')) {
      route = '/profile-public';
      params = path.split('/')[2];
    } else if (path.startsWith('/messages/')) {
      route = '/messages-contact';
      params = path.split('/')[2];
    } else {
      route = path.split('?')[0];
      params = null;
    }

    // Vérifier si l'utilisateur est connecté pour les routes protégées
    const protectedRoutes = ['/publish', '/dashboard', '/messages', '/messages-contact', '/stats', '/admin', '/profile', '/notifications', '/map', '/challenges', '/events'];
    const currentUser = CedeoStore.getCurrentUser();

    if (protectedRoutes.includes(route) && !currentUser) {
      navigate('/login');
      return;
    }

    // Re-render le shell si l'état de connexion a changé
    const shellHasUser = document.querySelector('.header-actions .avatar');
    if ((currentUser && !shellHasUser) || (!currentUser && shellHasUser)) {
      renderShell();
    }

    // Routing
    switch (route) {
      case '/':
        Trips.renderHomePage();
        break;
      case '/login':
        Auth.renderLoginPage();
        break;
      case '/publish':
        Trips.renderPublishPage();
        break;
      case '/search':
        Trips.renderSearchResults(params);
        break;
      case '/trip':
        Trips.renderTripDetailPage(params);
        break;
      case '/dashboard':
        Trips.renderDashboard();
        break;
      case '/messages':
        Chat.renderMessagesPage(null);
        break;
      case '/messages-contact':
        Chat.renderMessagesPage(params);
        break;
      case '/stats':
        Stats.renderStatsPage();
        break;
      case '/profile':
        Auth.renderProfilePage(null);
        break;
      case '/profile-public':
        Auth.renderProfilePage(params);
        break;
      case '/notifications':
        Notifications.renderNotificationsPage();
        break;
      case '/map':
        MapModule.renderMapPage();
        break;
      case '/challenges':
        Gamification.renderChallengesPage();
        break;
      case '/events':
        Events.renderEventsPage();
        break;
      case '/admin':
        Stats.renderAdminPage();
        break;
      default:
        Trips.renderHomePage();
    }

    updateActiveNav();
    window.scrollTo(0, 0);
  }

  /**
   * Navigation programmatique
   */
  function navigate(path) {
    window.location.hash = '#' + path;
  }

  /**
   * Met à jour la navigation active
   */
  function updateActiveNav() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '').split('?')[0];

    // Desktop nav
    document.querySelectorAll('.header-nav-link').forEach(link => {
      const route = link.dataset.route;
      link.classList.toggle('active', path === route || (route !== '/' && path.startsWith(route)));
    });

    // Mobile nav
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      const route = item.dataset.route;
      item.classList.toggle('active', path === route || (route !== '/' && path.startsWith(route)));
    });
  }

  /**
   * Met à jour les badges de notification
   */
  function updateNotificationBadge() {
    Notifications.updateBadge();
  }

  /**
   * Met à jour le badge de messages non lus
   */
  function updateMessageBadge() {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return;

    const count = CedeoStore.getUnreadMessageCount(currentUser.id);
    document.querySelectorAll('.msg-badge-count').forEach(el => {
      if (count > 0) {
        el.textContent = count > 99 ? '99+' : count;
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    });
  }

  /**
   * Affiche un toast (notification temporaire)
   */
  function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003DA5" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const toast = Utils.createElement(`
      <div class="toast toast-${type}">
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
          <div class="toast-title">${Utils.escapeHtml(message)}</div>
        </div>
        <button class="toast-close">&times;</button>
      </div>
    `);

    container.appendChild(toast);

    // Fermer au clic
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

    // Auto-fermeture
    setTimeout(() => removeToast(toast), duration);
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  return {
    init,
    navigate,
    showToast,
    updateNotificationBadge,
    updateMessageBadge,
    renderShell
  };
})();

// Exposer globalement pour les onclick inline
window.App = App;

// Démarrer l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', App.init);
