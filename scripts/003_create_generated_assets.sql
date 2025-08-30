-- Create generated assets table
create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.asset_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  image_url text not null,
  parameters jsonb default '{}',
  status text not null default 'completed' check (status in ('pending', 'generating', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.generated_assets enable row level security;

-- RLS policies for generated assets
create policy "generated_assets_select_own"
  on public.generated_assets for select
  using (auth.uid() = user_id);

create policy "generated_assets_insert_own"
  on public.generated_assets for insert
  with check (auth.uid() = user_id);

create policy "generated_assets_update_own"
  on public.generated_assets for update
  using (auth.uid() = user_id);

create policy "generated_assets_delete_own"
  on public.generated_assets for delete
  using (auth.uid() = user_id);
