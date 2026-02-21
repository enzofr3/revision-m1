/* ===========================================
   CEDEO Ride — Pool Fixe (Feature 2)
   Équipes de covoiturage permanentes
   =========================================== */

const Pools = (() => {
  const STORAGE_KEY = 'cedeoride_pools';

  function getPools() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function savePools(pools) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
  }

  function getPool(id) {
    return getPools().find(p => p.id === id);
  }

  function createPool(poolData) {
    const pools = getPools();
    const pool = {
      id: Utils.generateId(),
      createdAt: new Date().toISOString(),
      status: 'active',
      members: [],
      rotationSchedule: [],
      absences: [],
      ...poolData
    };
    pools.push(pool);
    savePools(pools);
    return pool;
  }

  function updatePool(id, updates) {
    const pools = getPools();
    const idx = pools.findIndex(p => p.id === id);
    if (idx !== -1) {
      pools[idx] = { ...pools[idx], ...updates };
      savePools(pools);
      return pools[idx];
    }
    return null;
  }

  function joinPool(poolId, userId) {
    const pool = getPool(poolId);
    if (!pool) return;
    if (pool.members.includes(userId)) return;
    pool.members.push(userId);
    updatePool(poolId, { members: pool.members });

    CedeoStore.createNotification({
      userId: pool.creatorId,
      type: 'pool_join',
      title: 'Nouveau membre Pool',
      message: `Un collègue a rejoint votre pool "${pool.name}" !`,
      icon: '👥'
    });
  }

  function leavePool(poolId, userId) {
    const pool = getPool(poolId);
    if (!pool) return;
    pool.members = pool.members.filter(m => m !== userId);
    updatePool(poolId, { members: pool.members });
  }

  function declareAbsence(poolId, userId, date, reason) {
    const pool = getPool(poolId);
    if (!pool) return;
    pool.absences.push({
      userId,
      date,
      reason,
      declaredAt: new Date().toISOString()
    });
    updatePool(poolId, { absences: pool.absences });

    // Notify other members
    pool.members.filter(m => m !== userId).forEach(memberId => {
      const user = CedeoStore.getUser(userId);
      CedeoStore.createNotification({
        userId: memberId,
        type: 'pool_absence',
        title: 'Absence dans votre pool',
        message: `${user ? user.firstName : 'Un membre'} sera absent le ${date}${reason ? ` (${reason})` : ''}.`,
        icon: '📅'
      });
    });
  }

  function getUserPools(userId) {
    return getPools().filter(p => p.members.includes(userId) || p.creatorId === userId);
  }

  function getPoolRotation(pool) {
    const drivers = pool.members.filter(m => {
      const user = CedeoStore.getUser(m);
      return user && user.vehicle;
    });
    if (drivers.length === 0) return [];

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    return days.map((day, i) => ({
      day,
      driverId: drivers[i % drivers.length],
      driver: CedeoStore.getUser(drivers[i % drivers.length])
    }));
  }

  function loadDemoPools() {
    if (getPools().length > 0) return;
    const pools = [
      {
        id: 'pool_01',
        name: 'Navette Rennes ↔ Châteaubourg',
        description: 'Covoiturage quotidien entre Rennes et Châteaubourg, départ 7h45',
        creatorId: 'usr_pierre',
        members: ['usr_pierre', 'usr_maxime', 'usr_sophie'],
        fromName: 'Rennes',
        toName: 'Châteaubourg',
        departureTime: '07:45',
        days: [1, 2, 3, 4, 5],
        rotationSchedule: [],
        absences: [],
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'pool_02',
        name: 'Rennes ↔ Saint-Malo Hebdo',
        description: 'Trajet hebdomadaire le mardi pour la réunion commerciale',
        creatorId: 'usr_sophie',
        members: ['usr_sophie', 'usr_thomas', 'usr_camille'],
        fromName: 'Rennes',
        toName: 'Saint-Malo',
        departureTime: '08:00',
        days: [2],
        rotationSchedule: [],
        absences: [],
        status: 'active',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ];
    savePools(pools);
  }

  function renderPoolsPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) { window.App.navigate('/login'); return; }

    loadDemoPools();
    const myPools = getUserPools(currentUser.id);
    const allPools = getPools().filter(p => p.status === 'active');
    const otherPools = allPools.filter(p => !p.members.includes(currentUser.id) && p.creatorId !== currentUser.id);
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    app.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4)">
        <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3)">
          <div>
            <h1 class="page-title">Mes Pools</h1>
            <p class="page-subtitle">Équipes de covoiturage permanentes</p>
          </div>
          <a href="#/pools/create" class="btn btn-primary btn-sm">+ Créer un pool</a>
        </div>

        ${myPools.length > 0 ? `
          <div style="display:flex;flex-direction:column;gap:var(--space-4);margin-bottom:var(--space-8)">
            ${myPools.map(pool => {
              const rotation = getPoolRotation(pool);
              const memberUsers = pool.members.map(m => CedeoStore.getUser(m)).filter(Boolean);
              return `
                <div class="card" style="padding:0;overflow:hidden">
                  <div style="background:linear-gradient(135deg, var(--color-primary), var(--color-primary-light));padding:var(--space-5) var(--space-6);color:#fff">
                    <div style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold)">${Utils.escapeHtml(pool.name)}</div>
                    <div style="font-size:var(--font-size-sm);opacity:0.9;margin-top:var(--space-1)">${Utils.escapeHtml(pool.description)}</div>
                    <div style="display:flex;gap:var(--space-4);margin-top:var(--space-3);font-size:var(--font-size-xs)">
                      <span>🕐 ${pool.departureTime}</span>
                      <span>📅 ${pool.days.map(d => dayNames[d]).join(', ')}</span>
                      <span>👥 ${pool.members.length} membres</span>
                    </div>
                  </div>
                  <div style="padding:var(--space-5) var(--space-6)">
                    <div style="font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-3)">Membres</div>
                    <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-4)">
                      ${memberUsers.map(m => `
                        <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1) var(--space-3);background:var(--color-bg);border-radius:var(--radius-full);font-size:var(--font-size-xs)">
                          <div class="avatar avatar-xs" style="background-color:${Utils.getAvatarColor(m.id)}">${Utils.getInitials(m.firstName, m.lastName)}</div>
                          ${Utils.escapeHtml(m.firstName)}
                          ${m.vehicle ? '🚗' : ''}
                        </div>
                      `).join('')}
                    </div>
                    ${rotation.length > 0 ? `
                      <div style="font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-2)">Planning de rotation</div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(100px, 1fr));gap:var(--space-2);margin-bottom:var(--space-4)">
                        ${rotation.map(r => `
                          <div style="text-align:center;padding:var(--space-2);background:var(--color-bg);border-radius:var(--radius-md);font-size:var(--font-size-xs)">
                            <div style="font-weight:var(--font-weight-semibold)">${r.day}</div>
                            <div class="avatar avatar-xs" style="background-color:${r.driver ? Utils.getAvatarColor(r.driverId) : '#ccc'};margin:var(--space-1) auto">${r.driver ? Utils.getInitials(r.driver.firstName, r.driver.lastName) : '?'}</div>
                            <div>${r.driver ? Utils.escapeHtml(r.driver.firstName) : '—'}</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                    <div style="display:flex;gap:var(--space-2)">
                      <button class="btn btn-outline btn-sm" onclick="Pools.showAbsenceModal('${pool.id}')">📅 Déclarer absence</button>
                      ${pool.creatorId !== currentUser.id ? `<button class="btn btn-ghost btn-sm" onclick="Pools.leavePool('${pool.id}','${currentUser.id}');App.navigate('/pools')">Quitter</button>` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="card" style="margin-bottom:var(--space-8)">
            <div class="empty-state">
              <div class="empty-state-title">Aucun pool rejoint</div>
              <div class="empty-state-text">Rejoignez un pool existant ou créez le vôtre</div>
            </div>
          </div>
        `}

        ${otherPools.length > 0 ? `
          <h2 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">Pools disponibles</h2>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${otherPools.map(pool => `
              <div class="card card-compact">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)">
                  <div>
                    <div style="font-weight:var(--font-weight-semibold)">${Utils.escapeHtml(pool.name)}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${pool.departureTime} · ${pool.days.map(d => dayNames[d]).join(', ')} · ${pool.members.length} membres</div>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="Pools.joinPool('${pool.id}','${currentUser.id}');App.navigate('/pools')">Rejoindre</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderCreatePoolPage() {
    const app = document.getElementById('app-content');
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) { window.App.navigate('/login'); return; }

    app.innerHTML = `
      <div class="container" style="max-width:640px;padding:var(--space-8) var(--space-4)">
        <div class="page-header">
          <h1 class="page-title">Créer un Pool</h1>
          <p class="page-subtitle">Organisez un covoiturage permanent avec vos collègues</p>
        </div>
        <form id="create-pool-form">
          <div class="card" style="margin-bottom:var(--space-4)">
            <div style="display:flex;flex-direction:column;gap:var(--space-4)">
              <div class="form-group">
                <label class="form-label">Nom du pool *</label>
                <input class="form-input" type="text" id="pool-name" placeholder="Ex: Navette Rennes ↔ Dinan" required>
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="pool-desc" placeholder="Décrivez le trajet et les conditions..."></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Départ</label>
                  <input class="form-input" type="text" id="pool-from" placeholder="Ville de départ" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Arrivée</label>
                  <input class="form-input" type="text" id="pool-to" placeholder="Ville d'arrivée" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Heure de départ</label>
                <input class="form-input" type="time" id="pool-time" value="08:00" required>
              </div>
              <div class="form-group">
                <label class="form-label">Jours</label>
                <div class="days-picker">
                  <div class="day-chip selected" data-day="1">L</div>
                  <div class="day-chip selected" data-day="2">M</div>
                  <div class="day-chip selected" data-day="3">M</div>
                  <div class="day-chip selected" data-day="4">J</div>
                  <div class="day-chip selected" data-day="5">V</div>
                  <div class="day-chip" data-day="6">S</div>
                  <div class="day-chip" data-day="0">D</div>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Créer le pool</button>
        </form>
      </div>
    `;

    document.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', () => chip.classList.toggle('selected'));
    });

    document.getElementById('create-pool-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const days = Array.from(document.querySelectorAll('.day-chip.selected')).map(c => parseInt(c.dataset.day));
      const pool = createPool({
        name: document.getElementById('pool-name').value.trim(),
        description: document.getElementById('pool-desc').value.trim(),
        creatorId: currentUser.id,
        members: [currentUser.id],
        fromName: document.getElementById('pool-from').value.trim(),
        toName: document.getElementById('pool-to').value.trim(),
        departureTime: document.getElementById('pool-time').value,
        days
      });
      window.App.showToast('Pool créé avec succès !', 'success');
      window.App.navigate('/pools');
    });
  }

  function showAbsenceModal(poolId) {
    const currentUser = CedeoStore.getCurrentUser();
    if (!currentUser) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">Déclarer une absence</div>
          <button class="modal-close" id="close-absence-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group" style="margin-bottom:var(--space-4)">
            <label class="form-label">Date d'absence</label>
            <input class="form-input" type="date" id="absence-date" min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group" style="margin-bottom:var(--space-4)">
            <label class="form-label">Raison (optionnel)</label>
            <input class="form-input" type="text" id="absence-reason" placeholder="Ex: Télétravail, congé...">
          </div>
          <button class="btn btn-primary" id="submit-absence" style="width:100%">Confirmer l'absence</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    backdrop.querySelector('#close-absence-modal').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

    backdrop.querySelector('#submit-absence').addEventListener('click', () => {
      const date = document.getElementById('absence-date').value;
      const reason = document.getElementById('absence-reason').value.trim();
      if (!date) { window.App.showToast('Sélectionnez une date', 'warning'); return; }
      declareAbsence(poolId, currentUser.id, date, reason);
      backdrop.remove();
      window.App.showToast('Absence déclarée !', 'success');
    });
  }

  return {
    renderPoolsPage,
    renderCreatePoolPage,
    getPools,
    getPool,
    createPool,
    joinPool,
    leavePool,
    getUserPools,
    showAbsenceModal,
    loadDemoPools,
    declareAbsence
  };
})();
