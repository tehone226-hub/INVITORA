-- =====================================================================
-- Invitora — schéma initial pour Neon (Postgres + Neon Auth + API de données)
-- Règle 5 (CLAUDE.md) : RLS sur toutes les tables. Un organisateur ne voit
-- que ses événements. Les invités passent par des fonctions SQL ciblées
-- (get_public_event, submit_rsvp) appelées uniquement par le serveur.
-- Les comptes sont dans neon_auth."user" ; l'API de données (rôle « authenticated »)
-- lit l'identité dans le jeton JWT via auth.uid().
-- =====================================================================

-- Rôles utilisés par l'API de données de Neon
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Profils (1 par compte Neon Auth ; créés à la première connexion par le serveur)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key,
  email       text,
  full_name   text,
  phone       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- Vrai si l'utilisateur connecté est administrateur
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Événements
-- ---------------------------------------------------------------------
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  slug            text not null unique check (char_length(slug) >= 10),
  event_type      text not null check (event_type in
                    ('mariage', 'dot', 'bapteme', 'anniversaire', 'funerailles', 'entreprise', 'soutenance', 'autre')),
  title           text not null check (char_length(title) between 1 and 160),
  hosts           text check (char_length(hosts) <= 160),
  starts_at       timestamptz,
  venue           text check (char_length(venue) <= 160),
  city            text check (char_length(city) <= 80),
  address         text check (char_length(address) <= 240),
  maps_url        text check (char_length(maps_url) <= 500 and maps_url ~ '^https://'),
  message         text check (char_length(message) <= 2000),
  program         jsonb not null default '[]'::jsonb check (jsonb_typeof(program) = 'array' and jsonb_array_length(program) <= 20),
  dress_code      text check (char_length(dress_code) <= 160),
  rsvp_deadline   date,
  contact_phone   text check (char_length(contact_phone) <= 30),
  language        text not null default 'fr' check (language in ('fr', 'mos', 'dyu')),
  theme           text not null default 'faso-dan-fani'
                    check (theme in ('faso-dan-fani', 'bogolan', 'tiebele', 'indigo')),
  cover_image_url text check (cover_image_url is null or (cover_image_url ~ '^https://' and char_length(cover_image_url) <= 600)),
  status          text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  -- Colonnes réservées au serveur (paiement validé) : non modifiables par l'organisateur
  plan            text check (plan in ('essentiel', 'celebration', 'prestige')),
  plan_expires_at timestamptz,
  guest_limit     integer check (guest_limit is null or guest_limit > 0),
  image_generations integer not null default 0,
  blocked_at      timestamptz,   -- suspension par l'administration (réservé au serveur)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index events_owner_idx on public.events (owner_id);
create index events_status_idx on public.events (status);

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- Un événement est visible du public s'il est publié ET si sa formule est active
create or replace function public.event_is_public(e public.events)
returns boolean
language sql
stable
set search_path = ''
as $$
  select e.status = 'published' and e.blocked_at is null and e.plan_expires_at is not null and e.plan_expires_at > now();
$$;

-- ---------------------------------------------------------------------
-- Réponses des invités (RSVP)
-- ---------------------------------------------------------------------
create table public.rsvps (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 120),
  phone        text check (char_length(phone) <= 30),
  response     text not null check (response in ('yes', 'no', 'maybe')),
  guests_count integer not null default 1 check (guests_count between 1 and 20),
  message      text check (char_length(message) <= 500),
  created_at   timestamptz not null default now()
);

create index rsvps_event_idx on public.rsvps (event_id, created_at desc);

-- ---------------------------------------------------------------------
-- Paiements (SasPay)
-- ---------------------------------------------------------------------
create table public.payments (
  id                     uuid primary key default gen_random_uuid(),
  event_id               uuid not null references public.events (id) on delete cascade,
  user_id                uuid not null references public.profiles (id) on delete cascade,
  plan                   text not null check (plan in ('essentiel', 'celebration', 'prestige')),
  amount                 text not null,            -- chaîne décimale, ex. "4900.00"
  currency               text not null default 'XOF',
  status                 text not null default 'pending'
                           check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  saspay_session_id      text unique,
  saspay_transaction_id  text unique,
  checkout_url           text,
  created_at             timestamptz not null default now(),
  paid_at                timestamptz
);

create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_event_idx on public.payments (event_id);

-- Webhooks déjà traités (idempotence par data.id)
create table public.webhook_events (
  id          text primary key,
  event_type  text not null,
  payload     jsonb not null,
  status      text not null default 'processing' check (status in ('processing', 'done')),
  locked_at   timestamptz not null default now(),
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Usage de l'IA (limites et statistiques)
-- ---------------------------------------------------------------------
create table public.ai_usage (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  event_id   uuid references public.events (id) on delete set null,
  kind       text not null check (kind in ('text', 'image')),
  model      text not null,
  ok         boolean not null default true,
  created_at timestamptz not null default now()
);

create index ai_usage_user_idx on public.ai_usage (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Réglages du site (modifiables par l'administrateur)
-- ---------------------------------------------------------------------
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('show_sample_content', 'false'::jsonb),
  ('maintenance_message', '""'::jsonb);

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles       enable row level security;
alter table public.events         enable row level security;
alter table public.rsvps          enable row level security;
alter table public.payments       enable row level security;
alter table public.webhook_events enable row level security;
alter table public.ai_usage       enable row level security;
alter table public.app_settings   enable row level security;

-- profiles
create policy "profil : lecture de soi ou admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profil : modification de soi" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profil : admin modifie tout" on public.profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- L'organisateur ne peut pas changer son rôle : seules ces colonnes lui sont ouvertes
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- events
-- Pas de lecture publique directe : les invités passent par get_public_event(slug),
-- qui ne renvoie qu'une invitation à la fois, par son adresse exacte.
create policy "événement : lecture par le propriétaire ou admin" on public.events
  for select to authenticated using (owner_id = (select auth.uid()) or (select public.is_admin()));
create policy "événement : création par soi" on public.events
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "événement : modification par le propriétaire ou admin" on public.events
  for update to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()))
  with check (owner_id = (select auth.uid()) or (select public.is_admin()));
create policy "événement : suppression par le propriétaire ou admin" on public.events
  for delete to authenticated using (owner_id = (select auth.uid()) or (select public.is_admin()));

-- Les colonnes de formule ne sont modifiables que par le serveur (service role)
revoke insert, update on public.events from authenticated;
grant insert (slug, event_type, title, hosts, starts_at, venue, city, address, maps_url, message,
              program, dress_code, rsvp_deadline, contact_phone, language, theme, cover_image_url, status)
  on public.events to authenticated;
grant update (event_type, title, hosts, starts_at, venue, city, address, maps_url, message,
              program, dress_code, rsvp_deadline, contact_phone, language, theme, cover_image_url, status)
  on public.events to authenticated;

-- rsvps
-- Pas d'insertion directe de réponse : tout passe par submit_rsvp().
create policy "rsvp : lecture par le propriétaire de l'événement ou admin" on public.rsvps
  for select to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));
create policy "rsvp : suppression par le propriétaire de l'événement ou admin" on public.rsvps
  for delete to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));

-- payments : lecture seule pour l'utilisateur, écriture par le serveur uniquement
create policy "paiement : lecture par soi ou admin" on public.payments
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

-- webhook_events : aucun accès client (service role uniquement)

-- ai_usage
create policy "ia : lecture par soi ou admin" on public.ai_usage
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

-- app_settings
create policy "réglages : lecture publique" on public.app_settings
  for select to authenticated using (true);
create policy "réglages : modification admin" on public.app_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- =====================================================================
-- Fonctions publiques (invités) — exécutées avec les droits du propriétaire de la base
-- =====================================================================

-- Une invitation par son adresse exacte, avec une liste de colonnes explicite
create or replace function public.get_public_event(p_slug text)
returns table (
  id uuid, slug text, event_type text, title text, hosts text, starts_at timestamptz,
  venue text, city text, address text, maps_url text, message text, program jsonb,
  dress_code text, rsvp_deadline date, contact_phone text, language text, theme text,
  cover_image_url text, status text, plan text, plan_expires_at timestamptz, guest_limit integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.slug, e.event_type, e.title, e.hosts, e.starts_at,
         e.venue, e.city, e.address, e.maps_url, e.message, e.program,
         e.dress_code, e.rsvp_deadline, e.contact_phone, e.language, e.theme,
         e.cover_image_url, e.status, e.plan, e.plan_expires_at, e.guest_limit
  from public.events e
  where e.slug = p_slug and public.event_is_public(e)
$$;

-- Réponse d'un invité : vérifie la date limite, la limite d'invités (avec verrou) et le rythme
create or replace function public.submit_rsvp(
  p_slug text, p_name text, p_phone text, p_response text, p_guests integer, p_message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  ev public.events;
  n  integer;
begin
  select * into ev from public.events e where e.slug = p_slug for update;
  if not found or not public.event_is_public(ev) then
    raise exception 'event_unavailable' using errcode = 'P0001';
  end if;
  if ev.rsvp_deadline is not null and ev.rsvp_deadline < (now() at time zone 'utc')::date then
    raise exception 'rsvp_closed' using errcode = 'P0001';
  end if;
  select count(*) into n from public.rsvps r where r.event_id = ev.id and r.created_at > now() - interval '1 minute';
  if n >= 40 then
    raise exception 'too_many_requests' using errcode = 'P0001';
  end if;
  if ev.guest_limit is not null then
    select count(*) into n from public.rsvps r where r.event_id = ev.id;
    if n >= ev.guest_limit then
      raise exception 'guest_limit_reached' using errcode = 'P0001';
    end if;
  end if;
  insert into public.rsvps (event_id, name, phone, response, guests_count, message)
  values (ev.id, p_name, nullif(p_phone, ''), p_response, greatest(1, least(coalesce(p_guests, 1), 20)), nullif(p_message, ''));
end;
$$;

-- Appelées uniquement par le serveur (connexion propriétaire) : aucune exécution pour les autres rôles
revoke execute on function public.get_public_event(text) from public, authenticated;
revoke execute on function public.submit_rsvp(text, text, text, text, integer, text) from public, authenticated;

-- =====================================================================
-- Activation d'une formule : UNE transaction (paiement + événement), serveur uniquement
-- =====================================================================
create or replace function public.activate_payment(
  p_payment_id uuid, p_transaction_id text, p_guest_limit integer, p_months integer
)
returns text   -- slug de l'événement, ou null si le paiement était déjà traité
language plpgsql
security definer
set search_path = ''
as $$
declare
  pay public.payments;
  v_slug text;
begin
  update public.payments
     set status = 'paid', paid_at = now(), saspay_transaction_id = p_transaction_id
   where id = p_payment_id and status = 'pending'
   returning * into pay;
  if not found then
    return null;
  end if;

  update public.events e
     set plan = pay.plan,
         plan_expires_at = greatest(coalesce(e.plan_expires_at, now()), now()) + make_interval(months => p_months),
         guest_limit = p_guest_limit
   where e.id = pay.event_id
   returning e.slug into v_slug;
  return v_slug;
end;
$$;

revoke execute on function public.activate_payment(uuid, text, integer, integer) from public, authenticated;

-- =====================================================================
-- Droits de l'API de données (rôle « authenticated ») : strict minimum, filtré ensuite par la RLS
-- =====================================================================
grant usage on schema public to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.event_is_public(public.events) to authenticated;
grant select on public.profiles, public.events, public.rsvps, public.payments, public.ai_usage, public.app_settings to authenticated;
grant delete on public.events, public.rsvps to authenticated;
grant update on public.app_settings to authenticated;
