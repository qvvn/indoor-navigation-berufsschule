// database-api.js - Vereinfacht ohne SQL.js (CSP-freundlich)

// Raum-Daten direkt in JavaScript (ohne SQLite)
const RAEUME_DATEN = {
    "R132": {
        id: "R132",
        name: "Raum 132", 
        beschreibung: "Informatikraum mit 30 PC-Arbeitsplätzen",
        raumtyp: "Informatikraum",
        etage: "3"
    },
    "R133": {
        id: "R133", 
        name: "Raum 133",
        beschreibung: "Mathematikraum mit Whiteboard und Beamer", 
        raumtyp: "Mathematikraum",
        etage: "3"
    },
    "R134": {
        id: "R134",
        name: "Raum 134",
        beschreibung: "Englischraum mit interaktiver Tafel",
        raumtyp: "Sprachraum", 
        etage: "3"
    },
    "R135": {
        id: "R135",
        name: "Raum 135", 
        beschreibung: "Physikraum mit Experimentierplätzen",
        raumtyp: "Physikraum",
        etage: "3"
    },
    "R136": {
        id: "R136",
        name: "Raum 136",
        beschreibung: "Chemieraum mit Laborausstattung", 
        raumtyp: "Chemieraum",
        etage: "3"
    },
    "R137": {
        id: "R137",
        name: "Raum 137",
        beschreibung: "Biologieraum mit Mikroskopen",
        raumtyp: "Biologieraum", 
        etage: "3"
    }
};

// Verbindungen zwischen Räumen (vereinfacht)
const VERBINDUNGEN = {
    "R132": ["R133"],
    "R133": ["R132", "R134"],
    "R134": ["R133", "R135"], 
    "R135": ["R134", "R136"],
    "R136": ["R135", "R137"],
    "R137": ["R136"]
};

// Datenbank initialisieren (ersetzt SQLite)
async function initDatabase() {
    console.log('📊 Lokale Datenbank initialisiert');
    console.log(`✅ ${Object.keys(RAEUME_DATEN).length} Räume geladen`);
    return true;
}

// Alle Räume abrufen
async function getAlleRaeume() {
    return Object.values(RAEUME_DATEN);
}

// Einzelnen Raum abrufen
async function getRaumInfo(raumId) {
    return RAEUME_DATEN[raumId] || null;
}

// Route berechnen (einfacher Dijkstra-ähnlicher Algorithmus)
async function berechneRoute(startRaum, zielRaum) {
    console.log(`🗺️ Route berechnen: ${startRaum} → ${zielRaum}`);
    
    // Prüfen ob Start und Ziel existieren
    if (!RAEUME_DATEN[startRaum]) {
        return {
            gefunden: false,
            beschreibung: `❌ Startraum ${startRaum} nicht gefunden`
        };
    }
    
    if (!RAEUME_DATEN[zielRaum]) {
        return {
            gefunden: false,
            beschreibung: `❌ Zielraum ${zielRaum} nicht gefunden`
        };
    }
    
    // Gleicher Raum
    if (startRaum === zielRaum) {
        return {
            gefunden: true,
            beschreibung: `✅ Du bist bereits in ${RAEUME_DATEN[zielRaum].name}!`
        };
    }
    
    // Einfache Routenberechnung (Breadth-First Search)
    const route = findRoute(startRaum, zielRaum);
    
    if (route.length > 0) {
        const routeBeschreibung = route.map((raumId, index) => {
            const raum = RAEUME_DATEN[raumId];
            if (index === 0) {
                return `🚀 Start: ${raum.name}`;
            } else if (index === route.length - 1) {
                return `🎯 Ziel erreicht: ${raum.name}`;
            } else {
                return `➡️ Gehe zu: ${raum.name}`;
            }
        }).join('\n');
        
        return {
            gefunden: true,
            beschreibung: routeBeschreibung,
            route: route,
            distanz: route.length - 1
        };
    } else {
        return {
            gefunden: false,
            beschreibung: `❌ Keine Route von ${RAEUME_DATEN[startRaum].name} zu ${RAEUME_DATEN[zielRaum].name} gefunden`
        };
    }
}

// Breadth-First Search für Routenfindung
function findRoute(start, ziel) {
    const queue = [[start]];
    const visited = new Set();
    
    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        
        if (current === ziel) {
            return path;
        }
        
        if (visited.has(current)) {
            continue;
        }
        
        visited.add(current);
        
        const neighbors = VERBINDUNGEN[current] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push([...path, neighbor]);
            }
        }
    }
    
    return []; // Keine Route gefunden
}

// QR-Scan loggen (für Statistiken)
async function logQRScan(raumId) {
    const timestamp = new Date().toISOString();
    console.log(`📱 QR-Scan geloggt: ${raumId} um ${timestamp}`);
    
    // In localStorage speichern für Statistiken
    const scans = JSON.parse(localStorage.getItem('qr_scans') || '[]');
    scans.push({ raumId, timestamp });
    localStorage.setItem('qr_scans', JSON.stringify(scans));
}

// Gebäude-Statistiken
async function getGebaeudeStats() {
    const raeume = await getAlleRaeume();
    const scans = JSON.parse(localStorage.getItem('qr_scans') || '[]');
    
    return {
        anzahl_raeume: raeume.length,
        anzahl_scans: scans.length,
        etagen: [...new Set(raeume.map(r => r.etage))],
        raumtypen: [...new Set(raeume.map(r => r.raumtyp))]
    };
}
