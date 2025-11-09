"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ConversationLog from "../components/ConversationLog";
import TaskBoard from "../components/TaskBoard";
import VoiceAssistant from "../components/VoiceAssistant";
import CatalogHelper from "../components/CatalogHelper";
import { interpretCommand } from "../lib/commandEngine";
import {
  marketplaceProfiles
} from "../lib/catalogProcessing";
import type { AssistantMessage, CatalogOutputRow, MarketplaceKey, Task } from "../lib/types";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { v4 as uuid } from "uuid";

const starterTasks: Task[] = [
  {
    id: uuid(),
    title: "Reconcile Amazon apparel inventory",
    status: "pending",
    source: "manual"
  },
  {
    id: uuid(),
    title: "Draft Flipkart deal of the day copy",
    status: "in-progress",
    source: "manual"
  }
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [rawCatalog, setRawCatalog] = useState("");
  const [marketplace, setMarketplace] = useState<MarketplaceKey>("amazon");
  const [catalogRows, setCatalogRows] = useState<CatalogOutputRow[]>([]);
  const [manualCommand, setManualCommand] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [
    {
      id: uuid(),
      role: "assistant",
      content:
        "Aurora online. Ask me to capture priorities, update task status, or transform your raw catalog data for Amazon, Flipkart, Meesho, or Myntra.",
      timestamp: Date.now()
    }
  ]);

  const { speak } = useSpeechSynthesis();

  const updateMessages = useCallback((message: AssistantMessage) => {
    setMessages((prev) => [...prev.slice(-8), message]);
  }, []);

  const runCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      const context = {
        tasks,
        rawCatalog,
        catalogRows,
        selectedMarketplace: marketplace
      };

      const outcome = interpretCommand(trimmed, context);

      setTasks(outcome.tasks);
      setCatalogRows(outcome.catalogRows);
      updateMessages({
        id: uuid(),
        role: "user",
        content: trimmed,
        timestamp: Date.now()
      });
      updateMessages(outcome.message);

      if (outcome.announce) {
        speak(outcome.message.content);
      }
    },
    [catalogRows, marketplace, rawCatalog, speak, tasks, updateMessages]
  );

  const handleManualSubmit = () => {
    if (!manualCommand.trim()) return;
    runCommand(manualCommand);
    setManualCommand("");
  };

  const quickPrompts = useMemo(
    () => [
      "Add task follow up with PDP designers",
      "Mark task draft Flipkart deal of the day copy as complete",
      "Show my tasks",
      "Generate listing sheet",
      "Help"
    ],
    []
  );

  useEffect(() => {
    setCatalogRows([]);
  }, [marketplace]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 md:px-10">
      <header className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="glass rounded-3xl p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-brand">Aurora</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            Your voice-first marketplace command center
          </h1>
          <p className="mt-4 max-w-xl text-sm text-slate-300">
            Handle daily operations, orchestrate listings across Amazon, Flipkart, Meesho, and
            Myntra, and auto-fill catalog sheets from raw data. Just speak or type — Aurora gets it
            done.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => runCommand(prompt)}
                className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 transition hover:border-brand hover:text-brand"
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <input
              type="text"
              value={manualCommand}
              onChange={(event) => setManualCommand(event.target.value)}
              placeholder="Type a command…"
              className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
            />
            <button
              onClick={handleManualSubmit}
              className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              type="button"
            >
              Send
            </button>
          </div>
        </div>
        <VoiceAssistant onCommand={runCommand} />
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <TaskBoard
          tasks={tasks}
          onAdd={(task) => {
            setTasks((prev) => [...prev, task]);
            speak(`Task ${task.title} added`);
          }}
          onUpdate={(updated) => {
            setTasks(updated);
            const completed = updated.filter((task) => task.status === "completed").length;
            speak(`Task board updated. ${completed} completed.`);
          }}
        />
        <ConversationLog entries={messages} />
      </section>

      <CatalogHelper
        rawData={rawCatalog}
        marketplace={marketplace}
        generatedRows={catalogRows}
        onRawDataChange={setRawCatalog}
        onMarketplaceChange={setMarketplace}
        onGenerate={() => {
          const context = {
            tasks,
            rawCatalog,
            catalogRows,
            selectedMarketplace: marketplace
          };
          const outcome = interpretCommand("generate catalog", context);
          setCatalogRows(outcome.catalogRows);
          updateMessages({
            id: uuid(),
            role: "user",
            content: "Generate catalog",
            timestamp: Date.now()
          });
          updateMessages(outcome.message);
          speak(outcome.message.content);
        }}
      />

      <footer className="mb-10 text-center text-xs text-slate-500">
        Marketplace profiles:{" "}
        {Object.values(marketplaceProfiles)
          .map((profile) => profile.name)
          .join(" • ")}
      </footer>
    </main>
  );
}
