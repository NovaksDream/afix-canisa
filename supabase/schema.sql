-- Afix · structura bazei de date Supabase (pasul 1)
-- Rulează tot fișierul o singură dată în Supabase: SQL Editor → New query → Run.
--
-- Etapa 1 păstrează datele canisei ca un singur document JSON per utilizator,
-- exact cum le folosește aplicația acum. Pozele stau separat, în Storage.
-- Mai târziu le putem împărți în tabele (câini, cuiburi, pui) pentru rapoarte.

-- ---------------------------------------------------------------
-- 1. Datele canisei: un rând per utilizator, vizibil doar pentru el
-- ---------------------------------------------------------------
create table if not exists public.kennel_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.kennel_state enable row level security;

create policy "Fiecare își vede doar canisa"
  on public.kennel_state for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Fiecare își creează doar canisa"
  on public.kennel_state for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Fiecare își modifică doar canisa"
  on public.kennel_state for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Fiecare își șterge doar canisa"
  on public.kennel_state for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------
-- 2. Transferurile de fișe către noii proprietari
--    Conținutul e criptat în browser cu codul de transfer; serverul
--    vede doar textul criptat. id = amprenta codului (nu codul însuși).
-- ---------------------------------------------------------------
create table if not exists public.transfers (
  id          text primary key,
  ciphertext  text not null,
  iv          text not null,
  payer       text not null check (payer in ('owner', 'breeder')),
  paid        boolean not null default false,
  created_by  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  claimed_by  uuid references auth.users (id) on delete set null,
  claimed_at  timestamptz
);

alter table public.transfers enable row level security;

-- Crescătorul își vede și își creează doar transferurile proprii.
create policy "Crescătorul își vede transferurile"
  on public.transfers for select
  to authenticated
  using ((select auth.uid()) = created_by);

create policy "Crescătorul creează transferuri"
  on public.transfers for insert
  to authenticated
  with check ((select auth.uid()) = created_by and paid = false and claimed_at is null);

-- Noul proprietar NU poate lista transferurile. Le citește doar
-- cunoscând id-ul (care se obține numai din cod), prin funcția de mai jos.
create or replace function public.get_transfer(p_id text)
returns table (id text, ciphertext text, iv text, payer text, paid boolean, claimed_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select t.id, t.ciphertext, t.iv, t.payer, t.paid, t.claimed_at
  from public.transfers t
  where t.id = p_id and auth.uid() is not null;
$$;

-- Setări generale ale aplicației, citite doar de funcțiile serverului.
-- require_payment = false cât timp plățile online nu sunt încă legate;
-- se trece pe true când procesatorul de plăți confirmă automat plățile:
--   update public.app_settings set value = 'true' where key = 'require_payment';
create table if not exists public.app_settings (
  key   text primary key,
  value jsonb not null
);
alter table public.app_settings enable row level security;
insert into public.app_settings (key, value) values ('require_payment', 'false')
on conflict (key) do nothing;

-- Activarea: reușește o singură dată. Plata e confirmată separat,
-- de procesatorul de plăți (pasul cu plăți), care setează paid = true.
create or replace function public.claim_transfer(p_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  if auth.uid() is null then
    return false;
  end if;
  update public.transfers
     set claimed_by = auth.uid(), claimed_at = now()
   where id = p_id
     and claimed_at is null
     and (paid or payer = 'breeder'
          or coalesce((select value::text::boolean from public.app_settings where key = 'require_payment'), true) = false)
  returning true into ok;
  return coalesce(ok, false);
end;
$$;

revoke all on function public.get_transfer(text) from public, anon;
revoke all on function public.claim_transfer(text) from public, anon;
grant execute on function public.get_transfer(text) to authenticated;
grant execute on function public.claim_transfer(text) to authenticated;

-- ---------------------------------------------------------------
-- 3. Pozele (pedigree, documente, câini): un dosar per utilizator
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "Fiecare își vede pozele"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Fiecare își urcă pozele"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Fiecare își înlocuiește pozele"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Fiecare își șterge pozele"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
