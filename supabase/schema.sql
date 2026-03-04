-- Users table (mirrors Supabase auth.users via foreign key)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default timezone('utc'::text, now())
);

-- Tasks
create type public.task_status as enum ('todo', 'in_progress', 'done');
create type public.task_priority as enum ('low', 'medium', 'high');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_date date,
  created_at timestamptz default timezone('utc'::text, now())
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (status);

-- Workouts
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  exercise_name text not null,
  sets int,
  reps int,
  weight numeric,
  muscle_group text,
  workout_date date not null default current_date,
  created_at timestamptz default timezone('utc'::text, now())
);

create index if not exists workouts_user_id_idx on public.workouts (user_id);
create index if not exists workouts_date_idx on public.workouts (workout_date);

-- Habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  habit_name text not null,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now())
);

create unique index if not exists habits_user_name_date_idx
  on public.habits (user_id, habit_name, date);

-- Basic RLS policies (assuming row level security is enabled on each table)
alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.workouts enable row level security;
alter table public.habits enable row level security;

create policy "Users can view and manage their own profile"
  on public.users
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can manage their own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own workouts"
  on public.workouts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own habits"
  on public.habits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed data for development (replace user UUID with a real one)
-- select auth.uid() in SQL editor after logging in as a test user
-- and paste its value below.

-- example:
-- insert into public.users (id, display_name)
-- values ('00000000-0000-0000-0000-000000000000', 'Demo User')
-- on conflict (id) do update set display_name = excluded.display_name;

-- insert into public.tasks (user_id, title, description, status, priority, due_date)
-- values
-- ('00000000-0000-0000-0000-000000000000', 'Plan week in Notion', 'Outline key projects and focus blocks.', 'todo', 'high', current_date),
-- ('00000000-0000-0000-0000-000000000000', 'Push workout', 'Bench, overhead press, accessories.', 'in_progress', 'high', current_date),
-- ('00000000-0000-0000-0000-000000000000', 'Inbox zero', 'Clear email + Slack', 'done', 'medium', current_date - 1);

-- insert into public.workouts (user_id, exercise_name, sets, reps, weight, muscle_group, workout_date)
-- values
-- ('00000000-0000-0000-0000-000000000000', 'Bench press', 4, 6, 80, 'chest', current_date),
-- ('00000000-0000-0000-0000-000000000000', 'Overhead press', 3, 8, 40, 'shoulders', current_date),
-- ('00000000-0000-0000-0000-000000000000', 'Barbell row', 4, 8, 70, 'back', current_date - 1);

-- insert into public.habits (user_id, habit_name, date, completed)
-- values
-- ('00000000-0000-0000-0000-000000000000', 'Gym', current_date, true),
-- ('00000000-0000-0000-0000-000000000000', 'Deep Work', current_date, true),
-- ('00000000-0000-0000-0000-000000000000', 'Reading', current_date, false),
-- ('00000000-0000-0000-0000-000000000000', 'Intermittent Fasting', current_date, true);

