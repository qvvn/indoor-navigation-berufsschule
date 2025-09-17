// app.js - Hauptlogik der Indoor Navigation App

// Globale Variablen
let aktuellerStandort = null; // Wo befindet sich der Benutzer gerade?

// Wird ausgeführt sobald die Seite geladen ist
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏫 Indoor Navigation App gestartet');
    
    // Datenbank zuerst initialisieren
    await initDatabase();
    
    // Dann App initialisieren
    await initializeApp();
    setupEventListeners();
    
    // NEU: URL-Parameter für automatischen Standort prüfen
    await checkURLParameter();
});

// NEU: Funktion um URL-Parameter zu prüfen und Standort automatisch zu setzen
async function checkURLParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    
    if (roomParam) {
        console.log(`📱 QR-Code Parameter erkannt: ${roomParam}`);
        
        // Prüfen ob Raum in Datenbank existiert
        const raumInfo = await getRaumInfo(roomParam);
        
        if (raumInfo) {
            // Automatisch den Standort setzen
            await setzeAktuellenStandort(roomParam);
            
            // Benutzer informieren
            showNotification(`✅ Standort ${raumInfo.name} automatisch erkannt!`);
            
            console.log(`✅ Standort automatisch gesetzt: ${roomParam}`);
        } else {
            console.warn(`⚠️ Raum ${roomParam} nicht in Datenbank gefunden`);
            showNotification(`⚠️ QR-Code ${roomParam} unbekannt`);
        }
    }
}

// NEU: Notification anzeigen (einfache Lösung)
function showNotification(message) {
    // Einfache Alert-Benachrichtigung
    // Du kannst das später durch eine schönere Notification ersetzen
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2d5a27;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Nach 4 Sekunden automatisch entfernen
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// App-Initialisierung: Alles vorbereiten
async function initializeApp() {
    console.log('App wird initialisiert...');
    
    // Ziel-Dropdown mit allen verfügbaren Räumen füllen
    await befuelleZielDropdown();
    
    // Anfangs-Zustand: Noch kein Standort bekannt
    updateUI();
}

// Event-Listener für Buttons und Interaktionen einrichten
function setupEventListeners() {
    // QR-Scanner Button
    const scannerButton = document.getElementById('start-scanner');
    scannerButton.addEventListener('click', function() {
        if (scannerActive) {
            stopQRScanner(); // Scanner stoppen wenn aktiv
        } else {
            startQRScanner(); // Scanner starten wenn inaktiv
        }
    });
    
    // Route berechnen Button
    const routeButton = document.getElementById('find-route');
    routeButton.addEventListener('click', async function() {
        await berechneUndZeigeRoute(); // Route zwischen Start und Ziel berechnen
    });
    
    // Ziel-Dropdown: Automatisch Route berechnen wenn sich Ziel ändert
    const zielSelect = document.getElementById('destination-select');
    zielSelect.addEventListener('change', async function() {
        if (aktuellerStandort && zielSelect.value) {
            await berechneUndZeigeRoute(); // Sofort neue Route berechnen
        }
    });
}

// Dropdown-Menü mit allen verfügbaren Räumen füllen
async function befuelleZielDropdown() {
    const dropdown = document.getElementById('destination-select');
    
    // Loading-Text anzeigen
    dropdown.innerHTML = '<option value="">-- Lade Räume... --</option>';
    
    try {
        const alleRaeume = await getAlleRaeume(); // Aus Datenbank laden
        
        // Dropdown leeren und neu füllen
        dropdown.innerHTML = '<option value="">-- Wähle dein Ziel --</option>';
        
        // Für jeden Raum eine Option hinzufügen
        alleRaeume.forEach(raum => {
            const option = document.createElement('option');
            option.value = raum.id; // Database ID (z.B. "R136")
            option.textContent = raum.name; // Anzeigename (z.B. "Raum 136")
            dropdown.appendChild(option);
        });
        
        console.log(`✅ ${alleRaeume.length} Räume in Dropdown geladen`);
        
    } catch (error) {
        console.error('Fehler beim Laden der Räume:', error);
        dropdown.innerHTML = '<option value="">-- Fehler beim Laden --</option>';
    }
}

// Aktuellen Standort setzen (wird vom QR-Scanner aufgerufen)
async function setzeAktuellenStandort(raumId) {
    console.log(`Standort gesetzt: ${raumId}`);
    
    // QR-Scan in Datenbank loggen (für Statistiken)
    await logQRScan(raumId);
    
    aktuellerStandort = raumId; // Global speichern
    await updateUI(); // Benutzeroberfläche aktualisieren
    
    // Wenn bereits ein Ziel ausgewählt ist, sofort Route berechnen
    const zielSelect = document.getElementById('destination-select');
    if (zielSelect.value) {
        await berechneUndZeigeRoute();
    }
}

// Benutzeroberfläche aktualisieren
async function updateUI() {
    const currentRoomElement = document.getElementById('current-room');
    
    if (aktuellerStandort) {
        // Raum-Details aus Datenbank holen
        const raumInfo = await getRaumInfo(aktuellerStandort);
        
        if (raumInfo) {
            currentRoomElement.innerHTML = `
                <strong>✅ ${raumInfo.name}</strong><br>
                <small style="color: #666;">
                    ${raumInfo.beschreibung}<br>
                    ${raumInfo.raumtyp} • Etage ${raumInfo.etage}
                </small>
            `;
            currentRoomElement.style.color = '#2d5a27'; // Grüne Farbe für Erfolg
        } else {
            currentRoomElement.innerHTML = `
                <strong>⚠️ ${aktuellerStandort}</strong><br>
                <small style="color: #666;">Raum nicht in Datenbank gefunden</small>
            `;
            currentRoomElement.style.color = '#856404'; // Orange für Warnung
        }
        
        // Route-Button aktivieren
        document.getElementById('find-route').disabled = false;
        
    } else {
        // Noch kein Standort bekannt
        currentRoomElement.innerHTML = `
            <strong>📱 Noch nicht bekannt</strong><br>
            <small style="color: #666;">Scanne einen QR-Code um deinen Standort zu ermitteln!</small>
        `;
        currentRoomElement.style.color = '#666'; // Graue Farbe
        
        // Route-Button deaktivieren
        document.getElementById('find-route').disabled = true;
    }
}

// Route berechnen und anzeigen
async function berechneUndZeigeRoute() {
    const zielSelect = document.getElementById('destination-select');
    const routeDisplay = document.getElementById('route-display');
    
    // Loading-Anzeige
    routeDisplay.innerHTML = '🔄 Route wird berechnet...';
    
    // Prüfen ob Start und Ziel vorhanden sind
    if (!aktuellerStandort) {
        routeDisplay.innerHTML = '❌ Scanne zuerst einen QR-Code um deinen Standort zu ermitteln.';
        return;
    }
    
    if (!zielSelect.value) {
        routeDisplay.innerHTML = '❌ Wähle zuerst ein Ziel aus.';
        return;
    }
    
    const zielRaum = zielSelect.value;
    
    try {
        // Route mit Datenbank berechnen
        const routeErgebnis = await berechneRoute(aktuellerStandort, zielRaum);
        
        if (routeErgebnis.gefunden) {
            // Route gefunden - schön anzeigen
            routeDisplay.innerHTML = `
                <div class="route-success">
                    ${routeErgebnis.beschreibung.replace(/\n/g, '<br>')}
                </div>
            `;
            routeDisplay.className = 'route-section success';
            
        } else {
            // Keine Route gefunden
            routeDisplay.innerHTML = `
                <div class="route-error">
                    ${routeErgebnis.beschreibung}
                </div>
            `;
            routeDisplay.className = 'route-section error';
        }
        
    } catch (error) {
        console.error('Fehler bei Routenberechnung:', error);
        routeDisplay.innerHTML = `
            <div class="route-error">
                ❌ Fehler bei der Routenberechnung: ${error.message}
            </div>
        `;
        routeDisplay.className = 'route-section error';
    }
}

// Hilfsfunktion: App zurücksetzen (für Debugging)
async function resetApp() {
    console.log('App wird zurückgesetzt...');
    
    aktuellerStandort = null;
    document.getElementById('destination-select').value = '';
    document.getElementById('route-display').innerHTML = 'Wähle erst Start und Ziel aus.';
    
    // Scanner stoppen falls aktiv
    if (typeof scannerActive !== 'undefined' && scannerActive) {
        stopQRScanner();
    }
    
    await updateUI();
}

// Für Debugging: Test-Funktionen  
async function simuliereQRScan(raumId) {
    console.log(`Simuliere QR-Scan für: ${raumId}`);
    
    // Prüfen ob Raum in Datenbank existiert
    const raumInfo = await getRaumInfo(raumId);
    if (raumInfo) {
        qrCodeErkannt(raumId); // Simuliert einen QR-Code Scan
    } else {
        console.error(`❌ Raum ${raumId} existiert nicht in der Datenbank!`);
        alert(`Raum ${raumId} wurde nicht gefunden!`);
    }
}

// Datenbank-Management Funktionen
async function zeigeAlleRaeume() {
    const raeume = await getAlleRaeume();
    console.table(raeume); // Schöne Tabellen-Anzeige in der Konsole
    return raeume;
}

async function zeigeGebaeudeStats() {
    const stats = await getGebaeudeStats();
    console.log('📊 Gebäude-Statistiken:', stats);
    return stats;
}
