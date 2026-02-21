/* ===========================================
   CEDEO Ride — Store (gestion localStorage)
   CRUD pour toutes les entités de l'application
   =========================================== */

const CedeoStore = (() => {
  // Clés localStorage
  const KEYS = {
    users: 'cedeoride_users',
    trips: 'cedeoride_trips',
    bookings: 'cedeoride_bookings',
    messages: 'cedeoride_messages',
    ratings: 'cedeoride_ratings',
    notifications: 'cedeoride_notifications',
    currentUser: 'cedeoride_current_user',
    initialized: 'cedeoride_initialized'
  };

  // --- Helpers génériques ---

  function getCollection(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function setCollection(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function addItem(key, item) {
    const collection = getCollection(key);
    collection.push(item);
    setCollection(key, collection);
    return item;
  }

  function updateItem(key, id, updates) {
    const collection = getCollection(key);
    const index = collection.findIndex(item => item.id === id);
    if (index !== -1) {
      collection[index] = { ...collection[index], ...updates };
      setCollection(key, collection);
      return collection[index];
    }
    return null;
  }

  function deleteItem(key, id) {
    const collection = getCollection(key);
    const filtered = collection.filter(item => item.id !== id);
    setCollection(key, filtered);
  }

  function getById(key, id) {
    return getCollection(key).find(item => item.id === id);
  }

  // --- Users ---

  function getUsers() {
    return getCollection(KEYS.users);
  }

  function getUser(id) {
    return getById(KEYS.users, id);
  }

  function createUser(userData) {
    const user = {
      id: Utils.generateId(),
      createdAt: new Date().toISOString(),
      ...userData
    };
    return addItem(KEYS.users, user);
  }

  function updateUser(id, updates) {
    return updateItem(KEYS.users, id, updates);
  }

  function deleteUser(id) {
    deleteItem(KEYS.users, id);
    // Supprimer aussi les données associées
    const trips = getTrips().filter(t => t.driverId === id);
    trips.forEach(t => deleteTrip(t.id));
    const bookings = getBookings().filter(b => b.userId === id);
    bookings.forEach(b => deleteBooking(b.id));
  }

  function findUserByEmail(email) {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- Session utilisateur ---

  function getCurrentUserId() {
    return localStorage.getItem(KEYS.currentUser);
  }

  function setCurrentUser(userId) {
    localStorage.setItem(KEYS.currentUser, userId);
  }

  function getCurrentUser() {
    const id = getCurrentUserId();
    return id ? getUser(id) : null;
  }

  function logout() {
    localStorage.removeItem(KEYS.currentUser);
  }

  // --- Trips ---

  function getTrips() {
    return getCollection(KEYS.trips);
  }

  function getTrip(id) {
    return getById(KEYS.trips, id);
  }

  function createTrip(tripData) {
    const trip = {
      id: Utils.generateId(),
      createdAt: new Date().toISOString(),
      status: 'active',
      ...tripData
    };
    return addItem(KEYS.trips, trip);
  }

  function updateTrip(id, updates) {
    return updateItem(KEYS.trips, id, updates);
  }

  function deleteTrip(id) {
    deleteItem(KEYS.trips, id);
    // Annuler les réservations liées
    const bookings = getBookings().filter(b => b.tripId === id);
    bookings.forEach(b => updateBooking(b.id, { status: 'cancelled' }));
  }

  /**
   * Recherche de trajets avec filtres
   */
  function searchTrips(filters = {}) {
    let trips = getTrips().filter(t => t.status === 'active');

    if (filters.from) {
      trips = trips.filter(t =>
        t.fromId === filters.from ||
        (t.fromName && t.fromName.toLowerCase().includes(filters.from.toLowerCase()))
      );
    }

    if (filters.to) {
      trips = trips.filter(t =>
        t.toId === filters.to ||
        (t.toName && t.toName.toLowerCase().includes(filters.to.toLowerCase()))
      );
    }

    if (filters.date) {
      trips = trips.filter(t => {
        const tripDate = new Date(t.departureTime).toISOString().split('T')[0];
        return tripDate === filters.date;
      });
    }

    if (filters.seats) {
      trips = trips.filter(t => {
        const booked = getBookings().filter(b => b.tripId === t.id && b.status === 'confirmed')
          .reduce((sum, b) => sum + (b.seats || 1), 0);
        return (t.seats - booked) >= filters.seats;
      });
    }

    // Exclure les trajets passés
    const now = new Date();
    trips = trips.filter(t => new Date(t.departureTime) > now);

    return trips;
  }

  /**
   * Trajets d'un conducteur
   */
  function getTripsByDriver(driverId) {
    return getTrips().filter(t => t.driverId === driverId);
  }

  /**
   * Places restantes pour un trajet
   */
  function getAvailableSeats(tripId) {
    const trip = getTrip(tripId);
    if (!trip) return 0;
    const booked = getBookings()
      .filter(b => b.tripId === tripId && b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.seats || 1), 0);
    return trip.seats - booked;
  }

  // --- Bookings ---

  function getBookings() {
    return getCollection(KEYS.bookings);
  }

  function getBooking(id) {
    return getById(KEYS.bookings, id);
  }

  function createBooking(bookingData) {
    const booking = {
      id: Utils.generateId(),
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      ...bookingData
    };
    return addItem(KEYS.bookings, booking);
  }

  function updateBooking(id, updates) {
    return updateItem(KEYS.bookings, id, updates);
  }

  function deleteBooking(id) {
    deleteItem(KEYS.bookings, id);
  }

  /**
   * Réservations d'un passager
   */
  function getBookingsByUser(userId) {
    return getBookings().filter(b => b.userId === userId);
  }

  /**
   * Réservations pour un trajet
   */
  function getBookingsByTrip(tripId) {
    return getBookings().filter(b => b.tripId === tripId && b.status === 'confirmed');
  }

  // --- Messages ---

  function getMessages() {
    return getCollection(KEYS.messages);
  }

  function createMessage(messageData) {
    const message = {
      id: Utils.generateId(),
      timestamp: new Date().toISOString(),
      read: false,
      ...messageData
    };
    return addItem(KEYS.messages, message);
  }

  /**
   * Messages entre deux utilisateurs
   */
  function getConversation(userId1, userId2) {
    return getMessages().filter(m =>
      (m.fromId === userId1 && m.toId === userId2) ||
      (m.fromId === userId2 && m.toId === userId1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Liste des conversations d'un utilisateur
   */
  function getConversationList(userId) {
    const messages = getMessages().filter(m => m.fromId === userId || m.toId === userId);
    const contacts = {};

    messages.forEach(m => {
      const contactId = m.fromId === userId ? m.toId : m.fromId;
      if (!contacts[contactId] || new Date(m.timestamp) > new Date(contacts[contactId].timestamp)) {
        contacts[contactId] = m;
      }
    });

    return Object.entries(contacts)
      .map(([contactId, lastMessage]) => ({
        contactId,
        lastMessage,
        unreadCount: messages.filter(m => m.fromId === contactId && m.toId === userId && !m.read).length
      }))
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  }

  /**
   * Marquer les messages comme lus
   */
  function markMessagesAsRead(fromId, toId) {
    const messages = getCollection(KEYS.messages);
    let updated = false;
    messages.forEach(m => {
      if (m.fromId === fromId && m.toId === toId && !m.read) {
        m.read = true;
        updated = true;
      }
    });
    if (updated) setCollection(KEYS.messages, messages);
  }

  /**
   * Nombre total de messages non lus
   */
  function getUnreadMessageCount(userId) {
    return getMessages().filter(m => m.toId === userId && !m.read).length;
  }

  // --- Ratings ---

  function getRatings() {
    return getCollection(KEYS.ratings);
  }

  function createRating(ratingData) {
    const rating = {
      id: Utils.generateId(),
      createdAt: new Date().toISOString(),
      ...ratingData
    };
    return addItem(KEYS.ratings, rating);
  }

  /**
   * Note moyenne d'un utilisateur
   */
  function getUserAverageRating(userId) {
    const userRatings = getRatings().filter(r => r.toUserId === userId);
    if (userRatings.length === 0) return { average: 0, count: 0 };
    const total = userRatings.reduce((sum, r) => sum + r.rating, 0);
    return {
      average: Math.round(total / userRatings.length * 10) / 10,
      count: userRatings.length
    };
  }

  /**
   * Avis reçus par un utilisateur
   */
  function getUserRatings(userId) {
    return getRatings().filter(r => r.toUserId === userId);
  }

  // --- Notifications ---

  function getNotifications() {
    return getCollection(KEYS.notifications);
  }

  function createNotification(notifData) {
    const notif = {
      id: Utils.generateId(),
      createdAt: new Date().toISOString(),
      read: false,
      ...notifData
    };
    return addItem(KEYS.notifications, notif);
  }

  function getUserNotifications(userId) {
    return getNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function markNotificationRead(id) {
    return updateItem(KEYS.notifications, id, { read: true });
  }

  function markAllNotificationsRead(userId) {
    const all = getCollection(KEYS.notifications);
    all.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    setCollection(KEYS.notifications, all);
  }

  function getUnreadNotificationCount(userId) {
    return getNotifications().filter(n => n.userId === userId && !n.read).length;
  }

  function deleteNotification(id) {
    deleteItem(KEYS.notifications, id);
  }

  // --- État d'initialisation ---

  function isInitialized() {
    return localStorage.getItem(KEYS.initialized) === 'true';
  }

  function setInitialized() {
    localStorage.setItem(KEYS.initialized, 'true');
  }

  /**
   * Reset complet des données
   */
  function resetAll() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }

  /**
   * Export CSV de toutes les données
   */
  function exportCSV(type) {
    let data, headers;
    switch (type) {
      case 'users':
        data = getUsers();
        headers = ['ID', 'Prénom', 'Nom', 'Email', 'Agence', 'Téléphone', 'Inscrit le'];
        return csvFromArray(data.map(u => [u.id, u.firstName, u.lastName, u.email, u.agencyId, u.phone || '', u.createdAt]), headers);
      case 'trips':
        data = getTrips();
        headers = ['ID', 'Conducteur', 'Départ', 'Arrivée', 'Date/Heure', 'Places', 'Statut'];
        return csvFromArray(data.map(t => [t.id, t.driverId, t.fromName, t.toName, t.departureTime, t.seats, t.status]), headers);
      case 'bookings':
        data = getBookings();
        headers = ['ID', 'Trajet', 'Passager', 'Places', 'Statut', 'Date'];
        return csvFromArray(data.map(b => [b.id, b.tripId, b.userId, b.seats || 1, b.status, b.createdAt]), headers);
      default:
        return '';
    }
  }

  function csvFromArray(rows, headers) {
    const escape = v => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [headers.map(escape).join(',')];
    rows.forEach(row => lines.push(row.map(escape).join(',')));
    return lines.join('\n');
  }

  // Exposer l'API publique
  return {
    // Users
    getUsers, getUser, createUser, updateUser, deleteUser, findUserByEmail,
    // Session
    getCurrentUserId, setCurrentUser, getCurrentUser, logout,
    // Trips
    getTrips, getTrip, createTrip, updateTrip, deleteTrip, searchTrips,
    getTripsByDriver, getAvailableSeats,
    // Bookings
    getBookings, getBooking, createBooking, updateBooking, deleteBooking,
    getBookingsByUser, getBookingsByTrip,
    // Messages
    getMessages, createMessage, getConversation, getConversationList,
    markMessagesAsRead, getUnreadMessageCount,
    // Ratings
    getRatings, createRating, getUserAverageRating, getUserRatings,
    // Notifications
    getNotifications, createNotification, getUserNotifications,
    markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount,
    deleteNotification,
    // Admin
    isInitialized, setInitialized, resetAll, exportCSV
  };
})();

// Rendre le store accessible globalement
window.CedeoStore = CedeoStore;
