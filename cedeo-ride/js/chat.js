/* ===========================================
   CEDEO Ride — Module de messagerie
   Chat entre conducteur et passager
   =========================================== */

const Chat = (() => {

  let currentContactId = null;
  let messageCheckInterval = null;

  /**
   * Affiche la page de messagerie (liste des conversations)
   */
  function renderMessagesPage(contactId) {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();

    if (!currentUser) {
      window.App.navigate('/login');
      return;
    }

    const conversations = CedeoStore.getConversationList(currentUser.id);
    currentContactId = contactId || null;

    // Sur mobile, afficher soit la liste soit la conversation
    const showConversation = !!currentContactId;

    app.innerHTML = `
      <div class="chat-layout">
        <div class="chat-sidebar ${showConversation ? 'hidden-mobile' : ''}">
          <div class="chat-sidebar-header">Messages</div>
          ${conversations.length === 0 ? `
            <div style="padding:var(--space-8) var(--space-4);text-align:center;color:var(--color-text-secondary)">
              <p>Aucune conversation</p>
              <p style="font-size:var(--font-size-xs);margin-top:var(--space-2)">Réservez un trajet pour commencer à discuter avec le conducteur.</p>
            </div>
          ` : conversations.map(conv => {
            const contact = CedeoStore.getUser(conv.contactId);
            if (!contact) return '';
            const isActive = conv.contactId === currentContactId;
            return `
              <div class="chat-contact ${isActive ? 'active' : ''}" data-contact="${conv.contactId}">
                <div class="avatar avatar-sm" style="background-color:${Utils.getAvatarColor(contact.id)}">${Utils.getInitials(contact.firstName, contact.lastName)}</div>
                <div class="chat-contact-info">
                  <div class="chat-contact-name">${Utils.escapeHtml(contact.firstName)} ${Utils.escapeHtml(contact.lastName)}</div>
                  <div class="chat-contact-preview">${Utils.escapeHtml(conv.lastMessage.text || '')}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-1);flex-shrink:0">
                  <div class="chat-contact-time" style="white-space:nowrap">${Utils.timeAgo(conv.lastMessage.timestamp)}</div>
                  ${conv.unreadCount > 0 ? `<span class="badge-count chat-contact-unread">${conv.unreadCount}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="chat-main ${!showConversation ? 'hidden-mobile' : ''}" id="chat-main">
          ${currentContactId ? renderConversation(currentUser.id, currentContactId) : `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-light)">
              <div style="text-align:center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto var(--space-4);opacity:0.3">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>Sélectionnez une conversation</p>
              </div>
            </div>
          `}
        </div>
      </div>
    `;

    // Clic sur un contact
    app.querySelectorAll('.chat-contact').forEach(el => {
      el.addEventListener('click', () => {
        const cid = el.dataset.contact;
        window.App.navigate(`/messages/${cid}`);
      });
    });

    // Marquer les messages comme lus
    if (currentContactId) {
      CedeoStore.markMessagesAsRead(currentContactId, currentUser.id);
      window.App.updateNotificationBadge();
    }

    // Auto-refresh des messages
    startMessageCheck(currentUser.id, currentContactId);
  }

  /**
   * Rendu du contenu d'une conversation
   */
  function renderConversation(userId, contactId) {
    const contact = CedeoStore.getUser(contactId);
    if (!contact) return '<div style="padding:var(--space-4)">Utilisateur introuvable</div>';

    const messages = CedeoStore.getConversation(userId, contactId);

    // Grouper les messages par date
    let lastDate = '';
    let messagesHtml = '';
    messages.forEach(m => {
      const dateStr = new Date(m.timestamp).toLocaleDateString('fr-FR');
      if (dateStr !== lastDate) {
        messagesHtml += `<div class="chat-date-divider">${Utils.formatDate(m.timestamp)}</div>`;
        lastDate = dateStr;
      }
      const isSent = m.fromId === userId;
      messagesHtml += `
        <div class="chat-bubble ${isSent ? 'sent' : 'received'}">
          ${Utils.escapeHtml(m.text)}
          <div class="chat-bubble-time">${Utils.formatTime(m.timestamp)}</div>
        </div>
      `;
    });

    return `
      <div class="chat-main-header">
        <button class="btn btn-icon btn-sm btn-ghost chat-back" id="chat-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="avatar avatar-sm" style="background-color:${Utils.getAvatarColor(contact.id)}">${Utils.getInitials(contact.firstName, contact.lastName)}</div>
        <div style="flex:1">
          <div style="font-weight:var(--font-weight-medium);font-size:var(--font-size-sm)">${Utils.escapeHtml(contact.firstName)} ${Utils.escapeHtml(contact.lastName)}</div>
        </div>
        <button class="btn btn-icon btn-sm btn-ghost" onclick="App.navigate('/profile/${contact.id}')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </button>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${messages.length === 0 ? `
          <div style="text-align:center;color:var(--color-text-light);padding:var(--space-8)">
            <p>Commencez la conversation avec ${Utils.escapeHtml(contact.firstName)}</p>
          </div>
        ` : messagesHtml}
      </div>
      <div class="chat-input-area">
        <input class="form-input" type="text" id="chat-input" placeholder="Votre message..." autocomplete="off">
        <button class="btn btn-primary btn-icon" id="chat-send-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    `;
  }

  /**
   * Initialise les événements de la conversation après le rendu
   */
  function initConversationEvents(userId, contactId) {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const messagesContainer = document.getElementById('chat-messages');

    if (!input || !sendBtn) return;

    // Scroll en bas
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Envoi de message
    const sendMessage = () => {
      const text = input.value.trim();
      if (!text) return;

      CedeoStore.createMessage({
        fromId: userId,
        toId: contactId,
        text
      });

      // Notification au destinataire
      const currentUser = CedeoStore.getCurrentUser();
      CedeoStore.createNotification({
        userId: contactId,
        type: 'new_message',
        fromUserId: userId,
        title: 'Nouveau message',
        message: `${currentUser.firstName} : ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
        icon: '💬'
      });

      input.value = '';

      // Ajouter le message au DOM sans re-render complet
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble sent';
      bubble.innerHTML = `
        ${Utils.escapeHtml(text)}
        <div class="chat-bubble-time">${Utils.formatTime(new Date().toISOString())}</div>
      `;
      messagesContainer.appendChild(bubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Bouton retour (mobile)
    document.getElementById('chat-back-btn')?.addEventListener('click', () => {
      window.App.navigate('/messages');
    });
  }

  /**
   * Démarre le polling des messages (toutes les 3 secondes)
   */
  function startMessageCheck(userId, contactId) {
    stopMessageCheck();
    if (!contactId) return;

    // Initialiser les événements
    setTimeout(() => initConversationEvents(userId, contactId), 100);

    messageCheckInterval = setInterval(() => {
      // Vérifier les nouveaux messages
      if (contactId) {
        CedeoStore.markMessagesAsRead(contactId, userId);
      }
    }, 3000);
  }

  /**
   * Arrête le polling
   */
  function stopMessageCheck() {
    if (messageCheckInterval) {
      clearInterval(messageCheckInterval);
      messageCheckInterval = null;
    }
  }

  return {
    renderMessagesPage,
    stopMessageCheck
  };
})();
