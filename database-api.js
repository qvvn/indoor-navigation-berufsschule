// database-api.js - Einfach ohne unnötige Infos

// Raum-Daten (nur das Nötigste)
const RAEUME_DATEN = {
    "R132": {
        id: "R132",
        name: "Raum 132", 
        etage: "3"
    },
    "R133": {
        id: "R133", 
        name: "Raum 133",
        etage: "3"
    },
    "R134": {
        id: "R134",
        name: "Raum 134",
        etage: "3"
    },
    "R135": {
        id: "R135",
        name: "Raum 135", 
        etage: "3"
    },
    "R136": {
        id: "R136",
        name: "Raum 136",
        etage: "3"
    },
    "R137": {
        id: "R137",
        name: "Raum 137",
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

// Datenbank initialisieren
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

// Route berechnen
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
    
    // Route finden
    const route = findRoute(startRaum, zielRaum);
    
    if (route.length > 0) {
        const routeBeschreibung = route.map((raumId, index) => {
            const raum = RAEUME_DATEN[raumId];
            if (index === 0) {
                return `🚀 Start: ${raum.name}`;
            } else if (index === route.length - 1) {
                return `🎯 Ziel: ${raum.name}`;
            } else {
                return `➡️ Gehe zu: ${raum.name}`;
            }
        }).join('\n');
        
        return {
            gefunden: true,
            beschreibung: routeBeschreibung,
            route: route
        };
    } else {
        return {
            gefunden: false,
            beschreibung: `❌ Keine Route von ${RAEUME_DATEN[startRaum].name} zu ${RAEUME_DATEN[zielRaum].name} gefunden`
        };
    }
}

// Routenfindung
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
    
    return [];
}

// QR-Scan loggen
async function logQRScan(raumId) {
    const timestamp = new Date().toISOString();
    console.log(`📱 QR-Scan: ${raumId} um ${timestamp}`);
}

// Statistiken
async function getGebaeudeStats() {
    const raeume = await getAlleRaeume();
    return {
        anzahl_raeume: raeume.length,
        etagen: [...new Set(raeume.map(r => r.etage))]
    };
}
