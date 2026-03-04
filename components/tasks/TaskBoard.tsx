"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
};

type Column = {
  id: TaskStatus;
  title: string;
};

const COLUMNS: Column[] = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" }
];

export function TaskBoard() {
  const { user, loading: userLoading, error: userError } = useSupabaseUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setTasks(data as Task[]);
      } else if (error) {
        setError(`Could not load tasks: ${error.message}`);
      }
      setLoading(false);
    };
    void load();
  }, [user]);

  const handleCreateTask = async () => {
    if (!user || !title.trim()) return;
    setError(null);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title,
        description,
        status: "todo",
        priority: "medium"
      })
      .select()
      .single();
    if (!error && data) {
      setTasks((prev) => [data as Task, ...prev]);
      setTitle("");
      setDescription("");
    } else if (error) {
      setError(`Could not create task: ${error.message}`);
    }
  };

  const handleDrop = async (taskId: string, newStatus: TaskStatus) => {
    const previous = tasks;
    setDraggingId(null);
    setError(null);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);
    if (error) {
      setTasks(previous);
      setError(`Could not update task status: ${error.message}`);
    }
  };

  const grouped: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: []
  };
  tasks.forEach((task) => grouped[task.status].push(task));

  if (userLoading) {
    return <p className="text-xs text-slate-400">Loading your tasks…</p>;
  }

  if (!user) {
    return (
      <p className="text-xs text-slate-400">
        You need to be logged in to manage tasks.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-xs text-slate-300">
            New task
            <input
              className="mt-1 w-full rounded-lg bg-surfaceMuted border border-border/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <textarea
            className="w-full rounded-lg bg-surfaceMuted border border-border/70 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent resize-none h-16 scrollbar-thin"
            placeholder="Optional description, context, or links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreateTask}
          className="px-4 py-2 rounded-lg bg-accent text-sm font-medium hover:bg-accent/90 disabled:opacity-60"
          disabled={!title.trim()}
        >
          Add task
        </button>
      </div>
      {(userError || error) && (
        <p className="text-xs text-red-400">{userError ?? error}</p>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Loading tasks…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={grouped[column.id]}
              draggingId={draggingId}
              onDragStart={setDraggingId}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type ColumnProps = {
  column: Column;
  tasks: Task[];
  draggingId: string | null;
  onDragStart: (id: string | null) => void;
  onDrop: (id: string, status: TaskStatus) => void;
};

function Column({
  column,
  tasks,
  draggingId,
  onDragStart,
  onDrop
}: ColumnProps) {
  return (
    <div
      className="glass-panel min-h-[260px] flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(id, column.id);
      }}
    >
      <header className="flex items-center justify-between px-3 pt-3 pb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {column.title}
        </p>
        <span className="text-[11px] text-slate-500">{tasks.length}</span>
      </header>
      <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto scrollbar-thin">
        {tasks.map((task) => (
          <article
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", task.id);
              onDragStart(task.id);
            }}
            onDragEnd={() => onDragStart(null)}
            className={`rounded-lg border border-border/70 bg-surfaceMuted p-3 cursor-grab text-xs ${
              draggingId === task.id ? "opacity-50" : ""
            }`}
          >
            <p className="font-semibold text-[13px] mb-1">{task.title}</p>
            {task.description && (
              <p className="text-[11px] text-slate-400 line-clamp-3">
                {task.description}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              {task.due_date && <span>Due {task.due_date}</span>}
              <span
                className={`px-1.5 py-0.5 rounded-full border ${
                  task.priority === "high"
                    ? "border-rose-500/50 text-rose-300"
                    : task.priority === "medium"
                    ? "border-amber-500/50 text-amber-300"
                    : "border-slate-500/60 text-slate-300"
                }`}
              >
                {task.priority}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
