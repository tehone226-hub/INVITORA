-- =====================================================================
-- Invitora — schéma initial
-- Règle 5 (CLAUDE.md) : RLS sur toutes les tables. Un organisateur ne voit
-- que ses événements ; le public peut seulement lire un événement publié
-- (et payé) et créer une réponse RSVP.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Profils (1 par compte Supabase Auth)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
  maps_url        text check (char_length(maps_url) <= 500),
  message         text check (char_length(message) <= 2000),
  program         jsonb not null default '[]'::jsonb,
  dress_code      text check (char_length(dress_code) <= 160),
  rsvp_deadline   date,
  contact_phone   text check (char_length(contact_phone) <= 30),
  language        text not null default 'fr' check (language in ('fr', 'mos', 'dyu')),
  theme           text not null default 'faso-dan-fani'
                    check (theme in ('faso-dan-fani', 'bogolan', 'tiebele', 'indigo')),
  cover_image_url text,
  status          text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  -- Colonnes réservées au serveur (paiement validé) : non modifiables par l'organisateur
  plan            text check (plan in ('essentiel', 'celebration', 'prestige')),
  plan_expires_at timestamptz,
  guest_limit     integer check (guest_limit is null or guest_limit > 0),
  image_generations integer not null default 0,
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
  select e.status = 'published' and e.plan_expires_at is not null and e.plan_expires_at > now();
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

-- Limite d'invités suivis selon la formule (garde-fou côté base)
create or replace function public.enforce_guest_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lim integer;
  n   integer;
begin
  select guest_limit into lim from public.events where id = new.event_id;
  if lim is not null then
    select count(*) into n from public.rsvps where event_id = new.event_id;
    if n >= lim then
      raise exception 'guest_limit_reached' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger rsvps_guest_limit
  before insert on public.rsvps
  for each row execute function public.enforce_guest_limit();

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
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone) on public.profiles to authenticated;

-- events
create policy "événement : public si publié et payé" on public.events
  for select to anon, authenticated using (public.event_is_public(events));
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
revoke insert, update on public.events from authenticated, anon;
grant insert (slug, event_type, title, hosts, starts_at, venue, city, address, maps_url, message,
              program, dress_code, rsvp_deadline, contact_phone, language, theme, cover_image_url, status)
  on public.events to authenticated;
grant update (event_type, title, hosts, starts_at, venue, city, address, maps_url, message,
              program, dress_code, rsvp_deadline, contact_phone, language, theme, cover_image_url, status)
  on public.events to authenticated;

-- rsvps
create policy "rsvp : le public répond à un événement public" on public.rsvps
  for insert to anon, authenticated
  with check (exists (select 1 from public.events e where e.id = event_id and public.event_is_public(e)));
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
  for select to anon, authenticated using (true);
create policy "réglages : modification admin" on public.app_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- =====================================================================
-- Temps réel : nouvelles réponses RSVP (filtré par RLS)
-- =====================================================================
alter publication supabase_realtime add table public.rsvps;

-- =====================================================================
-- Stockage : images d'invitation (lecture publique, écriture dans son dossier)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('invitations', 'invitations', true)
on conflict (id) do nothing;

create policy "stockage : dépôt dans son dossier" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'invitations' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "stockage : suppression dans son dossier" on storage.objects
  for delete to authenticated
  using (bucket_id = 'invitations' and (storage.foldername(name))[1] = (select auth.uid())::text);
