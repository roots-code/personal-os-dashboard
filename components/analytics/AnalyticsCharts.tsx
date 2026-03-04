"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { supabase } from "@/lib/supabaseClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Aggregates = {
  tasksPerDay: Record<string, number>;
  workoutsPerWeek: Record<string, number>;
  habitsCompletion: Record<string, { completed: number; total: number }>;
};

export function AnalyticsCharts() {
  const [agg, setAgg] = useState<Aggregates | null>(null);

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const past30Iso = past30.toISOString();

      const [{ data: tasks }, { data: workouts }, { data: habits }] =
        await Promise.all([
          supabase
            .from("tasks")
            .select("created_at, status")
            .gte("created_at", past30Iso),
          supabase
            .from("workouts")
            .select("workout_date")
            .gte("workout_date", past30Iso),
          supabase
            .from("habits")
            .select("habit_name, date, completed")
            .gte("date", past30Iso)
        ]);

      const tasksPerDay: Record<string, number> = {};
      (tasks ?? []).forEach((t: any) => {
        if (t.status !== "done") return;
        const key = t.created_at.slice(0, 10);
        tasksPerDay[key] = (tasksPerDay[key] || 0) + 1;
      });

      const workoutsPerWeek: Record<string, number> = {};
      (workouts ?? []).forEach((w: any) => {
        const d = new Date(w.workout_date);
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (d.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000);
        const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        const key = `${d.getFullYear()}-W${week}`;
        workoutsPerWeek[key] = (workoutsPerWeek[key] || 0) + 1;
      });

      const habitsCompletion: Aggregates["habitsCompletion"] = {};
      (habits ?? []).forEach((h: any) => {
        const key = h.date;
        const bucket =
          habitsCompletion[key] || ({ completed: 0, total: 0 } as const);
        habitsCompletion[key] = {
          completed: bucket.completed + (h.completed ? 1 : 0),
          total: bucket.total + 1
        };
      });

      setAgg({ tasksPerDay, workoutsPerWeek, habitsCompletion });
    };
    load();
  }, []);

  if (!agg) {
    return <p className="text-xs text-slate-400">Loading analytics…</p>;
  }

  const taskLabels = Object.keys(agg.tasksPerDay).sort();
  const workoutLabels = Object.keys(agg.workoutsPerWeek).sort();
  const habitLabels = Object.keys(agg.habitsCompletion).sort();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="glass-panel p-4">
        <h2 className="text-sm font-semibold mb-2">Tasks completed / day</h2>
        <div className="h-44">
          <Bar
            data={{
              labels: taskLabels,
              datasets: [
                {
                  label: "Tasks",
                  data: taskLabels.map((d) => agg.tasksPerDay[d]),
                  backgroundColor: "#4f46e5"
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  ticks: { color: "#9ca3af", font: { size: 9 } },
                  grid: { display: false }
                },
                y: {
                  ticks: { color: "#6b7280", font: { size: 9 }, stepSize: 1 },
                  grid: { color: "rgba(55,65,81,0.6)" }
                }
              }
            }}
          />
        </div>
      </div>
      <div className="glass-panel p-4">
        <h2 className="text-sm font-semibold mb-2">Workout frequency / week</h2>
        <div className="h-44">
          <Bar
            data={{
              labels: workoutLabels,
              datasets: [
                {
                  label: "Workouts",
                  data: workoutLabels.map((d) => agg.workoutsPerWeek[d]),
                  backgroundColor: "#22c55e"
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  ticks: { color: "#9ca3af", font: { size: 9 } },
                  grid: { display: false }
                },
                y: {
                  ticks: { color: "#6b7280", font: { size: 9 }, stepSize: 1 },
                  grid: { color: "rgba(55,65,81,0.6)" }
                }
              }
            }}
          />
        </div>
      </div>
      <div className="glass-panel p-4">
        <h2 className="text-sm font-semibold mb-2">Habit completion rate</h2>
        <div className="h-44">
          <Bar
            data={{
              labels: habitLabels,
              datasets: [
                {
                  label: "% complete",
                  data: habitLabels.map((d) => {
                    const bucket = agg.habitsCompletion[d];
                    return bucket.total
                      ? Math.round((bucket.completed / bucket.total) * 100)
                      : 0;
                  }),
                  backgroundColor: "#f97316"
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  ticks: { color: "#9ca3af", font: { size: 9 } },
                  grid: { display: false }
                },
                y: {
                  ticks: { color: "#6b7280", font: { size: 9 } },
                  grid: { color: "rgba(55,65,81,0.6)" },
                  max: 100
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

