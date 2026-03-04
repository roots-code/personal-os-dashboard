"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

type HabitRow = {
  id: string;
  habit_name: string;
  date: string;
  completed: boolean;
};

const HABIT_NAMES = ["Gym", "Deep Work", "Reading", "Intermittent Fasting"];

export function HabitChecklist() {
  const { user, loading: userLoading } = useSupabaseUser();
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [items, setItems] = useState<Record<string, HabitRow | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date);
      if (!error && data) {
        const byName: Record<string, HabitRow | null> = {};
        HABIT_NAMES.forEach((name) => {
          byName[name] =
            (data as HabitRow[]).find((h) => h.habit_name === name) ?? null;
        });
        setItems(byName);
      }
      setLoading(false);
    };
    void load();
  }, [date, user]);

  const toggleHabit = async (habitName: string) => {
    if (!user) return;
    const existing = items[habitName];
    if (existing) {
      const { data } = await supabase
        .from("habits")
        .update({ completed: !existing.completed })
        .eq("id", existing.id)
        .select()
        .single();
      setItems((prev) => ({ ...prev, [habitName]: data as HabitRow }));
    } else {
      const { data } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          habit_name: habitName,
          date,
          completed: true
        })
        .select()
        .single();
      setItems((prev) => ({ ...prev, [habitName]: data as HabitRow }));
    }
  };

  const completedCount = HABIT_NAMES.filter(
    (name) => items[name]?.completed
  ).length;

  if (userLoading) {
    return <p className="text-xs text-slate-400">Loading your habits…</p>;
  }

  if (!user) {
    return (
      <p className="text-xs text-slate-400">
        You need to be logged in to track habits.
      </p>
    );
  }

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-slate-300 space-y-1">
          Date
          <input
            type="date"
            className="block rounded-lg bg-surfaceMuted border border-border/70 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-accent"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <div className="text-right">
          <p className="text-xs text-slate-400">Completion</p>
          <p className="text-sm font-semibold">
            {completedCount} / {HABIT_NAMES.length}
          </p>
        </div>
      </div>
      {loading ? (
        <p className="text-xs text-slate-400">Loading habits…</p>
      ) : (
        <ul className="space-y-2 text-xs md:text-sm">
          {HABIT_NAMES.map((name) => {
            const row = items[name];
            const completed = row?.completed ?? false;
            return (
              <li
                key={name}
                className="flex items-center justify-between gap-3 rounded-lg bg-surfaceMuted border border-border/60 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => toggleHabit(name)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`inline-flex h-4 w-4 rounded-full border ${
                      completed
                        ? "border-emerald-400 bg-emerald-400/20"
                        : "border-slate-600"
                    }`}
                  />
                  <span>{name}</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  {completed ? "Done" : "Pending"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

