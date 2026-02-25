/* ===========================================
   CEDEO Ride — Passeport Vert (Feature 11)
   Empreinte CO2, arbre SVG animé, carte de partage
   =========================================== */

const GreenPassport = (() => {
  const STORAGE_KEY = 'cedeoride_passport';

  const TREE_STAGES = [
    { minCO2: 0, name: 'Graine', iconName: 'seedling', color: '#a3d977', scale: 0.3 },
    { minCO2: 5, name: 'Pousse', iconName: 'sprout', color: '#7cc653', scale: 0.5 },
    { minCO2: 15, name: 'Jeune arbre', iconName: 'tree-deciduous', color: '#4caf50', scale: 0.7 },
    { minCO2: 30, name: 'Arbre mature', iconName: 'tree-pine', color: '#2e7d32', scale: 0.85 },
    { minCO2: 50, name: 'Forêt', iconName: 'forest', color: '#1b5e20', scale: 1.0 }
  ];

  function getUserPassportData(userId) {
    const bookings = CedeoStore.getBookings().filter(b =>
      (b.userId === userId || b.driverId === userId) && b.status === 'confirmed'
    );
    const trips = CedeoStore.getTripsByDriver(userId);

    let totalCO2 = 0;
    let totalKm = 0;
    let totalTrips = 0;
    let totalMoney = 0;

    bookings.forEach(b => {
      const trip = CedeoStore.getTrip(b.tripId);
      if (trip && trip.distanceKm) {
        totalCO2 += Utils.calculateCO2Saved(trip.distanceKm, 1);
        totalKm += trip.distanceKm;
        totalTrips++;
        totalMoney += Utils.calculateMoneySaved(trip.distanceKm, 1);
      }
    });

    trips.forEach(t => {
      if (t.distanceKm) {
        const passengerCount = CedeoStore.getBookingsByTrip(t.id).length;
        if (passengerCount > 0) {
          totalCO2 += Utils.calculateCO2Saved(t.distanceKm, passengerCount);
          totalKm += t.distanceKm;
          totalTrips++;
        }
      }
    });

    // Find current tree stage
    let stage = TREE_STAGES[0];
    for (let i = TREE_STAGES.length - 1; i >= 0; i--) {
      if (totalCO2 >= TREE_STAGES[i].minCO2) {
        stage = TREE_STAGES[i];
        break;
      }
    }

    const nextStage = TREE_STAGES[TREE_STAGES.indexOf(stage) + 1] || null;
    const progress = nextStage ?
      Math.min(100, Math.round(((totalCO2 - stage.minCO2) / (nextStage.minCO2 - stage.minCO2)) * 100)) : 100;

    return {
      totalCO2: Math.round(totalCO2 * 10) / 10,
      totalKm: Math.round(totalKm),
      totalTrips,
      totalMoney: Math.round(totalMoney),
      treesEquiv: Utils.co2ToTrees(totalCO2),
      stage,
      nextStage,
      progress
    };
  }

  function renderTreeSVG(stage, size = 200) {
    const s = stage.scale;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" style="animation: treeGrow 1s ease both">
        <!-- Sol -->
        <ellipse cx="100" cy="170" rx="${60 * s + 20}" ry="8" fill="#8B4513" opacity="0.2"/>

        <!-- Tronc -->
        <rect x="${95 - 5*s}" y="${170 - 80*s}" width="${10 + 10*s}" height="${80*s}" rx="4" fill="#8B6914"/>

        ${s >= 0.5 ? `
          <!-- Feuillage -->
          <ellipse cx="100" cy="${170 - 80*s - 30*s}" rx="${40*s}" ry="${35*s}" fill="${stage.color}" opacity="0.9"/>
          <ellipse cx="${100 - 20*s}" cy="${170 - 80*s - 20*s}" rx="${30*s}" ry="${28*s}" fill="${stage.color}"/>
          <ellipse cx="${100 + 20*s}" cy="${170 - 80*s - 20*s}" rx="${30*s}" ry="${28*s}" fill="${stage.color}"/>
        ` : ''}

        ${s >= 0.7 ? `
          <!-- Feuillage supplémentaire -->
          <ellipse cx="100" cy="${170 - 80*s - 50*s}" rx="${35*s}" ry="${30*s}" fill="${stage.color}" opacity="0.8"/>
          <ellipse cx="${100 - 15*s}" cy="${170 - 80*s - 45*s}" rx="${25*s}" ry="${22*s}" fill="${stage.color}"/>
        ` : ''}

        ${s >= 1.0 ? `
          <!-- Petit arbre à droite -->
          <rect x="150" y="140" width="6" height="30" rx="2" fill="#8B6914" opacity="0.7"/>
          <ellipse cx="153" cy="130" rx="15" ry="14" fill="${stage.color}" opacity="0.6"/>
          <!-- Petit arbre à gauche -->
          <rect x="45" y="145" width="5" height="25" rx="2" fill="#8B6914" opacity="0.7"/>
          <ellipse cx="47" cy="137" rx="12" ry="11" fill="${stage.color}" opacity="0.6"/>
        ` : ''}

        ${s < 0.5 ? `
          <!-- Graine / pousse -->
          <ellipse cx="100" cy="160" rx="${12*Math.max(s,0.3)}" ry="${10*Math.max(s,0.3)}" fill="${stage.color}"/>
          <path d="M100 160 L100 ${160 - 20*s}" stroke="${stage.color}" stroke-width="2" fill="none"/>
          ${s > 0.3 ? '<ellipse cx="97" cy="150" rx="6" ry="4" fill="#a3d977" transform="rotate(-20,97,150)"/>' : ''}
        ` : ''}
      </svg>
    `;
  }

  function renderPassportPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) { window.App.navigate('/login'); return; }

    const data = getUserPassportData(currentUser.id);

    app.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4);max-width:800px">
        <div class="page-header" style="text-align:center">
          <h1 class="page-title">Mon Passeport Vert</h1>
          <p class="page-subtitle">Votre impact écologique avec CEDEO Ride</p>
        </div>

        <!-- Arbre central -->
        <div class="card" style="text-align:center;margin-bottom:var(--space-6);overflow:hidden;padding:0">
          <div style="background:linear-gradient(to bottom, #e8f5e9 0%, #c8e6c9 100%);padding:var(--space-8) var(--space-4) var(--space-6)">
            ${renderTreeSVG(data.stage)}
            <div style="margin-top:var(--space-4)">
              <div style="font-size:var(--font-size-xl);font-weight:var(--font-weight-bold);color:#1b5e20;display:flex;align-items:center;justify-content:center;gap:var(--space-2)">${AppIcons.i(data.stage.iconName, 24, data.stage.color)} ${data.stage.name}</div>
              ${data.nextStage ? `
                <div style="max-width:300px;margin:var(--space-3) auto 0">
                  <div style="display:flex;justify-content:space-between;font-size:var(--font-size-xs);margin-bottom:var(--space-1)">
                    <span>${data.totalCO2} kg CO2</span>
                    <span>${data.nextStage.name} à ${data.nextStage.minCO2} kg</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-bar-fill eco" style="width:${data.progress}%"></div>
                  </div>
                </div>
              ` : '<div style="font-size:var(--font-size-sm);color:var(--color-success);margin-top:var(--space-2)">Niveau maximum atteint !</div>'}
            </div>
          </div>

          <!-- Stats grid -->
          <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:1px;background:var(--color-border)">
            <div style="background:var(--color-surface);padding:var(--space-5);text-align:center">
              <div style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);color:var(--color-eco)" class="animated-counter" data-target="${data.totalCO2}">${data.totalCO2}</div>
              <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">kg CO2 économisé</div>
            </div>
            <div style="background:var(--color-surface);padding:var(--space-5);text-align:center">
              <div style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);color:var(--color-primary)">${data.totalKm}</div>
              <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">km partagés</div>
            </div>
            <div style="background:var(--color-surface);padding:var(--space-5);text-align:center">
              <div style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);color:#f59e0b">${data.totalMoney} €</div>
              <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">économisé</div>
            </div>
            <div style="background:var(--color-surface);padding:var(--space-5);text-align:center">
              <div style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);color:var(--color-success)">${data.treesEquiv}</div>
              <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">arbres équivalents</div>
            </div>
          </div>
        </div>

        <!-- Stades de l'arbre -->
        <div class="card" style="margin-bottom:var(--space-6)">
          <div style="font-weight:var(--font-weight-semibold);margin-bottom:var(--space-4)">Stades de croissance</div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${TREE_STAGES.map((s, i) => {
              const isCurrent = s.name === data.stage.name;
              const isUnlocked = data.totalCO2 >= s.minCO2;
              return `
                <div style="display:flex;align-items:center;gap:var(--space-3);opacity:${isUnlocked ? '1' : '0.4'}">
                  <div style="width:40px;height:40px;border-radius:var(--radius-full);background:${isUnlocked ? s.color + '20' : 'var(--color-bg)'};display:flex;align-items:center;justify-content:center;${isCurrent ? 'box-shadow:0 0 0 3px ' + s.color + '40' : ''}">${AppIcons.i(s.iconName, 20, isUnlocked ? s.color : '#9ca3af')}</div>
                  <div style="flex:1">
                    <div style="font-weight:${isCurrent ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)'};font-size:var(--font-size-sm)">${s.name}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-light)">${s.minCO2} kg CO2 minimum</div>
                  </div>
                  ${isUnlocked ? '<span class="badge badge-success">✓</span>' : ''}
                  ${isCurrent ? '<span class="badge badge-eco">Actuel</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Share card -->
        <div class="card" style="text-align:center;background:linear-gradient(135deg, var(--color-primary), var(--color-primary-light));color:#fff;border:none">
          <div style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-2)">Partagez votre impact !</div>
          <p style="font-size:var(--font-size-sm);opacity:0.9;margin-bottom:var(--space-4)">
            ${data.totalCO2} kg CO2 économisé grâce à ${data.totalTrips} covoiturages CEDEO Ride
          </p>
          <button class="btn" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3)" onclick="GreenPassport.sharePassport()">
            ${AppIcons.i('share', 16, '#fff')} Partager mon passeport
          </button>
        </div>
      </div>
    `;
  }

  function sharePassport() {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return;
    const data = getUserPassportData(currentUser.id);

    const shareText = `Mon Passeport Vert CEDEO Ride\nNiveau : ${data.stage.name}\n${data.totalCO2} kg CO2 economise\n${data.totalKm} km partages\n${data.treesEquiv} arbres equivalents`;

    if (navigator.share) {
      navigator.share({ title: 'Mon Passeport Vert CEDEO Ride', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText).then(() => {
        window.App.showToast('Copié dans le presse-papier !', 'success');
      }).catch(() => {
        window.App.showToast('Partagez votre impact avec vos collègues !', 'info');
      });
    }
  }

  return {
    renderPassportPage,
    getUserPassportData,
    renderTreeSVG,
    sharePassport,
    TREE_STAGES
  };
})();
