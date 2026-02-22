/* ===========================================
   CEDEO Ride — Icônes et illustrations SVG
   Logo, illustrations d'états vides, icônes inline
   =========================================== */

window.AppIcons = {

  /**
   * Helper : retourne un SVG inline avec taille et couleur configurable
   */
  i(name, size = 20, color = 'currentColor') {
    const icons = {
      // --- Navigation & Interface ---
      home: `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>`,
      plus: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`,
      clipboard: `<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>`,
      map: `<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>`,
      pin: `<circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 00-8-8z"/>`,
      users: `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>`,
      refresh: `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>`,
      train: `<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><line x1="12" y1="3" x2="12" y2="11"/><circle cx="8" cy="21" r="1"/><circle cx="16" cy="21" r="1"/><path d="M6 17l-2 4"/><path d="M18 17l2 4"/>`,
      leaf: `<path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 0-8 0-5 5z"/><path d="M6 15s2-2 6-2"/>`,
      trophy: `<path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/>`,
      star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
      calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
      chart: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
      user: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
      message: `<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>`,
      bell: `<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>`,
      logout: `<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
      search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
      close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
      menu: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`,
      'arrow-left': `<path d="M19 12H5M12 19l-7-7 7-7"/>`,
      'arrow-right': `<path d="M5 12h14M12 5l7 7-7 7"/>`,
      'chevron-right': `<polyline points="9 18 15 12 9 6"/>`,
      settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>`,
      info: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`,
      filter: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
      grid: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`,
      share: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
      download: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
      upload: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
      eye: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
      edit: `<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
      trash: `<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>`,
      copy: `<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>`,

      // --- Transport ---
      car: `<path d="M16 6l3 5h1a2 2 0 012 2v3a1 1 0 01-1 1h-1"/><path d="M5 17H3a1 1 0 01-1-1v-3a2 2 0 012-2h1l3-5"/><path d="M5 6h11"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M10 17h4"/>`,
      bus: `<rect x="3" y="3" width="18" height="15" rx="2"/><path d="M3 10h18"/><circle cx="7" cy="21" r="1"/><circle cx="17" cy="21" r="1"/><path d="M5 18v3"/><path d="M19 18v3"/>`,
      truck: `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,

      // --- Status & Actions ---
      check: `<polyline points="20 6 9 17 4 12"/>`,
      'check-circle': `<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
      'x-circle': `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`,
      alert: `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
      'alert-circle': `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
      shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
      'shield-check': `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`,
      lock: `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>`,
      unlock: `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/>`,
      sparkle: `<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>`,
      zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
      bookmark: `<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>`,

      // --- Time ---
      clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
      'alarm-clock': `<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3L2 6"/><path d="M22 6l-3-3"/><path d="M6.38 18.7L4 21"/><path d="M17.64 18.67L20 21"/>`,

      // --- Eco & Nature ---
      seedling: `<path d="M7 20h10"/><path d="M12 20v-8"/><path d="M12 12C12 8 8 4 4 4c0 4 4 8 8 8z"/><path d="M12 12c0-4 4-8 8-8-0 4-4 8-8 8z"/>`,
      sprout: `<path d="M7 20h10"/><path d="M12 20V10"/><path d="M12 10c-3 0-7-3-7-7 4 0 7 4 7 7z"/><path d="M12 14c2 0 5-2 5-5-3 0-5 3-5 5z"/>`,
      tree: `<path d="M12 22v-6"/><path d="M12 16l-4.5-7h9z"/><path d="M12 12l-3.5-5.5h7z"/><path d="M12 8l-2.5-4h5z"/>`,
      'tree-pine': `<path d="M12 22v-5"/><path d="M17 17H7l5-8z"/><path d="M15.5 12H8.5L12 5z"/>`,
      mountain: `<path d="M8 21l4.5-11L17 21"/><path d="M2 21h20"/><path d="M15 10l4 11"/><path d="M5 21l4-7"/>`,
      globe: `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>`,
      'tree-deciduous': `<circle cx="12" cy="8" r="6"/><path d="M12 14v8"/><path d="M9 22h6"/>`,
      forest: `<path d="M12 22v-4"/><path d="M7 22v-3"/><path d="M17 22v-3"/><circle cx="12" cy="10" r="5"/><circle cx="7" cy="13" r="3.5"/><circle cx="17" cy="13" r="3.5"/>`,

      // --- Weather ---
      sun: `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`,
      'cloud-sun': `<path d="M12 2v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M20 12h2"/><path d="M19.07 4.93l-1.41 1.41"/><path d="M15.95 12.64A5 5 0 009.5 7.36"/><path d="M17 17h.01"/><path d="M13 21H7a4 4 0 010-8h.5a5.5 5.5 0 0110 1H18a3 3 0 010 6h-1"/>`,
      cloud: `<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>`,
      'cloud-rain': `<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25"/>`,
      'cloud-drizzle': `<line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="16" y1="19" x2="16" y2="21"/><line x1="16" y1="13" x2="16" y2="15"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="12" y1="15" x2="12" y2="17"/><path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25"/>`,
      fog: `<path d="M3 12h18"/><path d="M3 16h18"/><path d="M3 20h18"/><path d="M5 8h14"/><path d="M7 4h10"/>`,
      wind: `<path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>`,
      thermometer: `<path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>`,

      // --- Social & Trust ---
      crown: `<path d="M2 4l3 12h14l3-12-5 4-5-4-5 4z"/><path d="M5 16h14v2H5z"/>`,
      handshake: `<path d="M11 17l-1-1a5 5 0 010-7l2-2 4 4"/><path d="M13 7l1 1a5 5 0 010 7l-2 2-4-4"/><path d="M2 12l5-5"/><path d="M22 12l-5 5"/>`,
      heart: `<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>`,
      'thumbs-up': `<path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>`,

      // --- Building & Place ---
      building: `<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 22v-4h6v4"/>`,
      flag: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>`,

      // --- Gamification ---
      medal: `<circle cx="12" cy="8" r="6"/><polyline points="9 18 12 14 15 18"/><path d="M12 14v-2"/>`,
      target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
      flame: `<path d="M12 22c-4.97 0-9-2.69-9-6 0-4 3.5-7.5 3.5-7.5S8 12 12 8c4-4 4-6 4-6s4 4.5 4 10c0 3.31-4.03 6-8 6z"/><path d="M12 22c-1.66 0-3-1.5-3-3.37 0-2.25 1.97-4.23 1.97-4.23S12 16 13.5 14c1.5-2 1.5-3.5 1.5-3.5S18 13 18 16.63C18 18.5 13.66 22 12 22z"/>`,
      award: `<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`,
      gift: `<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>`,
      sunrise: `<path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/>`,
      road: `<path d="M4 19L8 5"/><path d="M20 19L16 5"/><line x1="12" y1="5" x2="12" y2="7"/><line x1="12" y1="10" x2="12" y2="12"/><line x1="12" y1="15" x2="12" y2="19"/>`,
      money: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>`,
      speed: `<path d="M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0"/><path d="M12 7v5l3 3"/>`,

      // --- Data & Content ---
      ticket: `<path d="M2 9a3 3 0 013 3 3 3 0 01-3 3v4h20v-4a3 3 0 010-6V5H2z"/><path d="M13 5v2"/><path d="M13 11v2"/><path d="M13 17v2"/>`,
      tag: `<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`,
      lightbulb: `<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/>`,
      coffee: `<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>`,
      hiking: `<path d="M13 4a2 2 0 100-4 2 2 0 000 4z"/><path d="M6 21l3-9 4 2V7"/><path d="M10 14l5 7"/>`,
      'no-car': `<circle cx="12" cy="12" r="10"/><path d="M16 6l3 5"/><path d="M5 11l3-5"/><path d="M5 6h11"/><circle cx="7.5" cy="14" r="1.5"/><circle cx="16.5" cy="14" r="1.5"/><line x1="4" y1="4" x2="20" y2="20"/>`,
      ruler: `<path d="M21.73 18l-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3z" fill="none"/><line x1="4" y1="21" x2="20" y2="21"/><line x1="12" y1="3" x2="12" y2="21"/>`,
      seat: `<path d="M4 18v-5a8 8 0 0116 0v5"/><rect x="3" y="18" width="18" height="3" rx="1"/>`,
      undo: `<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>`,
      confetti: `<path d="M5.8 11.3L2 22l10.7-3.8"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="M22 2l-2.24.75a1 1 0 00-.64.64L18.37 5.6a1 1 0 01-.64.64L15 7l2.24.75a1 1 0 01.64.64l.75 2.24 .75-2.24a1 1 0 01.64-.64L22 7l-2.24-.75a1 1 0 01-.64-.64z"/>`,
      hero: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>`,
      siren: `<path d="M7 12h10"/><path d="M7 16h10"/><path d="M12 2v4"/><path d="M4.93 5.93l2.83 2.83"/><path d="M19.07 5.93l-2.83 2.83"/><rect x="5" y="12" width="14" height="8" rx="2"/>`,
    };

    const d = icons[name];
    if (!d) return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;font-size:${size * 0.7}px">?</span>`;

    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0">${d}</svg>`;
  },

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
