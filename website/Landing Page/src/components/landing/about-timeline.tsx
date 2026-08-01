import { useState } from "react";
import { Sparkles, Terminal, Shield, Zap, Code2, ArrowRight } from "lucide-react";

interface Milestone {
  id: string;
  year: string;
  badge: string;
  title: string;
  summary: string;
  techDetails: string;
  icon: typeof Sparkles;
}

const MILESTONES: Milestone[] = [
  {
    id: "step-1",
    year: "Phase 1",
    badge: "The Problem",
    title: "The Interview Meltdown",
    summary:
      "We froze on an LRU Cache problem during a live interview — not because we didn't know the code, but because of artificial pressure and 3 pairs of watching eyes.",
    techDetails:
      "Technical interviews measure stress tolerance, not actual software engineering craftsmanship. We knew developers needed a silent, non-intrusive safety net.",
    icon: Code2,
  },
  {
    id: "step-2",
    year: "Phase 2",
    badge: "The OS Hack",
    title: "DirectX Window Protection",
    summary:
      "Architected the native Windows C++ binding using SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE) inside Electron.",
    techDetails:
      "Web browser extensions get flagged easily. Native DirectX OS-level affinity bypasses Zoom, Google Meet, MS Teams, and Discord screen capture with 0% window leakage.",
    icon: Shield,
  },
  {
    id: "step-3",
    year: "Phase 3",
    badge: "The Speed Engine",
    title: "Sub-200ms Cerebras LPU Inference",
    summary:
      "Standard LLMs take 3.2 seconds — far too slow when an interviewer is listening. We integrated Cerebras LPU for instant token streaming.",
    techDetails:
      "By combining Deepgram local Voice Activity Detection (VAD) with Cerebras Llama-3.3 70B, answers stream token-by-token at over 200 tokens/sec before the candidate finishes reading.",
    icon: Zap,
  },
  {
    id: "step-4",
    year: "Phase 4",
    badge: "Open Source",
    title: "100% Transparent Community Release",
    summary:
      "Published CocoAI on GitHub with full open-source code, zero telemetry, and zero log storage.",
    techDetails:
      "No black boxes. No remote servers tracking your interview answers. Your API keys are stored locally on your own machine.",
    icon: Sparkles,
  },
];

export function AboutTimeline() {
  const [activeStep, setActiveStep] = useState<string>("step-2");

  const current = MILESTONES.find(m => m.id === activeStep) || MILESTONES[0];

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-2 text-violet-400 mb-2">
        <Terminal className="h-4 w-4" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider">
          Engineering Evolution
        </span>
      </div>

      <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
        How CocoAI Was Built
      </h3>

      {/* Timeline Steps Bar */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MILESTONES.map(m => {
          const isActive = m.id === activeStep;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setActiveStep(m.id)}
              className={`flex flex-col text-left rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border border-violet-500/50 bg-gradient-to-br from-violet-950/40 to-pink-950/40 text-white shadow-lg shadow-violet-500/20 scale-[1.02]"
                  : "border border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400">
                  {m.year}
                </span>
                <Icon className={`h-4 w-4 ${isActive ? "text-pink-400" : "text-zinc-500"}`} />
              </div>
              <span className="mt-2 text-xs font-bold text-white line-clamp-1">{m.title}</span>
              <span className="mt-0.5 text-[11px] text-zinc-400 line-clamp-1">{m.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Step Expanded Card */}
      <div className="mt-6 rounded-xl border border-violet-500/20 bg-black/60 p-5 font-mono leading-relaxed text-zinc-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {current.badge}: {current.title}
          </span>
          <span className="text-[11px] text-zinc-500">{current.year}</span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">{current.summary}</p>

        <div className="mt-4 rounded-lg bg-violet-950/30 p-3 border border-violet-500/20 text-xs text-violet-300">
          <span className="font-bold text-violet-400">💡 Deep Technical Insight: </span>
          {current.techDetails}
        </div>
      </div>
    </div>
  );
}
