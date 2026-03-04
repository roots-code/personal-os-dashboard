import { DashboardCard } from "@/components/layout/DashboardCard";
import { ProductivityScore } from "@/components/dashboard/ProductivityScore";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { DashboardTaskSummary } from "@/components/dashboard/DashboardTaskSummary";
import { TodayWorkout } from "@/components/dashboard/TodayWorkout";
import { HabitSummary } from "@/components/dashboard/HabitSummary";

export function DashboardShell() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Today&apos;s Control Center
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Overview of your schedule, tasks, workouts, habits, and productivity.
          </p>
        </div>
        <ProductivityScore />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Today's Schedule" description="Blocks for focus, health, and recovery">
          <TodaySchedule />
        </DashboardCard>
        <DashboardCard title="Tasks" description="Snapshot of your workstream">
          <DashboardTaskSummary />
        </DashboardCard>
        <DashboardCard title="Today's Workout" description="Stay consistent with your training plan">
          <TodayWorkout />
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Habits" description="Compound gains from small daily actions">
          <HabitSummary />
        </DashboardCard>
        <DashboardCard
          title="Weekly Activity"
          description="Blend of tasks, workouts, and habits"
        >
          <WeeklyActivityChart />
        </DashboardCard>
        <DashboardCard title="Notes" description="Quick capture for today">
          <textarea
            className="w-full h-32 bg-surfaceMuted rounded-lg border border-border/70 text-xs md:text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-accent resize-none scrollbar-thin"
            placeholder="Capture any key intentions, reflections, or constraints for today..."
          />
        </DashboardCard>
      </div>
    </div>
  );
}

