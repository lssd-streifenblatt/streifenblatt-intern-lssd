import { AuthSystem } from './auth.js';
import { DataManager } from './dataManager.js';
import { UIManager } from './ui.js';

export class App {
  constructor() {
    this.auth = new AuthSystem();
    this.dataManager = new DataManager();
    this.ui = new UIManager(this.auth, this.dataManager);
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    if (this.auth.checkSession()) {
      await this.showMainApp();
    } else {
      this.showLogin();
    }

    this.initialized = true;
  }

  showLogin() {
    const app = document.getElementById('app');
    app.innerHTML = this.ui.renderLogin();

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin(e);
    });
  }

  async handleLogin(e) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    const result = await this.auth.login(username, password);

    if (result.success) {
      await this.showMainApp();
    } else {
      errorDiv.textContent = result.error;
      errorDiv.style.display = 'block';
    }
  }

  async showMainApp() {
    const app = document.getElementById('app');
    const user = this.auth.getCurrentUser();

    app.innerHTML = `
      <div class="main-app">
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="logo">LSSD</div>
            <h2>Sheriff Department</h2>
          </div>

          <nav class="sidebar-nav">
            <a href="#" class="nav-item active" data-view="dashboard">
              <span class="nav-icon">📊</span>
              <span>Dashboard</span>
            </a>
            <a href="#" class="nav-item" data-view="patrols">
              <span class="nav-icon">🚔</span>
              <span>Streifen</span>
            </a>
            <a href="#" class="nav-item" data-view="employees">
              <span class="nav-icon">👮</span>
              <span>Mitarbeiter</span>
            </a>
            <a href="#" class="nav-item" data-view="messages">
              <span class="nav-icon">📨</span>
              <span>Mitteilungen</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="user-profile">
              <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-rank">${user.rank}</div>
                <div class="user-badge">Badge #${user.badge}</div>
              </div>
              <button class="btn-logout" id="logoutBtn">Abmelden</button>
            </div>
          </div>
        </aside>

        <main class="main-content">
          <div class="content-header">
            <h1 id="viewTitle">Dashboard</h1>
            <div class="header-actions">
              <div class="time-display">${new Date().toLocaleString('de-DE')}</div>
            </div>
          </div>
          <div id="viewContent" class="view-content">
            ${await this.ui.renderDashboard()}
          </div>
        </main>
      </div>
    `;

    this.setupNavigation();
    this.setupLogout();
    this.startTimeUpdate();
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', async (e) => {
        e.preventDefault();

        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        const view = item.dataset.view;
        await this.switchView(view);
      });
    });
  }

  async switchView(view) {
    const viewContent = document.getElementById('viewContent');
    const viewTitle = document.getElementById('viewTitle');

    const titles = {
      dashboard: 'Dashboard',
      patrols: 'Streifenverwaltung',
      employees: 'Mitarbeiterverwaltung',
      messages: 'Mitteilungen'
    };

    viewTitle.textContent = titles[view] || 'Dashboard';

    viewContent.style.opacity = '0';

    setTimeout(async () => {
      let content = '';

      switch (view) {
        case 'dashboard':
          content = await this.ui.renderDashboard();
          break;
        case 'patrols':
          content = await this.ui.renderPatrols();
          break;
        case 'employees':
          content = await this.ui.renderEmployees();
          break;
        case 'messages':
          content = await this.ui.renderMessages();
          break;
        default:
          content = await this.ui.renderDashboard();
      }

      viewContent.innerHTML = content;
      viewContent.style.opacity = '1';
    }, 200);
  }

  setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
      this.auth.logout();
      window.location.reload();
    });
  }

  startTimeUpdate() {
    setInterval(() => {
      const timeDisplay = document.querySelector('.time-display');
      if (timeDisplay) {
        timeDisplay.textContent = new Date().toLocaleString('de-DE');
      }
    }, 1000);
  }

  showCreatePatrolModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Neue Streife starten</h2>
          <button class="modal-close">&times;</button>
        </div>
        <form id="createPatrolForm" class="modal-form">
          <div class="input-group">
            <label for="vehicleSelect">Fahrzeug wählen</label>
            <select id="vehicleSelect" required>
              <option value="">Fahrzeug auswählen...</option>
            </select>
          </div>
          <div class="input-group">
            <label for="patrolNotes">Notizen</label>
            <textarea id="patrolNotes" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary modal-cancel">Abbrechen</button>
            <button type="submit" class="btn-primary">Streife starten</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    this.loadVehiclesForModal();

    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelector('#createPatrolForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createPatrol(e);
      modal.remove();
    });

    setTimeout(() => modal.classList.add('show'), 10);
  }

  async loadVehiclesForModal() {
    const vehicles = await this.dataManager.getVehicles();
    const select = document.getElementById('vehicleSelect');

    vehicles.filter(v => v.status === 'available').forEach(vehicle => {
      const option = document.createElement('option');
      option.value = vehicle.id;
      option.textContent = `${vehicle.callsign} - ${vehicle.type}`;
      select.appendChild(option);
    });
  }

  async createPatrol(e) {
    const vehicleId = document.getElementById('vehicleSelect').value;
    const notes = document.getElementById('patrolNotes').value;

    const user = this.auth.getCurrentUser();

    const patrol = {
      id: 'patrol_' + Date.now(),
      officerId: user.id,
      vehicleId: vehicleId,
      status: 'patrol',
      startTime: new Date().toISOString(),
      endTime: null,
      notes: notes
    };

    this.dataManager.addPatrol(patrol);
    this.dataManager.updateLocalVehicle(vehicleId, { status: 'in_use', assignedTo: user.id });
    this.dataManager.updateLocalUser(user.id, { status: 'patrol', activePatrol: patrol.id });

    user.activePatrol = patrol.id;
    user.status = 'patrol';
    sessionStorage.setItem('currentUser', JSON.stringify(user));

    this.ui.showNotification('Streife erfolgreich gestartet', 'success');
    await this.switchView('patrols');
  }

  async updatePatrolStatus(patrolId) {
    const statuses = [
      { value: 'patrol', label: 'Auf Streife' },
      { value: 'incident', label: 'Im Einsatz' },
      { value: 'break', label: 'Pause' },
      { value: 'available', label: 'Verfügbar' }
    ];

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Status ändern</h2>
          <button class="modal-close">&times;</button>
        </div>
        <form id="statusForm" class="modal-form">
          <div class="input-group">
            <label for="statusSelect">Neuer Status</label>
            <select id="statusSelect" required>
              ${statuses.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary modal-cancel">Abbrechen</button>
            <button type="submit" class="btn-primary">Status ändern</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());

    modal.querySelector('#statusForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const newStatus = document.getElementById('statusSelect').value;
      this.dataManager.updatePatrol(patrolId, { status: newStatus });
      this.ui.showNotification('Status aktualisiert', 'success');
      modal.remove();
      this.switchView('patrols');
    });

    setTimeout(() => modal.classList.add('show'), 10);
  }

  async endPatrol(patrolId) {
    if (!confirm('Streife wirklich beenden?')) return;

    const patrols = await this.dataManager.getPatrols();
    const patrol = patrols.find(p => p.id === patrolId);

    if (patrol) {
      this.dataManager.updatePatrol(patrolId, { endTime: new Date().toISOString() });
      this.dataManager.updateLocalVehicle(patrol.vehicleId, { status: 'available', assignedTo: null });
      this.dataManager.updateLocalUser(patrol.officerId, { status: 'online', activePatrol: null });

      const user = this.auth.getCurrentUser();
      if (user.id === patrol.officerId) {
        user.status = 'online';
        user.activePatrol = null;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      }

      this.dataManager.removePatrol(patrolId);
    }

    this.ui.showNotification('Streife beendet', 'success');
    await this.switchView('patrols');
  }

  showNewMessageModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Neue Mitteilung</h2>
          <button class="modal-close">&times;</button>
        </div>
        <form id="messageForm" class="modal-form">
          <div class="input-group">
            <label for="messageTitle">Titel</label>
            <input type="text" id="messageTitle" required>
          </div>
          <div class="input-group">
            <label for="messageContent">Nachricht</label>
            <textarea id="messageContent" rows="5" required></textarea>
          </div>
          <div class="input-group">
            <label for="messagePriority">Priorität</label>
            <select id="messagePriority" required>
              <option value="info">Info</option>
              <option value="warning">Warnung</option>
              <option value="urgent">Dringend</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary modal-cancel">Abbrechen</button>
            <button type="submit" class="btn-primary">Senden</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());

    modal.querySelector('#messageForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = this.auth.getCurrentUser();

      const message = {
        id: 'msg_' + Date.now(),
        from: user.name,
        title: document.getElementById('messageTitle').value,
        message: document.getElementById('messageContent').value,
        priority: document.getElementById('messagePriority').value,
        timestamp: new Date().toISOString(),
        read: false
      };

      this.dataManager.addMessage(message);
      this.ui.showNotification('Mitteilung gesendet', 'success');
      modal.remove();
      this.switchView('messages');
    });

    setTimeout(() => modal.classList.add('show'), 10);
  }
}
