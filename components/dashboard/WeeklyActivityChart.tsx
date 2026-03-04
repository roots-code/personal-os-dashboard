"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

type TaskRow = { created_at: string };
type WorkoutRow = { workout_date: string };
type HabitRow = { date: string; completed: boolean };

function localDateString(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
}

function buildLast7Days() {
  const days: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = localDateString(date);
    const label = date.toLocaleDateString(undefined, { weekday: "short" });
    days.push({ key, label });
  }
  return days;
}

export function WeeklyActivityChart() {
  const { user, loading: userLoading, error: userError } = useSupabaseUser();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [habits, setHabits] = useState<HabitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 6);
      const cutoffDate = localDateString(cutoff);
      const cutoffIso = `${cutoffDate}T00:00:00.000Z`;

      const [
        { data: taskRows, error: taskError },
        { data: workoutRows, error: workoutError },
        { data: habitRows, error: habitError }
      ] = await Promise.all([
        supabase
          .from("tasks")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", cutoffIso),
        supabase
          .from("workouts")
          .select("workout_date")
          .eq("user_id", user.id)
          .gte("workout_date", cutoffDate),
        supabase
          .from("habits")
          .select("date, completed")
          .eq("user_id", user.id)
          .gte("date", cutoffDate)
      ]);

      if (taskError || workoutError || habitError) {
        setError(
          taskError?.message ??
            workoutError?.message ??
            habitError?.message ??
            "Could not load weekly activity"
        );
        setLoading(false);
        return;
      }

      setTasks((taskRows ?? []) as TaskRow[]);
      setWorkouts((workoutRows ?? []) as WorkoutRow[]);
      setHabits((habitRows ?? []) as HabitRow[]);
      setLoading(false);
    };

    void load();

    const tasksChannel = supabase
      .channel(`dashboard-weekly-tasks-${user.id}`)
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
      .channel(`dashboard-weekly-workouts-${user.id}`)
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
      .channel(`dashboard-weekly-habits-${user.id}`)
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

  const series = useMemo(() => {
    const days = buildLast7Days();

    const taskCounts: Record<string, number> = {};
    tasks.forEach((row) => {
      const key = row.created_at.slice(0, 10);
      taskCounts[key] = (taskCounts[key] || 0) + 1;
    });

    const workoutCounts: Record<string, number> = {};
    workouts.forEach((row) => {
      workoutCounts[row.workout_date] = (workoutCounts[row.workout_date] || 0) + 1;
    });

    const habitCounts: Record<string, number> = {};
    habits.forEach((row) => {
      if (!row.completed) return;
      habitCounts[row.date] = (habitCounts[row.date] || 0) + 1;
    });

    return {
      labels: days.map((day) => day.label),
      tasks: days.map((day) => taskCounts[day.key] || 0),
      workouts: days.map((day) => workoutCounts[day.key] || 0),
      habits: days.map((day) => habitCounts[day.key] || 0)
    };
  }, [habits, tasks, workouts]);

  if (userLoading || loading) {
    return <p className="text-[11px] text-slate-400">Loading weekly activity...</p>;
  }

  if (!user) {
    return <p className="text-[11px] text-slate-400">Login to view activity.</p>;
  }

  if (userError || error) {
    return <p className="text-[11px] text-red-400">{userError ?? error}</p>;
  }

  const data = {
    labels: series.labels,
    datasets: [
      {
        label: "Tasks",
        data: series.tasks,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.4,
        fill: true
      },
      {
        label: "Workouts",
        data: series.workouts,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.18)",
        tension: 0.4,
        fill: true
      },
      {
        label: "Habits",
        data: series.habits,
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.18)",
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: "index" as const,
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#9ca3af",
          font: { size: 10 }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: { size: 9 },
          stepSize: 2
        },
        grid: {
          color: "rgba(55, 65, 81, 0.5)"
        }
      }
    }
  };

  return (
    <div className="h-40">
      <Line data={data} options={options} />
    </div>
  );
}
