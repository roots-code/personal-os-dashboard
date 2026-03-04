"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

type HabitRow = {
  habit_name: string;
  date: string;
  completed: boolean;
};

const HABIT_NAMES = ["Gym", "Deep Work", "Reading", "Intermittent Fasting"];

function localDateString(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
}

function streakFromDates(today: string, completedDates: Set<string>) {
  let streak = 0;
  let current = new Date(`${today}T00:00:00`);

  while (true) {
    const key = localDateString(current);
    if (!completedDates.has(key)) break;
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export function HabitSummary() {
  const { user, loading: userLoading, error: userError } = useSupabaseUser();
  const [rows, setRows] = useState<HabitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const past60 = new Date();
      past60.setDate(past60.getDate() - 60);

      const { data, error } = await supabase
        .from("habits")
        .select("habit_name, date, completed")
        .eq("user_id", user.id)
        .gte("date", localDateString(past60));

      if (error) {
        setError(`Could not load habits: ${error.message}`);
        setLoading(false);
        return;
      }

      setRows((data ?? []) as HabitRow[]);
      setLoading(false);
    };

    void load();

    const channel = supabase
      .channel(`dashboard-habit-summary-${user.id}`)
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
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const items = useMemo(() => {
    const today = localDateString(new Date());

    return HABIT_NAMES.map((name) => {
      const matches = rows.filter((row) => row.habit_name === name);
      const completedToday = matches.some(
        (row) => row.date === today && row.completed
      );
      const completedDates = new Set(
        matches.filter((row) => row.completed).map((row) => row.date)
      );
      const streak = streakFromDates(today, completedDates);

      return { name, completedToday, streak };
    });
  }, [rows]);

  if (userLoading || loading) {
    return <p className="text-[11px] text-slate-400">Loading habits...</p>;
  }

  if (!user) {
    return <p className="text-[11px] text-slate-400">Login to view habits.</p>;
  }

  if (userError || error) {
    return <p className="text-[11px] text-red-400">{userError ?? error}</p>;
  }

  return (
    <ul className="space-y-2 text-xs md:text-sm">
      {items.map((habit) => (
        <li
          key={habit.name}
          className="flex items-center justify-between gap-3 rounded-lg bg-surfaceMuted px-3 py-2 border border-border/60"
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-4 w-4 rounded-full border ${
                habit.completedToday
                  ? "border-emerald-400 bg-emerald-400/20"
                  : "border-slate-600"
              }`}
            />
            <span>{habit.name}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {habit.streak} day streak
          </span>
        </li>
      ))}
    </ul>
  );
}
