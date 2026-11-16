/**
 * Applique les migrations SQL de db/migrations (dans l'ordre) sur la base Neon.
 *
 *   npm run db:migrate
 *
 * Lit DATABASE_URL dans .env.local (ou dans l'environnement). Chaque fichier n'est
 * appliqué qu'une fois (table public.schema_migrations).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";

// Charge .env.local si présent (sans dépendance supplémentaire)
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquante : renseignez-la dans .env.local.");
  process.exit(1);
}

const dir = path.resolve("db/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: true } });
await client.connect();
try {
  await client.query(`create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())`);
  const { rows } = await client.query("select name from public.schema_migrations");
  const done = new Set(rows.map((r) => r.name));
  for (const file of files) {
    if (done.has(file)) {
      console.log(`déjà appliquée : ${file}`);
      continue;
    }
    console.log(`application de ${file}…`);
    await client.query("begin");
    try {
      await client.query(readFileSync(path.join(dir, file), "utf8"));
      await client.query("insert into public.schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`  ✓ ${file}`);
    } catch (e) {
      await client.query("rollback");
      console.error(`  ✗ ${file} : ${e.message}`);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  await client.end();
}
