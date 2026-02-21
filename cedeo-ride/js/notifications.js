/* ===========================================
   CEDEO Ride — Système de notifications
   Notifications in-app, rappels, centre de notifications
   =========================================== */

const Notifications = (() => {

  /**
   * Vérifie et crée les notifications automatiques
   * (rappels de trajet, demandes de notation, etc.)
   */
  function checkAutoNotifications() {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return;

    const now = new Date();
    const trips = CedeoStore.getTrips();
    const bookings = CedeoStore.getBookings();
    const notifications = CedeoStore.getUserNotifications(currentUser.id);

    // --- Rappels de trajet J-1 et H-1 ---
    trips.forEach(trip => {
      if (trip.status !== 'active') return;
      const departure = new Date(trip.departureTime);
      const diffMs = departure - now;
      const diffH = diffMs / (1000 * 60 * 60);

      // Est-ce que l'utilisateur est concerné ?
      const isDriver = trip.driverId === currentUser.id;
      const isPassenger = bookings.some(b =>
        b.tripId === trip.id && b.userId === currentUser.id && b.status === 'confirmed'
      );
      if (!isDriver && !isPassenger) return;

      // Rappel J-1 (entre 23h et 25h avant)
      if (diffH > 23 && diffH < 25) {
        const alreadyNotified = notifications.some(n =>
          n.type === 'reminder_day' && n.tripId === trip.id
        );
        if (!alreadyNotified) {
          CedeoStore.createNotification({
            userId: currentUser.id,
            type: 'reminder_day',
            tripId: trip.id,
            title: 'Rappel : trajet demain',
            message: `Votre trajet ${trip.fromName} → ${trip.toName} est prévu demain à ${Utils.formatTime(trip.departureTime)}.`,
            icon: '📅'
          });
        }
      }

      // Rappel H-1 (entre 0.5h et 1.5h avant)
      if (diffH > 0.5 && diffH < 1.5) {
        const alreadyNotified = notifications.some(n =>
          n.type === 'reminder_hour' && n.tripId === trip.id
        );
        if (!alreadyNotified) {
          CedeoStore.createNotification({
            userId: currentUser.id,
            type: 'reminder_hour',
            tripId: trip.id,
            title: 'Départ dans 1 heure',
            message: `Votre trajet ${trip.fromName} → ${trip.toName} part bientôt !`,
            icon: '⏰'
          });
        }
      }
    });

    // --- Demande de notation après trajet terminé ---
    bookings.filter(b => b.status === 'confirmed').forEach(booking => {
      const trip = CedeoStore.getTrip(booking.tripId);
      if (!trip) return;

      const departure = new Date(trip.departureTime);
      const duration = trip.durationMin || 60;
      const arrivalEstimated = new Date(departure.getTime() + duration * 60000);

      // Si le trajet est terminé (arrivée + 30 min de marge)
      if (now > new Date(arrivalEstimated.getTime() + 30 * 60000)) {
        // Pour le passager : noter le conducteur
        if (booking.userId === currentUser.id) {
          const alreadyRated = CedeoStore.getRatings().some(r =>
            r.tripId === booking.tripId && r.fromUserId === currentUser.id && r.toUserId === trip.driverId
          );
          const alreadyNotified = notifications.some(n =>
            n.type === 'rate_request' && n.tripId === booking.tripId && n.targetUserId === trip.driverId
          );
          if (!alreadyRated && !alreadyNotified) {
            const driver = CedeoStore.getUser(trip.driverId);
            CedeoStore.createNotification({
              userId: currentUser.id,
              type: 'rate_request',
              tripId: booking.tripId,
              targetUserId: trip.driverId,
              title: 'Comment s\'est passé votre trajet ?',
              message: `Notez ${driver ? driver.firstName : 'votre conducteur'} pour le trajet ${trip.fromName} → ${trip.toName}.`,
              icon: '⭐'
            });
          }
        }

        // Pour le conducteur : noter le passager
        if (trip.driverId === currentUser.id) {
          const alreadyRated = CedeoStore.getRatings().some(r =>
            r.tripId === booking.tripId && r.fromUserId === currentUser.id && r.toUserId === booking.userId
          );
          const alreadyNotified = notifications.some(n =>
            n.type === 'rate_request' && n.tripId === booking.tripId && n.targetUserId === booking.userId
          );
          if (!alreadyRated && !alreadyNotified) {
            const passenger = CedeoStore.getUser(booking.userId);
            CedeoStore.createNotification({
              userId: currentUser.id,
              type: 'rate_request',
              tripId: booking.tripId,
              targetUserId: booking.userId,
              title: 'Notez votre passager',
              message: `Comment s'est passé le trajet avec ${passenger ? passenger.firstName : 'votre passager'} ?`,
              icon: '⭐'
            });
          }
        }
      }
    });
  }

  /**
   * Affiche le centre de notifications
   */
  function renderNotificationsPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    if (!currentUser) {
      window.App.navigate('/login');
      return;
    }

    const notifications = CedeoStore.getUserNotifications(currentUser.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    app.innerHTML = `
      <div class="container">
        <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h1 class="page-title">Notifications</h1>
            <p class="page-subtitle">${unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}</p>
          </div>
          ${unreadCount > 0 ? `<button class="btn btn-ghost btn-sm" id="mark-all-read">Tout marquer comme lu</button>` : ''}
        </div>

        <div class="card card-flat" style="padding:0;overflow:hidden">
          ${notifications.length === 0 ? `
            <div class="empty-state">
              ${window.AppIcons.emptyNotifications()}
              <div class="empty-state-title">Aucune notification</div>
              <div class="empty-state-text">Vous serez notifié des nouveaux trajets, réservations et messages.</div>
            </div>
          ` : notifications.map(n => renderNotificationItem(n)).join('')}
        </div>
      </div>
    `;

    // Marquer tout comme lu
    document.getElementById('mark-all-read')?.addEventListener('click', () => {
      CedeoStore.markAllNotificationsRead(currentUser.id);
      window.App.updateNotificationBadge();
      renderNotificationsPage();
    });

    // Clic sur notification
    app.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const notifId = item.dataset.id;
        const notif = notifications.find(n => n.id === notifId);
        if (!notif) return;

        CedeoStore.markNotificationRead(notifId);
        window.App.updateNotificationBadge();

        // Navigation selon le type
        if (notif.type === 'rate_request') {
          showRatingModal(notif);
        } else if (notif.type === 'new_booking' || notif.type === 'booking_confirmed' || notif.type === 'trip_cancelled') {
          if (notif.tripId) window.App.navigate(`/trip/${notif.tripId}`);
        } else if (notif.type === 'new_message') {
          if (notif.fromUserId) window.App.navigate(`/messages/${notif.fromUserId}`);
        } else if (notif.type === 'match') {
          if (notif.tripId) window.App.navigate(`/trip/${notif.tripId}`);
        } else {
          // Refresh la page
          renderNotificationsPage();
        }
      });
    });
  }

  /**
   * Rendu HTML d'une notification
   */
  function renderNotificationItem(notif) {
    const iconBg = {
      welcome: 'var(--color-primary-bg)',
      new_booking: 'var(--color-success-bg)',
      booking_confirmed: 'var(--color-success-bg)',
      match: 'var(--color-eco-bg)',
      reminder_day: 'var(--color-warning-bg)',
      reminder_hour: 'var(--color-warning-bg)',
      rate_request: 'var(--color-warning-bg)',
      new_message: 'var(--color-primary-bg)',
      trip_cancelled: 'var(--color-error-bg)'
    };

    return `
      <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
        <div class="notification-icon" style="background:${iconBg[notif.type] || 'var(--color-divider)'}">
          ${notif.icon || '🔔'}
        </div>
        <div class="notification-content">
          <div class="notification-text"><strong>${Utils.escapeHtml(notif.title)}</strong></div>
          <div class="notification-text" style="color:var(--color-text-secondary)">${Utils.escapeHtml(notif.message)}</div>
          <div class="notification-time">${Utils.timeAgo(notif.createdAt)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Affiche la modale de notation
   */
  function showRatingModal(notif) {
    const targetUser = CedeoStore.getUser(notif.targetUserId);
    if (!targetUser) return;

    let selectedRating = 0;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Noter ${Utils.escapeHtml(targetUser.firstName)}</h3>
          <button class="modal-close" id="close-rating-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div style="text-align:center">
            <div class="avatar avatar-xl" style="background-color:${Utils.getAvatarColor(targetUser.id)};margin:0 auto var(--space-4)">${Utils.getInitials(targetUser.firstName, targetUser.lastName)}</div>
            <p style="margin-bottom:var(--space-4);color:var(--color-text-secondary)">Comment s'est passé votre trajet ?</p>
            <div class="rating-modal-stars" id="rating-stars"></div>
            <div class="form-group" style="margin-top:var(--space-4)">
              <textarea class="form-textarea" id="rating-comment" placeholder="Laissez un commentaire (optionnel)" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="cancel-rating">Annuler</button>
          <button class="btn btn-primary" id="submit-rating" disabled>Envoyer</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Étoiles interactives
    const starsContainer = document.getElementById('rating-stars');
    const interactiveStars = Utils.renderInteractiveStars(0, (rating) => {
      selectedRating = rating;
      document.getElementById('submit-rating').disabled = false;
    });
    starsContainer.appendChild(interactiveStars);

    // Fermer
    const closeModal = () => {
      backdrop.classList.add('closing');
      setTimeout(() => backdrop.remove(), 200);
    };

    document.getElementById('close-rating-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-rating').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });

    // Soumettre
    document.getElementById('submit-rating').addEventListener('click', () => {
      if (selectedRating === 0) return;

      CedeoStore.createRating({
        tripId: notif.tripId,
        fromUserId: CedeoStore.getCurrentUserId(),
        toUserId: notif.targetUserId,
        rating: selectedRating,
        comment: document.getElementById('rating-comment').value.trim()
      });

      closeModal();
      window.App.showToast('Merci pour votre avis !', 'success');

      // Re-render si on est sur la page notifications
      if (window.location.hash.startsWith('#/notifications')) {
        renderNotificationsPage();
      }
    });
  }

  /**
   * Met à jour le badge de notifications dans le header
   */
  function updateBadge() {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return;

    const count = CedeoStore.getUnreadNotificationCount(currentUser.id);
    const badgeEls = document.querySelectorAll('.notif-badge-count');
    badgeEls.forEach(el => {
      if (count > 0) {
        el.textContent = count > 99 ? '99+' : count;
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    });
  }

  return {
    checkAutoNotifications,
    renderNotificationsPage,
    showRatingModal,
    updateBadge
  };
})();
