'use client';

import { FormEvent, useState } from "react";
import { v4 as uuid } from "uuid";
import type { Task } from "../lib/types";

interface TaskBoardProps {
  tasks: Task[];
  onAdd: (task: Task) => void;
  onUpdate: (tasks: Task[]) => void;
}

export default function TaskBoard({ tasks, onAdd, onUpdate }: TaskBoardProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const task: Task = {
      id: uuid(),
      title: trimmed,
      status: "pending",
      source: "manual"
    };
    onAdd(task);
    setTitle("");
  };

  const updateStatus = (taskId: string, status: Task["status"]) => {
    const updated = tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    );
    onUpdate(updated);
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Daily Mission Control</h2>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs uppercase tracking-wide text-brand">
          {tasks.length} tasks
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex gap-3"
      >
        <input
          type="text"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a quick task…"
          className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
        <button
          type="submit"
          className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Add
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">
            Aurora will place your priorities here. Add one manually or ask via voice.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 px-4 py-3 text-sm text-slate-200"
            >
              <div>
                <p className="font-medium text-slate-100">{task.title}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {task.status === "completed"
                    ? "Completed"
                    : task.status === "in-progress"
                    ? "In progress"
                    : "Pending"}{" "}
                  • {task.source === "voice" ? "Voice" : task.source === "catalog" ? "Catalog" : "Manual"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(task.id, "pending")}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    task.status === "pending"
                      ? "border-brand bg-brand/20 text-brand"
                      : "border-slate-700 text-slate-300"
                  }`}
                  type="button"
                >
                  Pending
                </button>
                <button
                  onClick={() => updateStatus(task.id, "in-progress")}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    task.status === "in-progress"
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : "border-slate-700 text-slate-300"
                  }`}
                  type="button"
                >
                  Progress
                </button>
                <button
                  onClick={() => updateStatus(task.id, "completed")}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    task.status === "completed"
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                      : "border-slate-700 text-slate-300"
                  }`}
                  type="button"
                >
                  Done
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
