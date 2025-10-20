let aktuellerBenutzer = null;
let patrouillen = [];
let bearbeitetePatrouillenId = null;

document.addEventListener('DOMContentLoaded', () => {
    initialisiereDashboard();
});

function initialisiereDashboard() {
    const benutzerSitzung = sessionStorage.getItem('aktuellerBenutzer');

    if (!benutzerSitzung) {
        window.location.href = 'login.html';
        return;
    }

    aktuellerBenutzer = JSON.parse(benutzerSitzung);

    document.getElementById('benutzerName').textContent = aktuellerBenutzer.name;
    document.getElementById('benutzerRang').textContent = aktuellerBenutzer.rank;
    document.getElementById('benutzerInitialen').textContent = getInitialen(aktuellerBenutzer.name);

    ladePatrouillen();
    aktualisiereStatistiken();
    aktualisiereBenutzerStatus();
    richteEventListenerEin();
    erstelleSterne();
}

function richteEventListenerEin() {
    document.getElementById('logoutBtn').addEventListener('click', abmelden);
    document.getElementById('neuePatrouilleBtn').addEventListener('click', öffneNeuePatrouillenModal);
    document.getElementById('toggleDienstBtn').addEventListener('click', wechselDienstStatus);
    document.getElementById('modalSchließen').addEventListener('click', schließeModal);
    document.getElementById('abbrechenBtn').addEventListener('click', schließeModal);
    document.getElementById('patrouillenFormular').addEventListener('submit', verarbeitePatrouillenEingabe);
    document.getElementById('statusFilter').addEventListener('change', filterePatrouillen);

    document.querySelector('.modal-overlay').addEventListener('click', schließeModal);
}

function getInitialen(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function abmelden() {
    sessionStorage.removeItem('aktuellerBenutzer');
    localStorage.removeItem('lssd_patrouillen');
    window.location.href = 'login.html';
}

function wechselDienstStatus() {
    aktuellerBenutzer.imDienst = !aktuellerBenutzer.imDienst;
    sessionStorage.setItem('aktuellerBenutzer', JSON.stringify(aktuellerBenutzer));
    aktualisiereBenutzerStatus();
    aktualisiereStatistiken();
}

function aktualisiereBenutzerStatus() {
    const statusPunkt = document.getElementById('meinStatusPunkt');
    const statusText = document.getElementById('meinStatusText');
    const dienstBtn = document.getElementById('dienstBtnText');

    if (aktuellerBenutzer.imDienst) {
        statusPunkt.className = 'status-punkt-gross aktiv';
        statusText.textContent = 'IM DIENST';
        dienstBtn.textContent = 'DIENST BEENDEN';
        document.getElementById('toggleDienstBtn').classList.add('aktiv');
    } else {
        statusPunkt.className = 'status-punkt-gross';
        statusText.textContent = 'AUSSER DIENST';
        dienstBtn.textContent = 'DIENST BEGINNEN';
        document.getElementById('toggleDienstBtn').classList.remove('aktiv');
    }
}

function ladePatrouillen() {
    const gespeichert = localStorage.getItem('lssd_patrouillen');
    patrouillen = gespeichert ? JSON.parse(gespeichert) : [];
    zeigePatrouillen();
}

function speicherePatrouillen() {
    localStorage.setItem('lssd_patrouillen', JSON.stringify(patrouillen));
    zeigePatrouillen();
    aktualisiereStatistiken();
}

function zeigePatrouillen() {
    const raster = document.getElementById('patrouillenRaster');
    const filter = document.getElementById('statusFilter').value;

    let gefiltertePatrouillen = patrouillen;
    if (filter !== 'alle') {
        gefiltertePatrouillen = patrouillen.filter(p => p.status === filter);
    }

    if (gefiltertePatrouillen.length === 0) {
        raster.innerHTML = `
            <div class="leer-zustand">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <h3>Keine aktiven Patrouillen</h3>
                <p>Erstelle eine neue Patrouille, um zu beginnen</p>
            </div>
        `;
        return;
    }

    raster.innerHTML = gefiltertePatrouillen.map(p => `
        <div class="patrouillen-karte ${p.status}" data-id="${p.id}">
            <div class="patrouillen-glanz"></div>
            <div class="patrouillen-kopf">
                <div class="patrouillen-rufzeichen">${p.callsign}</div>
                <div class="patrouillen-status-badge ${p.status}">
                    <span class="status-punkt"></span>
                    ${getStatusText(p.status)}
                </div>
            </div>
            <div class="patrouillen-inhalt">
                <div class="info-block">
                    <div class="info-element">
                        📍 <span>${p.location}</span>
                    </div>
                    <div class="info-element">
                        👮 <span>${p.officer}</span>
                    </div>
                    <div class="info-element">
                        ⏰ <span>${formatZeit(p.startTime)}</span>
                    </div>
                </div>
                ${p.notes ? `<div class="patrouillen-notizen">${p.notes}</div>` : ''}
            </div>
            <div class="patrouillen-aktionen">
                <button class="aktions-btn" onclick="bearbeitePatrouille('${p.id}')" title="Bearbeiten">✏️</button>
                <button class="aktions-btn löschen" onclick="löschePatrouille('${p.id}')" title="Löschen">🗑️</button>
            </div>
        </div>
    `).join('');
}

function filterePatrouillen() {
    zeigePatrouillen();
}

function getStatusText(status) {
    const statusTexte = {
        'available': 'VERFÜGBAR',
        'on-patrol': 'AUF STREIFE',
        'busy': 'BESCHÄFTIGT',
        'off-duty': 'AUSSER DIENST'
    };
    return statusTexte[status] || status.toUpperCase();
}

function formatZeit(zeitstempel) {
    const datum = new Date(zeitstempel);
    return datum.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function aktualisiereStatistiken() {
    const aktiv = patrouillen.filter(p => p.status !== 'off-duty').length;
    const imDienst = patrouillen.filter(p => p.status === 'on-patrol').length;
    const verfügbar = patrouillen.filter(p => p.status === 'available').length;

    document.getElementById('aktivePatrouillen').textContent = aktiv;
    document.getElementById('imDienstAnzahl').textContent = imDienst;
    document.getElementById('verfügbareEinheiten').textContent = verfügbar;
}

function öffneNeuePatrouillenModal() {
    bearbeitetePatrouillenId = null;
    document.getElementById('modalTitel').textContent = 'NEUE PATROUILLE ERSTELLEN';
    document.getElementById('absendenBtnText').textContent = 'PATROUILLE ERSTELLEN';
    document.getElementById('patrouillenFormular').reset();
    document.getElementById('patrouillenId').value = '';
    document.getElementById('patrouillenModal').classList.add('aktiv');
}

function bearbeitePatrouille(id) {
    const p = patrouillen.find(p => p.id === id);
    if (!p) return;

    bearbeitetePatrouillenId = id;
    document.getElementById('modalTitel').textContent = 'PATROUILLE BEARBEITEN';
    document.getElementById('absendenBtnText').textContent = 'PATROUILLE AKTUALISIEREN';
    document.getElementById('patrouillenId').value = p.id;
    document.getElementById('patrouillenRufzeichen').value = p.callsign;
    document.getElementById('patrouillenStatus').value = p.status;
    document.getElementById('patrouillenOrt').value = p.location;
    document.getElementById('patrouillenNotizen').value = p.notes || '';
    document.getElementById('patrouillenModal').classList.add('aktiv');
}

function löschePatrouille(id) {
    if (confirm('Möchtest du diese Patrouille wirklich löschen?')) {
        patrouillen = patrouillen.filter(p => p.id !== id);
        speicherePatrouillen();
    }
}

function schließeModal() {
    document.getElementById('patrouillenModal').classList.remove('aktiv');
    bearbeitetePatrouillenId = null;
}

function verarbeitePatrouillenEingabe(e) {
    e.preventDefault();

    const formDaten = new FormData(e.target);
    const patrouillenDaten = {
        id: bearbeitetePatrouillenId || generiereId(),
        callsign: formDaten.get('callsign'),
        status: formDaten.get('status'),
        location: formDaten.get('location'),
        notes: formDaten.get('notes'),
        officer: aktuellerBenutzer.name,
        officerId: aktuellerBenutzer.id,
        startTime: bearbeitetePatrouillenId 
            ? patrouillen.find(p => p.id === bearbeitetePatrouillenId).startTime 
            : new Date().toISOString()
    };

    if (bearbeitetePatrouillenId) {
        const index = patrouillen.findIndex(p => p.id === bearbeitetePatrouillenId);
        patrouillen[index] = patrouillenDaten;
    } else {
        patrouillen.push(patrouillenDaten);
    }

    speicherePatrouillen();
    schließeModal();
}

function generiereId() {
    return 'patrouille_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
