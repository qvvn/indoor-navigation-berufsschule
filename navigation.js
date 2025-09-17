// navigation.js - Wegfindungs-Algorithmus (einfache Version)

// Hauptfunktion: Berechnet den kürzesten Weg zwischen zwei Räumen
function berechneRoute(startRaum, zielRaum) {
    // Spezialfall: Start und Ziel sind der gleiche Raum
    if (startRaum === zielRaum) {
        return {
            gefunden: true,
            weg: [startRaum], // Nur der aktuelle Raum
            beschreibung: "Du bist bereits am Ziel! 🎯"
        };
    }
    
    // Breadth-First-Search (BFS) Algorithmus für kürzesten Weg
    // Das ist ein Standard-Algorithmus für Wegfindung in Graphen
    
    const besucht = new Set(); // Welche Räume haben wir schon besucht?
    const warteschlange = []; // Welche Räume müssen wir noch prüfen?
    const vorgaenger = new Map(); // Von welchem Raum sind wir in jeden Raum gekommen?
    
    // Startpunkt zur Warteschlange hinzufügen
    warteschlange.push(startRaum);
    besucht.add(startRaum); // Als besucht markieren
    
    // Solange es noch Räume zu prüfen gibt
    while (warteschlange.length > 0) {
        const aktuellerRaum = warteschlange.shift(); // Ersten Raum aus Warteschlange nehmen
        
        // Haben wir das Ziel erreicht?
        if (aktuellerRaum === zielRaum) {
            // Weg rekonstruieren (rückwärts vom Ziel zum Start)
            const weg = [];
            let aktuell = zielRaum;
            
            while (aktuell !== undefined) {
                weg.unshift(aktuell); // Am Anfang einfügen (damit Reihenfolge stimmt)
                aktuell = vorgaenger.get(aktuell); // Zum vorherigen Raum
            }
            
            return {
                gefunden: true,
                weg: weg,
                beschreibung: erstelleWegbeschreibung(weg)
            };
        }
        
        // Alle Nachbar-Räume prüfen
        const raumInfo = getRaumInfo(aktuellerRaum); // Aus rooms.js
        if (raumInfo && raumInfo.verbindungen) {
            for (const nachbar of raumInfo.verbindungen) {
                // Haben wir diesen Nachbarn schon besucht?
                if (!besucht.has(nachbar)) {
                    besucht.add(nachbar); // Als besucht markieren
                    warteschlange.push(nachbar); // Zur Warteschlange hinzufügen
                    vorgaenger.set(nachbar, aktuellerRaum); // Merken, von wo wir gekommen sind
                }
            }
        }
    }
    
    // Kein Weg gefunden
    return {
        gefunden: false,
        weg: [],
        beschreibung: "❌ Es konnte kein Weg gefunden werden. Sind die Räume verbunden?"
    };
}

// Hilfsfunktion: Erstellt eine benutzerfreundliche Wegbeschreibung
function erstelleWegbeschreibung(weg) {
    if (weg.length === 0) {
        return "Kein Weg verfügbar.";
    }
    
    if (weg.length === 1) {
        return "Du bist bereits am Ziel! 🎯";
    }
    
    let beschreibung = "🗺️ Deine Route:\n\n";
    
    // Jeden Schritt im Weg beschreiben
    for (let i = 0; i < weg.length; i++) {
        const raumInfo = getRaumInfo(weg[i]); // Raum-Details holen
        const raumName = raumInfo ? raumInfo.name : weg[i];
        
        if (i === 0) {
            // Startpunkt
            beschreibung += `📍 Start: ${raumName}\n`;
        } else if (i === weg.length - 1) {
            // Zielpunkt
            beschreibung += `🎯 Ziel: ${raumName}\n`;
        } else {
            // Zwischenschritt
            beschreibung += `↓ Gehe zu: ${raumName}\n`;
        }
    }
    
    // Zusätzliche Info über Anzahl der Schritte
    const schritte = weg.length - 1;
    beschreibung += `\n✨ Route in ${schritte} Schritt${schritte === 1 ? '' : 'en'}`;
    
    return beschreibung;
}

// Hilfsfunktion: Alle erreichbaren Räume von einem Startpunkt finden
function findeErreichbareRaeume(startRaum) {
    const erreichbar = new Set();
    const warteschlange = [startRaum];
    
    while (warteschlange.length > 0) {
        const aktuell = warteschlange.shift();
        erreichbar.add(aktuell);
        
        const raumInfo = getRaumInfo(aktuell);
        if (raumInfo && raumInfo.verbindungen) {
            for (const nachbar of raumInfo.verbindungen) {
                if (!erreichbar.has(nachbar)) {
                    warteschlange.push(nachbar);
                }
            }
        }
    }
    
    return Array.from(erreichbar); // Set zu Array konvertieren
}