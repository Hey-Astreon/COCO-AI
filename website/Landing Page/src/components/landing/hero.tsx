import { ArrowUpRight, Download, EyeOff, Github, Mic, Shield, Sparkles, Star, Zap } from "lucide-react";
import { COCOAI_RELEASES_URL, COCOAI_REPO_URL } from "@/lib/links";
import { Reveal } from "./reveal";
import { HeroHudWidget } from "./hero-hud-widget";

const HERO_BADGES = [
  "🛡️ 100% Local & Private",
  "🔒 Invisible to Zoom / Meet / Teams",
  "⚡ Powered by Cerebras Ultra-Fast AI",
];

const HERO_STATS = [
  { value: "<200ms", label: "Cerebras Inference Latency" },
  { value: "100%", label: "Screen-Share Protection" },
  { value: "15+", label: "Tested Interview Platforms" },
  { value: "0", label: "Server Logs & Trackers" },
];

interface HeroProps {
  onDownloadClick?: () => void;
}

export function Hero({ onDownloadClick }: HeroProps) {
  return (
    <section id="top" className="relative overflow-hidden px-4 pt-32 pb-16 sm:px-6 sm:pt-40">
      {/* Ambient background lighting using official logo colors */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-aurora absolute -top-40 left-1/2 h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/30 via-fuchsia-500/25 to-pink-500/20 blur-[130px]" />
        <div
          className="animate-aurora absolute top-10 -right-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-pink-500/20 to-violet-600/20 blur-[110px]"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="animate-aurora absolute -bottom-32 -left-40 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-violet-600/25 to-pink-500/15 blur-[120px]"
          style={{ animationDelay: "-11s" }}
        />
      </div>

      <div className="mx-auto max-w-6xl text-center">
        {/* Live Pill Badge */}
        <Reveal>
          <div className="glass-card mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10">
            <span className="animate-live-pulse h-2 w-2 rounded-full bg-pink-500" />
            <span>#1 Stealth Copilot for Live Technical &amp; Coding Interviews</span>
          </div>
        </Reveal>

        {/* ─── Kinetic Word-Rise Headline ─── */}
        <div className="mx-auto mt-6 max-w-4xl font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="overflow-hidden pb-1">
              <span className="hero-word-rise inline-block" style={{ animationDelay: "0s" }}>
                Ace
              </span>
            </span>
            <span className="overflow-hidden pb-1">
              <span className="hero-word-rise inline-block" style={{ animationDelay: "0.08s" }}>
                Your
              </span>
            </span>
            <span className="overflow-hidden pb-1">
              <span className="hero-word-rise inline-block text-foreground/80" style={{ animationDelay: "0.16s" }}>
                Technical
              </span>
            </span>
            <span className="overflow-hidden pb-1">
              <span className="hero-word-rise inline-block" style={{ animationDelay: "0.24s" }}>
                Interviews.
              </span>
            </span>
            <span className="overflow-hidden pb-1">
              <span
                className="hero-word-rise inline-block text-gradient"
                style={{
                  animationDelay: "0.32s",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Invisibly.
              </span>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <Reveal delay={250}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Real-time audio question detection, personalized answers based on your resume,
            and an invisible DirectX overlay. Powered by Cerebras ultra-fast inference.
          </p>
        </Reveal>

        {/* Action Buttons */}
        <Reveal delay={350}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={onDownloadClick}
              className="btn-primary-glow btn-shine inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-xl transition-all duration-200 hover:scale-[1.02] sm:w-auto"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
              }}
              aria-label="Download CocoAI for Windows"
            >
              <Download className="h-4 w-4" />
              Download CocoAI for Windows
            </button>

            <a
              href={COCOAI_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-lift inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-7 py-4 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:bg-zinc-800 hover:text-white sm:w-auto"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
              <Star className="h-3.5 w-3.5 text-pink-400 fill-pink-400/20" />
            </a>

            <a
              href={COCOAI_RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-lift inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-7 py-4 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:bg-zinc-800 hover:text-white sm:w-auto"
            >
              View Releases
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        {/* Feature Pill Badges */}
        <Reveal delay={450}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-400">
            {HERO_BADGES.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5">
                {badge}
              </span>
            ))}
          </div>
        </Reveal>

        {/* ─── Interactive Floating Hero HUD Simulator ─── */}
        <Reveal delay={550} className="mt-16">
          <HeroHudWidget />
        </Reveal>

        {/* Stats Strip */}
        <Reveal delay={650}>
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur-lg"
              >
                <span
                  className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-zinc-400 text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
