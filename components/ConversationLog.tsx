'use client';

import { format } from "date-fns";
import type { AssistantMessage } from "../lib/types";

interface ConversationLogProps {
  entries: AssistantMessage[];
}

export default function ConversationLog({ entries }: ConversationLogProps) {
  if (!entries.length) {
    return (
      <div className="glass flex h-full min-h-[240px] flex-col justify-center rounded-3xl p-6 text-sm text-slate-400">
        Ask Aurora to add a task, update status, or transform your catalog data.
      </div>
    );
  }

  return (
    <div className="glass h-full min-h-[280px] rounded-3xl p-6">
      <h2 className="text-xl font-semibold text-slate-100">Activity Feed</h2>
      <div className="mt-4 space-y-4 overflow-y-auto pr-1 text-sm text-slate-300 max-h-[320px]">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`rounded-2xl border border-slate-800/50 p-4 ${
              entry.role === "assistant"
                ? "bg-slate-900/40"
                : entry.role === "user"
                ? "bg-brand/10"
                : "bg-amber-500/10"
            }`}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span>{entry.role === "assistant" ? "Aurora" : "You"}</span>
              <span>{format(new Date(entry.timestamp), "PPP p")}</span>
            </div>
            <p className="mt-2 whitespace-pre-line text-[0.95rem] text-slate-100">
              {entry.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
