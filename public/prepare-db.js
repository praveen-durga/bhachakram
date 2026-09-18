// prepare-db.js
const fs = require('fs');
const readline = require('readline');
const Database = require('better-sqlite3');

// Bump this whenever atlas.sqlite is regenerated with different data, so the
// worker's OPFS cache (keyed on this value) knows to refetch instead of
// reusing a stale cached copy.
const DB_VERSION = '3';

// Restrict to these countries to keep the shipped db small (ISO 3166-1 alpha-2 codes).
const INCLUDED_COUNTRIES = new Set(['IN', 'US']);

const db = new Database('atlas.sqlite');

// Optimize SQLite for static read-only distribution
db.exec(`
  PRAGMA journal_mode = OFF;
  PRAGMA synchronous = OFF;

  CREATE TABLE places (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    admin1 TEXT, -- State / Province
    country TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    timezone TEXT NOT NULL
  );

  CREATE TABLE meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('version', DB_VERSION);

const insert = db.prepare(`
  INSERT INTO places (name, admin1, country, lat, lng, timezone)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(...row);
});

async function processGeoNames() {
  const fileStream = fs.createReadStream('allCountries.txt');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let batch = [];
  for await (const line of rl) {
    const cols = line.split('\t');
    const featureClass = cols[6]; // Class 'P' is populated places (cities, villages)
    const country = cols[8];

    if (featureClass === 'P' && INCLUDED_COUNTRIES.has(country)) {
      const name = cols[2]; // asciiname - plain-ASCII transliteration, matches what users type
      const lat = parseFloat(cols[4]);
      const lng = parseFloat(cols[5]);
      const admin1 = cols[10]; // State/Region code
      const timezone = cols[17]; // IANA timezone name

      batch.push([name, admin1, country, lat, lng, timezone]);

      if (batch.length >= 10000) {
        insertMany(batch);
        batch = [];
      }
    }
  }
  if (batch.length > 0) insertMany(batch);

  // Critical for fast searching across 2.5M rows
  console.log('Building search index...');
  db.exec(`CREATE INDEX idx_places_name ON places(name COLLATE NOCASE);`);
  db.close();
  console.log('Database successfully generated: atlas.sqlite');
}

processGeoNames();
