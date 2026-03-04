const MOCK_HABITS = [
  { name: "Gym", completed: true, streak: 4 },
  { name: "Deep Work", completed: true, streak: 7 },
  { name: "Reading", completed: false, streak: 2 },
  { name: "Intermittent Fasting", completed: true, streak: 10 }
];

export function HabitSummary() {
  return (
    <ul className="space-y-2 text-xs md:text-sm">
      {MOCK_HABITS.map((habit) => (
        <li
          key={habit.name}
          className="flex items-center justify-between gap-3 rounded-lg bg-surfaceMuted px-3 py-2 border border-border/60"
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-4 w-4 rounded-full border ${
                habit.completed
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

