-- Cal-Kie workout plans. Apply this migration to the SAME Supabase project as TrackCake.
-- TrackCake tables and migration history remain unchanged.
create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  title text not null default 'My workout week',
  plan_data jsonb not null check (jsonb_typeof(plan_data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_plans_user_week_unique unique (user_id, week_start)
);

create index if not exists workout_plans_user_updated_idx
  on public.workout_plans (user_id, updated_at desc);

alter table public.workout_plans enable row level security;

drop policy if exists "Users can read their own workout plans" on public.workout_plans;
create policy "Users can read their own workout plans"
  on public.workout_plans for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own workout plans" on public.workout_plans;
create policy "Users can create their own workout plans"
  on public.workout_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own workout plans" on public.workout_plans;
create policy "Users can update their own workout plans"
  on public.workout_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own workout plans" on public.workout_plans;
create policy "Users can delete their own workout plans"
  on public.workout_plans for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.workout_plans to authenticated;

create or replace function public.calkie_workout_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.calkie_workout_set_updated_at() from public, anon, authenticated;
drop trigger if exists workout_plans_set_updated_at on public.workout_plans;
create trigger workout_plans_set_updated_at
before update on public.workout_plans
for each row execute function public.calkie_workout_set_updated_at();
