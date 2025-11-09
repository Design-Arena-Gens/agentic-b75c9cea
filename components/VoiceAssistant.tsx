'use client';

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionResultItem = {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultItem>;
};

type RecognitionInstance = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
};

interface VoiceAssistantProps {
  onCommand: (text: string) => void;
  disabled?: boolean;
}

const recognitionFactory = (): RecognitionInstance | null => {
  if (typeof window === "undefined") return null;
  const SpeechRecognitionCtor =
    (window as unknown as { SpeechRecognition?: () => RecognitionInstance; webkitSpeechRecognition?: () => RecognitionInstance })
      .SpeechRecognition ??
    (window as unknown as { SpeechRecognition?: () => RecognitionInstance; webkitSpeechRecognition?: () => RecognitionInstance })
      .webkitSpeechRecognition;
  if (!SpeechRecognitionCtor) return null;
  const recognition: RecognitionInstance = new (SpeechRecognitionCtor as any)();
  recognition.lang = "en-IN";
  recognition.interimResults = true;
  recognition.continuous = false;
  return recognition;
};

export default function VoiceAssistant({ onCommand, disabled }: VoiceAssistantProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [support, setSupport] = useState(true);
  const recognitionRef = useRef<RecognitionInstance | null>(null);

  useEffect(() => {
    const instance = recognitionFactory();
    if (!instance) {
      setSupport(false);
      return;
    }
    recognitionRef.current = instance;
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) setTranscript(interim);
      if (final) {
        setTranscript(final);
        onCommand(final);
        setTimeout(() => setTranscript(""), 400);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setTranscript("");
    };

    recognition.onend = () => setListening(false);
  }, [onCommand]);

  const toggleListening = useCallback(() => {
    if (disabled) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    setTranscript("");
    recognition.start();
    setListening(true);
  }, [disabled, listening]);

  if (!support) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        This browser does not support voice commands. Use the quick actions or text input instead.
      </div>
    );
  }

  return (
    <div className="glass relative rounded-3xl p-6 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Voice link</p>
          <h2 className="text-2xl font-semibold text-white">Talk to Aurora</h2>
        </div>
        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`group flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 transition ${
            listening
              ? "bg-red-500/80 text-white shadow-[0_0_30px_rgba(248,113,113,0.5)]"
              : "bg-slate-900 text-slate-200 hover:border-brand hover:text-brand"
          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <span className="text-lg">{listening ? "■" : "●"}</span>
        </button>
      </div>
      <div className="mt-4 h-16 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-4 text-slate-300">
        {transcript ? transcript : listening ? "Listening…" : "Tap to start a conversation"}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Try: “Add task schedule photoshoot for the new catalog” or “Generate Amazon catalog from my
        data”.
      </p>
    </div>
  );
}
