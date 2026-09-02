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
