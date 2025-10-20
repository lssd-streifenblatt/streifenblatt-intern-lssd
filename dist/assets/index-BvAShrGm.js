(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function a(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(t){if(t.ep)return;t.ep=!0;const i=a(t);fetch(t.href,i)}})();class u{constructor(){this.currentUser=null,this.sessionTimeout=null}async hashPassword(e){const s=new TextEncoder().encode(e),t=await crypto.subtle.digest("SHA-256",s);return Array.from(new Uint8Array(t)).map(i=>i.toString(16).padStart(2,"0")).join("")}async login(e,a){try{const t=await(await fetch("/data/users.json")).json(),i=await this.hashPassword(a),n=t.users.find(r=>r.username===e&&r.password===i);return n?(this.currentUser={...n},delete this.currentUser.password,this.currentUser.status="online",this.currentUser.lastLogin=new Date().toISOString(),sessionStorage.setItem("currentUser",JSON.stringify(this.currentUser)),this.startSessionTimeout(),{success:!0,user:this.currentUser}):{success:!1,error:"Ungültige Anmeldedaten"}}catch(s){return console.error("Login error:",s),{success:!1,error:"Systemfehler"}}}logout(){this.currentUser&&(this.currentUser.status="offline"),this.currentUser=null,sessionStorage.removeItem("currentUser"),this.sessionTimeout&&clearTimeout(this.sessionTimeout)}checkSession(){const e=sessionStorage.getItem("currentUser");return e?(this.currentUser=JSON.parse(e),this.startSessionTimeout(),!0):!1}startSessionTimeout(){this.sessionTimeout&&clearTimeout(this.sessionTimeout),this.sessionTimeout=setTimeout(()=>{alert("Session abgelaufen. Bitte erneut anmelden."),this.logout(),window.location.reload()},36e5)}hasPermission(e){if(!this.currentUser)return!1;const a={admin:3,supervisor:2,employee:1},s=a[this.currentUser.role]||0,t=a[e]||0;return s>=t}getCurrentUser(){return this.currentUser}}class h{constructor(){this.cache={users:null,vehicles:null,patrols:null,incidents:null,messages:null,config:null}}async loadData(e){try{const s=await(await fetch(`/data/${e}.json`)).json();return this.cache[e]=s,s}catch(a){return console.error(`Error loading ${e}:`,a),null}}async getUsers(){var e;return this.cache.users||await this.loadData("users"),((e=this.cache.users)==null?void 0:e.users)||[]}async getVehicles(){var e;return this.cache.vehicles||await this.loadData("vehicles"),((e=this.cache.vehicles)==null?void 0:e.vehicles)||[]}async getPatrols(){var e;return this.cache.patrols||await this.loadData("patrols"),((e=this.cache.patrols)==null?void 0:e.patrols)||[]}async getIncidents(){var e;return this.cache.incidents||await this.loadData("incidents"),((e=this.cache.incidents)==null?void 0:e.incidents)||[]}async getMessages(){var e;return this.cache.messages||await this.loadData("messages"),((e=this.cache.messages)==null?void 0:e.messages)||[]}async getConfig(){return this.cache.config||await this.loadData("config"),this.cache.config}updateLocalUser(e,a){if(this.cache.users&&this.cache.users.users){const s=this.cache.users.users.findIndex(t=>t.id===e);s!==-1&&(this.cache.users.users[s]={...this.cache.users.users[s],...a})}}updateLocalVehicle(e,a){if(this.cache.vehicles&&this.cache.vehicles.vehicles){const s=this.cache.vehicles.vehicles.findIndex(t=>t.id===e);s!==-1&&(this.cache.vehicles.vehicles[s]={...this.cache.vehicles.vehicles[s],...a})}}addPatrol(e){this.cache.patrols&&this.cache.patrols.patrols.push(e)}updatePatrol(e,a){if(this.cache.patrols&&this.cache.patrols.patrols){const s=this.cache.patrols.patrols.findIndex(t=>t.id===e);s!==-1&&(this.cache.patrols.patrols[s]={...this.cache.patrols.patrols[s],...a})}}removePatrol(e){this.cache.patrols&&this.cache.patrols.patrols&&(this.cache.patrols.patrols=this.cache.patrols.patrols.filter(a=>a.id!==e))}addIncident(e){this.cache.incidents&&this.cache.incidents.incidents.push(e)}addMessage(e){this.cache.messages&&this.cache.messages.messages.unshift(e)}clearCache(){this.cache={users:null,vehicles:null,patrols:null,incidents:null,messages:null,config:null}}}class v{constructor(e,a){this.auth=e,this.dataManager=a,this.currentView="dashboard"}renderLogin(){return`
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
    `}async renderDashboard(){const e=await this.dataManager.getUsers(),a=await this.dataManager.getVehicles(),s=await this.dataManager.getPatrols(),t=await this.dataManager.getIncidents(),i=e.filter(o=>o.status!=="offline").length,n=a.filter(o=>o.status==="available").length,r=s.length,d=t.filter(o=>o.status==="active").length;return`
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon">👮</div>
          <div class="stat-content">
            <div class="stat-value">${i}</div>
            <div class="stat-label">Aktive Beamte</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🚔</div>
          <div class="stat-content">
            <div class="stat-value">${n}</div>
            <div class="stat-label">Verfügbare Fahrzeuge</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-value">${r}</div>
            <div class="stat-label">Aktive Streifen</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <div class="stat-value">${d}</div>
            <div class="stat-label">Laufende Einsätze</div>
          </div>
        </div>

        <div class="content-card full-width">
          <h2>Aktive Streifen</h2>
          <div id="activePatrolsList">
            ${await this.renderPatrolList(s)}
          </div>
        </div>

        <div class="content-card">
          <h2>Aktive Beamte</h2>
          <div id="activeUsersList">
            ${this.renderActiveUsersList(e)}
          </div>
        </div>

        <div class="content-card">
          <h2>Fahrzeugstatus</h2>
          <div id="vehicleStatusList">
            ${this.renderVehicleStatus(a)}
          </div>
        </div>
      </div>
    `}async renderPatrolList(e){if(e.length===0)return'<p class="empty-state">Keine aktiven Streifen</p>';const a=await this.dataManager.getUsers(),s=await this.dataManager.getVehicles();return e.map(t=>{const i=a.find(r=>r.id===t.officerId),n=s.find(r=>r.id===t.vehicleId);return`
        <div class="patrol-item" data-patrol-id="${t.id}">
          <div class="patrol-header">
            <span class="callsign">${(n==null?void 0:n.callsign)||"N/A"}</span>
            <span class="status-badge status-${t.status}">${this.getStatusText(t.status)}</span>
          </div>
          <div class="patrol-details">
            <p><strong>${(i==null?void 0:i.name)||"Unbekannt"}</strong> - ${(i==null?void 0:i.badge)||"N/A"}</p>
            <p class="patrol-time">Start: ${new Date(t.startTime).toLocaleTimeString("de-DE")}</p>
          </div>
          <div class="patrol-actions">
            <button class="btn-small" onclick="app.updatePatrolStatus('${t.id}')">Status ändern</button>
            <button class="btn-small btn-danger" onclick="app.endPatrol('${t.id}')">Streife beenden</button>
          </div>
        </div>
      `}).join("")}renderActiveUsersList(e){const a=e.filter(s=>s.status!=="offline");return a.length===0?'<p class="empty-state">Keine aktiven Beamte</p>':a.map(s=>`
      <div class="user-item">
        <div class="user-info">
          <span class="user-name">${s.name}</span>
          <span class="user-badge">#${s.badge}</span>
        </div>
        <span class="status-badge status-${s.status}">${s.status}</span>
      </div>
    `).join("")}renderVehicleStatus(e){return e.map(a=>`
      <div class="vehicle-item">
        <div class="vehicle-info">
          <span class="vehicle-callsign">${a.callsign}</span>
          <span class="vehicle-type">${a.type}</span>
        </div>
        <span class="status-badge status-${a.status}">${this.getVehicleStatusText(a.status)}</span>
      </div>
    `).join("")}async renderPatrols(){const e=await this.dataManager.getPatrols(),a=await this.dataManager.getVehicles();return`
      <div class="patrols-view">
        <div class="view-header">
          <h1>Streifenverwaltung</h1>
          ${this.auth.getCurrentUser().activePatrol?"":`
            <button class="btn-primary" onclick="app.showCreatePatrolModal()">
              Neue Streife starten
            </button>
          `}
        </div>

        <div class="patrols-container">
          ${await this.renderPatrolList(e)}
        </div>

        <div class="available-vehicles">
          <h2>Verfügbare Fahrzeuge</h2>
          <div class="vehicle-grid">
            ${a.filter(t=>t.status==="available").map(t=>`
              <div class="vehicle-card">
                <div class="vehicle-callsign">${t.callsign}</div>
                <div class="vehicle-type">${t.type}</div>
                <div class="vehicle-model">${t.model}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `}async renderEmployees(){const e=await this.dataManager.getUsers(),a=this.auth.getCurrentUser(),s=this.auth.hasPermission("admin");return`
      <div class="employees-view">
        <div class="view-header">
          <h1>Mitarbeiterverwaltung</h1>
          ${s?`
            <button class="btn-primary" onclick="app.showAddUserModal()">
              Neuen Mitarbeiter hinzufügen
            </button>
          `:""}
        </div>

        <div class="employees-grid">
          ${e.map(t=>`
            <div class="employee-card">
              <div class="employee-header">
                <div>
                  <h3>${t.name}</h3>
                  <p class="employee-badge">Badge #${t.badge}</p>
                </div>
                <span class="status-badge status-${t.status}">${t.status}</span>
              </div>
              <div class="employee-info">
                <div class="info-row">
                  <span class="label">Rang:</span>
                  <span class="value">${t.rank}</span>
                </div>
                <div class="info-row">
                  <span class="label">Rolle:</span>
                  <span class="value">${this.getRoleText(t.role)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Gesamtstunden:</span>
                  <span class="value">${t.totalHours}h</span>
                </div>
                ${t.lastLogin?`
                  <div class="info-row">
                    <span class="label">Letzter Login:</span>
                    <span class="value">${new Date(t.lastLogin).toLocaleString("de-DE")}</span>
                  </div>
                `:""}
              </div>
              ${s&&t.id!==a.id?`
                <div class="employee-actions">
                  <button class="btn-small" onclick="app.editUser('${t.id}')">Bearbeiten</button>
                </div>
              `:""}
            </div>
          `).join("")}
        </div>
      </div>
    `}async renderMessages(){const e=await this.dataManager.getMessages();return`
      <div class="messages-view">
        <div class="view-header">
          <h1>Mitteilungen</h1>
          ${this.auth.hasPermission("supervisor")?`
            <button class="btn-primary" onclick="app.showNewMessageModal()">
              Neue Mitteilung
            </button>
          `:""}
        </div>

        <div class="messages-list">
          ${e.map(a=>`
            <div class="message-card priority-${a.priority}">
              <div class="message-header">
                <div>
                  <h3>${a.title}</h3>
                  <span class="message-from">Von: ${a.from}</span>
                </div>
                <span class="message-time">${new Date(a.timestamp).toLocaleString("de-DE")}</span>
              </div>
              <div class="message-content">
                <p>${a.message}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `}getStatusText(e){return{patrol:"Auf Streife",incident:"Im Einsatz",break:"Pause",available:"Verfügbar"}[e]||e}getVehicleStatusText(e){return{available:"Verfügbar",in_use:"Im Einsatz",maintenance:"Wartung"}[e]||e}getRoleText(e){return{admin:"Administrator",supervisor:"Supervisor",employee:"Mitarbeiter"}[e]||e}showNotification(e,a="info"){const s=document.createElement("div");s.className=`notification notification-${a}`,s.textContent=e,document.body.appendChild(s),setTimeout(()=>{s.classList.add("show")},10),setTimeout(()=>{s.classList.remove("show"),setTimeout(()=>s.remove(),300)},3e3)}}class p{constructor(){this.auth=new u,this.dataManager=new h,this.ui=new v(this.auth,this.dataManager),this.initialized=!1}async init(){this.initialized||(this.auth.checkSession()?await this.showMainApp():this.showLogin(),this.initialized=!0)}showLogin(){const e=document.getElementById("app");e.innerHTML=this.ui.renderLogin(),document.getElementById("loginForm").addEventListener("submit",async s=>{s.preventDefault(),await this.handleLogin(s)})}async handleLogin(e){const a=document.getElementById("username").value,s=document.getElementById("password").value,t=document.getElementById("loginError"),i=await this.auth.login(a,s);i.success?await this.showMainApp():(t.textContent=i.error,t.style.display="block")}async showMainApp(){const e=document.getElementById("app"),a=this.auth.getCurrentUser();e.innerHTML=`
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
                <div class="user-name">${a.name}</div>
                <div class="user-rank">${a.rank}</div>
                <div class="user-badge">Badge #${a.badge}</div>
              </div>
              <button class="btn-logout" id="logoutBtn">Abmelden</button>
            </div>
          </div>
        </aside>

        <main class="main-content">
          <div class="content-header">
            <h1 id="viewTitle">Dashboard</h1>
            <div class="header-actions">
              <div class="time-display">${new Date().toLocaleString("de-DE")}</div>
            </div>
          </div>
          <div id="viewContent" class="view-content">
            ${await this.ui.renderDashboard()}
          </div>
        </main>
      </div>
    `,this.setupNavigation(),this.setupLogout(),this.startTimeUpdate()}setupNavigation(){const e=document.querySelectorAll(".nav-item");e.forEach(a=>{a.addEventListener("click",async s=>{s.preventDefault(),e.forEach(i=>i.classList.remove("active")),a.classList.add("active");const t=a.dataset.view;await this.switchView(t)})})}async switchView(e){const a=document.getElementById("viewContent"),s=document.getElementById("viewTitle"),t={dashboard:"Dashboard",patrols:"Streifenverwaltung",employees:"Mitarbeiterverwaltung",messages:"Mitteilungen"};s.textContent=t[e]||"Dashboard",a.style.opacity="0",setTimeout(async()=>{let i="";switch(e){case"dashboard":i=await this.ui.renderDashboard();break;case"patrols":i=await this.ui.renderPatrols();break;case"employees":i=await this.ui.renderEmployees();break;case"messages":i=await this.ui.renderMessages();break;default:i=await this.ui.renderDashboard()}a.innerHTML=i,a.style.opacity="1"},200)}setupLogout(){document.getElementById("logoutBtn").addEventListener("click",()=>{this.auth.logout(),window.location.reload()})}startTimeUpdate(){setInterval(()=>{const e=document.querySelector(".time-display");e&&(e.textContent=new Date().toLocaleString("de-DE"))},1e3)}showCreatePatrolModal(){const e=document.createElement("div");e.className="modal",e.innerHTML=`
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
    `,document.body.appendChild(e),this.loadVehiclesForModal(),e.querySelector(".modal-close").addEventListener("click",()=>e.remove()),e.querySelector(".modal-cancel").addEventListener("click",()=>e.remove()),e.addEventListener("click",a=>{a.target===e&&e.remove()}),e.querySelector("#createPatrolForm").addEventListener("submit",async a=>{a.preventDefault(),await this.createPatrol(a),e.remove()}),setTimeout(()=>e.classList.add("show"),10)}async loadVehiclesForModal(){const e=await this.dataManager.getVehicles(),a=document.getElementById("vehicleSelect");e.filter(s=>s.status==="available").forEach(s=>{const t=document.createElement("option");t.value=s.id,t.textContent=`${s.callsign} - ${s.type}`,a.appendChild(t)})}async createPatrol(e){const a=document.getElementById("vehicleSelect").value,s=document.getElementById("patrolNotes").value,t=this.auth.getCurrentUser(),i={id:"patrol_"+Date.now(),officerId:t.id,vehicleId:a,status:"patrol",startTime:new Date().toISOString(),endTime:null,notes:s};this.dataManager.addPatrol(i),this.dataManager.updateLocalVehicle(a,{status:"in_use",assignedTo:t.id}),this.dataManager.updateLocalUser(t.id,{status:"patrol",activePatrol:i.id}),t.activePatrol=i.id,t.status="patrol",sessionStorage.setItem("currentUser",JSON.stringify(t)),this.ui.showNotification("Streife erfolgreich gestartet","success"),await this.switchView("patrols")}async updatePatrolStatus(e){const a=[{value:"patrol",label:"Auf Streife"},{value:"incident",label:"Im Einsatz"},{value:"break",label:"Pause"},{value:"available",label:"Verfügbar"}],s=document.createElement("div");s.className="modal",s.innerHTML=`
      <div class="modal-content">
        <div class="modal-header">
          <h2>Status ändern</h2>
          <button class="modal-close">&times;</button>
        </div>
        <form id="statusForm" class="modal-form">
          <div class="input-group">
            <label for="statusSelect">Neuer Status</label>
            <select id="statusSelect" required>
              ${a.map(t=>`<option value="${t.value}">${t.label}</option>`).join("")}
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary modal-cancel">Abbrechen</button>
            <button type="submit" class="btn-primary">Status ändern</button>
          </div>
        </form>
      </div>
    `,document.body.appendChild(s),s.querySelector(".modal-close").addEventListener("click",()=>s.remove()),s.querySelector(".modal-cancel").addEventListener("click",()=>s.remove()),s.querySelector("#statusForm").addEventListener("submit",t=>{t.preventDefault();const i=document.getElementById("statusSelect").value;this.dataManager.updatePatrol(e,{status:i}),this.ui.showNotification("Status aktualisiert","success"),s.remove(),this.switchView("patrols")}),setTimeout(()=>s.classList.add("show"),10)}async endPatrol(e){if(!confirm("Streife wirklich beenden?"))return;const s=(await this.dataManager.getPatrols()).find(t=>t.id===e);if(s){this.dataManager.updatePatrol(e,{endTime:new Date().toISOString()}),this.dataManager.updateLocalVehicle(s.vehicleId,{status:"available",assignedTo:null}),this.dataManager.updateLocalUser(s.officerId,{status:"online",activePatrol:null});const t=this.auth.getCurrentUser();t.id===s.officerId&&(t.status="online",t.activePatrol=null,sessionStorage.setItem("currentUser",JSON.stringify(t))),this.dataManager.removePatrol(e)}this.ui.showNotification("Streife beendet","success"),await this.switchView("patrols")}showNewMessageModal(){const e=document.createElement("div");e.className="modal",e.innerHTML=`
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
    `,document.body.appendChild(e),e.querySelector(".modal-close").addEventListener("click",()=>e.remove()),e.querySelector(".modal-cancel").addEventListener("click",()=>e.remove()),e.querySelector("#messageForm").addEventListener("submit",a=>{a.preventDefault();const s=this.auth.getCurrentUser(),t={id:"msg_"+Date.now(),from:s.name,title:document.getElementById("messageTitle").value,message:document.getElementById("messageContent").value,priority:document.getElementById("messagePriority").value,timestamp:new Date().toISOString(),read:!1};this.dataManager.addMessage(t),this.ui.showNotification("Mitteilung gesendet","success"),e.remove(),this.switchView("messages")}),setTimeout(()=>e.classList.add("show"),10)}}const c=new p;window.app=c;document.addEventListener("DOMContentLoaded",()=>{c.init()});
