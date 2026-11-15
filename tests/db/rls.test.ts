/**
 * Vérifie le schéma et les règles de sécurité (RLS) de la migration Supabase
 * sur un vrai PostgreSQL local (PGlite), avec une simulation minimale de
 * l'environnement Supabase (schémas auth et storage, rôles anon/authenticated).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
const ADMIN = "33333333-3333-3333-3333-333333333333";

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

  create schema auth;
  grant usage on schema auth to anon, authenticated, service_role;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated, service_role;

  create schema storage;
  grant usage on schema storage to anon, authenticated, service_role;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;

  create publication supabase_realtime;
`;

let db: PGlite;

/** Exécute une requête avec l'identité donnée (null = visiteur anonyme, "service" = serveur). */
async function as<T = Record<string, unknown>>(who: string | null | "service", sql: string, params: unknown[] = []) {
  const role = who === "service" ? "service_role" : who ? "authenticated" : "anon";
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${who && who !== "service" ? who : ""}', false);`);
  await db.exec(`set role ${role};`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec("reset role;");
  }
}

async function createEvent(owner: string, slug: string) {
  const rows = await as<{ id: string }>(
    owner,
    `insert into public.events (slug, event_type, title) values ($1, 'mariage', 'Mariage test') returning id`,
    [slug],
  );
  return rows[0].id;
}

async function activate(eventId: string, guestLimit: number | null) {
  await as(
    "service",
    `update public.events set status = 'published', plan = 'essentiel',
       plan_expires_at = now() + interval '90 days', guest_limit = $2 where id = $1`,
    [eventId, guestLimit],
  );
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUB);
  const migration = readFileSync(
    path.join(process.cwd(), "supabase/migrations/20261115000000_init.sql"),
    "utf8",
  );
  await db.exec(migration);
  // Trois comptes : le trigger doit créer les profils
  await db.exec(`
    insert into auth.users (id, email, raw_user_meta_data) values
      ('${A}', 'a@test.bf', '{"full_name":"Awa"}'),
      ('${B}', 'b@test.bf', '{}'),
      ('${ADMIN}', 'admin@test.bf', '{}');
    update public.profiles set role = 'admin' where id = '${ADMIN}';
  `);
}, 60_000);

describe("profils", () => {
  it("le trigger crée un profil à l'inscription", async () => {
    const rows = await as(A, "select full_name from public.profiles where id = $1", [A]);
    expect(rows).toEqual([{ full_name: "Awa" }]);
  });

  it("un utilisateur ne voit pas le profil des autres", async () => {
    const rows = await as(A, "select id from public.profiles");
    expect(rows.map((r) => r.id)).toEqual([A]);
  });

  it("un utilisateur ne peut pas se donner le rôle admin", async () => {
    await expect(as(A, "update public.profiles set role = 'admin' where id = $1", [A])).rejects.toThrow();
  });

  it("un utilisateur peut modifier son nom", async () => {
    await as(A, "update public.profiles set full_name = 'Awa K.' where id = $1", [A]);
    const rows = await as(A, "select full_name from public.profiles where id = $1", [A]);
    expect(rows[0].full_name).toBe("Awa K.");
  });
});

describe("événements", () => {
  it("un organisateur crée un événement, invisible des autres et du public", async () => {
    const id = await createEvent(A, "brouillon-aaaa-0001");
    expect(await as(A, "select id from public.events where id = $1", [id])).toHaveLength(1);
    expect(await as(B, "select id from public.events where id = $1", [id])).toHaveLength(0);
    expect(await as(null, "select id from public.events where id = $1", [id])).toHaveLength(0);
  });

  it("l'organisateur ne peut pas s'attribuer une formule", async () => {
    const id = await createEvent(A, "triche-aaaa-0002");
    await expect(
      as(A, "update public.events set plan = 'prestige', plan_expires_at = now() + interval '1 year' where id = $1", [id]),
    ).rejects.toThrow();
  });

  it("publié sans formule payée : toujours invisible du public", async () => {
    const id = await createEvent(A, "nonpaye-aaaa-0003");
    await as(A, "update public.events set status = 'published' where id = $1", [id]);
    expect(await as(null, "select id from public.events where id = $1", [id])).toHaveLength(0);
  });

  it("publié et payé : visible du public", async () => {
    const id = await createEvent(A, "public-aaaa-0004");
    await activate(id, null);
    expect(await as(null, "select id from public.events where id = $1", [id])).toHaveLength(1);
  });

  it("un autre utilisateur ne peut ni modifier ni supprimer", async () => {
    const id = await createEvent(A, "protege-aaaa-0005");
    await as(B, "update public.events set title = 'Piraté' where id = $1", [id]);
    await as(B, "delete from public.events where id = $1", [id]);
    const rows = await as(A, "select title from public.events where id = $1", [id]);
    expect(rows).toEqual([{ title: "Mariage test" }]);
  });

  it("l'administrateur voit tous les événements", async () => {
    const rows = await as(ADMIN, "select count(*)::int as n from public.events");
    expect((rows[0] as { n: number }).n).toBeGreaterThanOrEqual(5);
  });

  it("le slug doit faire au moins 10 caractères", async () => {
    await expect(createEvent(A, "court")).rejects.toThrow();
  });
});

describe("réponses RSVP", () => {
  it("le public répond à un événement publié et payé, sans pouvoir lire les réponses", async () => {
    const id = await createEvent(A, "rsvp-aaaa-0006");
    await activate(id, null);
    await as(null, "insert into public.rsvps (event_id, name, response) values ($1, 'Moussa', 'yes')", [id]);
    expect(await as(null, "select id from public.rsvps where event_id = $1", [id])).toHaveLength(0);
    expect(await as(A, "select name from public.rsvps where event_id = $1", [id])).toEqual([{ name: "Moussa" }]);
    expect(await as(B, "select name from public.rsvps where event_id = $1", [id])).toHaveLength(0);
  });

  it("impossible de répondre à un brouillon", async () => {
    const id = await createEvent(A, "rsvpbrouillon-0007");
    await expect(
      as(null, "insert into public.rsvps (event_id, name, response) values ($1, 'X', 'yes')", [id]),
    ).rejects.toThrow();
  });

  it("la limite d'invités de la formule est respectée", async () => {
    const id = await createEvent(A, "limite-aaaa-0008");
    await activate(id, 2);
    await as(null, "insert into public.rsvps (event_id, name, response) values ($1, 'Un', 'yes')", [id]);
    await as(null, "insert into public.rsvps (event_id, name, response) values ($1, 'Deux', 'no')", [id]);
    await expect(
      as(null, "insert into public.rsvps (event_id, name, response) values ($1, 'Trois', 'yes')", [id]),
    ).rejects.toThrow(/guest_limit_reached/);
  });

  it("le nombre d'accompagnants est borné", async () => {
    const id = await createEvent(A, "borne-aaaa-0009");
    await activate(id, null);
    await expect(
      as(null, "insert into public.rsvps (event_id, name, response, guests_count) values ($1, 'X', 'yes', 99)", [id]),
    ).rejects.toThrow();
  });
});

describe("paiements, webhooks, réglages", () => {
  it("un utilisateur ne peut pas créer de paiement lui-même", async () => {
    const id = await createEvent(A, "paiement-aaaa-0010");
    await expect(
      as(A, "insert into public.payments (event_id, user_id, plan, amount) values ($1, $2, 'prestige', '1.00')", [id, A]),
    ).rejects.toThrow();
  });

  it("les webhooks sont invisibles des clients", async () => {
    await as("service", "insert into public.webhook_events (id, event_type, payload) values ('tx_1', 'transaction.success', '{}')");
    expect(await as(A, "select id from public.webhook_events")).toHaveLength(0);
    expect(await as(null, "select id from public.webhook_events")).toHaveLength(0);
  });

  it("un même webhook ne peut être enregistré qu'une fois", async () => {
    await expect(
      as("service", "insert into public.webhook_events (id, event_type, payload) values ('tx_1', 'transaction.success', '{}')"),
    ).rejects.toThrow();
  });

  it("les réglages sont lisibles par tous, modifiables seulement par l'admin", async () => {
    expect(await as(null, "select key from public.app_settings where key = 'show_sample_content'")).toHaveLength(1);
    await as(A, "update public.app_settings set value = 'true' where key = 'show_sample_content'");
    let rows = await as(null, "select value from public.app_settings where key = 'show_sample_content'");
    expect(rows[0].value).toBe(false);
    await as(ADMIN, "update public.app_settings set value = 'true' where key = 'show_sample_content'");
    rows = await as(null, "select value from public.app_settings where key = 'show_sample_content'");
    expect(rows[0].value).toBe(true);
  });
});
