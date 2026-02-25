/* ===========================================
   CEDEO Ride — Utilitaires
   Fonctions de calcul, formatage, helpers génériques
   =========================================== */

const Utils = (() => {
  // --- Agences de la région Ouest avec coordonnées GPS ---
  const AGENCIES = [
    { id: 'rennes-lorient', name: 'CEDEO Rennes Route de Lorient', lat: 48.1058, lng: -1.7254, shortName: 'Rennes Lorient' },
    { id: 'rennes-stgregoire', name: 'CEDEO Rennes Saint-Grégoire', lat: 48.1410, lng: -1.6870, shortName: 'Rennes St-Grégoire' },
    { id: 'cesson-bray', name: 'CEDEO Cesson - Bray', lat: 48.1190, lng: -1.6050, shortName: 'Cesson Bray' },
    { id: 'cesson-chene', name: 'CEDEO Cesson - Chêne Morand', lat: 48.1150, lng: -1.6110, shortName: 'Cesson Chêne Morand' },
    { id: 'chateaubourg', name: 'CEDEO Châteaubourg', lat: 48.1100, lng: -1.4040, shortName: 'Châteaubourg' },
    { id: 'derval', name: 'CEDEO Derval (STAC)', lat: 47.6660, lng: -1.6690, shortName: 'Derval (STAC)' },
    { id: 'saint-malo', name: 'CEDEO Saint-Malo', lat: 48.6490, lng: -1.9780, shortName: 'Saint-Malo' },
    { id: 'dinan', name: 'CEDEO Dinan', lat: 48.4510, lng: -2.0470, shortName: 'Dinan' },
    { id: 'fougeres', name: 'CEDEO Fougères', lat: 48.3520, lng: -1.2000, shortName: 'Fougères' },
    { id: 'la-roche', name: 'CEDEO La Roche-sur-Yon', lat: 46.6700, lng: -1.4270, shortName: 'La Roche-sur-Yon' }
  ];

  // --- Couleurs pour avatars ---
  const AVATAR_COLORS = [
    '#003DA5', '#DA291C', '#16a34a', '#7c3aed', '#0891b2',
    '#c2410c', '#4338ca', '#0d9488', '#b91c1c', '#7c2d12'
  ];

  /**
   * Génère un identifiant unique
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Calcule la distance entre deux points GPS (formule de Haversine)
   * @returns {number} Distance en km
   */
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  function toRad(deg) {
    return deg * Math.PI / 180;
  }

  /**
   * Estime la durée de trajet en minutes (vitesse moyenne de 70 km/h route)
   * On multiplie la distance à vol d'oiseau par un facteur 1.3 pour approximer la route
   */
  function estimateDuration(distanceKm) {
    const routeDistance = distanceKm * 1.3;
    return Math.round(routeDistance / 70 * 60);
  }

  /**
   * Calcule le CO2 économisé par le covoiturage
   * Formule : distance × 0.12 kg CO2/km × (nb passagers)
   */
  function calculateCO2Saved(distanceKm, nbPassengers) {
    return Math.round(distanceKm * 0.12 * nbPassengers * 10) / 10;
  }

  /**
   * Calcule l'économie financière
   * 0.15€/km × distance × nb passagers
   */
  function calculateMoneySaved(distanceKm, nbPassengers) {
    return Math.round(distanceKm * 0.15 * nbPassengers * 100) / 100;
  }

  /**
   * Convertit des kg de CO2 en nombre d'arbres équivalents
   * 1 arbre absorbe environ 25 kg de CO2 par an
   */
  function co2ToTrees(co2Kg) {
    return Math.round(co2Kg / 25 * 10) / 10;
  }

  /**
   * Génère les initiales à partir d'un prénom et nom
   */
  function getInitials(firstName, lastName) {
    return ((firstName || '').charAt(0) + (lastName || '').charAt(0)).toUpperCase();
  }

  /**
   * Retourne une couleur stable pour un avatar en fonction de l'ID utilisateur
   */
  function getAvatarColor(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  /**
   * Crée un élément HTML d'avatar avec les initiales
   */
  function createAvatarElement(user, sizeClass = 'avatar-md') {
    const el = document.createElement('div');
    el.className = `avatar ${sizeClass}`;
    el.style.backgroundColor = getAvatarColor(user.id);
    el.textContent = getInitials(user.firstName, user.lastName);
    return el;
  }

  /**
   * Formate une date en français
   */
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (isSameDay(date, today)) return "Aujourd'hui";
    if (isSameDay(date, tomorrow)) return 'Demain';

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  }

  /**
   * Formate une date courte (ex: "Lun 15 Jan")
   */
  function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (isSameDay(date, today)) return "Aujourd'hui";
    if (isSameDay(date, tomorrow)) return 'Demain';

    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('fr-FR', options);
  }

  /**
   * Formate une heure (ex: "08:30")
   */
  function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Formate un timestamp relatif (il y a X minutes, etc.)
   */
  function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "À l'instant";
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
    return formatDateShort(dateStr);
  }

  function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  }

  /**
   * Calcule l'heure d'arrivée estimée
   */
  function estimateArrival(departureTime, durationMin) {
    const d = new Date(departureTime);
    d.setMinutes(d.getMinutes() + durationMin);
    return d.toISOString();
  }

  /**
   * Debounce une fonction
   */
  function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Échappe le HTML pour prévenir les XSS
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Crée un élément DOM à partir d'un template HTML
   */
  function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  /**
   * Affiche les étoiles de notation (lecture seule)
   */
  function renderStars(rating, size = '') {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '<div class="stars stars-readonly">';
    for (let i = 1; i <= 5; i++) {
      if (i <= full) {
        html += '<span class="star filled">&#9733;</span>';
      } else if (i === full + 1 && half) {
        html += '<span class="star filled">&#9733;</span>';
      } else {
        html += '<span class="star">&#9734;</span>';
      }
    }
    html += '</div>';
    return html;
  }

  /**
   * Crée des étoiles interactives pour la notation
   */
  function renderInteractiveStars(currentRating = 0, onRate) {
    const container = document.createElement('div');
    container.className = 'stars';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = `star ${i <= currentRating ? 'filled' : ''}`;
      star.innerHTML = i <= currentRating ? '&#9733;' : '&#9734;';
      star.addEventListener('click', () => {
        onRate(i);
        container.querySelectorAll('.star').forEach((s, idx) => {
          s.className = `star ${idx < i ? 'filled' : ''}`;
          s.innerHTML = idx < i ? '&#9733;' : '&#9734;';
        });
      });
      container.appendChild(star);
    }
    return container;
  }

  /**
   * Rendu des icônes de préférences
   */
  function renderPrefIcons(prefs) {
    if (!prefs) return '';
    const icons = [];
    if (prefs.music !== undefined) icons.push(`<span class="pref-icon ${prefs.music ? 'active' : ''}" title="${prefs.music ? 'Musique appréciée' : 'Pas de musique'}">&#9835;</span>`);
    if (prefs.chat !== undefined) icons.push(`<span class="pref-icon ${prefs.chat ? 'active' : ''}" title="${prefs.chat ? 'Discussion bienvenue' : 'Silence apprécié'}">&#128172;</span>`);
    if (prefs.smoking !== undefined) icons.push(`<span class="pref-icon ${prefs.smoking ? '' : 'active'}" title="${prefs.smoking ? 'Fumeur' : 'Non-fumeur'}">&#128685;</span>`);
    if (prefs.pets !== undefined) icons.push(`<span class="pref-icon ${prefs.pets ? 'active' : ''}" title="${prefs.pets ? 'Animaux acceptés' : 'Pas d\'animaux'}">&#128054;</span>`);
    return `<div class="pref-icons">${icons.join('')}</div>`;
  }

  /**
   * Retourne les badges d'un utilisateur
   */
  function getUserBadges(userId) {
    const badges = [];
    const Store = window.CedeoStore;
    if (!Store) return badges;

    const bookings = Store.getBookings();
    const ratings = Store.getRatings();
    const users = Store.getUsers();

    // Nombre de covoiturages
    const userTrips = bookings.filter(b =>
      (b.userId === userId || b.driverId === userId) && b.status === 'confirmed'
    );

    if (userTrips.length >= 10) {
      badges.push({ iconName: 'leaf', label: 'Éco-champion', desc: '10+ covoiturages effectués' });
    }

    // Note moyenne
    const userRatings = ratings.filter(r => r.toUserId === userId);
    if (userRatings.length > 0) {
      const avgRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
      if (avgRating >= 4.5) {
        badges.push({ iconName: 'star', label: 'Top conducteur', desc: 'Note moyenne > 4.5' });
      }
    }

    // Personnes différentes
    const uniquePeople = new Set();
    bookings.filter(b => b.userId === userId).forEach(b => uniquePeople.add(b.driverId));
    bookings.filter(b => b.driverId === userId).forEach(b => uniquePeople.add(b.userId));
    if (uniquePeople.size >= 5) {
      badges.push({ iconName: 'handshake', label: 'Fédérateur', desc: 'A covoituré avec 5+ personnes' });
    }

    // Pionnier (parmi les 3 premiers inscrits)
    const sortedUsers = [...users].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortedUsers.findIndex(u => u.id === userId) < 3) {
      badges.push({ iconName: 'trophy', label: 'Pionnier', desc: 'Parmi les premiers inscrits' });
    }

    return badges;
  }

  /**
   * Recherche une agence par son ID
   */
  function getAgencyById(id) {
    return AGENCIES.find(a => a.id === id);
  }

  /**
   * Recherche une agence par nom (partiel, insensible à la casse)
   */
  function searchAgencies(query) {
    if (!query) return AGENCIES;
    const q = query.toLowerCase();
    return AGENCIES.filter(a => a.name.toLowerCase().includes(q) || a.shortName.toLowerCase().includes(q));
  }

  /**
   * Trouve la distance entre deux agences ou deux points
   */
  function getDistanceBetween(from, to) {
    const fromAgency = typeof from === 'string' ? getAgencyById(from) : from;
    const toAgency = typeof to === 'string' ? getAgencyById(to) : to;

    if (fromAgency && toAgency) {
      return calculateDistance(fromAgency.lat, fromAgency.lng, toAgency.lat, toAgency.lng);
    }
    return 0;
  }

  return {
    AGENCIES,
    AVATAR_COLORS,
    generateId,
    calculateDistance,
    estimateDuration,
    calculateCO2Saved,
    calculateMoneySaved,
    co2ToTrees,
    getInitials,
    getAvatarColor,
    createAvatarElement,
    formatDate,
    formatDateShort,
    formatTime,
    timeAgo,
    isSameDay,
    estimateArrival,
    debounce,
    escapeHtml,
    createElement,
    renderStars,
    renderInteractiveStars,
    renderPrefIcons,
    getUserBadges,
    getAgencyById,
    searchAgencies,
    getDistanceBetween
  };
})();
