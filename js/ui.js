export class UIManager {
  constructor(auth, dataManager) {
    this.auth = auth;
    this.dataManager = dataManager;
    this.currentView = 'dashboard';
  }

  renderLogin() {
    return `
      <div class="login-container">
        <div class="login-box">
          <div class="login-header">
            <div class="logo-badge">LSSD</div>
            <h1>Los Santos Sheriff Department</h1>
            <p class="subtitle">Streifenblatt-System</p>
          </div>
          <form id="loginForm" class="login-form">
            <div class="input-group">
              <label for="username">Benutzername</label>
              <input type="text" id="username" name="username" required autocomplete="username">
            </div>
            <div class="input-group">
              <label for="password">Passwort</label>
              <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn-primary">Anmelden</button>
            <div id="loginError" class="error-message"></div>
          </form>
          <div class="login-footer">
            <p>Standard-Zugangsdaten: admin / password</p>
          </div>
        </div>
      </div>
    `;
  }

  async renderDashboard() {
    const users = await this.dataManager.getUsers();
    const vehicles = await this.dataManager.getVehicles();
    const patrols = await this.dataManager.getPatrols();
    const incidents = await this.dataManager.getIncidents();

    const activeUsers = users.filter(u => u.status !== 'offline').length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const activePatrols = patrols.length;
    const activeIncidents = incidents.filter(i => i.status === 'active').length;

    return `
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon">👮</div>
          <div class="stat-content">
            <div class="stat-value">${activeUsers}</div>
            <div class="stat-label">Aktive Beamte</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🚔</div>
          <div class="stat-content">
            <div class="stat-value">${availableVehicles}</div>
            <div class="stat-label">Verfügbare Fahrzeuge</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-value">${activePatrols}</div>
            <div class="stat-label">Aktive Streifen</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <div class="stat-value">${activeIncidents}</div>
            <div class="stat-label">Laufende Einsätze</div>
          </div>
        </div>

        <div class="content-card full-width">
          <h2>Aktive Streifen</h2>
          <div id="activePatrolsList">
            ${await this.renderPatrolList(patrols)}
          </div>
        </div>

        <div class="content-card">
          <h2>Aktive Beamte</h2>
          <div id="activeUsersList">
            ${this.renderActiveUsersList(users)}
          </div>
        </div>

        <div class="content-card">
          <h2>Fahrzeugstatus</h2>
          <div id="vehicleStatusList">
            ${this.renderVehicleStatus(vehicles)}
          </div>
        </div>
      </div>
    `;
  }

  async renderPatrolList(patrols) {
    if (patrols.length === 0) {
      return '<p class="empty-state">Keine aktiven Streifen</p>';
    }

    const users = await this.dataManager.getUsers();
    const vehicles = await this.dataManager.getVehicles();

    return patrols.map(patrol => {
      const officer = users.find(u => u.id === patrol.officerId);
      const vehicle = vehicles.find(v => v.id === patrol.vehicleId);

      return `
        <div class="patrol-item" data-patrol-id="${patrol.id}">
          <div class="patrol-header">
            <span class="callsign">${vehicle?.callsign || 'N/A'}</span>
            <span class="status-badge status-${patrol.status}">${this.getStatusText(patrol.status)}</span>
          </div>
          <div class="patrol-details">
            <p><strong>${officer?.name || 'Unbekannt'}</strong> - ${officer?.badge || 'N/A'}</p>
            <p class="patrol-time">Start: ${new Date(patrol.startTime).toLocaleTimeString('de-DE')}</p>
          </div>
          <div class="patrol-actions">
            <button class="btn-small" onclick="app.updatePatrolStatus('${patrol.id}')">Status ändern</button>
            <button class="btn-small btn-danger" onclick="app.endPatrol('${patrol.id}')">Streife beenden</button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderActiveUsersList(users) {
    const activeUsers = users.filter(u => u.status !== 'offline');

    if (activeUsers.length === 0) {
      return '<p class="empty-state">Keine aktiven Beamte</p>';
    }

    return activeUsers.map(user => `
      <div class="user-item">
        <div class="user-info">
          <span class="user-name">${user.name}</span>
          <span class="user-badge">#${user.badge}</span>
        </div>
        <span class="status-badge status-${user.status}">${user.status}</span>
      </div>
    `).join('');
  }

  renderVehicleStatus(vehicles) {
    return vehicles.map(vehicle => `
      <div class="vehicle-item">
        <div class="vehicle-info">
          <span class="vehicle-callsign">${vehicle.callsign}</span>
          <span class="vehicle-type">${vehicle.type}</span>
        </div>
        <span class="status-badge status-${vehicle.status}">${this.getVehicleStatusText(vehicle.status)}</span>
      </div>
    `).join('');
  }

  async renderPatrols() {
    const patrols = await this.dataManager.getPatrols();
    const vehicles = await this.dataManager.getVehicles();
    const currentUser = this.auth.getCurrentUser();

    return `
      <div class="patrols-view">
        <div class="view-header">
          <h1>Streifenverwaltung</h1>
          ${!currentUser.activePatrol ? `
            <button class="btn-primary" onclick="app.showCreatePatrolModal()">
              Neue Streife starten
            </button>
          ` : ''}
        </div>

        <div class="patrols-container">
          ${await this.renderPatrolList(patrols)}
        </div>

        <div class="available-vehicles">
          <h2>Verfügbare Fahrzeuge</h2>
          <div class="vehicle-grid">
            ${vehicles.filter(v => v.status === 'available').map(v => `
              <div class="vehicle-card">
                <div class="vehicle-callsign">${v.callsign}</div>
                <div class="vehicle-type">${v.type}</div>
                <div class="vehicle-model">${v.model}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  async renderEmployees() {
    const users = await this.dataManager.getUsers();
    const currentUser = this.auth.getCurrentUser();
    const canManage = this.auth.hasPermission('admin');

    return `
      <div class="employees-view">
        <div class="view-header">
          <h1>Mitarbeiterverwaltung</h1>
          ${canManage ? `
            <button class="btn-primary" onclick="app.showAddUserModal()">
              Neuen Mitarbeiter hinzufügen
            </button>
          ` : ''}
        </div>

        <div class="employees-grid">
          ${users.map(user => `
            <div class="employee-card">
              <div class="employee-header">
                <div>
                  <h3>${user.name}</h3>
                  <p class="employee-badge">Badge #${user.badge}</p>
                </div>
                <span class="status-badge status-${user.status}">${user.status}</span>
              </div>
              <div class="employee-info">
                <div class="info-row">
                  <span class="label">Rang:</span>
                  <span class="value">${user.rank}</span>
                </div>
                <div class="info-row">
                  <span class="label">Rolle:</span>
                  <span class="value">${this.getRoleText(user.role)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Gesamtstunden:</span>
                  <span class="value">${user.totalHours}h</span>
                </div>
                ${user.lastLogin ? `
                  <div class="info-row">
                    <span class="label">Letzter Login:</span>
                    <span class="value">${new Date(user.lastLogin).toLocaleString('de-DE')}</span>
                  </div>
                ` : ''}
              </div>
              ${canManage && user.id !== currentUser.id ? `
                <div class="employee-actions">
                  <button class="btn-small" onclick="app.editUser('${user.id}')">Bearbeiten</button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async renderMessages() {
    const messages = await this.dataManager.getMessages();

    return `
      <div class="messages-view">
        <div class="view-header">
          <h1>Mitteilungen</h1>
          ${this.auth.hasPermission('supervisor') ? `
            <button class="btn-primary" onclick="app.showNewMessageModal()">
              Neue Mitteilung
            </button>
          ` : ''}
        </div>

        <div class="messages-list">
          ${messages.map(msg => `
            <div class="message-card priority-${msg.priority}">
              <div class="message-header">
                <div>
                  <h3>${msg.title}</h3>
                  <span class="message-from">Von: ${msg.from}</span>
                </div>
                <span class="message-time">${new Date(msg.timestamp).toLocaleString('de-DE')}</span>
              </div>
              <div class="message-content">
                <p>${msg.message}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getStatusText(status) {
    const statusMap = {
      'patrol': 'Auf Streife',
      'incident': 'Im Einsatz',
      'break': 'Pause',
      'available': 'Verfügbar'
    };
    return statusMap[status] || status;
  }

  getVehicleStatusText(status) {
    const statusMap = {
      'available': 'Verfügbar',
      'in_use': 'Im Einsatz',
      'maintenance': 'Wartung'
    };
    return statusMap[status] || status;
  }

  getRoleText(role) {
    const roleMap = {
      'admin': 'Administrator',
      'supervisor': 'Supervisor',
      'employee': 'Mitarbeiter'
    };
    return roleMap[role] || role;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}
