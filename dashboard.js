let currentUser = null;
let patrols = [];
let editingPatrolId = null;

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    const userSession = sessionStorage.getItem('currentUser');

    if (!userSession) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(userSession);

    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRank').textContent = currentUser.rank;
    document.getElementById('userInitials').textContent = getInitials(currentUser.name);

    loadPatrols();
    updateStats();
    updateUserStatus();
    setupEventListeners();
    createStars();
}

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('newPatrolBtn').addEventListener('click', openNewPatrolModal);
    document.getElementById('toggleDutyBtn').addEventListener('click', toggleDuty);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('patrolForm').addEventListener('submit', handlePatrolSubmit);
    document.getElementById('statusFilter').addEventListener('change', filterPatrols);

    document.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function logout() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('lssd_patrols');
    window.location.href = 'login.html';
}

function toggleDuty() {
    currentUser.onDuty = !currentUser.onDuty;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserStatus();
    updateStats();
}

function updateUserStatus() {
    const statusDot = document.getElementById('myStatusDot');
    const statusText = document.getElementById('myStatusText');
    const dutyBtn = document.getElementById('dutyBtnText');

    if (currentUser.onDuty) {
        statusDot.className = 'status-dot-large active';
        statusText.textContent = 'ON DUTY';
        dutyBtn.textContent = 'GO OFF DUTY';
        document.getElementById('toggleDutyBtn').classList.add('active');
    } else {
        statusDot.className = 'status-dot-large';
        statusText.textContent = 'OFF DUTY';
        dutyBtn.textContent = 'GO ON DUTY';
        document.getElementById('toggleDutyBtn').classList.remove('active');
    }
}

function loadPatrols() {
    const stored = localStorage.getItem('lssd_patrols');
    patrols = stored ? JSON.parse(stored) : [];
    renderPatrols();
}

function savePatrols() {
    localStorage.setItem('lssd_patrols', JSON.stringify(patrols));
    renderPatrols();
    updateStats();
}

function renderPatrols() {
    const grid = document.getElementById('patrolsGrid');
    const filter = document.getElementById('statusFilter').value;

    let filteredPatrols = patrols;
    if (filter !== 'all') {
        filteredPatrols = patrols.filter(p => p.status === filter);
    }

    if (filteredPatrols.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <h3>No Active Patrols</h3>
                <p>Create a new patrol to get started</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredPatrols.map(patrol => `
        <div class="patrol-card ${patrol.status}" data-id="${patrol.id}">
            <div class="patrol-card-glow"></div>
            <div class="patrol-header">
                <div class="patrol-callsign">${patrol.callsign}</div>
                <div class="patrol-status-badge ${patrol.status}">
                    <span class="status-dot"></span>
                    ${getStatusText(patrol.status)}
                </div>
            </div>
            <div class="patrol-body">
                <div class="patrol-info">
                    <div class="info-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                        </svg>
                        <span>${patrol.location}</span>
                    </div>
                    <div class="info-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                        </svg>
                        <span>${patrol.officer}</span>
                    </div>
                    <div class="info-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
                        </svg>
                        <span>${formatTime(patrol.startTime)}</span>
                    </div>
                </div>
                ${patrol.notes ? `<div class="patrol-notes">${patrol.notes}</div>` : ''}
            </div>
            <div class="patrol-actions">
                <button class="action-icon-btn" onclick="editPatrol('${patrol.id}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="action-icon-btn delete" onclick="deletePatrol('${patrol.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function filterPatrols() {
    renderPatrols();
}

function getStatusText(status) {
    const statusMap = {
        'available': 'AVAILABLE',
        'on-patrol': 'ON PATROL',
        'busy': 'BUSY',
        'off-duty': 'OFF DUTY'
    };
    return statusMap[status] || status.toUpperCase();
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function updateStats() {
    const activeCount = patrols.filter(p => p.status !== 'off-duty').length;
    const onDutyCount = patrols.filter(p => p.status === 'on-patrol').length;
    const availableCount = patrols.filter(p => p.status === 'available').length;

    document.getElementById('activePatrols').textContent = activeCount;
    document.getElementById('onDutyCount').textContent = onDutyCount;
    document.getElementById('availableUnits').textContent = availableCount;
}

function openNewPatrolModal() {
    editingPatrolId = null;
    document.getElementById('modalTitle').textContent = 'CREATE NEW PATROL';
    document.getElementById('submitBtnText').textContent = 'CREATE PATROL';
    document.getElementById('patrolForm').reset();
    document.getElementById('patrolId').value = '';
    document.getElementById('patrolModal').classList.add('active');
}

function editPatrol(id) {
    const patrol = patrols.find(p => p.id === id);
    if (!patrol) return;

    editingPatrolId = id;
    document.getElementById('modalTitle').textContent = 'EDIT PATROL';
    document.getElementById('submitBtnText').textContent = 'UPDATE PATROL';
    document.getElementById('patrolId').value = patrol.id;
    document.getElementById('patrolCallsign').value = patrol.callsign;
    document.getElementById('patrolStatus').value = patrol.status;
    document.getElementById('patrolLocation').value = patrol.location;
    document.getElementById('patrolNotes').value = patrol.notes || '';
    document.getElementById('patrolModal').classList.add('active');
}

function deletePatrol(id) {
    if (confirm('Are you sure you want to delete this patrol?')) {
        patrols = patrols.filter(p => p.id !== id);
        savePatrols();
    }
}

function closeModal() {
    document.getElementById('patrolModal').classList.remove('active');
    editingPatrolId = null;
}

function handlePatrolSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const patrolData = {
        id: editingPatrolId || generateId(),
        callsign: formData.get('callsign'),
        status: formData.get('status'),
        location: formData.get('location'),
        notes: formData.get('notes'),
        officer: currentUser.name,
        officerId: currentUser.id,
        startTime: editingPatrolId ? patrols.find(p => p.id === editingPatrolId).startTime : new Date().toISOString()
    };

    if (editingPatrolId) {
        const index = patrols.findIndex(p => p.id === editingPatrolId);
        patrols[index] = patrolData;
    } else {
        patrols.push(patrolData);
    }

    savePatrols();
    closeModal();
}

function generateId() {
    return 'patrol_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
