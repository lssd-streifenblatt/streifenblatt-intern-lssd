const WEBHOOKS = {
    login: 'https://discord.com/api/webhooks/1430135460214214737/XmaITkS8ZirsO14a19ka884SyKHhzGQUKiEnmlptz6sjCGlliVXyQtCMUX_Pm_CDFZi0',
    logout: 'https://discord.com/api/webhooks/1430135526513578076/3daUUMAz4AT-7wnVrCbhdq_VQPitWgWGmVqnZ22wNdFlywYDllS1xxjHkWfChylRYeCU',
    patrolCreated: 'https://discord.com/api/webhooks/1430135601696473211/z1coKmWXmsxlw3NwkPFz-x5tWIak3rk3X1uyG7-nsQFFhWmyoPZb8Y1pNB5umxqxswIY',
    patrolDeleted: 'https://discord.com/api/webhooks/1430135675642187778/PH0ZbRZvq7lWa1MnULHM60WU4L4HziSCR5DoWFZT6CCF9Of4VRhUdQEbhcFfdlZ1jmeq',
    personAdded: 'https://discord.com/api/webhooks/1430135864633065533/iQnfYa1HBV_rxll5ZZqyB0YphL0u995DEQE0XEtDKksunzd5vlMK_BXwXsyk-A1_O3dI',
    personRemoved: 'https://discord.com/api/webhooks/1430135994602225795/XGh_OAwkdZx5FkdIPUkNnSaysHGBzWafWOXEAwLrzJ-TUrIU4U2vlbJk39gkuLQsaAym',
    userAdded: 'https://discord.com/api/webhooks/1430136096599048274/B03DFT75XMejFHWecb-hhyP0GyztlR4zgoNlvtHTM7D61HQsonYx_n9ODeBJnUatLnyV',
    userRemoved: 'https://discord.com/api/webhooks/1430136182079225876/gab_zTe_8h46d_2lCvAoNHSWA3_FxQjEMcwzmUXqFy-KFTWA3n-fGJ49dWAPzBKqU3cj',
    extra1: 'https://discord.com/api/webhooks/1430136379811168357/VB83AGa4O50S9w8nrsEHo0hPq7vL_lAEh5WX6T1EzSDOa5eOPP-kKY2m8808bVtRlrbV',
    extra2: 'https://discord.com/api/webhooks/1430136412191068181/VJT4bzWGDSvpn0-J04njuNPzXB5iK4QZNUNqILoIC0quEW4DSVVVQjcq70JxRAWIToTL',
    extra3: 'https://discord.com/api/webhooks/1430136445900689478/NLhhcKrw8Rqrgw22clcuTnlVOd1szmPYzmARCB4BJtDzMpYMNPD5un-HyU3fF8eOzyVG'
};

let currentUser = null;
let allData = null;
let currentPatrolId = null;

async function sendWebhook(url, data) {
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Webhook error:', error);
    }
}

async function loadData() {
    const response = await fetch('data.json');
    allData = await response.json();
    return allData;
}

async function saveData() {
    localStorage.setItem('lssdData', JSON.stringify(allData));
    await sendWebhook(WEBHOOKS.extra1, {
        embeds: [{
            title: 'Daten Aktualisiert',
            description: 'Das System wurde aktualisiert',
            color: 65445,
            timestamp: new Date().toISOString()
        }]
    });
}

function loadFromStorage() {
    const stored = localStorage.getItem('lssdData');
    if (stored) {
        allData = JSON.parse(stored);
    }
}

async function init() {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(userStr);
    await loadData();
    loadFromStorage();

    updateUserInfo();
    setupEventListeners();
    loadPatrols();
    loadEmployees();
    loadProfile();
    loadAdminPanel();

    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.add('show');
        });
    }
}

function updateUserInfo() {
    const profileImg = currentUser.profileImage || '';
    document.getElementById('navProfileImage').src = profileImg;
    document.getElementById('navUsername').textContent = currentUser.username;
    document.getElementById('navDienummer').textContent = currentUser.dienummer;

    const dutyIndicator = document.getElementById('navDutyIndicator');
    if (currentUser.onDuty) {
        dutyIndicator.classList.add('on-duty');
        dutyIndicator.querySelector('.duty-text').textContent = 'ON DUTY';
    } else {
        dutyIndicator.classList.remove('on-duty');
        dutyIndicator.querySelector('.duty-text').textContent = 'OFF DUTY';
    }
}

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('createPatrolBtn').addEventListener('click', openCreatePatrolModal);
    document.getElementById('confirmCreatePatrol').addEventListener('click', createPatrol);
    document.getElementById('addUserBtn')?.addEventListener('click', openAddUserModal);
    document.getElementById('confirmAddUser')?.addEventListener('click', addUser);
    document.getElementById('changeImageBtn').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });
    document.getElementById('imageUpload').addEventListener('change', uploadProfileImage);
    document.getElementById('dutyToggleBtn').addEventListener('click', toggleDuty);
    document.getElementById('joinPatrolBtn')?.addEventListener('click', joinPatrol);
    document.getElementById('savePatrolBtn')?.addEventListener('click', savePatrol);
    document.getElementById('deletePatrolBtn')?.addEventListener('click', deletePatrol);

    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
}

function switchView(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');

    if (view === 'patrols') loadPatrols();
    if (view === 'employees') loadEmployees();
    if (view === 'profile') loadProfile();
    if (view === 'admin') loadAdminPanel();
}

async function logout() {
    await sendWebhook(WEBHOOKS.logout, {
        embeds: [{
            title: 'Benutzer Abmeldung',
            color: 16711680,
            fields: [
                { name: 'Benutzername', value: currentUser.username, inline: true },
                { name: 'Dienummer', value: currentUser.dienummer, inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    });

    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function loadPatrols() {
    const grid = document.getElementById('patrolsGrid');
    grid.innerHTML = '';

    if (!allData.patrols || allData.patrols.length === 0) {
        grid.innerHTML = '<p style="color: rgba(255,255,255,0.6); grid-column: 1/-1; text-align: center;">Keine aktiven Streifen</p>';
        return;
    }

    allData.patrols.forEach(patrol => {
        const card = document.createElement('div');
        card.className = 'patrol-card';
        card.onclick = () => openPatrolDetail(patrol.id);

        const statusClass = patrol.status.toLowerCase().replace(/\s+/g, '-');

        card.innerHTML = `
            <div class="patrol-card-header">
                <span class="patrol-unit">${patrol.unit}</span>
                <span class="patrol-status ${statusClass}">${patrol.status}</span>
            </div>
            <div class="patrol-card-body">
                <div class="patrol-info-item">
                    <span class="patrol-info-label">FAHRZEUG</span>
                    <span class="patrol-info-value">${patrol.vehicle}</span>
                </div>
                <div class="patrol-info-item">
                    <span class="patrol-info-label">GEBIET</span>
                    <span class="patrol-info-value">${patrol.area}</span>
                </div>
                <div class="patrol-info-item">
                    <span class="patrol-info-label">ERSTELLT VON</span>
                    <span class="patrol-info-value">${patrol.createdBy}</span>
                </div>
            </div>
            <div class="patrol-members">
                <div class="patrol-members-title">MITGLIEDER (${patrol.members.length})</div>
                <div class="patrol-members-list">
                    ${patrol.members.map(m => `<span class="member-tag">${m}</span>`).join('')}
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function openCreatePatrolModal() {
    document.getElementById('createPatrolModal').classList.add('active');
}

async function createPatrol() {
    const unit = document.getElementById('patrolUnit').value;
    const vehicle = document.getElementById('patrolVehicle').value;
    const area = document.getElementById('patrolArea').value;
    const status = document.getElementById('patrolStatus').value;

    if (!unit || !vehicle || !area) {
        alert('Bitte alle Felder ausfüllen');
        return;
    }

    const newPatrol = {
        id: Date.now().toString(),
        unit,
        vehicle,
        area,
        status,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
        members: [currentUser.username]
    };

    if (!allData.patrols) allData.patrols = [];
    allData.patrols.push(newPatrol);
    await saveData();

    await sendWebhook(WEBHOOKS.patrolCreated, {
        embeds: [{
            title: 'Streife Erstellt',
            color: 65445,
            fields: [
                { name: 'Einheit', value: unit, inline: true },
                { name: 'Fahrzeug', value: vehicle, inline: true },
                { name: 'Gebiet', value: area, inline: true },
                { name: 'Status', value: status, inline: true },
                { name: 'Erstellt von', value: currentUser.username, inline: true },
                { name: 'Dienummer', value: currentUser.dienummer, inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    });

    document.getElementById('createPatrolModal').classList.remove('active');
    document.getElementById('patrolUnit').value = '';
    document.getElementById('patrolVehicle').value = '';
    document.getElementById('patrolArea').value = '';
    loadPatrols();
}

function openPatrolDetail(patrolId) {
    currentPatrolId = patrolId;
    const patrol = allData.patrols.find(p => p.id === patrolId);
    if (!patrol) return;

    document.getElementById('patrolDetailTitle').textContent = `STREIFE ${patrol.unit}`;
    document.getElementById('editPatrolUnit').value = patrol.unit;
    document.getElementById('editPatrolVehicle').value = patrol.vehicle;
    document.getElementById('editPatrolArea').value = patrol.area;
    document.getElementById('editPatrolStatus').value = patrol.status;
    document.getElementById('patrolCreator').textContent = patrol.createdBy;

    const membersList = document.getElementById('patrolMembersList');
    membersList.innerHTML = '';
    patrol.members.forEach(member => {
        const item = document.createElement('div');
        item.className = 'member-item';
        item.innerHTML = `
            <span class="member-name">${member}</span>
            ${patrol.members.length > 1 && member === currentUser.username ?
                `<button class="member-remove" onclick="leavePatrol('${patrolId}', '${member}')">VERLASSEN</button>` : ''}
        `;
        membersList.appendChild(item);
    });

    const joinBtn = document.getElementById('joinPatrolBtn');
    if (patrol.members.includes(currentUser.username)) {
        joinBtn.style.display = 'none';
    } else {
        joinBtn.style.display = 'block';
    }

    document.getElementById('patrolDetailModal').classList.add('active');
}

async function joinPatrol() {
    const patrol = allData.patrols.find(p => p.id === currentPatrolId);
    if (!patrol) return;

    if (!patrol.members.includes(currentUser.username)) {
        patrol.members.push(currentUser.username);
        await saveData();

        await sendWebhook(WEBHOOKS.personAdded, {
            embeds: [{
                title: 'Person zur Streife Hinzugefügt',
                color: 65445,
                fields: [
                    { name: 'Einheit', value: patrol.unit, inline: true },
                    { name: 'Person', value: currentUser.username, inline: true },
                    { name: 'Dienummer', value: currentUser.dienummer, inline: true },
                    { name: 'Mitglieder Gesamt', value: patrol.members.length.toString(), inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        });

        openPatrolDetail(currentPatrolId);
        loadPatrols();
    }
}

async function leavePatrol(patrolId, member) {
    const patrol = allData.patrols.find(p => p.id === patrolId);
    if (!patrol) return;

    patrol.members = patrol.members.filter(m => m !== member);
    await saveData();

    await sendWebhook(WEBHOOKS.personRemoved, {
        embeds: [{
            title: 'Person von Streife Entfernt',
            color: 16711680,
            fields: [
                { name: 'Einheit', value: patrol.unit, inline: true },
                { name: 'Person', value: member, inline: true },
                { name: 'Mitglieder Verbleibend', value: patrol.members.length.toString(), inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    });

    if (patrol.members.length === 0) {
        allData.patrols = allData.patrols.filter(p => p.id !== patrolId);
        await saveData();
        document.getElementById('patrolDetailModal').classList.remove('active');
    } else {
        openPatrolDetail(currentPatrolId);
    }

    loadPatrols();
}

async function savePatrol() {
    const patrol = allData.patrols.find(p => p.id === currentPatrolId);
    if (!patrol) return;

    patrol.unit = document.getElementById('editPatrolUnit').value;
    patrol.vehicle = document.getElementById('editPatrolVehicle').value;
    patrol.area = document.getElementById('editPatrolArea').value;
    patrol.status = document.getElementById('editPatrolStatus').value;

    await saveData();

    await sendWebhook(WEBHOOKS.extra2, {
        embeds: [{
            title: 'Streife Aktualisiert',
            color: 65445,
            fields: [
                { name: 'Einheit', value: patrol.unit, inline: true },
                { name: 'Fahrzeug', value: patrol.vehicle, inline: true },
                { name: 'Gebiet', value: patrol.area, inline: true },
                { name: 'Status', value: patrol.status, inline: true },
                { name: 'Aktualisiert von', value: currentUser.username, inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    });

    document.getElementById('patrolDetailModal').classList.remove('active');
    loadPatrols();
}

async function deletePatrol() {
    if (currentUser.role !== 'admin') return;

    const patrol = allData.patrols.find(p => p.id === currentPatrolId);
    if (!patrol) return;

    if (!confirm(`Streife ${patrol.unit} wirklich löschen?`)) return;

    await sendWebhook(WEBHOOKS.patrolDeleted, {
        embeds: [{
            title: 'Streife Gelöscht',
            color: 16711680,
            fields: [
                { name: 'Einheit', value: patrol.unit, inline: true },
                { name: 'Fahrzeug', value: patrol.vehicle, inline: true },
                { name: 'Gebiet', value: patrol.area, inline: true },
                { name: 'Gelöscht von', value: currentUser.username, inline: true },
                { name: 'Dienummer', value: currentUser.dienummer, inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    });

    allData.patrols = allData.patrols.filter(p => p.id !== currentPatrolId);
    await saveData();

    document.getElementById('patrolDetailModal').classList.remove('active');
    loadPatrols();
}

function loadEmployees() {
    const list = document.getElementById('employeesList');
    list.innerHTML = '';

    allData.users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'employee-card';

        card.innerHTML = `
            <img src="${user.profileImage || ''}" class="employee-img" alt="">
            <div class="employee-info">
                <div class="employee-name">${user.username}</div>
                <div class="employee-dienummer">${user.dienummer}</div>
                <div class="employee-rank">${user.rank}</div>
                <div class="employee-duty ${user.onDuty ? 'on' : 'off'}">
                    ${user.onDuty ? 'ON DUTY' : 'OFF DUTY'}
                </div>
            </div>
        `;

        list.appendChild(card);
    });
}

function loadProfile() {
    document.getElementById('profileImage').src = currentUser.profileImage || '';
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileDienummer').textContent = currentUser.dienummer;
    document.getElementById('profileRank').textContent = currentUser.rank;
    document.getElementById('profileRole').textContent = currentUser.role === 'admin' ? 'Administrator' : 'Mitarbeiter';

    const dutyBtn = document.getElementById('dutyToggleBtn');
    if (currentUser.onDuty) {
        dutyBtn.classList.add('on-duty');
        dutyBtn.querySelector('.toggle-text').textContent = 'ON DUTY';
    } else {
        dutyBtn.classList.remove('on-duty');
        dutyBtn.querySelector('.toggle-text').textContent = 'OFF DUTY';
    }
}

function uploadProfileImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageData = e.target.result;
        currentUser.profileImage = imageData;

        const user = allData.users.find(u => u.id === currentUser.id);
        if (user) {
            user.profileImage = imageData;
            await saveData();
        }

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInfo();
        loadProfile();

        await sendWebhook(WEBHOOKS.extra3, {
            embeds: [{
                title: 'Profilbild Aktualisiert',
                color: 65445,
                fields: [
                    { name: 'Benutzer', value: currentUser.username, inline: true },
                    { name: 'Dienummer', value: currentUser.dienummer, inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        });
    };
    reader.readAsDataURL(file);
}

async function toggleDuty() {
    currentUser.onDuty = !currentUser.onDuty;

    const user = allData.users.find(u => u.id === currentUser.id);
    if (user) {
        user.onDuty = currentUser.onDuty;
        await saveData();
    }

    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInfo();
    loadProfile();
    loadEmployees();

    await sendWebhook(WEBHOOKS.extra1, {
        embeds: [{
            title: currentUser.onDuty ? 'Dienst Begonnen' : 'Dienst Beendet',
            color: currentUser.onDuty ? 65445 : 16711680,
            fields: [
                { name: 'Benutzer', value: currentUser.username, inline: true },
                { name: 'Dienummer', value: currentUser.dienummer, inline: true },
                { name: 'Status', value: currentUser.onDuty ? 'ON DUTY' : 'OFF DUTY', inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    });
}

function loadAdminPanel() {
    if (currentUser.role !== 'admin') return;

    const list = document.getElementById('adminUsersList');
    list.innerHTML = '';

    allData.users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'admin-user-card';

        card.innerHTML = `
            <div class="admin-user-info">
                <div class="admin-user-field">
                    <label>BENUTZERNAME</label>
                    <span>${user.username}</span>
                </div>
                <div class="admin-user-field">
                    <label>DIENUMMER</label>
                    <span>${user.dienummer}</span>
                </div>
                <div class="admin-user-field">
                    <label>RANG</label>
                    <span>${user.rank}</span>
                </div>
                <div class="admin-user-field">
                    <label>ROLLE</label>
                    <span>${user.role === 'admin' ? 'Administrator' : 'Mitarbeiter'}</span>
                </div>
            </div>
            <div class="admin-user-actions">
                <button class="danger-btn" onclick="removeUser('${user.id}')">ENTFERNEN</button>
            </div>
        `;

        list.appendChild(card);
    });
}

function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

async function addUser() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const dienummer = document.getElementById('newDienummer').value;
    const rank = document.getElementById('newRank').value;
    const role = document.getElementById('newRole').value;

    if (!username || !password || !dienummer || !rank) {
        alert('Bitte alle Felder ausfüllen');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        username,
        password,
        dienummer,
        rank,
        role,
        profileImage: '',
        onDuty: false
    };

    allData.users.push(newUser);
    await saveData();

    await sendWebhook(WEBHOOKS.userAdded, {
        embeds: [{
            title: 'Mitarbeiter Hinzugefügt',
            color: 65445,
            fields: [
                { name: 'Benutzername', value: username, inline: true },
                { name: 'Dienummer', value: dienummer, inline: true },
                { name: 'Rang', value: rank, inline: true },
                { name: 'Rolle', value: role === 'admin' ? 'Administrator' : 'Mitarbeiter', inline: true },
                { name: 'Hinzugefügt von', value: currentUser.username, inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    });

    document.getElementById('addUserModal').classList.remove('active');
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('newDienummer').value = '';
    document.getElementById('newRank').value = '';
    loadAdminPanel();
    loadEmployees();
}

async function removeUser(userId) {
    const user = allData.users.find(u => u.id === userId);
    if (!user) return;

    if (user.id === currentUser.id) {
        alert('Sie können sich nicht selbst entfernen');
        return;
    }

    if (!confirm(`Mitarbeiter ${user.username} wirklich entfernen?`)) return;

    await sendWebhook(WEBHOOKS.userRemoved, {
        embeds: [{
            title: 'Mitarbeiter Entfernt',
            color: 16711680,
            fields: [
                { name: 'Benutzername', value: user.username, inline: true },
                { name: 'Dienummer', value: user.dienummer, inline: true },
                { name: 'Rang', value: user.rank, inline: true },
                { name: 'Entfernt von', value: currentUser.username, inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    });

    allData.users = allData.users.filter(u => u.id !== userId);
    await saveData();

    loadAdminPanel();
    loadEmployees();
}

window.leavePatrol = leavePatrol;
window.removeUser = removeUser;

init();
