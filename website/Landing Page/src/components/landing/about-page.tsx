import { useNavigate } from "@tanstack/react-router";
import { Github, ExternalLink, Code2 } from "lucide-react";
import { SectionTag } from "./section-tag";
import { Reveal } from "./reveal";

const ROUSHAN_GITHUB = "https://github.com/Hey-Astreon";
const AYUSHI_GITHUB = "https://github.com/Silenttears-cloud";
const ROUSHAN_PORTFOLIO = "https://Astreon.me";
const AYUSHI_PORTFOLIO = "https://Ayushiraj.me";
const COCO_REPO = "https://github.com/Hey-Astreon/COCO-AI";

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        {/* Aurora orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="animate-aurora absolute top-[-120px] left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/25 via-pink-500/15 to-rose-500/20 blur-[110px]" />
          <div
            className="animate-aurora absolute right-[-140px] top-[30%] h-[340px] w-[340px] rounded-full bg-gradient-to-br from-pink-500/15 to-rose-500/10 blur-[100px]"
            style={{ animationDelay: "-7s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-20 text-center">
          <Reveal>
            <SectionTag label="Our Story" />
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Built by developers, <span className="text-gradient">for developers</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              CocoAI started as a personal tool to survive technical interviews. It grew into
              something we believe every developer deserves access to.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ─── Mission Card ─── */}
      <Reveal>
        <div className="mx-auto max-w-4xl px-6 pb-16">
          <div className="glass-card gradient-top-border isolate relative overflow-hidden rounded-2xl p-8 sm:p-10">
            <div
              className="absolute right-0 bottom-0 -z-10 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl"
              aria-hidden="true"
            />
            <h2 className="font-display text-xl font-bold text-foreground">Why we built CocoAI</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Technical interviews are broken. You're expected to perform at your absolute peak
              while someone watches every keystroke under artificial pressure. We've both been there
              — freezing on a problem we'd solved a hundred times before, just because the clock was
              ticking and eyes were watching.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              CocoAI isn't about cheating. It's about leveling the playing field. Big companies use
              AI tools internally every day. Why shouldn't candidates? We believe your nervousness
              shouldn't cost you the opportunity you worked years to earn.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              So we built an invisible, real-time assistant that works silently in the background —
              completely hidden from screen sharing — powered by the fastest AI inference on the
              planet. And we made it open source, because great tools should be accessible to
              everyone.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ─── Team Section ─── */}
      <div className="mx-auto max-w-4xl px-6 pb-20">
        <Reveal className="mb-10 text-center">
          <SectionTag label="The Team" />
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground">
            Built by engineers who care about performance and privacy.
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* ── Roushan Card ── */}
          <Reveal>
            <div className="glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:border-lavender/35 hover:shadow-[0_20px_60px_-25px_rgba(139,92,246,0.35)]">
              {/* Avatar glow */}
              <div
                className="absolute -top-8 -right-8 h-36 w-36 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-25"
                style={{ background: "radial-gradient(circle, hsl(262 83% 58%), transparent)" }}
                aria-hidden="true"
              />

              {/* GitHub handle + Handle badge */}
              <div className="flex items-center justify-between">
                <div className="bg-gradient-brand flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white shadow-lg shadow-violet-500/20">
                  R
                </div>
                <a
                  href={ROUSHAN_GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Github className="h-3 w-3" />
                  Hey-Astreon
                </a>
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-bold text-foreground">
                  <a
                    href={ROUSHAN_PORTFOLIO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-lavender"
                  >
                    Roushan Kumar
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </h3>
                <p className="mt-1 text-xs font-semibold tracking-wider text-lavender uppercase">
                  Founder & Lead Developer
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                The mind behind CocoAI.{" "}
                <a
                  href={ROUSHAN_PORTFOLIO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-lavender underline-offset-2 hover:underline"
                >
                  Roushan
                </a>{" "}
                is a full-stack developer and indie hacker with a deep obsession for building tools
                that actually solve real problems. He architected the entire Electron stealth
                engine, the Cerebras AI integration, and the real-time audio transcription pipeline.
                When not shipping code, he's probably thinking about what to build next.
              </p>

              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {["Electron", "React", "AI/ML", "Node.js", "Supabase"].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-border bg-accent/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:border-lavender/25"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── Ayushi Card ── */}
          <Reveal delay={100}>
            <div className="glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:border-pink/35 hover:shadow-[0_20px_60px_-25px_rgba(236,72,153,0.3)]">
              <div
                className="absolute -top-8 -right-8 h-36 w-36 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-25"
                style={{ background: "radial-gradient(circle, hsl(330 80% 60%), transparent)" }}
                aria-hidden="true"
              />

              <div className="flex items-center justify-between">
                <div className="bg-gradient-brand flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white shadow-lg shadow-pink-500/20">
                  A
                </div>
                <a
                  href={AYUSHI_GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Github className="h-3 w-3" />
                  Silenttears-cloud
                </a>
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-bold text-foreground">
                  <a
                    href={AYUSHI_PORTFOLIO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-pink"
                  >
                    Ayushi Raj
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </h3>
                <p className="mt-1 text-xs font-semibold tracking-wider text-pink uppercase">
                  Co-Developer & UX Lead
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                The eye for quality behind CocoAI.{" "}
                <a
                  href={AYUSHI_PORTFOLIO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-pink underline-offset-2 hover:underline"
                >
                  Ayushi
                </a>{" "}
                brings precision, user empathy, and a sharp design sense to every component. She
                shaped CocoAI's UI language, the product's overall polish, and the attention to
                detail that separates good software from great software. Her perspective as a
                developer and user herself keeps the product honest and human.
              </p>

              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {["UI/UX", "TypeScript", "React", "Design Systems", "CSS"].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-border bg-accent/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:border-pink/25"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ─── Open Source CTA ─── */}
      <Reveal>
        <div className="mx-auto max-w-4xl px-6 pb-24">
          <div className="gradient-border-animated relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-card px-8 py-12 text-center">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
              aria-hidden="true"
            />
            <Code2 className="h-10 w-10 text-lavender" />
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">100% Open Source</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                CocoAI is fully open source. Read the code, fork it, contribute, or audit exactly
                how it works. No black boxes. No hidden trackers.
              </p>
            </div>
            <a
              href={COCO_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/45 hover:scale-[1.02]"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </Reveal>

      {/* ─── Back nav ─── */}
      <div className="pb-16 text-center">
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-sm text-muted-foreground transition-colors hover:text-lavender"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}
