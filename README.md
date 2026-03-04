## Personal OS Dashboard

**Personal productivity and fitness dashboard** built with **Next.js App Router**, **TailwindCSS**, **Supabase (Postgres + Auth)**, **Chart.js**, and **TypeScript**.

### App structure

- **`app/`**
  - `layout.tsx` – root layout with dark dashboard shell and sidebar navigation
  - `page.tsx` – redirects `/` → `/dashboard`
  - **`(auth)/login/page.tsx`** – Supabase email magic-link login
  - **`(protected)/dashboard/page.tsx`** – main dashboard (widgets)
  - **`(protected)/tasks/page.tsx`** – Kanban task manager
  - **`(protected)/workouts/page.tsx`** – workout planner & logger
  - **`(protected)/habits/page.tsx`** – habit tracker
  - **`(protected)/analytics/page.tsx`** – analytics with Chart.js
  - **`(protected)/settings/page.tsx`** – basic settings copy
- **`components/`**
  - `layout/DashboardCard.tsx` – reusable card wrapper
  - `dashboard/*` – dashboard widgets (schedule, task summary, workout, habits, score, weekly chart)
  - `tasks/TaskBoard.tsx` – Kanban board with drag & drop and Supabase backing
  - `workouts/WorkoutLogger.tsx` – Push/Pull/Legs templates + weekly stats
  - `habits/HabitChecklist.tsx` – daily checklist with streak-friendly schema
  - `analytics/AnalyticsCharts.tsx` – workout frequency, habit completion, tasks/day charts
- **`lib/supabaseClient.ts`** – browser Supabase client (anon key)
- **`supabase/schema.sql`** – full SQL schema + sample inserts
- **`scripts/seed.ts`** – Node seed script using service role key

### Database schema (Supabase/Postgres)

See `supabase/schema.sql` for full DDL and RLS policies. Summary:

- **`users`**
  - `id uuid primary key references auth.users(id)`
  - `display_name text`
  - `created_at timestamptz`
- **`tasks`**
  - `id uuid primary key default gen_random_uuid()`
  - `user_id uuid references users(id)`
  - `title text not null`
  - `description text`
  - `status task_status enum ('todo','in_progress','done')`
  - `priority task_priority enum ('low','medium','high')`
  - `due_date date`
  - `created_at timestamptz`
- **`workouts`**
  - `id uuid`, `user_id uuid`
  - `exercise_name`, `sets`, `reps`, `weight`, `muscle_group`
  - `workout_date date`
- **`habits`**
  - `id uuid`, `user_id uuid`
  - `habit_name text`, `date date`, `completed boolean`
  - unique index on (`user_id`,`habit_name`,`date`)

RLS policies restrict all tables so that users only see and modify their own rows (`auth.uid() = user_id` or `id`).

### Authentication

- Uses **Supabase email magic-link login** (`app/(auth)/login/page.tsx`).
- Client-side auth via `@supabase/supabase-js`, configured in `lib/supabaseClient.ts`.
- In production, you can upgrade to `@supabase/auth-helpers-nextjs` and server components for stricter session handling.

### Productivity score

- Displayed in `components/dashboard/ProductivityScore.tsx`.
- Currently calculated client-side from mocked values; you can wire this into real aggregates from Supabase using the same patterns as `AnalyticsCharts`.

### Seed data

- SQL-level example inserts live in `supabase/schema.sql` (commented).
- A **Node seed script** lives at `scripts/seed.ts` and uses a Supabase **service role key** and a `DEMO_USER_ID` to populate:
  - demo user
  - several tasks across `todo`, `in_progress`, `done`
  - a couple of workouts
  - daily habit rows for the core habits (Gym, Deep Work, Reading, IF)

### Setup instructions

1. **Install dependencies**

   ```bash
   cd personal-os-dashboard
   npm install
   ```

2. **Create a Supabase project**

   - Go to the Supabase dashboard.
   - Create a new project.
   - From **Project Settings → API**, copy:
     - Project URL
     - anon public key
     - service role key

3. **Apply database schema**

   - In Supabase, open the **SQL editor**.
   - Paste the contents of `supabase/schema.sql`.
   - Run it to create tables, enums, and RLS policies.

4. **Configure environment variables**

   - Copy `.env.example` → `.env.local`:

     ```bash
     cp .env.example .env.local
     ```

   - Fill in:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Create a test user from the Supabase Auth UI or by signing in once using the magic link.
   - Set `DEMO_USER_ID` in `.env.local` to that user’s `auth.users` UUID (can be copied from Supabase dashboard).

5. **Run seed script (optional but recommended)**

   ```bash
   npm run seed
   ```

   This will upsert the demo user into `public.users` and insert sample tasks, workouts, and habits.

6. **Run the app locally**

   ```bash
   npm run dev
   ```

   Then open `http://localhost:3000` in your browser. You’ll be redirected to `/dashboard`; if not authenticated, navigate to `/login` and request a magic-link.

### Commands

- **`npm run dev`** – start development server
- **`npm run build`** – production build
- **`npm start`** – run built app
- **`npm run lint`** – run ESLint
- **`npm run seed`** – seed example data into Supabase

### Notes / production readiness

- The UI is responsive and dark-theme-first, designed around a minimal dashboard aesthetic.
- All data-oriented components (`TaskBoard`, `WorkoutLogger`, `HabitChecklist`, `AnalyticsCharts`) use Supabase clients and typed models.
- For a stricter production posture, add:
  - middleware or layout-level auth guards using Supabase Auth Helpers
  - error boundaries and loading states per route segment
  - monitoring/logging around Supabase calls.

# personal-os-dashboard
