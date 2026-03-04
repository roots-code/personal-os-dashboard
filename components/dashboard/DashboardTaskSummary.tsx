const MOCK_TASKS = {
  todo: 4,
  inProgress: 2,
  done: 6
};

export function DashboardTaskSummary() {
  const total = MOCK_TASKS.todo + MOCK_TASKS.inProgress + MOCK_TASKS.done;

  return (
    <div className="flex flex-col gap-3 text-xs md:text-sm">
      <div className="flex gap-3">
        <Pill label="Todo" value={MOCK_TASKS.todo} tone="amber" />
        <Pill label="In Progress" value={MOCK_TASKS.inProgress} tone="blue" />
        <Pill label="Done" value={MOCK_TASKS.done} tone="emerald" />
      </div>
      <div className="h-2 rounded-full bg-surfaceMuted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400"
          style={{
            width: `${(MOCK_TASKS.done / Math.max(total, 1)) * 100}%`
          }}
        />
      </div>
      <p className="text-[11px] text-slate-400">
        {MOCK_TASKS.done} / {total} tasks completed today.
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

