"use client";

import { HabitChecklist } from "@/components/habits/HabitChecklist";

export default function HabitsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Habits
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Track daily habits and streaks across Gym, Deep Work, Reading, and IF.
        </p>
      </header>
      <HabitChecklist />
    </div>
  );
}

