import airportsJson from './airports.json' with { type: 'json' };

const airportIndex = [];

for (const icao in airportsJson) {
    const a = airportsJson[icao];
    airportIndex.push({
        icao: a.icao.toLowerCase(),
        iata: a.iata.toLowerCase(),
        city: a.city.toLowerCase(),
        name: a.name.toLowerCase(),
        record: a
    });
}

const STOPWORDS = new Set([
  "to", "from", "the", "a", "an", "on", "at", "i", "help", "want", "would", "like", "you", "fly", "find", "flight", "flights", "go", "travel", "book", "me"
]);

function extractLocationWords(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9/]+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

function findAirport(matchWord) {
    matchWord = matchWord.toLowerCase();

    // IATA
    let hit = airportIndex.find(a => a.iata.toLowerCase() === matchWord);
    if (hit) return hit.record;

    // ICAO
    hit = airportIndex.find(a => a.icao.toLowerCase() === matchWord);
    if (hit) return hit.record;

    // KG-MID (if supplied by user)
    if (matchWord.startsWith("/m/")) {
        return { iata: matchWord };
    }

    // City match
    hit = airportIndex.find(a => a.city.toLowerCase() === matchWord);
    if (hit) return hit.record;

    // Airport name
    if ( !matchWord.includes("air") ) { // filter out words like airport
        hit = airportIndex.find(a => a.name.toLowerCase().includes(matchWord));
        if (hit) return hit.record;
    }

    return null;
}

export function findAirportByPhrase(phrase) {
    if (!phrase || typeof phrase !== 'string') return null;
    const p = phrase.toLowerCase().trim();

    // IATA/ICAO
    let hit = airportIndex.find(a => a.iata.toLowerCase() === p || a.icao.toLowerCase() === p);
    if (hit) return hit.record;

    // KG-MID (if supplied by user)
    if (p.startsWith('/m/')) return { iata: p };

    // City match
    hit = airportIndex.find(a => a.city.toLowerCase() === p);
    if (hit) return hit.record;

    // partial name match
    hit = airportIndex.find(a => a.name.toLowerCase().includes(p));
    if (hit) return hit.record;

    // try tokenized matching
    const tokens = p.split(/\s+/).filter(Boolean);
    // try longer token windows
    for (let len = tokens.length; len > 0; len--) {
        for (let start = 0; start + len <= tokens.length; start++) {
            const window = tokens.slice(start, start + len).join(' ');
            // city
            hit = airportIndex.find(a => a.city.toLowerCase() === window);
            if (hit) return hit.record;
            // name contains
            hit = airportIndex.find(a => a.name.toLowerCase().includes(window));
            if (hit) return hit.record;
        }
    }

    // try single token matches
    for (const t of tokens) {
        hit = airportIndex.find(a => a.iata.toLowerCase() === t || a.icao.toLowerCase() === t || a.city.toLowerCase() === t || a.name.toLowerCase().includes(t));
        if (hit) return hit.record;
    }

    return null;
}

export function extractDestination(text) {
    const words = extractLocationWords(text);

    for (const w of words) {
        const airport = findAirport(w);
        if (airport) {
            return airport.iata
        }
    }

    return null;
}