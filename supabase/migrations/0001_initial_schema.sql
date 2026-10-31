-- EVENTORA initial schema. Apply with Supabase CLI or SQL editor.
create extension if not exists pgcrypto;

create type public.event_type as enum ('wedding','birthday','community','corporate','other');
create type public.member_role as enum ('owner','admin','editor','viewer');
create type public.task_priority as enum ('low','medium','high');
create type public.task_status as enum ('todo','in_progress','done');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 120),
  event_type public.event_type not null,
  event_date date not null,
  location text not null check (char_length(location) between 2 and 160),
  guest_count integer not null check (guest_count >= 0),
  budget_minor bigint not null check (budget_minor >= 0),
  currency char(3) not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  preferences text not null default '' check (char_length(preferences) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_owner_date_idx on public.events(owner_id, event_date);

create table public.event_members (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key(event_id,user_id)
);
create index event_members_user_idx on public.event_members(user_id,event_id);

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  planned_minor bigint not null check (planned_minor >= 0),
  created_at timestamptz not null default now()
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  category_id uuid references public.budget_categories(id) on delete set null,
  description text not null check (char_length(description) between 1 and 200),
  amount_minor bigint not null check (amount_minor >= 0),
  spent_on date not null default current_date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index expenses_event_idx on public.expenses(event_id,spent_on);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  due_date date,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index tasks_event_due_idx on public.tasks(event_id,due_date);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 80),
  contact_email text,
  contact_phone text,
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);
create table public.vendor_quotes (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  quote_notes text check (char_length(quote_notes) <= 2000),
  valid_until date,
  created_at timestamptz not null default now()
);

create table public.risk_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  risk text not null check (char_length(risk) between 1 and 160),
  mitigation text not null check (char_length(mitigation) between 1 and 500),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (char_length(provider) <= 80),
  model text not null check (char_length(model) <= 120),
  output jsonb not null,
  created_at timestamptz not null default now()
);
create index ai_generations_user_idx on public.ai_generations(user_id,created_at desc);

-- Helper checks event ownership or membership without trusting client-supplied user IDs.
create or replace function public.can_access_event(target_event uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.events e where e.id = target_event and e.owner_id = auth.uid())
  or exists(select 1 from public.event_members m where m.event_id = target_event and m.user_id = auth.uid());
$$;
revoke all on function public.can_access_event(uuid) from public;
grant execute on function public.can_access_event(uuid) to authenticated;

create or replace function public.can_edit_event(target_event uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.events e where e.id = target_event and e.owner_id = auth.uid())
  or exists(select 1 from public.event_members m where m.event_id = target_event and m.user_id = auth.uid() and m.role in ('admin','editor'));
$$;
revoke all on function public.can_edit_event(uuid) from public;
grant execute on function public.can_edit_event(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.budget_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.tasks enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_quotes enable row level security;
alter table public.risk_items enable row level security;
alter table public.ai_generations enable row level security;

create policy "profiles_select_self" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (id = auth.uid());

create policy "events_select_member" on public.events for select to authenticated using (owner_id = auth.uid() or public.can_access_event(id));
create policy "events_insert_owner" on public.events for insert to authenticated with check (owner_id = auth.uid());
create policy "events_update_owner" on public.events for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "events_delete_owner" on public.events for delete to authenticated using (owner_id = auth.uid());

create policy "members_select_event" on public.event_members for select to authenticated using (user_id = auth.uid() or public.can_access_event(event_id));
-- Membership management intentionally owner-only; invite flow must be implemented server-side with role checks.
create policy "members_insert_owner" on public.event_members for insert to authenticated with check (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));
create policy "members_delete_owner" on public.event_members for delete to authenticated using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));

create policy "budget_read" on public.budget_categories for select to authenticated using (public.can_access_event(event_id));
create policy "budget_write" on public.budget_categories for all to authenticated using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id));
create policy "expenses_read" on public.expenses for select to authenticated using (public.can_access_event(event_id));
create policy "expenses_insert" on public.expenses for insert to authenticated with check (public.can_edit_event(event_id) and created_by = auth.uid());
create policy "expenses_update" on public.expenses for update to authenticated using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id));
create policy "expenses_delete" on public.expenses for delete to authenticated using (public.can_edit_event(event_id));
create policy "tasks_read" on public.tasks for select to authenticated using (public.can_access_event(event_id));
create policy "tasks_write" on public.tasks for all to authenticated using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id));
create policy "vendors_read" on public.vendors for select to authenticated using (public.can_access_event(event_id));
create policy "vendors_write" on public.vendors for all to authenticated using (public.can_edit_event(event_id)) with check (public.can_edit_event(event_id));
create policy "quotes_read" on public.vendor_quotes for select to authenticated using (exists(select 1 from public.vendors v where v.id = vendor_id and public.can_access_event(v.event_id)));
create policy "quotes_write" on public.vendor_quotes for all to authenticated using (exists(select 1 from public.vendors v where v.id = vendor_id and public.can_edit_event(v.event_id))) with check (exists(select 1 from public.vendors v where v.id = vendor_id and public.can_edit_event(v.event_id)));
create policy "risks_access" on public.risk_items for all to authenticated using (public.can_access_event(event_id)) with check (public.can_access_event(event_id));
create policy "ai_generations_access" on public.ai_generations for all to authenticated using (user_id = auth.uid() and (event_id is null or public.can_access_event(event_id))) with check (user_id = auth.uid() and (event_id is null or public.can_access_event(event_id)));

-- Authenticated users receive only the table privileges needed by the app; RLS remains mandatory.
grant select, insert, update, delete on public.events, public.event_members, public.budget_categories, public.expenses, public.tasks, public.vendors, public.vendor_quotes, public.risk_items, public.ai_generations to authenticated;
grant select, insert, update on public.profiles to authenticated;
