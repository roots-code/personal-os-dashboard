"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

type WorkoutRow = {
  exercise_name: string;
  muscle_group: string | null;
  workout_date: string;
};

function localDateString(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
}

export function TodayWorkout() {
  const { user, loading: userLoading, error: userError } = useSupabaseUser();
  const [rows, setRows] = useState<WorkoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const today = localDateString(new Date());
      const { data, error } = await supabase
        .from("workouts")
        .select("exercise_name, muscle_group, workout_date")
        .eq("user_id", user.id)
        .eq("workout_date", today)
        .order("created_at", { ascending: false });

      if (error) {
        setError(`Could not load today's workout: ${error.message}`);
        setLoading(false);
        return;
      }

      setRows((data ?? []) as WorkoutRow[]);
      setLoading(false);
    };

    void load();

    const channel = supabase
      .channel(`dashboard-today-workout-${user.id}`)
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

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const muscleGroups = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.muscle_group).filter(Boolean))).join(
        ", "
      ),
    [rows]
  );

  const topExercises = useMemo(
    () => rows.slice(0, 3).map((row) => row.exercise_name),
    [rows]
  );

  if (userLoading || loading) {
    return <p className="text-[11px] text-slate-400">Loading workout...</p>;
  }

  if (!user) {
    return <p className="text-[11px] text-slate-400">Login to view workouts.</p>;
  }

  if (userError || error) {
    return <p className="text-[11px] text-red-400">{userError ?? error}</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="text-[11px] text-slate-400">
        No workout logged for today yet.
      </p>
    );
  }

  return (
    <div className="space-y-2 text-xs md:text-sm">
      <p className="font-medium">Workout logged today</p>
      <p className="text-slate-400">{muscleGroups || "Mixed muscle groups"}</p>
      <ul className="list-disc list-inside text-slate-300 text-xs md:text-sm">
        {topExercises.map((lift) => (
          <li key={lift}>{lift}</li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-400 mt-1">
        {rows.length} exercises logged.
      </p>
    </div>
  );
}
