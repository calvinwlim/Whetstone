-- Whetstone progress storage.
--
-- One row per user holding the whole ProgressState blob. The reducer in
-- src/lib/progress.ts already produces a serialisable object, so this needs no
-- mapping layer. If per-attempt SQL querying is ever wanted, this blob contains
-- everything needed to backfill relational tables later.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security is what makes the anon key safe to ship to the browser.
-- Without it, anyone holding that key could read every user's row.
alter table public.progress enable row level security;

-- `using` governs which rows are visible to reads, updates and deletes.
-- `with check` governs what may be written. Both are required: without the
-- check, a user could write a row belonging to somebody else.
drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at honest without trusting the client to send it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists progress_touch_updated_at on public.progress;
create trigger progress_touch_updated_at
  before update on public.progress
  for each row
  execute function public.touch_updated_at();

-- Newer Supabase projects do not grant table privileges to the API roles by
-- default, so enabling RLS is not sufficient on its own: without this, a
-- signed-in user gets "permission denied for table progress" (42501) before
-- any policy is even consulted. Only `authenticated` is granted -- `anon` has
-- no business reading progress, and the policy above is scoped to
-- authenticated regardless. RLS still decides which rows are visible.
grant select, insert, update, delete on public.progress to authenticated;

-- ---------------------------------------------------------------------------
-- Leaderboard
--
-- Deliberately a second, narrow table rather than a view over `progress`.
-- A board has to be readable by everyone who is signed in, and the only way to
-- make that obviously safe is for the readable table to hold nothing but the
-- columns intended to be public. The progress blob -- every answer, every
-- schedule -- stays owner-only, and no policy mistake here can expose it.
--
-- Presence of a row IS the opt-in. No row means not listed; switching the
-- setting off deletes the row rather than flagging it, so a person who opts
-- out leaves no trace behind. Storage is a few dozen bytes per participant and
-- there is no history, which keeps this affordable on a free database.
--
-- Trust model: these numbers are written by the client, so they are only as
-- honest as the browser reporting them. Verifying them server-side would mean
-- storing every attempt, which is exactly the cost this table exists to avoid.

create table if not exists public.leaderboard (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text        not null
    check (char_length(trim(display_name)) between 2 and 24),
  total_xp     integer     not null default 0 check (total_xp >= 0),
  streak       integer     not null default 0 check (streak >= 0),
  answered     integer     not null default 0 check (answered >= 0),
  accuracy     real        check (accuracy >= 0 and accuracy <= 1),
  updated_at   timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

-- Two policies, OR'd: everyone signed in may read the board, but writes are
-- restricted to your own row.
drop policy if exists "leaderboard readable by members" on public.leaderboard;
create policy "leaderboard readable by members" on public.leaderboard
  for select
  to authenticated
  using (true);

drop policy if exists "own leaderboard row" on public.leaderboard;
create policy "own leaderboard row" on public.leaderboard
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ranking is by XP or by streak, so neither ordering has to sort the table.
create index if not exists leaderboard_total_xp_idx
  on public.leaderboard (total_xp desc);
create index if not exists leaderboard_streak_idx
  on public.leaderboard (streak desc);

drop trigger if exists leaderboard_touch_updated_at on public.leaderboard;
create trigger leaderboard_touch_updated_at
  before update on public.leaderboard
  for each row
  execute function public.touch_updated_at();

grant select, insert, update, delete on public.leaderboard to authenticated;
