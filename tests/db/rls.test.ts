/**
 * Vérifie le schéma et les règles de sécurité (RLS, fonctions) de la migration Supabase
 * sur un vrai PostgreSQL local (PGlite), avec une simulation minimale de
 * l'environnement Neon (rôle authenticated de l'API de données, auth.uid() lu dans le JWT).
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
const ADMIN = "33333333-3333-3333-3333-333333333333";

const NEON_STUB = `
  -- Neon crée le rôle « authenticated » (API de données) ; le propriétaire de la base (ici service_role,
  -- qui contourne la RLS) fait les opérations de confiance côté serveur.
  create role service_role nologin bypassrls;
  grant usage, create on schema public to service_role;
  alter default privileges in schema public grant all on tables to service_role;
  alter default privileges in schema public grant all on functions to service_role;

  -- auth.uid() fourni par l'extension pg_session_jwt de Neon : lit la revendication « sub » du JWT
  create schema auth;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
`;

let db: PGlite;

/**
 * Exécute une requête avec l'identité donnée :
 * - un identifiant = utilisateur connecté (rôle authenticated, jeton avec ce « sub ») ;
 * - null = jeton valide SANS utilisateur connu (auth.uid() est nul) ;
 * - "service" = le serveur (connexion propriétaire, contourne la RLS).
 * Un visiteur sans jeton est refusé par l'API de données avant d'atteindre la base.
 */
async function as<T = Record<string, unknown>>(who: string | null | "service", sql: string, params: unknown[] = []) {
  const role = who === "service" ? "service_role" : "authenticated";
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${who && who !== "service" ? who : ""}', false);`);
  await db.exec(`set role ${role};`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec("reset role;");
  }
}

const rsvp = (slug: string, name = "Moussa", response = "yes", guests = 1) =>
  as("service", "select public.submit_rsvp($1, $2, '', $3, $4, '')", [slug, name, response, guests]);

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
  await db.exec(NEON_STUB);
  // Toutes les migrations, dans l'ordre (comme npm run db:migrate)
  const dir = path.join(process.cwd(), "db/migrations");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(path.join(dir, file), "utf8"));
  }
  await db.exec("grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;");
  await db.exec(`
    insert into public.profiles (id, email, full_name, role) values
      ('${A}', 'a@test.bf', 'Awa', 'user'),
      ('${B}', 'b@test.bf', null, 'user'),
      ('${ADMIN}', 'admin@test.bf', null, 'admin');
  `);
}, 60_000);

describe("profils", () => {
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

describe("événements : cloisonnement", () => {
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

  it("H1 : un événement publié et payé n'est PAS listable par un visiteur ni par un autre compte", async () => {
    const id = await createEvent(A, "public-aaaa-0004");
    await activate(id, null);
    expect(await as(null, "select slug from public.events")).toHaveLength(0);
    expect(await as(B, "select id from public.events where id = $1", [id])).toHaveLength(0);
  });

  it("H2 : un autre utilisateur ne peut ni modifier ni supprimer", async () => {
    const id = await createEvent(A, "protege-aaaa-0005");
    await as(B, "update public.events set title = 'Piraté' where id = $1", [id]);
    await as(B, "delete from public.events where id = $1", [id]);
    const rows = await as(A, "select title from public.events where id = $1", [id]);
    expect(rows).toEqual([{ title: "Mariage test" }]);
  });

  it("l'administrateur voit tous les événements", async () => {
    const rows = await as(ADMIN, "select count(*)::int as n from public.events");
    expect((rows[0] as { n: number }).n).toBeGreaterThanOrEqual(4);
  });

  it("le slug doit faire au moins 10 caractères", async () => {
    await expect(createEvent(A, "court")).rejects.toThrow();
  });

  it("L2 : contraintes en base (lien https, programme en liste, image https)", async () => {
    const id = await createEvent(A, "contraintes-aaaa-0020");
    await expect(as(A, "update public.events set maps_url = 'javascript:alert(1)' where id = $1", [id])).rejects.toThrow();
    await expect(as(A, "update public.events set maps_url = 'http://exemple.bf' where id = $1", [id])).rejects.toThrow();
    await expect(as(A, `update public.events set program = '"texte"'::jsonb where id = $1`, [id])).rejects.toThrow();
    await expect(as(A, "update public.events set cover_image_url = 'http://tracker.exemple/p.gif' where id = $1", [id])).rejects.toThrow();
    await as(A, "update public.events set maps_url = 'https://maps.app.goo.gl/abc' where id = $1", [id]);
  });
});

describe("fonds d'invitation (100)", () => {
  it("fond par défaut à la création", async () => {
    const id = await createEvent(A, "fond-defaut-aaaa-0060");
    const rows = await as<{ theme: string }>(A, "select theme from public.events where id = $1", [id]);
    expect(rows[0].theme).toBe("feuillage--ivoire");
  });

  it("accepte un fond « style--coloris »", async () => {
    const id = await createEvent(A, "fond-deco-aaaa-0061");
    await as(A, "update public.events set theme = 'deco--nuit' where id = $1", [id]);
    expect((await as<{ theme: string }>(A, "select theme from public.events where id = $1", [id]))[0].theme).toBe("deco--nuit");
  });

  it("refuse un format de fond invalide ou trop long", async () => {
    const id = await createEvent(A, "fond-mauvais-aaaa-0062");
    for (const bad of ["wax", "wax--", "WAX--braise", "wax--bra ise", "wax--braise'; drop table events;--", "a--b--c", "x".repeat(41) + "--y"]) {
      await expect(as(A, "update public.events set theme = $2 where id = $1", [id, bad]), bad).rejects.toThrow();
    }
  });
});

describe("page invité : get_public_event", () => {
  it("renvoie l'invitation publiée et payée, sans données internes", async () => {
    const id = await createEvent(A, "invite-aaaa-0030");
    await activate(id, null);
    const rows = await as<Record<string, unknown>>("service", "select * from public.get_public_event('invite-aaaa-0030')");
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Mariage test");
    expect(Object.keys(rows[0])).not.toContain("owner_id");
    expect(Object.keys(rows[0])).not.toContain("image_generations");
    expect(Object.keys(rows[0])).not.toContain("blocked_at");
  });

  it("ne renvoie rien pour un brouillon, un événement non payé ou un slug inconnu", async () => {
    await createEvent(A, "brouillon-aaaa-0031");
    const paid = await createEvent(A, "nonpaye-aaaa-0032");
    await as(A, "update public.events set status = 'published' where id = $1", [paid]);
    for (const slug of ["brouillon-aaaa-0031", "nonpaye-aaaa-0032", "inconnu-aaaa-0000"]) {
      expect(await as("service", "select * from public.get_public_event($1)", [slug])).toHaveLength(0);
    }
  });

  it("M6 : une invitation suspendue par l'administration n'est plus publique, et l'organisateur ne peut pas la rétablir", async () => {
    const id = await createEvent(A, "suspendu-aaaa-0033");
    await activate(id, null);
    expect(await as("service", "select * from public.get_public_event('suspendu-aaaa-0033')")).toHaveLength(1);
    await as("service", "update public.events set status = 'draft', blocked_at = now() where id = $1", [id]);
    // L'organisateur republie : toujours invisible, et blocked_at n'est pas modifiable par lui
    await as(A, "update public.events set status = 'published' where id = $1", [id]);
    await expect(as(A, "update public.events set blocked_at = null where id = $1", [id])).rejects.toThrow();
    expect(await as("service", "select * from public.get_public_event('suspendu-aaaa-0033')")).toHaveLength(0);
  });
});

describe("réponses RSVP : submit_rsvp", () => {
  it("un visiteur répond à un événement publié et payé, sans pouvoir lire les réponses", async () => {
    const id = await createEvent(A, "rsvp-aaaa-0006");
    await activate(id, null);
    await rsvp("rsvp-aaaa-0006");
    expect(await as(null, "select id from public.rsvps where event_id = $1", [id])).toHaveLength(0); // la RLS filtre tout
    expect(await as(A, "select name from public.rsvps where event_id = $1", [id])).toEqual([{ name: "Moussa" }]);
    expect(await as(B, "select name from public.rsvps where event_id = $1", [id])).toHaveLength(0);
  });

  it("M5 : l'insertion directe dans rsvps est interdite", async () => {
    const id = await createEvent(A, "direct-aaaa-0040");
    await activate(id, null);
    await expect(as(null, "insert into public.rsvps (event_id, name, response) values ($1, 'X', 'yes')", [id])).rejects.toThrow();
    await expect(as(B, "insert into public.rsvps (event_id, name, response) values ($1, 'X', 'yes')", [id])).rejects.toThrow();
  });

  it("impossible de répondre à un brouillon", async () => {
    await createEvent(A, "rsvpbrouillon-0007");
    await expect(rsvp("rsvpbrouillon-0007")).rejects.toThrow(/event_unavailable/);
  });

  it("la limite d'invités de la formule est respectée", async () => {
    const id = await createEvent(A, "limite-aaaa-0008");
    await activate(id, 2);
    await rsvp("limite-aaaa-0008", "Un");
    await rsvp("limite-aaaa-0008", "Deux", "no");
    await expect(rsvp("limite-aaaa-0008", "Trois")).rejects.toThrow(/guest_limit_reached/);
  });

  it("le nombre d'accompagnants est borné à 20", async () => {
    const id = await createEvent(A, "borne-aaaa-0009");
    await activate(id, null);
    await rsvp("borne-aaaa-0009", "Groupe", "yes", 99);
    const rows = await as<{ guests_count: number }>(A, "select guests_count from public.rsvps where event_id = $1", [id]);
    expect(rows[0].guests_count).toBe(20);
  });

  it("la date limite de réponse est appliquée côté base", async () => {
    const id = await createEvent(A, "echeance-aaaa-0041");
    await activate(id, null);
    await as(A, "update public.events set rsvp_deadline = current_date - 1 where id = $1", [id]);
    await expect(rsvp("echeance-aaaa-0041")).rejects.toThrow(/rsvp_closed/);
  });

  it("un rythme anormal de réponses est freiné", async () => {
    const id = await createEvent(A, "rythme-aaaa-0042");
    await activate(id, null);
    for (let i = 0; i < 40; i++) await rsvp("rythme-aaaa-0042", `Invité ${i}`);
    await expect(rsvp("rythme-aaaa-0042", "Trop")).rejects.toThrow(/too_many_requests/);
  });
});

describe("activation d'une formule : activate_payment", () => {
  async function pendingPayment(slug: string, plan = "celebration") {
    const eventId = await createEvent(A, slug);
    const rows = await as<{ id: string }>(
      "service",
      "insert into public.payments (event_id, user_id, plan, amount, status) values ($1, $2, $3, '4900.00', 'pending') returning id",
      [eventId, A, plan],
    );
    return { eventId, paymentId: rows[0].id };
  }

  it("active la formule dans une seule transaction (3 mois, limite d'invités)", async () => {
    const { eventId, paymentId } = await pendingPayment("activer-aaaa-0050");
    const res = await as<{ activate_payment: string | null }>("service", "select public.activate_payment($1, 'tx_50', 500, 3)", [paymentId]);
    expect(res[0].activate_payment).toBe("activer-aaaa-0050");
    const ev = await as<{ plan: string; guest_limit: number; ok: boolean }>(
      "service",
      "select plan, guest_limit, plan_expires_at > now() + interval '89 days' as ok from public.events where id = $1",
      [eventId],
    );
    expect(ev[0]).toEqual({ plan: "celebration", guest_limit: 500, ok: true });
    const pay = await as<{ status: string; saspay_transaction_id: string }>("service", "select status, saspay_transaction_id from public.payments where id = $1", [paymentId]);
    expect(pay[0]).toEqual({ status: "paid", saspay_transaction_id: "tx_50" });
  });

  it("est idempotent : un second appel ne change rien", async () => {
    const { eventId, paymentId } = await pendingPayment("idem-aaaa-0051");
    await as("service", "select public.activate_payment($1, 'tx_51', 500, 3)", [paymentId]);
    const before = await as<{ plan_expires_at: string }>("service", "select plan_expires_at::text from public.events where id = $1", [eventId]);
    const again = await as<{ activate_payment: string | null }>("service", "select public.activate_payment($1, 'tx_51', 500, 3)", [paymentId]);
    expect(again[0].activate_payment).toBeNull();
    const after = await as<{ plan_expires_at: string }>("service", "select plan_expires_at::text from public.events where id = $1", [eventId]);
    expect(after).toEqual(before);
  });

  it("prolonge de 3 mois une formule encore active", async () => {
    const { eventId, paymentId } = await pendingPayment("prolonge-aaaa-0052");
    await as("service", "update public.events set plan = 'essentiel', plan_expires_at = now() + interval '30 days' where id = $1", [eventId]);
    await as("service", "select public.activate_payment($1, 'tx_52', 500, 3)", [paymentId]);
    const ev = await as<{ ok: boolean }>("service", "select plan_expires_at > now() + interval '118 days' as ok from public.events where id = $1", [eventId]);
    expect(ev[0].ok).toBe(true);
  });

  it("n'est pas appelable par un visiteur ni par un utilisateur connecté", async () => {
    const { paymentId } = await pendingPayment("interdit-aaaa-0053");
    await expect(as(null, "select public.activate_payment($1, 'tx_x', 500, 3)", [paymentId])).rejects.toThrow();
    await expect(as(A, "select public.activate_payment($1, 'tx_x', 500, 3)", [paymentId])).rejects.toThrow();
  });
});

describe("paiements, webhooks, réglages", () => {
  it("un utilisateur ne peut pas créer de paiement lui-même", async () => {
    const id = await createEvent(A, "paiement-aaaa-0010");
    await expect(
      as(A, "insert into public.payments (event_id, user_id, plan, amount) values ($1, $2, 'prestige', '1.00')", [id, A]),
    ).rejects.toThrow();
  });

  it("les webhooks sont inaccessibles à l'API de données (aucun droit)", async () => {
    await as("service", "insert into public.webhook_events (id, event_type, payload) values ('tx_1', 'transaction.success', '{}')");
    await expect(as(A, "select id from public.webhook_events")).rejects.toThrow();
    await expect(as(A, "insert into public.webhook_events (id, event_type, payload) values ('tx_2', 'x', '{}')")).rejects.toThrow();
  });

  it("H3 : un traitement de webhook en cours est distinct d'un traitement terminé", async () => {
    const rows = await as<{ status: string }>("service", "select status from public.webhook_events where id = 'tx_1'");
    expect(rows[0].status).toBe("processing");
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
