/// <reference lib="webworker" />
import sqlite3InitModule, { Sqlite3Static } from '@sqlite.org/sqlite-wasm';

export interface Place {
  name: string;
  admin1: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

// Bump in lockstep with DB_VERSION in public/prepare-db.js whenever atlas.sqlite
// is regenerated, so a stale OPFS-cached copy is refetched instead of reused.
const DB_VERSION = '3';
const OPFS_DB_NAME = '/atlas.sqlite';

let db: any = null;

async function fetchAtlasBytes(): Promise<Uint8Array> {
  const response = await fetch('/atlas.sqlite');
  if (!response.ok) {
    throw new Error(`Failed to download atlas database: ${response.statusText}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

function readCachedVersion(opfsDb: any): string | null {
  try {
    let version: string | null = null;
    opfsDb.exec({
      sql: `SELECT value FROM meta WHERE key = 'version'`,
      callback: (row: [string]) => {
        version = row[0];
      },
    });
    return version;
  } catch {
    // meta table missing (older db) - treat as stale
    return null;
  }
}

// Persists atlas.sqlite in OPFS via the SAH pool VFS so it survives reloads
// without re-downloading ~400MB every session. Returns null if OPFS/SAH pool
// support isn't available in this browser, so the caller can fall back to the
// in-memory deserialize path.
async function initOpfsDB(sqlite3: Sqlite3Static): Promise<any | null> {
  if (!sqlite3.installOpfsSAHPoolVfs) {
    return null;
  }

  try {
    const poolUtil = await sqlite3.installOpfsSAHPoolVfs({ name: 'atlas-pool' });
    const hasCachedFile = poolUtil.getFileNames().includes(OPFS_DB_NAME);

    if (hasCachedFile) {
      const opfsDb = new poolUtil.OpfsSAHPoolDb(OPFS_DB_NAME);
      if (readCachedVersion(opfsDb) === DB_VERSION) {
        return opfsDb;
      }
      opfsDb.close();
    }

    // Cache missing or stale - (re)download and import into the OPFS pool.
    const bytes = await fetchAtlasBytes();
    await poolUtil.importDb(OPFS_DB_NAME, bytes);
    return new poolUtil.OpfsSAHPoolDb(OPFS_DB_NAME);
  } catch (err) {
    // SAH pool VFS can fail to acquire its exclusive lock (e.g. another tab/worker
    // already holds it) - fall back to the in-memory path rather than failing hard.
    console.warn('OPFS-backed atlas DB unavailable, falling back to in-memory:', err);
    return null;
  }
}

async function initDB() {
  try {
    // 1. Initialize SQLite WASM Module
    const sqlite3: Sqlite3Static = await sqlite3InitModule({
      locateFile: (file: string) => `/${file}`,
    });

    // 2. Prefer a persistent OPFS-backed database so the ~400MB atlas file is
    // only downloaded once; fall back to an in-memory copy if unsupported.
    db = await initOpfsDB(sqlite3);

    if (!db) {
      const bytes = await fetchAtlasBytes();

      // Allocate memory in WASM heap for the database buffer
      const p = sqlite3.wasm.allocFromTypedArray(bytes);
      db = new sqlite3.oo1.DB();

      // Deserialize the buffer directly into the DB instance
      // C API: sqlite3_deserialize(db, zDbName, pData, szDb, szBuf, mFlags)
      const rc = sqlite3.capi.sqlite3_deserialize(db, 'main', p, bytes.byteLength, bytes.byteLength, 0);

      if (rc !== 0) {
        throw new Error(`Failed to deserialize database. Return code: ${rc}`);
      }
    }

    // 3. Notify main thread that the worker is initialized and ready
    postMessage({ type: 'READY' });
  } catch (err: any) {
    postMessage({ type: 'ERROR', error: err?.message || String(err) });
  }
}

function searchPlaces(query: string) {
  if (!db) {
    postMessage({ type: 'RESULTS', results: [] });
    return;
  }

  // Prefix matching query (e.g., "Lon%" matches "London")
  const sql = `
    SELECT name, admin1, country, lat, lng, timezone
    FROM places
    WHERE name LIKE ?
    LIMIT 20;
  `;

  const results: Place[] = [];

  try {
    db.exec({
      sql: sql,
      bind: [`${query}%`],
      callback: (row: [string, string, string, number, number, string]) => {
        results.push({
          name: row[0],
          admin1: row[1],
          country: row[2],
          lat: row[3],
          lng: row[4],
          timezone: row[5],
        });
      },
    });

    postMessage({ type: 'RESULTS', results });
  } catch (err: any) {
    postMessage({ type: 'ERROR', error: err?.message || String(err) });
  }
}

// Handle messages from the Angular main thread service
addEventListener('message', ({ data }: MessageEvent) => {
  switch (data.type) {
    case 'INIT':
      initDB();
      break;
    case 'SEARCH':
      if (data.query && data.query.trim().length >= 2) {
        searchPlaces(data.query.trim());
      } else {
        postMessage({ type: 'RESULTS', results: [] });
      }
      break;
    default:
      console.warn('Unknown worker message type:', data.type);
  }
});
