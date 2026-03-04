"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

type TaskRow = { status: "todo" | "in_progress" | "done" };
type HabitRow = { completed: boolean };

function localDateString(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
}

export function ProductivityScore() {
  const { user, loading: userLoading, error: userError } = useSupabaseUser();
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const today = localDateString(new Date());
      const [
        { data: tasks, error: tasksError },
        { data: workouts, error: workoutsError },
        { data: habits, error: habitsError }
      ] = await Promise.all([
        supabase.from("tasks").select("status").eq("user_id", user.id),
        supabase
          .from("workouts")
          .select("id")
          .eq("user_id", user.id)
          .eq("workout_date", today),
        supabase
          .from("habits")
          .select("completed")
          .eq("user_id", user.id)
          .eq("date", today)
      ]);

      if (tasksError || workoutsError || habitsError) {
        setError(
          tasksError?.message ??
            workoutsError?.message ??
            habitsError?.message ??
            "Could not load productivity score"
        );
        setLoading(false);
        return;
      }

      const taskRows = (tasks ?? []) as TaskRow[];
      const doneTasks = taskRows.filter((task) => task.status === "done").length;
      const taskScore =
        taskRows.length === 0 ? 0 : Math.round((doneTasks / taskRows.length) * 40);

      const workoutCount = (workouts ?? []).length;
      const workoutScore = Math.min(workoutCount * 10, 30);

      const habitRows = (habits ?? []) as HabitRow[];
      const completedHabits = habitRows.filter((habit) => habit.completed).length;
      const habitScore =
        habitRows.length === 0
          ? 0
          : Math.round((completedHabits / habitRows.length) * 30);

      setScore(Math.min(taskScore + workoutScore + habitScore, 100));
      setLoading(false);
    };

    void load();

    const tasksChannel = supabase
      .channel(`dashboard-productivity-tasks-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          void load();
        }
      )
      .subscribe();
    const workoutsChannel = supabase
      .channel(`dashboard-productivity-workouts-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workouts",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          void load();
        }
      )
      .subscribe();
    const habitsChannel = supabase
      .channel(`dashboard-productivity-habits-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "habits",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(tasksChannel);
      void supabase.removeChannel(workoutsChannel);
      void supabase.removeChannel(habitsChannel);
    };
  }, [user]);

  return (
    <div className="glass-panel px-4 py-2.5 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-accentSoft flex items-center justify-center">
        <Activity className="h-4 w-4 text-emerald-400" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
          Productivity Score
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold">
            {userLoading || loading ? "--" : score ?? 0}
          </span>
          <span className="text-[11px] text-slate-400">/ 100 today</span>
        </div>
        {(userError || error) && (
          <p className="text-[11px] text-red-400 mt-1">{userError ?? error}</p>
        )}
      </div>
    </div>
  );
}
