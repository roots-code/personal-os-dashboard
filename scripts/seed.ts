import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoUserId = process.env.DEMO_USER_ID;

if (!url || !serviceKey || !demoUserId) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or DEMO_USER_ID in environment."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  // Upsert demo user
  await supabase
    .from("users")
    .upsert({ id: demoUserId, display_name: "Demo User" });

  // Seed tasks
  await supabase.from("tasks").insert([
    {
      user_id: demoUserId,
      title: "Plan week in Personal OS",
      description: "Outline key projects, blocks, and constraints.",
      status: "todo",
      priority: "high",
      due_date: new Date().toISOString().slice(0, 10)
    },
    {
      user_id: demoUserId,
      title: "Deep work block",
      description: "3 hours of focused work on primary project.",
      status: "in_progress",
      priority: "high",
      due_date: new Date().toISOString().slice(0, 10)
    },
    {
      user_id: demoUserId,
      title: "Inbox zero",
      description: "Clear email and Slack.",
      status: "done",
      priority: "medium",
      due_date: new Date().toISOString().slice(0, 10)
    }
  ]);

  // Seed workouts
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from("workouts").insert([
    {
      user_id: demoUserId,
      exercise_name: "Bench Press",
      sets: 4,
      reps: 6,
      weight: 80,
      muscle_group: "chest",
      workout_date: today
    },
    {
      user_id: demoUserId,
      exercise_name: "Squat",
      sets: 5,
      reps: 5,
      weight: 100,
      muscle_group: "legs",
      workout_date: today
    }
  ]);

  // Seed habits
  await supabase.from("habits").insert([
    { user_id: demoUserId, habit_name: "Gym", date: today, completed: true },
    {
      user_id: demoUserId,
      habit_name: "Deep Work",
      date: today,
      completed: true
    },
    {
      user_id: demoUserId,
      habit_name: "Reading",
      date: today,
      completed: false
    },
    {
      user_id: demoUserId,
      habit_name: "Intermittent Fasting",
      date: today,
      completed: true
    }
  ]);
}

main()
  // eslint-disable-next-line no-console
  .then(() => console.log("Seed completed"))
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));

