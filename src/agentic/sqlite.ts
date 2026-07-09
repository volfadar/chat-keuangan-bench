/**
 * Dual-runtime SQLite: bun:sqlite under Bun, better-sqlite3 under Node (Mastra Studio).
 */

export type SqlRunResult = { changes: number; lastInsertRowid: number | bigint };

export type SqlDb = {
  exec: (sql: string) => void;
  run: (sql: string, ...params: unknown[]) => SqlRunResult;
  all: <T = Record<string, unknown>>(sql: string, ...params: unknown[]) => T[];
  close: () => void;
};

const isBun = typeof (globalThis as { Bun?: unknown }).Bun !== "undefined";

export async function openSqlite(dbPath: string): Promise<SqlDb> {
  if (isBun) {
    const { Database } = await import("bun:sqlite");
    const db = new Database(dbPath);
    return {
      exec: (sql) => {
        db.exec(sql);
      },
      run: (sql, ...params) => {
        // Do not pass an empty bindings array — Bun treats it as bindings and
        // can break literal SQL (e.g. 'pengeluaran' → no such column).
        const info =
          params.length > 0 ? db.run(sql, params as never[]) : db.run(sql);
        return {
          changes: Number(info.changes),
          lastInsertRowid: info.lastInsertRowid,
        };
      },
      all: <T,>(sql: string, ...params: unknown[]) =>
        (params.length > 0
          ? db.query(sql).all(...(params as never[]))
          : db.query(sql).all()) as T[],
      close: () => db.close(),
    };
  }

  const BetterSqlite = (await import("better-sqlite3")).default;
  const db = new BetterSqlite(dbPath);
  return {
    exec: (sql) => {
      db.exec(sql);
    },
    run: (sql, ...params) => {
      const stmt = db.prepare(sql);
      const info = params.length > 0 ? stmt.run(...params) : stmt.run();
      return {
        changes: Number(info.changes),
        lastInsertRowid: info.lastInsertRowid,
      };
    },
    all: <T,>(sql: string, ...params: unknown[]) => {
      const stmt = db.prepare(sql);
      return (params.length > 0 ? stmt.all(...params) : stmt.all()) as T[];
    },
    close: () => db.close(),
  };
}
