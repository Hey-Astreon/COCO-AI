import { useNavigation } from "@/lib/navigation";
import { Github, ExternalLink, Heart, Code2, Sparkles } from "lucide-react";

const ROUSHAN_GITHUB = "https://github.com/Hey-Astreon";
const AYUSHI_GITHUB = "https://github.com/Silenttears-cloud";
const ROUSHAN_PORTFOLIO = "https://Astreon.me";
const AYUSHI_PORTFOLIO = "https://Ayushiraj.me";
const COCO_REPO = "https://github.com/Hey-Astreon/COCO-AI";

export function AboutPage() {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen" style={{ background: "hsl(240 6% 5%)" }}>
      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div
            className="absolute top-[-80px] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(ellipse, hsl(262 83% 58%) 0%, hsl(330 80% 55%) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-20 text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "hsl(262 83% 58% / 0.12)",
              border: "1px solid hsl(262 83% 58% / 0.25)",
              color: "hsl(262 83% 72%)",
            }}
          >
            <Sparkles className="h-3 w-3" />
            Our Story
          </div>
          <h1
            className="text-5xl font-bold tracking-tight sm:text-6xl"
            style={{ color: "hsl(0 0% 96%)" }}
          >
            Built by developers,{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, hsl(262 83% 68%), hsl(330 80% 65%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              for developers
            </span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
            style={{ color: "hsl(240 5% 55%)" }}
          >
            CocoAI started as a personal tool to survive technical interviews. It
            grew into something we believe every developer deserves access to.
          </p>
        </div>
      </div>

      {/* ─── Mission Card ─── */}
      <div className="mx-auto max-w-4xl px-6 pb-16">
        <div
          className="relative rounded-2xl p-8 sm:p-10"
          style={{
            background: "hsl(240 6% 8% / 0.8)",
            border: "1px solid hsl(240 6% 16%)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            className="absolute top-0 left-12 right-12 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(262 83% 60% / 0.5), hsl(330 80% 60% / 0.5), transparent)",
            }}
          />
          <h2
            className="text-xl font-bold"
            style={{ color: "hsl(0 0% 92%)" }}
          >
            Why we built CocoAI
          </h2>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: "hsl(240 5% 58%)" }}
          >
            Technical interviews are broken. You're expected to perform at your
            absolute peak while someone watches every keystroke under artificial
            pressure. We've both been there — freezing on a problem we'd solved
            a hundred times before, just because the clock was ticking and eyes
            were watching.
          </p>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: "hsl(240 5% 58%)" }}
          >
            CocoAI isn't about cheating. It's about leveling the playing field.
            Big companies use AI tools internally every day. Why shouldn't
            candidates? We believe your nervousness shouldn't cost you the
            opportunity you worked years to earn.
          </p>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: "hsl(240 5% 58%)" }}
          >
            So we built an invisible, real-time assistant that works silently in
            the background — completely hidden from screen sharing — powered by
            the fastest AI inference on the planet. And we made it open source,
            because great tools should be accessible to everyone.
          </p>
        </div>
      </div>

      {/* ─── Team Section ─── */}
      <div className="mx-auto max-w-4xl px-6 pb-20">
        <div className="mb-10 text-center">
          <h2
            className="text-3xl font-bold"
            style={{ color: "hsl(0 0% 94%)" }}
          >
            The Team
          </h2>
          <p className="mt-2 text-sm" style={{ color: "hsl(240 5% 50%)" }}>
            Built by engineers who care about performance and privacy.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* ── Roushan Card ── */}
          <div
            className="group relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
            style={{
              background: "hsl(240 6% 9%)",
              border: "1px solid hsl(240 6% 16%)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(262 83% 58% / 0.4)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 40px hsl(262 83% 58% / 0.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(240 6% 16%)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            {/* Avatar glow */}
            <div
              className="absolute -top-8 -right-8 h-36 w-36 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20"
              style={{ background: "radial-gradient(circle, hsl(262 83% 58%), transparent)" }}
              aria-hidden="true"
            />

            {/* GitHub handle + Handle badge */}
            <div className="flex items-center justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(262 83% 58% / 0.2), hsl(330 80% 55% / 0.1))",
                  border: "1px solid hsl(262 83% 58% / 0.3)",
                  color: "hsl(262 83% 72%)",
                }}
              >
                R
              </div>
              <a
                href={ROUSHAN_GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors"
                style={{
                  background: "hsl(240 6% 14%)",
                  border: "1px solid hsl(240 6% 22%)",
                  color: "hsl(240 5% 60%)",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(0 0% 90%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsl(240 5% 60%)")}
              >
                <Github className="h-3 w-3" />
                Hey-Astreon
              </a>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-bold" style={{ color: "hsl(0 0% 94%)" }}>
                <a
                  href={ROUSHAN_PORTFOLIO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: "hsl(0 0% 94%)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(262 83% 72%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(0 0% 94%)")}
                >
                  Roushan Kumar
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              </h3>
              <p
                className="mt-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "hsl(262 83% 65%)" }}
              >
                Founder & Lead Developer
              </p>
            </div>

            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "hsl(240 5% 56%)" }}
            >
              The mind behind CocoAI.{" "}
              <a
                href={ROUSHAN_PORTFOLIO}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "hsl(262 83% 68%)" }}
              >
                Roushan
              </a>{" "}
              is a full-stack developer and indie hacker with a deep obsession for
              building tools that actually solve real problems. He architected the
              entire Electron stealth engine, the Cerebras AI integration, and the
              real-time audio transcription pipeline. When not shipping code, he's
              probably thinking about what to build next.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Electron", "React", "AI/ML", "Node.js", "Supabase"].map(skill => (
                <span
                  key={skill}
                  className="rounded-md px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: "hsl(240 6% 13%)",
                    border: "1px solid hsl(240 6% 20%)",
                    color: "hsl(240 5% 60%)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* ── Ayushi Card ── */}
          <div
            className="group relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
            style={{
              background: "hsl(240 6% 9%)",
              border: "1px solid hsl(240 6% 16%)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(330 80% 60% / 0.4)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 40px hsl(330 80% 55% / 0.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(240 6% 16%)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <div
              className="absolute -top-8 -right-8 h-36 w-36 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20"
              style={{ background: "radial-gradient(circle, hsl(330 80% 60%), transparent)" }}
              aria-hidden="true"
            />

            <div className="flex items-center justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(330 80% 60% / 0.2), hsl(262 83% 58% / 0.1))",
                  border: "1px solid hsl(330 80% 60% / 0.3)",
                  color: "hsl(330 80% 72%)",
                }}
              >
                A
              </div>
              <a
                href={AYUSHI_GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors"
                style={{
                  background: "hsl(240 6% 14%)",
                  border: "1px solid hsl(240 6% 22%)",
                  color: "hsl(240 5% 60%)",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(0 0% 90%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsl(240 5% 60%)")}
              >
                <Github className="h-3 w-3" />
                Silenttears-cloud
              </a>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-bold" style={{ color: "hsl(0 0% 94%)" }}>
                <a
                  href={AYUSHI_PORTFOLIO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: "hsl(0 0% 94%)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(330 80% 72%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(0 0% 94%)")}
                >
                  Ayushi Raj
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              </h3>
              <p
                className="mt-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "hsl(330 80% 65%)" }}
              >
                Co-Developer & UX Lead
              </p>
            </div>

            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "hsl(240 5% 56%)" }}
            >
              The eye for quality behind CocoAI.{" "}
              <a
                href={AYUSHI_PORTFOLIO}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "hsl(330 80% 68%)" }}
              >
                Ayushi
              </a>{" "}
              brings precision, user empathy, and a sharp design sense to every
              component. She shaped CocoAI's UI language, the product's overall
              polish, and the attention to detail that separates good software
              from great software. Her perspective as a developer and user herself
              keeps the product honest and human.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["UI/UX", "TypeScript", "React", "Design Systems", "CSS"].map(skill => (
                <span
                  key={skill}
                  className="rounded-md px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: "hsl(240 6% 13%)",
                    border: "1px solid hsl(240 6% 20%)",
                    color: "hsl(240 5% 60%)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Open Source CTA ─── */}
      <div className="mx-auto max-w-4xl px-6 pb-24">
        <div
          className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl px-8 py-12 text-center"
          style={{
            background: "linear-gradient(135deg, hsl(262 83% 58% / 0.12), hsl(330 80% 55% / 0.08))",
            border: "1px solid hsl(262 83% 58% / 0.2)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <Code2 className="h-10 w-10" style={{ color: "hsl(262 83% 68%)" }} />
          <div>
            <h3 className="text-2xl font-bold" style={{ color: "hsl(0 0% 94%)" }}>
              100% Open Source
            </h3>
            <p className="mt-2 max-w-md text-sm" style={{ color: "hsl(240 5% 55%)" }}>
              CocoAI is fully open source. Read the code, fork it, contribute,
              or audit exactly how it works. No black boxes. No hidden trackers.
            </p>
          </div>
          <a
            href={COCO_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, hsl(262 83% 58%), hsl(330 80% 55%))",
              boxShadow: "0 4px 20px hsl(262 83% 58% / 0.35)",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 28px hsl(262 83% 58% / 0.5)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 20px hsl(262 83% 58% / 0.35)")}
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>

      {/* ─── Back nav ─── */}
      <div className="pb-16 text-center">
        <button
          onClick={() => navigate("/")}
          className="text-sm transition-colors"
          style={{ color: "hsl(240 5% 45%)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "hsl(262 83% 72%)")}
          onMouseLeave={e => (e.currentTarget.style.color = "hsl(240 5% 45%)")}
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}
