"use client";

import { WorkoutLogger } from "@/components/workouts/WorkoutLogger";

export default function WorkoutsPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Workouts
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Plan and log your Push / Pull / Legs sessions.
          </p>
        </div>
      </header>
      <WorkoutLogger />
    </div>
  );
}

