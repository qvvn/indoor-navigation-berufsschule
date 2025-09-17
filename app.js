// app.js - Hauptlogik der Indoor Navigation App

let aktuellerStandort = null; // aktueller Raum

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏫 Indoor Navigation App gestartet');
    
    await initDatabase();   // Datenbank laden
    await initializeApp();  // App starten
    setupEventListeners();  // Klicks etc.
    
    await checkURLParameter(); // URL prüfen (QR-Code Übergabe)
});

// URL-Parameter prüfen
async function checkURLParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    
    if (roomParam) {
        console.log(`📱 QR-Code Parameter erkannt: ${roomParam}`);
        const raumInfo = await getRaumInfo(roomParam);
        
        if (raumInfo) {
            await setzeAktuellenStandort(roomParam);
            showNotification(`✅ Standort ${raumInfo.name} automatisch erkannt!`);
        } else {
            showNotification(`⚠️ Raum ${roomParam} unbekannt`);
        }
    }
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px; right: 20px;
        background: #2d5a27; color: white;
        padding: 15px 20px; border-radius: 8px;
        z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

// App Initialisierung
async function initializeApp() {
    await befuelleZielDropdown();
    updateUI();
}

// Event Listener
function setupEventListeners() {
    const routeButton = document.getElementById('find-route');
    if (routeButton) {
        routeButton.addEventListener('click', async () => {
            await berechneUndZeigeRoute();
        });
    }
    const zielSelect = document.getElementById('destination-select');
    if (zielSelect) {
        zielSelect.addEventListener('change', async () => {
            if (aktuellerStandort && zielSelect.value) {
                await berechneUndZeigeRoute();
            }
        });
    }
}

// Dropdown füllen
async function befuelleZielDropdown() {
    const dropdown = document.getElementById('destination-select');
    dropdown.innerHTML = '<option value="">-- Lade Räume... --</option>';
    const alleRaeume = await getAlleRaeume();
    dropdown.innerHTML = '<option value="">-- Wähle dein Ziel --</option>';
    alleRaeume.forEach(raum => {
        const option = document.createElement('option');
        option.value = raum.id;
        option.textContent = raum.name;
        dropdown.appendChild(option);
    });
}

// Standort setzen
async function setzeAktuellenStandort(raumId) {
    aktuellerStandort = raumId;
    await updateUI();
    const zielSelect = document.getElementById('destination-select');
    if (zielSelect && zielSelect.value) {
        await berechneUndZeigeRoute();
    }
}

// UI aktualisieren
async function updateUI() {
    const currentRoomElement = document.getElementById('current-room');
    if (!aktuellerStandort) {
        currentRoomElement.innerHTML = `
            <strong>📱 Noch nicht bekannt</strong><br>
            <small style="color:#666;">Scanne einen QR-Code!</small>`;
        return;
    }
    const raumInfo = await getRaumInfo(aktuellerStandort);
    currentRoomElement.innerHTML = `
        <strong>✅ ${raumInfo.name}</strong><br>
        <small style="color:#666;">Etage ${raumInfo.etage}</small>`;
}

// Route berechnen
async function berechneUndZeigeRoute() {
    const zielSelect = document.getElementById('destination-select');
    const routeDisplay = document.getElementById('route-display');
    if (!aktuellerStandort) {
        routeDisplay.innerHTML = '❌ Scanne zuerst einen QR-Code!';
        return;
    }
    if (!zielSelect.value) {
        routeDisplay.innerHTML = '❌ Wähle ein Ziel!';
        return;
    }
    const ergebnis = await berechneRoute(aktuellerStandort, zielSelect.value);
    if (ergebnis.gefunden) {
        routeDisplay.innerHTML = ergebnis.beschreibung.replace(/\n/g, '<br>');
    } else {
        routeDisplay.innerHTML = `❌ ${ergebnis.beschreibung}`;
    }
}

// Debug-Funktionen
async function resetApp() {
    aktuellerStandort = null;
    document.getElementById('destination-select').value = '';
    document.getElementById('route-display').innerHTML = 'Wähle erst Start und Ziel aus.';
    updateUI();
}

async function simuliereQRScan(raumId) {
    const raumInfo = await getRaumInfo(raumId);
    if (raumInfo) {
        await setzeAktuellenStandort(raumId);
    } else {
        alert(`Raum ${raumId} existiert nicht!`);
    }
}

async function zeigeAlleRaeume() {
    const raeume = await getAlleRaeume();
    console.table(raeume);
}
