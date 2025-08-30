-- Create asset projects table
create table if not exists public.asset_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  style_reference_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.asset_projects enable row level security;

-- RLS policies for asset projects
create policy "asset_projects_select_own"
  on public.asset_projects for select
  using (auth.uid() = user_id);

create policy "asset_projects_insert_own"
  on public.asset_projects for insert
  with check (auth.uid() = user_id);

create policy "asset_projects_update_own"
  on public.asset_projects for update
  using (auth.uid() = user_id);

create policy "asset_projects_delete_own"
  on public.asset_projects for delete
  using (auth.uid() = user_id);
