import transcriptImg from "@/assets/cocoai_transcript.png";
import settingsImg from "@/assets/cocoai_settings.png";
import stealthImg from "@/assets/cocoai_stealth_comparison.png";
import exportImg from "@/assets/cocoai_export_md.png";
import screenAnalysisImg from "@/assets/cocoai_screen_analysis.png";
import { Reveal } from "./reveal";
import { SectionTag } from "./section-tag";

type FeatureModule = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
  image: string;
  imageAlt: string;
  chrome: string;
};

const MODULES: FeatureModule[] = [
  {
    id: "transcript",
    eyebrow: "Live Transcription",
    title: "Real-Time Speech-to-Text, Speaker Detection & VAD",
    description:
      "Listens directly to the interviewer, groups sentences using advanced Voice Activity Detection (VAD), and filters pauses. The Live Transcript feed displays real-time speech bubbles with speaker tags (INTERVIEWER / CANDIDATE) and instant '⚡ ANSWER' triggers next to every question.",
    chips: ["Voice Activity Detection", "Speaker Tags", "⚡ Instant Answers"],
    image: transcriptImg,
    imageAlt:
      "CocoAI live transcript feed with interviewer and candidate speech bubbles and AI answer triggers",
    chrome: "cocoai — live transcript feed",
  },
  {
    id: "resume",
    eyebrow: "Personalization",
    title: "Deep Resume & JD Context Ingestion",
    description:
      "Drag and drop your PDF resume and paste the job description directly into the Settings drawer. CocoAI uses this context to automatically align answers to your project history (e.g. Alyra Lock, Astra Vision) and specific technical stack (React, TypeScript, Express, MongoDB, FastAPI).",
    chips: ["PDF Resume Upload", "JD Matching", "Stack-Aware Answers"],
    image: settingsImg,
    imageAlt:
      "CocoAI settings drawer with resume PDF drop zone and job description context input forms",
    chrome: "cocoai — settings & context",
  },
  {
    id: "stealth",
    eyebrow: "Stealth Mode",
    title: "Invisible Stealth Overlay & Screen Share Protection",
    description:
      "Built to be completely invisible on screen sharing (Zoom, Teams, Google Meet). Control overlay modes via globally-registered hotkeys: Ctrl+Shift+H (Hide Window), Ctrl+Shift+A (Analyze Screen), Ctrl+Shift+S (Add Page), and Ctrl+Shift+G (Cycle Stealth). Toggle stealth states with the Eye icon button and slide opacity from 35% to 100%.",
    chips: ["Zoom / Teams / Meet Safe", "Global Hotkeys", "35–100% Opacity"],
    image: stealthImg,
    imageAlt:
      "Split-screen comparison showing what the interviewer sees on Zoom screen share versus what the candidate sees with the CocoAI overlay",
    chrome: "cocoai — stealth overlay active",
  },
  {
    id: "export",
    eyebrow: "Exporting",
    title: "Multi-Format Session Exporting",
    description:
      "Never lose a valuable interview question or solution. At any point, click the toolbar Export button to download the entire session transcript and generated code answers as clean Markdown (.md), plain Text (.txt), or structural JSON (.json) files for offline study or replay mode.",
    chips: ["Markdown .md", "Plain Text .txt", "Structural .json"],
    image: exportImg,
    imageAlt: "CocoAI export session panel with Markdown, JSON, and plain text download options",
    chrome: "cocoai — export session",
  },
  {
    id: "analysis",
    eyebrow: "Vision",
    title: "Scroll-Stitch Screen Analysis & Multi-Screenshot Solver",
    description:
      "Struggling with long coding prompts or complex diagrams? Press Ctrl+Shift+A to capture and solve code from any window or monitor. For long-scrolling pages, use Ctrl+Shift+S to stitch multiple page blocks together into a single, cohesive prompt that Gemini analyzes in one go.",
    chips: ["Ctrl+Shift+A Solve", "Scroll Stitching", "Any Monitor"],
    image: screenAnalysisImg,
    imageAlt:
      "Diagram of CocoAI screen analysis capturing multiple pages and stitching screenshots into one ultra-long context",
    chrome: "cocoai — screen analysis",
  },
];

function moduleNo(position: number) {
  return String(position + 1).padStart(2, "0");
}

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <SectionTag label="Features" />
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything You Need to Ace the Interview
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Five deeply-integrated systems working together in one invisible overlay.
          </p>
        </Reveal>

        <div className="mt-20 space-y-24 sm:mt-24 sm:space-y-32">
          {MODULES.map((module, i) => (
            <Reveal key={module.id} delay={i * 80}>
              <article>
                {/* Header */}
                <div className="max-w-3xl">
                  <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-lavender">
                    Module {moduleNo(i)} — {module.eyebrow}
                  </span>
                  <h3 className="font-display mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {module.title}
                  </h3>
                  <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
                    {module.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {module.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mockup */}
                <div className="relative mx-auto mt-10 w-full max-w-5xl">
                  {/* Ambient backlight */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-500 via-pink-500 to-rose-500 opacity-10 blur-3xl"
                  />
                  <div className="relative overflow-hidden rounded-xl border border-border bg-card">
                    {/* Chrome */}
                    <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
                      <div className="flex shrink-0 gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                        <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                        <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                      </div>
                      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-1 font-mono text-[11px] text-muted-foreground">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lavender" />
                        <span className="truncate">{module.chrome}</span>
                      </div>
                      <div className="w-10 shrink-0" />
                    </div>
                    <img
                      src={module.image}
                      alt={module.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="block h-auto w-full"
                    />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
