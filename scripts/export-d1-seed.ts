/**
 * ローカルの SQLite（prisma/dev.db）を D1 に流し込むための INSERT 文を生成する。
 *
 *   pnpm d1:export
 *   wrangler d1 execute dailynews --local  --file=scripts/d1-seed/0001.sql   （ローカル確認用）
 *   wrangler d1 execute dailynews --remote --file=scripts/d1-seed/0001.sql   （本番投入）
 *
 * Prisma を通さず node:sqlite で生の値を読む。ただし DateTime だけは表現が違う:
 * ローカル SQLite は ms epoch の INTEGER、D1 driver adapter は ISO 8601 文字列を期待するので、
 * DATETIME 宣言の列だけ ISO 文字列に変換する（数値のままだと P2023 で読めない）。
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH = process.env.SQLITE_PATH ?? "prisma/dev.db";
const OUT_DIR = "scripts/d1-seed";
const STATEMENTS_PER_FILE = 200;

/** 外部キーの向きに合わせた投入順。親テーブルを先に入れる。 */
const TABLE_ORDER = [
  "Company",
  "WatchSource",
  "Candidate",
  "Event",
  "SavedPost",
  "InterestProfile",
  "MeetupPlan",
  "XUsageDaily",
  "GoogleConnection",
  "GoogleGmailMessage",
  "GoogleCalendarEvent"
] as const;

/** その列が DATETIME 宣言かどうか（Prisma の SQLite は DateTime を DATETIME で作る） */
function datetimeColumns(db: DatabaseSync, table: string): Set<string> {
  const info = db.prepare(`PRAGMA table_info("${table}")`).all() as Array<{ name: string; type: string }>;
  return new Set(info.filter((column) => column.type.toUpperCase() === "DATETIME").map((column) => column.name));
}

/** ms epoch → ISO 8601。既に文字列なら触らない。 */
function toIsoDate(value: unknown): unknown {
  if (typeof value === "number") return new Date(value).toISOString();
  if (typeof value === "bigint") return new Date(Number(value)).toISOString();
  return value;
}

function quote(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "1" : "0";
  if (value instanceof Uint8Array) return `X'${Buffer.from(value).toString("hex")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function main(): void {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const statements: string[] = [];

  for (const table of TABLE_ORDER) {
    const rows = db.prepare(`SELECT * FROM "${table}"`).all() as Array<Record<string, unknown>>;
    if (rows.length === 0) {
      console.log(`${table}: 0 rows (skip)`);
      continue;
    }
    const columns = Object.keys(rows[0]);
    const dates = datetimeColumns(db, table);
    const columnList = columns.map((column) => `"${column}"`).join(", ");
    for (const row of rows) {
      const values = columns.map((column) => quote(dates.has(column) ? toIsoDate(row[column]) : row[column]));
      statements.push(`INSERT INTO "${table}" (${columnList}) VALUES (${values.join(", ")});`);
    }
    console.log(`${table}: ${rows.length} rows`);
  }
  db.close();

  mkdirSync(OUT_DIR, { recursive: true });
  for (const existing of readdirSync(OUT_DIR)) {
    if (existing.endsWith(".sql")) rmSync(join(OUT_DIR, existing));
  }

  let fileIndex = 0;
  for (let offset = 0; offset < statements.length; offset += STATEMENTS_PER_FILE) {
    fileIndex += 1;
    const name = `${String(fileIndex).padStart(4, "0")}.sql`;
    writeFileSync(join(OUT_DIR, name), statements.slice(offset, offset + STATEMENTS_PER_FILE).join("\n") + "\n", "utf8");
  }

  console.log(`\n${statements.length} statements -> ${OUT_DIR}/ (${fileIndex} files)`);
}

main();
