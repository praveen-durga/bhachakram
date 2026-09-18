// @sqlite.org/sqlite-wasm ships a default export typed as `init(): Promise<Sqlite3Static>`,
// but the runtime accepts an options object (see dist/index.mjs, `args[0]?.locateFile`).
// This augments the published types to match actual runtime support.
import type { Sqlite3Static } from '@sqlite.org/sqlite-wasm';

declare module '@sqlite.org/sqlite-wasm' {
  export interface Sqlite3InitOptions {
    locateFile?: (file: string) => string;
  }

  export default function sqlite3InitModule(options?: Sqlite3InitOptions): Promise<Sqlite3Static>;
}
