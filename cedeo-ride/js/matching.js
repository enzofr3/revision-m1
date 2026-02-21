/* ===========================================
   CEDEO Ride — Module de matching automatique
   Détection de correspondances entre trajets
   =========================================== */

const Matching = (() => {

  // Seuil de distance max entre deux points pour considérer un match (km)
  const DISTANCE_THRESHOLD = 20;
  // Seuil de décalage horaire pour considérer un match (minutes)
  const TIME_THRESHOLD = 30;

  /**
   * Trouve les matchs pour un trajet donné (quand un conducteur publie)
   * Retourne les utilisateurs ayant des trajets compatibles
   */
  function findMatchesForTrip(newTrip) {
    const allTrips = CedeoStore.getTrips().filter(t =>
      t.id !== newTrip.id &&
      t.status === 'active' &&
      t.driverId !== newTrip.driverId
    );

    const matches = [];

    allTrips.forEach(trip => {
      const score = calculateMatchScore(newTrip, trip);
      if (score > 0) {
        matches.push({
          trip,
          userId: trip.driverId,
          score,
          type: 'driver_match'
        });
      }
    });

    // Aussi chercher parmi les passagers récents qui cherchaient des trajets similaires
    const bookings = CedeoStore.getBookings();
    const users = CedeoStore.getUsers();

    users.forEach(user => {
      if (user.id === newTrip.driverId) return;

      // Regarder si l'utilisateur a déjà pris des trajets similaires
      const userBookings = bookings.filter(b => b.userId === user.id && b.status === 'confirmed');
      userBookings.forEach(booking => {
        const bookedTrip = CedeoStore.getTrip(booking.tripId);
        if (!bookedTrip) return;

        // Si le trajet réservé est similaire au nouveau trajet
        if (isRouteCompatible(newTrip, bookedTrip)) {
          // Vérifier que le match n'est pas déjà dans la liste
          if (!matches.find(m => m.userId === user.id)) {
            matches.push({
              trip: newTrip,
              userId: user.id,
              score: 50,
              type: 'passenger_interest'
            });
          }
        }
      });
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Trouve les matchs pour un utilisateur (trajets compatibles avec son profil)
   * Basé sur son agence, ses trajets passés et réservations
   */
  function findMatchesForUser(userId) {
    const user = CedeoStore.getUser(userId);
    if (!user) return [];

    const now = new Date();
    const allTrips = CedeoStore.getTrips().filter(t =>
      t.status === 'active' &&
      t.driverId !== userId &&
      new Date(t.departureTime) > now
    );

    // Trajets déjà réservés par l'utilisateur
    const userBookings = CedeoStore.getBookingsByUser(userId);
    const bookedTripIds = new Set(userBookings.filter(b => b.status === 'confirmed').map(b => b.tripId));

    const matches = [];

    allTrips.forEach(trip => {
      // Exclure les trajets déjà réservés
      if (bookedTripIds.has(trip.id)) return;

      // Vérifier s'il reste des places
      if (CedeoStore.getAvailableSeats(trip.id) <= 0) return;

      let score = 0;

      // Match par agence de rattachement
      if (trip.fromId === user.agencyId || trip.toId === user.agencyId) {
        score += 40;
      }

      // Match par proximité avec l'agence
      if (trip.fromId && user.agencyId) {
        const fromAgency = Utils.getAgencyById(trip.fromId);
        const userAgency = Utils.getAgencyById(user.agencyId);
        if (fromAgency && userAgency) {
          const dist = Utils.calculateDistance(fromAgency.lat, fromAgency.lng, userAgency.lat, userAgency.lng);
          if (dist < DISTANCE_THRESHOLD) {
            score += Math.max(0, 30 - dist);
          }
        }
      }

      if (trip.toId && user.agencyId) {
        const toAgency = Utils.getAgencyById(trip.toId);
        const userAgency = Utils.getAgencyById(user.agencyId);
        if (toAgency && userAgency) {
          const dist = Utils.calculateDistance(toAgency.lat, toAgency.lng, userAgency.lat, userAgency.lng);
          if (dist < DISTANCE_THRESHOLD) {
            score += Math.max(0, 20 - dist);
          }
        }
      }

      // Bonus si le trajet passe par des routes similaires à des trajets passés
      const pastTrips = CedeoStore.getTripsByDriver(userId);
      pastTrips.forEach(pt => {
        if (isRouteCompatible(trip, pt)) {
          score += 25;
        }
      });

      // Bonus si même route que des réservations passées
      userBookings.forEach(b => {
        const bookedTrip = CedeoStore.getTrip(b.tripId);
        if (bookedTrip && isRouteCompatible(trip, bookedTrip)) {
          score += 30;
        }
      });

      if (score > 20) {
        matches.push({ trip, score, type: 'suggestion' });
      }
    });

    return matches.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Calcule un score de compatibilité entre deux trajets
   * @returns {number} Score (0 = pas de match, 100 = match parfait)
   */
  function calculateMatchScore(trip1, trip2) {
    let score = 0;

    // --- Compatibilité de route ---
    if (isRouteCompatible(trip1, trip2)) {
      score += 50;
    } else {
      return 0; // Pas de match si les routes ne sont pas compatibles
    }

    // --- Compatibilité de date ---
    const date1 = new Date(trip1.departureTime).toISOString().split('T')[0];
    const date2 = new Date(trip2.departureTime).toISOString().split('T')[0];
    if (date1 === date2) {
      score += 25;
    } else {
      return 0; // Pas de match si les dates sont différentes
    }

    // --- Compatibilité horaire ---
    const time1 = new Date(trip1.departureTime);
    const time2 = new Date(trip2.departureTime);
    const diffMinutes = Math.abs(time1 - time2) / 60000;
    if (diffMinutes <= TIME_THRESHOLD) {
      score += 25 * (1 - diffMinutes / TIME_THRESHOLD);
    }

    return Math.round(score);
  }

  /**
   * Vérifie si deux routes sont compatibles
   * (même départ/arrivée ou départ/arrivée proches)
   */
  function isRouteCompatible(trip1, trip2) {
    // Même agences
    if (trip1.fromId && trip2.fromId && trip1.toId && trip2.toId) {
      if (trip1.fromId === trip2.fromId && trip1.toId === trip2.toId) return true;
    }

    // Proximité
    const from1 = trip1.fromId ? Utils.getAgencyById(trip1.fromId) : null;
    const from2 = trip2.fromId ? Utils.getAgencyById(trip2.fromId) : null;
    const to1 = trip1.toId ? Utils.getAgencyById(trip1.toId) : null;
    const to2 = trip2.toId ? Utils.getAgencyById(trip2.toId) : null;

    if (from1 && from2 && to1 && to2) {
      const fromDist = Utils.calculateDistance(from1.lat, from1.lng, from2.lat, from2.lng);
      const toDist = Utils.calculateDistance(to1.lat, to1.lng, to2.lat, to2.lng);

      // Détour accepté du conducteur
      const detour = Math.max(trip1.detourKm || 10, trip2.detourKm || 10);
      if (fromDist < detour && toDist < detour) return true;
    }

    // Même nom (pour les adresses libres)
    if (trip1.fromName && trip2.fromName && trip1.toName && trip2.toName) {
      const fromMatch = trip1.fromName.toLowerCase() === trip2.fromName.toLowerCase();
      const toMatch = trip1.toName.toLowerCase() === trip2.toName.toLowerCase();
      if (fromMatch && toMatch) return true;
    }

    return false;
  }

  return {
    findMatchesForTrip,
    findMatchesForUser,
    calculateMatchScore,
    isRouteCompatible
  };
})();
