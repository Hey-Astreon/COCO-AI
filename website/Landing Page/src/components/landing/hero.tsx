import { ArrowUpRight, Download, EyeOff, Github, Mic, ShieldCheck, Star, Zap } from "lucide-react";
import heroPreview from "@/assets/real_cocoai_ui_preview.webp";
import { COCOAI_RELEASES_URL, COCOAI_REPO_URL } from "@/lib/links";
import { Reveal } from "./reveal";
import { WordReveal } from "./word-reveal";
import { usePageProgress } from "@/lib/use-page-progress";

const HERO_BADGES = ["100% Local & Private", "Invisible on Screen Share", "v1.0.38 for Windows"];

const HERO_STATS = [
  { value: "15+", label: "Interview platforms" },
  { value: "<1s", label: "First answer latency" },
  { value: "100%", label: "Local & private" },
  { value: "50K", label: "Free tokens / month" },
];

const FLOAT_CHIPS = [
  {
    icon: Mic,
    text: "Question detected",
    className: "left-0 top-1/3 -translate-y-1/2 -ml-4 sm:-ml-10",
  },
  { icon: Zap, text: "Answer in <1s", className: "right-0 top-16 translate-x-2 sm:translate-x-6" },
  { icon: EyeOff, text: "Invisible on share", className: "left-6 -bottom-5" },
];

interface HeroProps {
  onDownloadClick?: () => void;
}

export function Hero({ onDownloadClick }: HeroProps) {
  const progress = usePageProgress();
  const pct = Math.round(progress * 100);

  return (
    <>
      {/* Preload the LCP hero image early — React 19 hoists this <link> into
          <head>, so the browser starts fetching it before layout/parse. */}
      <link rel="preload" as="image" href={heroPreview} fetchPriority="high" />

      <section id="top" className="relative overflow-hidden px-4 pt-32 pb-16 sm:px-6 sm:pt-40">
        {/* Aurora orbs — bolder ambient light behind the hero */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-aurora absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/30 via-pink-500/20 to-rose-500/25 blur-[120px]" />
          <div
            className="animate-aurora absolute top-10 -right-40 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-pink-500/25 to-rose-500/15 blur-[100px]"
            style={{ animationDelay: "-6s" }}
          />
          <div
            className="animate-aurora absolute -bottom-32 -left-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-violet-600/20 to-lavender/20 blur-[110px]"
            style={{ animationDelay: "-11s" }}
          />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <div className="glass-card mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-lavender" />
              Stealth copilot for live coding &amp; system design interviews
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-display mx-auto mt-6 max-w-4xl text-4xl leading-[1.08] font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <WordReveal
                words={[
                  { text: "Ace" },
                  { text: "Your" },
                  { text: "Technical" },
                  { text: "Interviews." },
                  { text: "Invisibly.", className: "text-gradient-animate" },
                ]}
              />
            </h1>
          </Reveal>

          <Reveal delay={250}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Real-time question detection, personalized answers based on your resume, and a fully
              customizable stealth overlay. Running locally, safely, and securely.
            </p>
          </Reveal>

          <Reveal delay={350}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={onDownloadClick}
                className="btn-primary-glow btn-shine inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-bold text-background sm:w-auto"
                aria-label="Download CocoAI for Windows"
              >
                <Download className="h-4 w-4" />
                Download CocoAI for Windows
              </button>
              <a
                href={COCOAI_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-lift inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground sm:w-auto"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
                <Star className="h-3.5 w-3.5 text-lavender" />
              </a>
              <a
                href={COCOAI_RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-lift inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground sm:w-auto"
              >
                View Releases
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={450}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {HERO_BADGES.map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-faint" />
                  {badge}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Browser mockup with floating status chips */}
          <Reveal delay={550} className="mt-16">
            <div className="relative mx-auto max-w-5xl">
              {/* Faint purple-pink ambient backlight — the only glow on the page */}
              <div
                aria-hidden="true"
                className="bg-gradient-brand absolute -inset-8 rounded-[2rem] opacity-15 blur-2xl"
              />

              <div className="glass-card relative overflow-hidden rounded-2xl">
                {/* Reading-progress bar — like a browser page-load bar, driven by
                  the same scroll progress as the navbar hairline */}
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-transparent">
                  <div
                    className="h-full origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.6)] transition-transform duration-150 ease-out"
                    style={{ transform: `scaleX(${progress})` }}
                  />
                </div>

                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                    <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                    <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                  </div>
                  <div className="glass-card mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full px-4 py-1 text-xs text-muted-foreground">
                    <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-lavender" />
                    cocoai — stealth overlay active
                  </div>
                  <div className="w-10" />
                </div>
                <img
                  src={heroPreview}
                  alt="CocoAI live interview copilot interface showing AI answers and a real-time transcript feed"
                  width={1045}
                  height={772}
                  className="block h-auto w-full"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>

              {/* Floating status chips — hidden on very small screens */}
              {FLOAT_CHIPS.map((chip) => (
                <div
                  key={chip.text}
                  className={`animate-float absolute z-10 hidden md:block ${chip.className}`}
                >
                  <div className="glass-card flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-foreground shadow-xl">
                    <chip.icon className="h-3.5 w-3.5 text-lavender" />
                    {chip.text}
                  </div>
                </div>
              ))}

              {/* Reading progress pill — appears once you start scrolling */}
              <div
                className={`pointer-events-none absolute right-4 -bottom-5 z-10 transition-all duration-300 ${
                  progress > 0.02 && progress < 0.98
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
              >
                <div className="glass-card flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-foreground shadow-xl">
                  <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted-foreground/25">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  {pct}% read
                </div>
              </div>
            </div>
          </Reveal>

          {/* Stats strip */}
          <Reveal delay={650}>
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-gradient sm:text-4xl">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
