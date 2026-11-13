-- Run in the Supabase SQL Editor. Public signup should remain disabled in Auth settings.
create extension if not exists pgcrypto;
create table if not exists public.content (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
 kind text not null check (kind in ('article','teaching','project','engineering','publication')),
 status text not null default 'draft' check (status in ('draft','published','archived')),
 excerpt text not null default '', body_markdown text not null default '',
 cover_image_path text, seo_title text, seo_description text, tags text[] not null default '{}',
 created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), published_at timestamptz
);
alter table public.content enable row level security;
-- Anonymous visitors can read only published content.
drop policy if exists "Public can read published content" on public.content;
create policy "Public can read published content" on public.content for select to anon, authenticated using (status = 'published');
-- Owner policies: replace UUID below with the UUID for udomaifiok0@gmail.com from Supabase Auth users.
-- Do not execute this block with the placeholder unchanged.
-- create policy "Owner can read all content" on public.content for select to authenticated using (auth.uid() = 'YOUR_OWNER_AUTH_USER_UUID'::uuid);
-- create policy "Owner can create content" on public.content for insert to authenticated with check (auth.uid() = 'YOUR_OWNER_AUTH_USER_UUID'::uuid);
-- create policy "Owner can update content" on public.content for update to authenticated using (auth.uid() = 'YOUR_OWNER_AUTH_USER_UUID'::uuid) with check (auth.uid() = 'YOUR_OWNER_AUTH_USER_UUID'::uuid);
-- create policy "Owner can delete content" on public.content for delete to authenticated using (auth.uid() = 'YOUR_OWNER_AUTH_USER_UUID'::uuid);
