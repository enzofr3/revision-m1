/* ===========================================
   CEDEO Ride — Données de démonstration
   Jeu de données réaliste pré-chargé au premier lancement
   =========================================== */

const DemoData = (() => {

  function load() {
    const now = new Date();

    // --- 1. Utilisateurs fictifs ---
    const users = [
      {
        id: 'usr_sophie',
        firstName: 'Sophie',
        lastName: 'Martin',
        email: 'sophie.martin@cedeo.fr',
        agencyId: 'rennes-lorient',
        phone: '06 12 34 56 78',
        vehicle: { brand: 'Renault', model: 'Mégane', color: 'Gris' },
        preferences: { music: true, chat: true, smoking: false, pets: false },
        createdAt: daysAgo(90)
      },
      {
        id: 'usr_thomas',
        firstName: 'Thomas',
        lastName: 'Dubois',
        email: 'thomas.dubois@cedeo.fr',
        agencyId: 'rennes-stgregoire',
        phone: '06 23 45 67 89',
        vehicle: { brand: 'Peugeot', model: '3008', color: 'Bleu' },
        preferences: { music: true, chat: false, smoking: false, pets: true },
        createdAt: daysAgo(85)
      },
      {
        id: 'usr_marie',
        firstName: 'Marie',
        lastName: 'Leroy',
        email: 'marie.leroy@cedeo.fr',
        agencyId: 'cesson-bray',
        phone: '06 34 56 78 90',
        vehicle: { brand: 'Citroën', model: 'C5 Aircross', color: 'Blanc' },
        preferences: { music: false, chat: true, smoking: false, pets: false },
        createdAt: daysAgo(80)
      },
      {
        id: 'usr_pierre',
        firstName: 'Pierre',
        lastName: 'Bernard',
        email: 'pierre.bernard@saint-gobain.com',
        agencyId: 'chateaubourg',
        phone: '06 45 67 89 01',
        vehicle: { brand: 'Dacia', model: 'Duster', color: 'Kaki' },
        preferences: { music: true, chat: true, smoking: false, pets: true },
        createdAt: daysAgo(75)
      },
      {
        id: 'usr_julie',
        firstName: 'Julie',
        lastName: 'Moreau',
        email: 'julie.moreau@cedeo.fr',
        agencyId: 'saint-malo',
        phone: '06 56 78 90 12',
        vehicle: { brand: 'VW', model: 'Golf', color: 'Noir' },
        preferences: { music: true, chat: true, smoking: false, pets: false },
        createdAt: daysAgo(70)
      },
      {
        id: 'usr_nicolas',
        firstName: 'Nicolas',
        lastName: 'Petit',
        email: 'nicolas.petit@cedeo.fr',
        agencyId: 'dinan',
        phone: '06 67 89 01 23',
        vehicle: { brand: 'Renault', model: 'Captur', color: 'Orange' },
        preferences: { music: false, chat: false, smoking: false, pets: false },
        createdAt: daysAgo(60)
      },
      {
        id: 'usr_camille',
        firstName: 'Camille',
        lastName: 'Roux',
        email: 'camille.roux@cedeo.fr',
        agencyId: 'fougeres',
        phone: '06 78 90 12 34',
        vehicle: null,
        preferences: { music: true, chat: true, smoking: false, pets: true },
        createdAt: daysAgo(55)
      },
      {
        id: 'usr_antoine',
        firstName: 'Antoine',
        lastName: 'Garnier',
        email: 'antoine.garnier@saint-gobain.com',
        agencyId: 'la-roche',
        phone: '06 89 01 23 45',
        vehicle: { brand: 'Peugeot', model: '308', color: 'Gris' },
        preferences: { music: true, chat: false, smoking: false, pets: false },
        createdAt: daysAgo(50)
      },
      {
        id: 'usr_lea',
        firstName: 'Léa',
        lastName: 'Fournier',
        email: 'lea.fournier@cedeo.fr',
        agencyId: 'derval',
        phone: '06 90 12 34 56',
        vehicle: { brand: 'Toyota', model: 'Yaris', color: 'Rouge' },
        preferences: { music: false, chat: true, smoking: false, pets: false },
        createdAt: daysAgo(45)
      },
      {
        id: 'usr_maxime',
        firstName: 'Maxime',
        lastName: 'Girard',
        email: 'maxime.girard@cedeo.fr',
        agencyId: 'cesson-chene',
        phone: '06 01 23 45 67',
        vehicle: { brand: 'Citroën', model: 'C3', color: 'Blanc' },
        preferences: { music: true, chat: true, smoking: false, pets: true },
        createdAt: daysAgo(40)
      }
    ];

    // --- 2. Trajets (15-20 sur les 7 prochains jours + quelques passés) ---
    const trips = [
      // Trajets futurs
      {
        id: 'trip_01',
        driverId: 'usr_sophie',
        fromName: 'CEDEO Rennes Route de Lorient',
        toName: 'CEDEO Saint-Malo',
        fromId: 'rennes-lorient',
        toId: 'saint-malo',
        departureTime: futureDateAt(1, 8, 0),
        seats: 3,
        detourKm: 10,
        comment: 'Réunion commerciale à Saint-Malo. Départ du parking de l\'agence.',
        recurring: false,
        recurringDays: null,
        distanceKm: 67,
        durationMin: 55,
        status: 'active',
        createdAt: daysAgo(2)
      },
      {
        id: 'trip_02',
        driverId: 'usr_thomas',
        fromName: 'CEDEO Rennes Saint-Grégoire',
        toName: 'CEDEO Dinan',
        fromId: 'rennes-stgregoire',
        toId: 'dinan',
        departureTime: futureDateAt(1, 7, 30),
        seats: 3,
        detourKm: 5,
        comment: 'Formation technique à Dinan.',
        recurring: false,
        recurringDays: null,
        distanceKm: 52,
        durationMin: 45,
        status: 'active',
        createdAt: daysAgo(3)
      },
      {
        id: 'trip_03',
        driverId: 'usr_marie',
        fromName: 'CEDEO Cesson - Bray',
        toName: 'CEDEO Fougères',
        fromId: 'cesson-bray',
        toId: 'fougeres',
        departureTime: futureDateAt(2, 8, 30),
        seats: 2,
        detourKm: 15,
        comment: 'Visite client à Fougères.',
        recurring: false,
        recurringDays: null,
        distanceKm: 51,
        durationMin: 42,
        status: 'active',
        createdAt: daysAgo(1)
      },
      {
        id: 'trip_04',
        driverId: 'usr_pierre',
        fromName: 'CEDEO Châteaubourg',
        toName: 'CEDEO Rennes Route de Lorient',
        fromId: 'chateaubourg',
        toId: 'rennes-lorient',
        departureTime: futureDateAt(1, 7, 45),
        seats: 4,
        detourKm: 10,
        comment: 'Direction régionale — RDV 9h.',
        recurring: true,
        recurringDays: [1, 2, 3, 4, 5],
        distanceKm: 35,
        durationMin: 30,
        status: 'active',
        createdAt: daysAgo(5)
      },
      {
        id: 'trip_05',
        driverId: 'usr_julie',
        fromName: 'CEDEO Saint-Malo',
        toName: 'CEDEO Rennes Saint-Grégoire',
        fromId: 'saint-malo',
        toId: 'rennes-stgregoire',
        departureTime: futureDateAt(2, 7, 0),
        seats: 3,
        detourKm: 5,
        comment: '',
        recurring: false,
        recurringDays: null,
        distanceKm: 72,
        durationMin: 60,
        status: 'active',
        createdAt: daysAgo(2)
      },
      {
        id: 'trip_06',
        driverId: 'usr_nicolas',
        fromName: 'CEDEO Dinan',
        toName: 'CEDEO Saint-Malo',
        fromId: 'dinan',
        toId: 'saint-malo',
        departureTime: futureDateAt(3, 9, 0),
        seats: 2,
        detourKm: 5,
        comment: 'Livraison chantier.',
        recurring: false,
        recurringDays: null,
        distanceKm: 32,
        durationMin: 30,
        status: 'active',
        createdAt: daysAgo(1)
      },
      {
        id: 'trip_07',
        driverId: 'usr_sophie',
        fromName: 'CEDEO Saint-Malo',
        toName: 'CEDEO Rennes Route de Lorient',
        fromId: 'saint-malo',
        toId: 'rennes-lorient',
        departureTime: futureDateAt(1, 17, 30),
        seats: 3,
        detourKm: 10,
        comment: 'Retour après la réunion.',
        recurring: false,
        recurringDays: null,
        distanceKm: 67,
        durationMin: 55,
        status: 'active',
        createdAt: daysAgo(2)
      },
      {
        id: 'trip_08',
        driverId: 'usr_antoine',
        fromName: 'CEDEO La Roche-sur-Yon',
        toName: 'CEDEO Derval (STAC)',
        fromId: 'la-roche',
        toId: 'derval',
        departureTime: futureDateAt(3, 8, 0),
        seats: 3,
        detourKm: 20,
        comment: 'Déplacement inter-agence.',
        recurring: false,
        recurringDays: null,
        distanceKm: 120,
        durationMin: 95,
        status: 'active',
        createdAt: daysAgo(4)
      },
      {
        id: 'trip_09',
        driverId: 'usr_maxime',
        fromName: 'CEDEO Cesson - Chêne Morand',
        toName: 'CEDEO Châteaubourg',
        fromId: 'cesson-chene',
        toId: 'chateaubourg',
        departureTime: futureDateAt(4, 8, 15),
        seats: 2,
        detourKm: 5,
        comment: 'Audit qualité.',
        recurring: false,
        recurringDays: null,
        distanceKm: 22,
        durationMin: 20,
        status: 'active',
        createdAt: daysAgo(1)
      },
      {
        id: 'trip_10',
        driverId: 'usr_lea',
        fromName: 'CEDEO Derval (STAC)',
        toName: 'CEDEO Rennes Route de Lorient',
        fromId: 'derval',
        toId: 'rennes-lorient',
        departureTime: futureDateAt(2, 7, 30),
        seats: 3,
        detourKm: 15,
        comment: 'Réunion mensuelle.',
        recurring: false,
        recurringDays: null,
        distanceKm: 65,
        durationMin: 55,
        status: 'active',
        createdAt: daysAgo(3)
      },
      {
        id: 'trip_11',
        driverId: 'usr_thomas',
        fromName: 'CEDEO Dinan',
        toName: 'CEDEO Rennes Saint-Grégoire',
        fromId: 'dinan',
        toId: 'rennes-stgregoire',
        departureTime: futureDateAt(1, 17, 0),
        seats: 3,
        detourKm: 5,
        comment: 'Retour de formation.',
        recurring: false,
        recurringDays: null,
        distanceKm: 52,
        durationMin: 45,
        status: 'active',
        createdAt: daysAgo(3)
      },
      {
        id: 'trip_12',
        driverId: 'usr_pierre',
        fromName: 'CEDEO Rennes Route de Lorient',
        toName: 'CEDEO Châteaubourg',
        fromId: 'rennes-lorient',
        toId: 'chateaubourg',
        departureTime: futureDateAt(1, 18, 0),
        seats: 4,
        detourKm: 10,
        comment: 'Retour.',
        recurring: true,
        recurringDays: [1, 2, 3, 4, 5],
        distanceKm: 35,
        durationMin: 30,
        status: 'active',
        createdAt: daysAgo(5)
      },
      {
        id: 'trip_13',
        driverId: 'usr_julie',
        fromName: 'CEDEO Rennes Saint-Grégoire',
        toName: 'CEDEO Saint-Malo',
        fromId: 'rennes-stgregoire',
        toId: 'saint-malo',
        departureTime: futureDateAt(2, 17, 30),
        seats: 3,
        detourKm: 5,
        comment: 'Retour.',
        recurring: false,
        recurringDays: null,
        distanceKm: 72,
        durationMin: 60,
        status: 'active',
        createdAt: daysAgo(2)
      },
      {
        id: 'trip_14',
        driverId: 'usr_sophie',
        fromName: 'CEDEO Rennes Route de Lorient',
        toName: 'CEDEO Cesson - Bray',
        fromId: 'rennes-lorient',
        toId: 'cesson-bray',
        departureTime: futureDateAt(5, 8, 30),
        seats: 2,
        detourKm: 5,
        comment: 'Point avec l\'équipe Cesson.',
        recurring: false,
        recurringDays: null,
        distanceKm: 12,
        durationMin: 15,
        status: 'active',
        createdAt: daysAgo(1)
      },
      {
        id: 'trip_15',
        driverId: 'usr_nicolas',
        fromName: 'CEDEO Dinan',
        toName: 'CEDEO Rennes Route de Lorient',
        fromId: 'dinan',
        toId: 'rennes-lorient',
        departureTime: futureDateAt(4, 7, 45),
        seats: 3,
        detourKm: 10,
        comment: '',
        recurring: false,
        recurringDays: null,
        distanceKm: 55,
        durationMin: 50,
        status: 'active',
        createdAt: daysAgo(2)
      },
      // Trajets passés (pour l'historique et les stats)
      {
        id: 'trip_p1',
        driverId: 'usr_sophie',
        fromName: 'CEDEO Rennes Route de Lorient',
        toName: 'CEDEO Dinan',
        fromId: 'rennes-lorient',
        toId: 'dinan',
        departureTime: daysAgo(5),
        seats: 3,
        distanceKm: 55,
        durationMin: 50,
        status: 'active',
        createdAt: daysAgo(8)
      },
      {
        id: 'trip_p2',
        driverId: 'usr_thomas',
        fromName: 'CEDEO Rennes Saint-Grégoire',
        toName: 'CEDEO Fougères',
        fromId: 'rennes-stgregoire',
        toId: 'fougeres',
        departureTime: daysAgo(3),
        seats: 3,
        distanceKm: 51,
        durationMin: 42,
        status: 'active',
        createdAt: daysAgo(6)
      },
      {
        id: 'trip_p3',
        driverId: 'usr_marie',
        fromName: 'CEDEO Cesson - Bray',
        toName: 'CEDEO Saint-Malo',
        fromId: 'cesson-bray',
        toId: 'saint-malo',
        departureTime: daysAgo(7),
        seats: 2,
        distanceKm: 72,
        durationMin: 60,
        status: 'active',
        createdAt: daysAgo(10)
      },
      {
        id: 'trip_p4',
        driverId: 'usr_pierre',
        fromName: 'CEDEO Châteaubourg',
        toName: 'CEDEO Rennes Route de Lorient',
        fromId: 'chateaubourg',
        toId: 'rennes-lorient',
        departureTime: daysAgo(10),
        seats: 4,
        distanceKm: 35,
        durationMin: 30,
        status: 'active',
        createdAt: daysAgo(12)
      }
    ];

    // --- 3. Réservations ---
    const bookings = [
      // Réservations futures
      { id: 'book_01', tripId: 'trip_01', userId: 'usr_thomas', driverId: 'usr_sophie', seats: 1, status: 'confirmed', createdAt: daysAgo(1) },
      { id: 'book_02', tripId: 'trip_01', userId: 'usr_camille', driverId: 'usr_sophie', seats: 1, status: 'confirmed', createdAt: daysAgo(1) },
      { id: 'book_03', tripId: 'trip_04', userId: 'usr_maxime', driverId: 'usr_pierre', seats: 1, status: 'confirmed', createdAt: daysAgo(4) },
      { id: 'book_04', tripId: 'trip_05', userId: 'usr_nicolas', driverId: 'usr_julie', seats: 1, status: 'confirmed', createdAt: daysAgo(1) },
      { id: 'book_05', tripId: 'trip_10', userId: 'usr_sophie', driverId: 'usr_lea', seats: 1, status: 'confirmed', createdAt: daysAgo(2) },
      // Réservations passées
      { id: 'book_p1', tripId: 'trip_p1', userId: 'usr_camille', driverId: 'usr_sophie', seats: 1, status: 'confirmed', createdAt: daysAgo(9) },
      { id: 'book_p2', tripId: 'trip_p1', userId: 'usr_nicolas', driverId: 'usr_sophie', seats: 1, status: 'confirmed', createdAt: daysAgo(8) },
      { id: 'book_p3', tripId: 'trip_p2', userId: 'usr_marie', driverId: 'usr_thomas', seats: 1, status: 'confirmed', createdAt: daysAgo(5) },
      { id: 'book_p4', tripId: 'trip_p3', userId: 'usr_julie', driverId: 'usr_marie', seats: 1, status: 'confirmed', createdAt: daysAgo(9) },
      { id: 'book_p5', tripId: 'trip_p4', userId: 'usr_maxime', driverId: 'usr_pierre', seats: 1, status: 'confirmed', createdAt: daysAgo(11) },
      { id: 'book_p6', tripId: 'trip_p4', userId: 'usr_lea', driverId: 'usr_pierre', seats: 1, status: 'confirmed', createdAt: daysAgo(11) },
      // Données historiques (mois précédents pour les stats)
      ...generateHistoricalBookings()
    ];

    // --- 4. Notes et avis ---
    const ratings = [
      { id: 'rat_01', tripId: 'trip_p1', fromUserId: 'usr_camille', toUserId: 'usr_sophie', rating: 5, comment: 'Super trajet, Sophie est très ponctuelle et agréable !', createdAt: daysAgo(4) },
      { id: 'rat_02', tripId: 'trip_p1', fromUserId: 'usr_nicolas', toUserId: 'usr_sophie', rating: 4, comment: 'Bon trajet, véhicule confortable.', createdAt: daysAgo(4) },
      { id: 'rat_03', tripId: 'trip_p1', fromUserId: 'usr_sophie', toUserId: 'usr_camille', rating: 5, comment: 'Camille est très agréable, toujours à l\'heure.', createdAt: daysAgo(4) },
      { id: 'rat_04', tripId: 'trip_p2', fromUserId: 'usr_marie', toUserId: 'usr_thomas', rating: 4, comment: 'Très bien, conduite prudente.', createdAt: daysAgo(2) },
      { id: 'rat_05', tripId: 'trip_p3', fromUserId: 'usr_julie', toUserId: 'usr_marie', rating: 5, comment: 'Excellent covoiturage !', createdAt: daysAgo(6) },
      { id: 'rat_06', tripId: 'trip_p4', fromUserId: 'usr_maxime', toUserId: 'usr_pierre', rating: 5, comment: 'Pierre est un super conducteur, je recommande.', createdAt: daysAgo(9) },
      { id: 'rat_07', tripId: 'trip_p4', fromUserId: 'usr_lea', toUserId: 'usr_pierre', rating: 4, comment: 'Bon trajet.', createdAt: daysAgo(9) },
      { id: 'rat_08', tripId: 'trip_p4', fromUserId: 'usr_pierre', toUserId: 'usr_maxime', rating: 5, comment: 'Maxime est très ponctuel.', createdAt: daysAgo(9) }
    ];

    // --- 5. Messages ---
    const messages = [
      { id: 'msg_01', fromId: 'usr_thomas', toId: 'usr_sophie', text: 'Bonjour Sophie ! J\'ai réservé une place pour demain. On se retrouve devant l\'agence ?', timestamp: daysAgo(1), read: true },
      { id: 'msg_02', fromId: 'usr_sophie', toId: 'usr_thomas', text: 'Salut Thomas ! Oui, je serai sur le parking à 7h50. À demain !', timestamp: hoursAgo(22), read: true },
      { id: 'msg_03', fromId: 'usr_thomas', toId: 'usr_sophie', text: 'Parfait, merci ! 👍', timestamp: hoursAgo(21), read: true },
      { id: 'msg_04', fromId: 'usr_camille', toId: 'usr_sophie', text: 'Salut Sophie, est-ce que tu peux me déposer à la gare de Saint-Malo plutôt qu\'à l\'agence ?', timestamp: hoursAgo(18), read: true },
      { id: 'msg_05', fromId: 'usr_sophie', toId: 'usr_camille', text: 'Pas de souci Camille, c\'est sur le chemin !', timestamp: hoursAgo(17), read: true },
      { id: 'msg_06', fromId: 'usr_nicolas', toId: 'usr_julie', text: 'Salut Julie, merci pour le covoiturage ! Tu penses qu\'on arrivera avant 9h ?', timestamp: hoursAgo(10), read: false },
      { id: 'msg_07', fromId: 'usr_maxime', toId: 'usr_pierre', text: 'Pierre, on se retrouve au même endroit que d\'habitude ?', timestamp: hoursAgo(8), read: true },
      { id: 'msg_08', fromId: 'usr_pierre', toId: 'usr_maxime', text: 'Oui, devant l\'entrée principale. À demain !', timestamp: hoursAgo(7), read: true }
    ];

    // --- 6. Notifications ---
    const notifications = [
      { id: 'notif_01', userId: 'usr_sophie', type: 'new_booking', tripId: 'trip_01', title: 'Nouvelle réservation', message: 'Thomas a réservé 1 place pour votre trajet Rennes → Saint-Malo.', icon: '🎫', read: true, createdAt: daysAgo(1) },
      { id: 'notif_02', userId: 'usr_sophie', type: 'new_booking', tripId: 'trip_01', title: 'Nouvelle réservation', message: 'Camille a réservé 1 place pour votre trajet Rennes → Saint-Malo.', icon: '🎫', read: false, createdAt: daysAgo(1) },
      { id: 'notif_03', userId: 'usr_thomas', type: 'booking_confirmed', tripId: 'trip_01', title: 'Réservation confirmée', message: 'Votre place est réservée pour le trajet Rennes → Saint-Malo.', icon: '✅', read: true, createdAt: daysAgo(1) },
      { id: 'notif_04', userId: 'usr_maxime', type: 'booking_confirmed', tripId: 'trip_04', title: 'Réservation confirmée', message: 'Votre place est réservée pour le trajet Châteaubourg → Rennes.', icon: '✅', read: true, createdAt: daysAgo(4) },
      { id: 'notif_05', userId: 'usr_nicolas', type: 'match', tripId: 'trip_02', title: 'Trajet compatible trouvé !', message: 'Un trajet Rennes → Dinan correspond à votre itinéraire.', icon: '✨', read: false, createdAt: daysAgo(3) }
    ];

    // --- Sauvegarder ---
    localStorage.setItem('cedeoride_users', JSON.stringify(users));
    localStorage.setItem('cedeoride_trips', JSON.stringify(trips));
    localStorage.setItem('cedeoride_bookings', JSON.stringify(bookings));
    localStorage.setItem('cedeoride_messages', JSON.stringify(messages));
    localStorage.setItem('cedeoride_ratings', JSON.stringify(ratings));
    localStorage.setItem('cedeoride_notifications', JSON.stringify(notifications));
  }

  /**
   * Génère des réservations historiques pour les 3 derniers mois
   */
  function generateHistoricalBookings() {
    const bookings = [];
    const userIds = ['usr_sophie', 'usr_thomas', 'usr_marie', 'usr_pierre', 'usr_julie', 'usr_nicolas', 'usr_camille', 'usr_antoine', 'usr_lea', 'usr_maxime'];
    const driverIds = ['usr_sophie', 'usr_thomas', 'usr_marie', 'usr_pierre', 'usr_julie', 'usr_nicolas'];

    // Mois -3 : 5 covoiturages
    for (let i = 0; i < 5; i++) {
      bookings.push({
        id: `book_h3_${i}`,
        tripId: `trip_p${(i % 4) + 1}`,
        userId: userIds[(i + 2) % userIds.length],
        driverId: driverIds[i % driverIds.length],
        seats: 1,
        status: 'confirmed',
        createdAt: monthsAgo(3, i * 5)
      });
    }

    // Mois -2 : 8 covoiturages
    for (let i = 0; i < 8; i++) {
      bookings.push({
        id: `book_h2_${i}`,
        tripId: `trip_p${(i % 4) + 1}`,
        userId: userIds[(i + 3) % userIds.length],
        driverId: driverIds[(i + 1) % driverIds.length],
        seats: 1,
        status: 'confirmed',
        createdAt: monthsAgo(2, i * 3)
      });
    }

    // Mois -1 : 12 covoiturages
    for (let i = 0; i < 12; i++) {
      bookings.push({
        id: `book_h1_${i}`,
        tripId: `trip_p${(i % 4) + 1}`,
        userId: userIds[(i + 1) % userIds.length],
        driverId: driverIds[(i + 2) % driverIds.length],
        seats: 1,
        status: 'confirmed',
        createdAt: monthsAgo(1, i * 2)
      });
    }

    // Mois actuel : quelques-uns déjà passés
    for (let i = 0; i < 6; i++) {
      bookings.push({
        id: `book_h0_${i}`,
        tripId: `trip_p${(i % 4) + 1}`,
        userId: userIds[i % userIds.length],
        driverId: driverIds[(i + 3) % driverIds.length],
        seats: 1,
        status: 'confirmed',
        createdAt: daysAgo(15 + i * 3)
      });
    }

    return bookings;
  }

  // --- Helpers de dates ---

  function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(8, 0, 0, 0);
    return d.toISOString();
  }

  function hoursAgo(hours) {
    const d = new Date();
    d.setHours(d.getHours() - hours);
    return d.toISOString();
  }

  function futureDateAt(daysFromNow, hour, minute) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  function monthsAgo(months, dayOffset = 0) {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(8, 0, 0, 0);
    return d.toISOString();
  }

  return { load };
})();
