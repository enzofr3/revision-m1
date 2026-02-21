/* ===========================================
   CEDEO Ride — Négociation horaire flexible (Feature 4)
   + Ghost Trips (Feature 5)
   + Arrêts intermédiaires (Feature 8)
   =========================================== */

const Negotiations = (() => {
  const STORAGE_KEY = 'cedeoride_negotiations';

  function getNegotiations() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveNegotiations(negs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(negs));
  }

  /**
   * Propose a time negotiation for a trip
   */
  function proposeTimeChange(tripId, fromUserId, proposedTime, message) {
    const negs = getNegotiations();
    const neg = {
      id: Utils.generateId(),
      tripId,
      fromUserId,
      proposedTime,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      responses: []
    };
    negs.push(neg);
    saveNegotiations(negs);

    const trip = CedeoStore.getTrip(tripId);
    if (trip) {
      const proposer = CedeoStore.getUser(fromUserId);
      CedeoStore.createNotification({
        userId: trip.driverId,
        type: 'time_negotiation',
        title: 'Proposition d\'horaire',
        message: `${proposer ? proposer.firstName : 'Un collègue'} propose ${Utils.formatTime(proposedTime)} pour votre trajet ${trip.fromName} → ${trip.toName}${message ? ' : "' + message + '"' : ''}.`,
        icon: '🕐',
        tripId,
        negotiationId: neg.id
      });
    }

    return neg;
  }

  function respondToNegotiation(negId, accepted, counterTime) {
    const negs = getNegotiations();
    const neg = negs.find(n => n.id === negId);
    if (!neg) return;

    neg.status = accepted ? 'accepted' : (counterTime ? 'counter' : 'rejected');
    if (counterTime) neg.counterTime = counterTime;
    saveNegotiations(negs);

    if (accepted) {
      // Update trip time
      CedeoStore.updateTrip(neg.tripId, { departureTime: neg.proposedTime });
    }

    const trip = CedeoStore.getTrip(neg.tripId);
    CedeoStore.createNotification({
      userId: neg.fromUserId,
      type: 'negotiation_response',
      title: accepted ? 'Horaire accepté !' : counterTime ? 'Contre-proposition' : 'Horaire refusé',
      message: accepted ?
        `Le conducteur accepte ${Utils.formatTime(neg.proposedTime)}.` :
        counterTime ?
          `Le conducteur propose ${Utils.formatTime(counterTime)} à la place.` :
          `Le conducteur ne peut pas modifier l'horaire.`,
      icon: accepted ? '✅' : counterTime ? '🔄' : '❌',
      tripId: neg.tripId
    });
  }

  function suggestCompromise(time1, time2) {
    const t1 = new Date(time1).getTime();
    const t2 = new Date(time2).getTime();
    return new Date((t1 + t2) / 2).toISOString();
  }

  function getTripNegotiations(tripId) {
    return getNegotiations().filter(n => n.tripId === tripId);
  }

  // --- Ghost Trips (Feature 5) ---

  function createGhostTrip(userId, data) {
    return CedeoStore.createTrip({
      driverId: userId,
      tripType: 'ghost',
      ...data,
      comment: data.comment || 'Trajet fantôme — habitude de déplacement, sans engagement.',
      seats: 0
    });
  }

  function getGhostTrips() {
    return CedeoStore.getTrips().filter(t => t.tripType === 'ghost' && t.status === 'active');
  }

  function convertGhostToReal(tripId, seats) {
    return CedeoStore.updateTrip(tripId, {
      tripType: 'regular',
      seats: seats || 3
    });
  }

  // --- Intermediate Stops / Waypoints (Feature 8) ---

  /**
   * Calculate perpendicular distance from a point to a line segment
   */
  function pointToSegmentDistance(pointLat, pointLng, fromLat, fromLng, toLat, toLng) {
    const A = pointLat - fromLat;
    const B = pointLng - fromLng;
    const C = toLat - fromLat;
    const D = toLng - fromLng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = lenSq !== 0 ? dot / lenSq : -1;

    let closestLat, closestLng;
    if (param < 0) {
      closestLat = fromLat;
      closestLng = fromLng;
    } else if (param > 1) {
      closestLat = toLat;
      closestLng = toLng;
    } else {
      closestLat = fromLat + param * C;
      closestLng = fromLng + param * D;
    }

    return Utils.calculateDistance(pointLat, pointLng, closestLat, closestLng);
  }

  /**
   * Find agencies along a route that are within detour distance
   */
  function findWaypoints(fromId, toId, maxDetourKm = 15) {
    const fromAgency = Utils.getAgencyById(fromId);
    const toAgency = Utils.getAgencyById(toId);
    if (!fromAgency || !toAgency) return [];

    return Utils.AGENCIES
      .filter(a => a.id !== fromId && a.id !== toId)
      .map(a => ({
        agency: a,
        detourKm: Math.round(pointToSegmentDistance(
          a.lat, a.lng,
          fromAgency.lat, fromAgency.lng,
          toAgency.lat, toAgency.lng
        ) * 10) / 10
      }))
      .filter(w => w.detourKm <= maxDetourKm)
      .sort((a, b) => a.detourKm - b.detourKm);
  }

  /**
   * Estimate additional time for waypoints
   */
  function estimateDetourTime(detourKm) {
    return Math.round(detourKm * 1.5); // ~1.5 min per km detour
  }

  return {
    proposeTimeChange,
    respondToNegotiation,
    suggestCompromise,
    getTripNegotiations,
    createGhostTrip,
    getGhostTrips,
    convertGhostToReal,
    findWaypoints,
    pointToSegmentDistance,
    estimateDetourTime
  };
})();
