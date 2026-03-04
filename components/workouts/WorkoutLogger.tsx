"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

type Workout = {
  id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  muscle_group: string | null;
  workout_date: string;
};

type TemplateKey = "push" | "pull" | "legs";

const TEMPLATES: Record<
  TemplateKey,
  { name: string; exercises: { exercise_name: string; muscle_group: string }[] }
> = {
  push: {
    name: "Push",
    exercises: [
      { exercise_name: "Bench Press", muscle_group: "chest" },
      { exercise_name: "Overhead Press", muscle_group: "shoulders" },
      { exercise_name: "Cable Fly", muscle_group: "chest" }
    ]
  },
  pull: {
    name: "Pull",
    exercises: [
      { exercise_name: "Deadlift", muscle_group: "back" },
      { exercise_name: "Pull Ups", muscle_group: "back" },
      { exercise_name: "Barbell Row", muscle_group: "back" }
    ]
  },
  legs: {
    name: "Legs",
    exercises: [
      { exercise_name: "Squat", muscle_group: "legs" },
      { exercise_name: "Romanian Deadlift", muscle_group: "hamstrings" },
      { exercise_name: "Leg Press", muscle_group: "legs" }
    ]
  }
};

export function WorkoutLogger() {
  const { user, loading: userLoading, error: userError } = useSupabaseUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [template, setTemplate] = useState<TemplateKey>("push");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .gte("workout_date", sevenDaysAgo)
        .order("workout_date", { ascending: false });
      if (!error && data) setWorkouts(data as Workout[]);
      if (error) setError(`Could not load workouts: ${error.message}`);
      setLoading(false);
    };
    void load();
  }, [user]);

  const handleAddTemplate = async () => {
    if (!user) return;
    setError(null);
    const items = TEMPLATES[template].exercises.map((ex) => ({
      user_id: user.id,
      workout_date: date,
      exercise_name: ex.exercise_name,
      muscle_group: ex.muscle_group,
      sets: 4,
      reps: 8
    }));
    const { data, error } = await supabase
      .from("workouts")
      .insert(items)
      .select();
    if (!error && data) {
      setWorkouts((prev) => [...(data as Workout[]), ...prev]);
    } else if (error) {
      setError(`Could not add workout template: ${error.message}`);
    }
  };

  const weeklyCount = workouts.reduce<Record<string, number>>((acc, w) => {
    acc[w.workout_date] = (acc[w.workout_date] || 0) + 1;
    return acc;
  }, {});

  if (userLoading) {
    return <p className="text-xs text-slate-400">Loading your workouts…</p>;
  }

  if (!user) {
    return (
      <p className="text-xs text-slate-400">
        You need to be logged in to log workouts.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 glass-panel p-4 space-y-3">
        <h2 className="text-sm font-semibold">Log workout</h2>
        <label className="text-xs text-slate-300 space-y-1 block">
          Date
          <input
            type="date"
            className="w-full rounded-lg bg-surfaceMuted border border-border/70 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-accent"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="text-xs text-slate-300 space-y-1 block">
          Template
          <select
            className="w-full rounded-lg bg-surfaceMuted border border-border/70 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-accent"
            value={template}
            onChange={(e) => setTemplate(e.target.value as TemplateKey)}
          >
            <option value="push">Push</option>
            <option value="pull">Pull</option>
            <option value="legs">Legs</option>
          </select>
        </label>
        <button
          onClick={handleAddTemplate}
          className="w-full mt-2 px-4 py-2 rounded-lg bg-accent text-xs font-medium hover:bg-accent/90"
        >
          Add template to log
        </button>
        {(userError || error) && (
          <p className="text-xs text-red-400">{userError ?? error}</p>
        )}
        <p className="text-[11px] text-slate-500 mt-1">
          Templates add a set of pre-defined exercises you can progressively overload over time.
        </p>
      </div>
      <div className="lg:col-span-2 glass-panel p-4">
        <h2 className="text-sm font-semibold mb-2">Last 7 days</h2>
        {loading ? (
          <p className="text-xs text-slate-400">Loading workouts…</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(weeklyCount).length === 0 && (
              <p className="text-xs text-slate-400">
                No workouts logged yet. Start by adding a template.
              </p>
            )}
            {Object.entries(weeklyCount)
              .sort(([a], [b]) => (a < b ? 1 : -1))
              .map(([d, count]) => (
                <div
                  key={d}
                  className="flex items-center justify-between rounded-lg bg-surfaceMuted border border-border/60 px-3 py-2 text-xs"
                >
                  <span>{d}</span>
                  <span className="text-slate-400">{count} exercises</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
