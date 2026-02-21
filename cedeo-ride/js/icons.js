/* ===========================================
   CEDEO Ride — Icônes et illustrations SVG
   Logo, illustrations d'états vides, icônes
   =========================================== */

window.AppIcons = {

  /**
   * Logo complet CEDEO Ride (pour la page login)
   */
  logoFull() {
    return `
      <svg width="220" height="56" viewBox="0 0 220 56" style="margin:0 auto">
        <!-- Icône voiture + feuille -->
        <g transform="translate(10, 4)">
          <!-- Carrosserie -->
          <path d="M8 32h32a4 4 0 0 0 4-4v-6a4 4 0 0 0-1.2-2.8L36 12.4a4 4 0 0 0-2.8-1.2H14.8a4 4 0 0 0-2.8 1.2L5.2 19.2A4 4 0 0 0 4 22v6a4 4 0 0 0 4 4z" fill="#003DA5"/>
          <!-- Vitres -->
          <path d="M14 13.5L9 20h12V13h-4.5a3 3 0 0 0-2.5 0.5z" fill="#e8eef8" opacity="0.9"/>
          <path d="M27 13h5.5a3 3 0 0 1 2 1L39 20H27V13z" fill="#e8eef8" opacity="0.9"/>
          <!-- Roues -->
          <circle cx="14" cy="34" r="5" fill="#1A1A1A"/>
          <circle cx="14" cy="34" r="2.5" fill="#6B7280"/>
          <circle cx="34" cy="34" r="5" fill="#1A1A1A"/>
          <circle cx="34" cy="34" r="2.5" fill="#6B7280"/>
          <!-- Phare -->
          <rect x="40" y="20" width="4" height="3" rx="1" fill="#f59e0b"/>
          <!-- Feuille éco -->
          <path d="M42 4c-4 0-8 2-10 6 0 0 2-1 5-1 3 0 5 2 5 5 0 3-2 5-5 5 3-1 9-4 9-9 0-3-1-6-4-6z" fill="#22c55e"/>
          <path d="M37 9c-2 2-3 5-2 8" stroke="#16a34a" stroke-width="1.5" fill="none"/>
        </g>

        <!-- Texte CEDEO -->
        <text x="66" y="28" font-family="Inter, Poppins, sans-serif" font-weight="700" font-size="24" fill="#003DA5">CEDEO</text>
        <!-- Texte Ride -->
        <text x="66" y="48" font-family="Inter, Poppins, sans-serif" font-weight="600" font-size="18" fill="#DA291C">Ride</text>
        <!-- Sous-texte -->
        <text x="100" y="48" font-family="Inter, Poppins, sans-serif" font-weight="400" font-size="11" fill="#6B7280">Région Ouest</text>
      </svg>
    `;
  },

  /**
   * Logo petit (pour le header)
   */
  logoSmall() {
    return `
      <svg width="36" height="36" viewBox="0 0 48 48">
        <rect width="48" height="48" rx="12" fill="#003DA5"/>
        <!-- Voiture simplifiée -->
        <path d="M10 30h28a3 3 0 0 0 3-3v-4a3 3 0 0 0-.9-2.1L34 14.8a3 3 0 0 0-2.1-.8H16.1a3 3 0 0 0-2.1.8L7.9 20.9A3 3 0 0 0 7 23v4a3 3 0 0 0 3 3z" fill="#fff" opacity="0.95"/>
        <circle cx="16" cy="31.5" r="3.5" fill="#003DA5"/>
        <circle cx="16" cy="31.5" r="1.5" fill="#fff"/>
        <circle cx="32" cy="31.5" r="3.5" fill="#003DA5"/>
        <circle cx="32" cy="31.5" r="1.5" fill="#fff"/>
        <!-- Feuille -->
        <path d="M36 8c-3 0-6 1.5-7.5 4.5 0 0 1.5-.8 3.8-.8 2.2 0 3.7 1.5 3.7 3.7 0 2.2-1.5 3.7-3.7 3.7 2.2-.8 6.5-3 6.5-6.5 0-2.5-1-4.6-2.8-4.6z" fill="#22c55e"/>
      </svg>
    `;
  },

  /**
   * Illustration état vide — Pas de trajets
   */
  emptyTrips() {
    return `
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#F3F4F6"/>
        <path d="M30 70h60a5 5 0 0 0 5-5v-8a5 5 0 0 0-1.5-3.5L82 42a5 5 0 0 0-3.5-1.5H41.5A5 5 0 0 0 38 42l-11.5 11.5A5 5 0 0 0 25 57v8a5 5 0 0 0 5 5z" fill="#D1D5DB"/>
        <circle cx="42" cy="74" r="6" fill="#9CA3AF"/>
        <circle cx="42" cy="74" r="3" fill="#D1D5DB"/>
        <circle cx="78" cy="74" r="6" fill="#9CA3AF"/>
        <circle cx="78" cy="74" r="3" fill="#D1D5DB"/>
        <path d="M45 55V46h8v9H45z" fill="#E5E7EB"/>
        <path d="M67 55V46h8v9h-8z" fill="#E5E7EB"/>
        <line x1="52" y1="30" x2="68" y2="30" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round"/>
        <line x1="48" y1="25" x2="72" y2="25" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  },

  /**
   * Illustration état vide — Pas de résultats de recherche
   */
  emptySearch() {
    return `
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#F3F4F6"/>
        <circle cx="52" cy="52" r="20" stroke="#D1D5DB" stroke-width="4" fill="none"/>
        <line x1="66" y1="66" x2="82" y2="82" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round"/>
        <line x1="44" y1="48" x2="60" y2="48" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
        <line x1="44" y1="54" x2="56" y2="54" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
        <circle cx="80" cy="30" r="3" fill="#E5E7EB"/>
        <circle cx="30" cy="80" r="2" fill="#E5E7EB"/>
      </svg>
    `;
  },

  /**
   * Illustration état vide — Pas de notifications
   */
  emptyNotifications() {
    return `
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#F3F4F6"/>
        <path d="M72 52a12 12 0 0 0-24 0c0 14-6 18-6 18h36s-6-4-6-18" stroke="#D1D5DB" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M56 74a4 4 0 0 0 8 0" stroke="#D1D5DB" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="72" cy="42" r="4" fill="#E5E7EB"/>
        <line x1="50" y1="85" x2="70" y2="85" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  },

  /**
   * Illustration état vide — Pas de messages
   */
  emptyMessages() {
    return `
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#F3F4F6"/>
        <rect x="30" y="35" width="60" height="40" rx="8" stroke="#D1D5DB" stroke-width="3" fill="none"/>
        <path d="M30 43l30 20 30-20" stroke="#D1D5DB" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="82" cy="35" r="5" fill="#E5E7EB"/>
      </svg>
    `;
  }
};
