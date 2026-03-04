const MOCK_BLOCKS = [
  { time: "06:30", label: "Morning routine & light mobility" },
  { time: "08:00", label: "Deep work block 1" },
  { time: "11:30", label: "Walk / sunlight / lunch" },
  { time: "13:00", label: "Deep work block 2" },
  { time: "16:30", label: "Workout - Push" },
  { time: "20:00", label: "Read + shutdown" }
];

export function TodaySchedule() {
  return (
    <ol className="space-y-2 text-xs md:text-sm">
      {MOCK_BLOCKS.map((block) => (
        <li
          key={block.time}
          className="flex items-start gap-3 rounded-lg bg-surfaceMuted px-3 py-2 border border-border/60"
        >
          <span className="text-[11px] text-slate-400 mt-0.5 w-14 shrink-0">
            {block.time}
          </span>
          <span>{block.label}</span>
        </li>
      ))}
    </ol>
  );
}

