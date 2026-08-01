import { useState, useEffect } from "react";
import { Sparkles, Eye, EyeOff, ShieldCheck, Zap, Terminal, Command } from "lucide-react";

type TopicKey = "algo" | "system" | "behavioral";

interface TopicContent {
  title: string;
  question: string;
  tokens: string[];
}

const TOPICS: Record<TopicKey, TopicContent> = {
  algo: {
    title: "Data Structures & Algorithms",
    question: "Interviewer: 'How would you optimize an LRU Cache to achieve O(1) get and put operations?'",
    tokens: [
      "Use", "a", "combination", "of", "a", "Doubly", "LinkedList", "and", "a", "HashMap.",
      "The", "HashMap", "stores", "key-to-node", "pointers", "for", "O(1)", "lookup,",
      "while", "the", "Doubly", "LinkedList", "maintains", "recency", "order.",
      "When", "a", "key", "is", "accessed,", "move", "its", "node", "to", "the", "head.",
      "When", "capacity", "is", "exceeded,", "remove", "the", "tail", "node", "in", "O(1)", "time.",
    ],
  },
  system: {
    title: "System Design & Architecture",
    question: "Interviewer: 'How do you design a resilient Distributed Rate Limiter for 100k req/sec?'",
    tokens: [
      "Implement", "a", "Sliding", "Window", "Counter", "using", "Redis", "Cluster", "with", "Lua", "scripts",
      "for", "atomic", "operations.", "Use", "local", "in-memory", "token", "buckets", "at", "the", "API", "Gateway",
      "layer", "to", "absorb", "spikes,", "syncing", "asynchronously", "with", "Redis.", "This", "reduces", "cross-datacenter",
      "latency", "to", "<1ms", "while", "guaranteeing", "zero", "race", "conditions.",
    ],
  },
  behavioral: {
    title: "Behavioral & Leadership",
    question: "Interviewer: 'Tell me about a time you resolved a major technical disagreement on your team.'",
    tokens: [
      "I", "addressed", "our", "database", "migration", "conflict", "by", "proposing", "an", "objective", "benchmark", "spike.",
      "I", "built", "a", "reproducible", "load", "test", "comparing", "PostgreSQL", "vs", "MongoDB", "under", "our", "actual",
      "query", "patterns.", "The", "data", "proved", "Postgres", "handled", "our", "relational", "joins", "with", "4x", "lower",
      "latency,", "aligning", "the", "team", "around", "empirical", "evidence.",
    ],
  },
};

export function HeroHudWidget() {
  const [selectedTopic, setSelectedTopic] = useState<TopicKey>("algo");
  const [displayedTokens, setDisplayedTokens] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hudOpacity, setHudOpacity] = useState(90);
  const [stealthHidden, setStealthHidden] = useState(false);
  const [activeHotkey, setActiveHotkey] = useState<string | null>(null);

  // Stream tokens one by one
  useEffect(() => {
    setDisplayedTokens([]);
    setIsStreaming(true);
    const fullTokens = TOPICS[selectedTopic].tokens;
    let index = 0;

    const timer = setInterval(() => {
      if (index < fullTokens.length) {
        setDisplayedTokens(prev => [...prev, fullTokens[index]]);
        index++;
      } else {
        setIsStreaming(false);
        clearInterval(timer);
      }
    }, 45); // ~22 tokens/sec typing effect for clear readability

    return () => clearInterval(timer);
  }, [selectedTopic]);

  // Global keydown handler to react to physical keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        const key = e.key.toUpperCase();
        if (key === "A") {
          e.preventDefault();
          setActiveHotkey("Ctrl+Shift+A");
          setSelectedTopic(prev => (prev === "algo" ? "system" : prev === "system" ? "behavioral" : "algo"));
          setTimeout(() => setActiveHotkey(null), 1000);
        } else if (key === "H") {
          e.preventDefault();
          setActiveHotkey("Ctrl+Shift+H");
          setStealthHidden(prev => !prev);
          setTimeout(() => setActiveHotkey(null), 1000);
        } else if (key === "G") {
          e.preventDefault();
          setActiveHotkey("Ctrl+Shift+G");
          setHudOpacity(prev => (prev <= 40 ? 90 : prev - 25));
          setTimeout(() => setActiveHotkey(null), 1000);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-4xl perspective-midrange">
      {/* Glow aura behind widget */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-3xl opacity-30 blur-3xl transition-all duration-500"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, #ec4899 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Main HUD Card */}
      <div
        className="animate-hud-float relative overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          opacity: stealthHidden ? 0.08 : hudOpacity / 100,
          background: "rgba(12, 10, 22, 0.88)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(236, 72, 153, 0.15) inset",
        }}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 gap-2">
          {/* Left: Window Dots & Title */}
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80 shadow-sm" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-sm" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-sm" />
            </div>

            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-violet-400" />
              <span className="font-mono text-xs font-semibold text-zinc-200 tracking-wide">
                CocoAI Stealth HUD <span className="text-[10px] text-violet-400 font-normal">v1.0 (DirectX Active)</span>
              </span>
            </div>
          </div>

          {/* Center: Live VAD Sound Wave Visualizer */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider">
              Interviewer Speaking
            </span>
            {/* Animated Equalizer Wave Bars */}
            <div className="flex items-end gap-0.5 h-3 ml-1">
              <span className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.1s] h-3" />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.3s] h-2" />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.2s] h-3.5" />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.4s] h-1.5" />
            </div>
          </div>

          {/* Right: Cerebras Speed Metric */}
          <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 font-mono">
            <Zap className="h-3 w-3 text-pink-400 fill-pink-400/20" />
            <span>200+ tok/s (Cerebras)</span>
          </div>
        </div>

        {/* Topic Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 bg-zinc-950/60 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Simulate Question:
          </span>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(TOPICS) as TopicKey[]).map(key => (
              <button
                key={key}
                onClick={() => setSelectedTopic(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedTopic === key
                    ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-500/25 scale-[1.02]"
                    : "bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {TOPICS[key].title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Viewport */}
        <div className="p-5 space-y-4">
          {/* Question Box */}
          <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3.5 text-xs text-zinc-300 leading-relaxed font-mono">
            <span className="text-violet-400 font-bold">🎙️ AUDIO transcript: </span>
            {TOPICS[selectedTopic].question}
          </div>

          {/* AI Streamed Answer Box */}
          <div className="relative min-h-[140px] rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-relaxed text-zinc-100 shadow-inner">
            <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400 border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5 text-pink-400 font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                ⚡ INSTANT AI SOLUTION
              </span>
              <span>{isStreaming ? "Streaming live..." : "Complete ✓"}</span>
            </div>

            <div className="text-zinc-200">
              {displayedTokens.map((token, i) => {
                if (!token) return null;
                const isSpecial = token.startsWith("O(1)") || token.includes("Redis") || token.includes("Postgres");
                const isHighlight = token.includes("Doubly") || token.includes("HashMap") || token.includes("Sliding");
                return (
                  <span
                    key={i}
                    className="inline-block mr-1 transition-opacity duration-150 animate-in fade-in"
                    style={{
                      color: isSpecial
                        ? "#a78bfa"
                        : isHighlight
                        ? "#ec4899"
                        : "#f4f4f5",
                    }}
                  >
                    {token}
                  </span>
                );
              })}

              {isStreaming && (
                <span className="inline-block h-3.5 w-2 bg-pink-500 animate-pulse align-middle ml-1" />
              )}
            </div>
          </div>

          {/* Interactive Controls & Hotkey Panel */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10 text-xs">
            {/* Hotkey triggers */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Live Hotkeys:
              </span>

              <button
                onClick={() => {
                  setSelectedTopic(prev => (prev === "algo" ? "system" : prev === "system" ? "behavioral" : "algo"));
                }}
                className={`keycap-badge ${activeHotkey === "Ctrl+Shift+A" ? "active" : ""}`}
                title="Simulate Screen Analysis / Next Question"
              >
                <Command className="h-3 w-3" />
                Ctrl+Shift+A (Solve)
              </button>

              <button
                onClick={() => setStealthHidden(prev => !prev)}
                className={`keycap-badge ${activeHotkey === "Ctrl+Shift+H" ? "active" : ""}`}
                title="Toggle Stealth Hide"
              >
                {stealthHidden ? <EyeOff className="h-3 w-3 text-red-400" /> : <Eye className="h-3 w-3" />}
                Ctrl+Shift+H ({stealthHidden ? "Unhide" : "Hide"})
              </button>

              <button
                onClick={() => setHudOpacity(prev => (prev <= 40 ? 90 : prev - 25))}
                className={`keycap-badge ${activeHotkey === "Ctrl+Shift+G" ? "active" : ""}`}
                title="Cycle Window Transparency"
              >
                <ShieldCheck className="h-3 w-3 text-violet-400" />
                Ctrl+Shift+G (Opacity: {hudOpacity}%)
              </button>
            </div>

            {/* Live Opacity Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-400">Opacity:</span>
              <input
                type="range"
                min="35"
                max="100"
                value={hudOpacity}
                onChange={e => {
                  setHudOpacity(Number(e.target.value));
                  setStealthHidden(false);
                }}
                className="h-1.5 w-24 accent-violet-500 cursor-pointer rounded-lg bg-zinc-800"
              />
              <span className="font-mono text-[11px] font-bold text-violet-300 w-8 text-right">
                {hudOpacity}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
