import { Activity } from "lucide-react";

export function ProductivityScore() {
  // In a real app this would be computed from Supabase data.
  const todayScore = 82;

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
          <span className="text-xl font-semibold">{todayScore}</span>
          <span className="text-[11px] text-slate-400">/ 100 today</span>
        </div>
      </div>
    </div>
  );
}

