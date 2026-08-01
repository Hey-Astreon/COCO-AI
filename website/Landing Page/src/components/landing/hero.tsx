import { ArrowRight, Download, Github, Sparkles, Star } from "lucide-react";
import { COCOAI_RELEASES_URL, COCOAI_REPO_URL } from "@/lib/links";
import { Reveal } from "./reveal";
import { OrbitalHeroNetwork } from "./orbital-hero-network";
import { LogoTicker } from "./logo-ticker";
import { HeroHudWidget } from "./hero-hud-widget";

interface HeroProps {
  onDownloadClick?: () => void;
}

export function Hero({ onDownloadClick }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* ─── Ambient Mesh Lighting ─── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-aurora absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/20 via-pink-500/15 to-rose-500/10 blur-[140px]" />
        <div
          className="animate-aurora absolute top-20 right-0 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-pink-500/10 to-violet-600/15 blur-[120px]"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="animate-aurora absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-600/15 to-pink-500/10 blur-[130px]"
          style={{ animationDelay: "-11s" }}
        />
      </div>

      {/* ─── Full-Viewport Hero Container ─── */}
      <section id="top" className="relative px-4 pt-28 pb-12 sm:px-6 sm:pt-36 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">

            {/* ─── Left Side: Headline & Conic CTA ─── */}
            <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
              {/* Badge */}
              <Reveal>
                <div className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-500/30 bg-violet-500/10 shadow-lg">
                  <span className="animate-live-pulse h-2 w-2 rounded-full bg-pink-500" />
                  <span>#1 Invisible AI Copilot for Technical Interviews</span>
                </div>
              </Reveal>

              {/* Headline with Word-Rise Entrance Physics */}
              <Reveal delay={100}>
                <h1 className="font-display mt-6 text-4xl leading-[1.08] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Unlock Your <br className="hidden sm:inline" />
                  <span
                    className="text-gradient"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #7c3aed 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Dream Tech Role.
                  </span>
                  <br />
                  Invisibly.
                </h1>
              </Reveal>

              {/* Subtitle */}
              <Reveal delay={250}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Real-time audio question detection, personalized answers tailored to your resume,
                  and native DirectX screen-share protection. Powered by Cerebras ultra-fast LLMs.
                </p>
              </Reveal>

              {/* CTA Action Bar with Rotating Conic-Gradient Border */}
              <Reveal delay={350}>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap lg:justify-start">
                  {/* Conic-Gradient Border Button Wrapper */}
                  <div className="btn-border-wrap">
                    <button
                      onClick={onDownloadClick}
                      className="group relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-bold text-background transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-600 hover:to-pink-600 hover:text-white hover:shadow-lg hover:shadow-violet-500/30"
                      aria-label="Download CocoAI for Windows"
                    >
                      <span>Download CocoAI for Windows</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>

                  <a
                    href={COCOAI_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary-lift inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-4 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-accent sm:w-auto"
                  >
                    <Github className="h-4 w-4" />
                    Star on GitHub
                    <Star className="h-3.5 w-3.5 text-pink-500 fill-pink-500/20" />
                  </a>
                </div>
              </Reveal>

              {/* Glowing Purple Cursor Badge */}
              <Reveal delay={450}>
                <div className="mt-8 flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-mono text-violet-700 dark:text-violet-300 shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
                  <span>⚡ Cerebras Speed Engine: 200+ tokens/sec</span>
                </div>
              </Reveal>
            </div>

            {/* ─── Right Side: Concentric Orbital Network ─── */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <Reveal delay={300}>
                <OrbitalHeroNetwork />
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Interactive Hero HUD Simulator Playground ─── */}
      <section className="relative px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl text-center mb-6">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Interactive Live Demonstration
          </span>
          <h2 className="font-display text-2xl font-bold text-foreground mt-1">
            Test the CocoAI Stealth HUD Live Below
          </h2>
        </div>
        <HeroHudWidget />
      </section>

      {/* ─── Infinite Horizontal Logo Ticker Strip ─── */}
      <LogoTicker />
    </div>
  );
}
