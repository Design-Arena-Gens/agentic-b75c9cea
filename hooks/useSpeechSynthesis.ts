'use client';

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceIndex?: number;
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const populateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (!text.trim()) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 1.05;
      utterance.pitch = options?.pitch ?? 1;
      if (voices.length) {
        const voice = voices[options?.voiceIndex ?? 0];
        if (voice) utterance.voice = voice;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        queueRef.current.shift();
        if (!queueRef.current.length) return;
        const next = queueRef.current[0];
        window.speechSynthesis.speak(next);
      };

      queueRef.current.push(utterance);
      if (queueRef.current.length === 1) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    },
    [voices]
  );

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    setSpeaking(false);
  }, []);

  return {
    speak,
    cancel,
    speaking,
    voices
  };
}
