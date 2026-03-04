"use client";

import { TaskBoard } from "@/components/tasks/TaskBoard";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Tasks
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Kanban board for your personal operating system.
          </p>
        </div>
      </header>
      <TaskBoard />
    </div>
  );
}

