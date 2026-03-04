const MOCK_WORKOUT = {
  template: "Push",
  focus: "Chest, shoulders, triceps",
  mainLifts: ["Bench press", "Overhead press"],
  status: "Scheduled for 16:30"
};

export function TodayWorkout() {
  return (
    <div className="space-y-2 text-xs md:text-sm">
      <p className="font-medium">{MOCK_WORKOUT.template} day</p>
      <p className="text-slate-400">{MOCK_WORKOUT.focus}</p>
      <ul className="list-disc list-inside text-slate-300 text-xs md:text-sm">
        {MOCK_WORKOUT.mainLifts.map((lift) => (
          <li key={lift}>{lift}</li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-400 mt-1">{MOCK_WORKOUT.status}</p>
    </div>
  );
}

