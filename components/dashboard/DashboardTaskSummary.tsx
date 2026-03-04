"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskCounts = Record<TaskStatus, number>;

const INITIAL_COUNTS: TaskCounts = {
  todo: 0,
  in_progress: 0,
  done: 0
};

export function DashboardTaskSummary() {
  const { user, loading: userLoading, error: userError } = useSupabaseUser();
  const [counts, setCounts] = useState<TaskCounts>(INITIAL_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("tasks")
        .select("status")
        .eq("user_id", user.id);

      if (error) {
        setError(`Could not load tasks: ${error.message}`);
        setLoading(false);
        return;
      }

      const next = { ...INITIAL_COUNTS };
      (data ?? []).forEach((task: { status: TaskStatus }) => {
        next[task.status] += 1;
      });
      setCounts(next);
      setLoading(false);
    };

    void load();

    const channel = supabase
      .channel(`dashboard-task-summary-${user.id}`)
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

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  if (userLoading || loading) {
    return <p className="text-[11px] text-slate-400">Loading task summary...</p>;
  }

  if (!user) {
    return <p className="text-[11px] text-slate-400">Login to view tasks.</p>;
  }

  if (userError || error) {
    return <p className="text-[11px] text-red-400">{userError ?? error}</p>;
  }

  const total = counts.todo + counts.in_progress + counts.done;

  return (
    <div className="flex flex-col gap-3 text-xs md:text-sm">
      <div className="flex gap-3">
        <Pill label="Todo" value={counts.todo} tone="amber" />
        <Pill label="In Progress" value={counts.in_progress} tone="blue" />
        <Pill label="Done" value={counts.done} tone="emerald" />
      </div>
      <div className="h-2 rounded-full bg-surfaceMuted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400"
          style={{ width: `${(counts.done / Math.max(total, 1)) * 100}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-400">
        {counts.done} / {total} tasks completed.
      </p>
    </div>
  );
}

function Pill({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "amber" | "blue" | "emerald";
}) {
  const toneClasses =
    tone === "amber"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
      : tone === "blue"
      ? "bg-sky-500/15 text-sky-300 border-sky-500/40"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${toneClasses}`}
    >
      <span className="text-[11px] uppercase tracking-[0.12em]">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}
