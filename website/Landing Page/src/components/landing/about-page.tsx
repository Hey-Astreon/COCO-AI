import { useNavigate } from "@tanstack/react-router";
import { Code2, Github, Sparkles, Heart } from "lucide-react";
import { SectionTag } from "./section-tag";
import { Reveal } from "./reveal";
import { DeveloperCard } from "./developer-card";
import { AboutTimeline } from "./about-timeline";
import { PrivacyAuditWidget } from "./privacy-audit-widget";

const ROUSHAN_GITHUB = "https://github.com/Hey-Astreon";
const AYUSHI_GITHUB = "https://github.com/Silenttears-cloud";
const ROUSHAN_PORTFOLIO = "https://Astreon.me";
const AYUSHI_PORTFOLIO = "https://Ayushiraj.me";
const COCO_REPO = "https://github.com/Hey-Astreon/COCO-AI";

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07070c] text-foreground">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden pt-32 pb-16 px-4 sm:px-6">
        {/* Ambient Aurora Orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-aurora absolute top-[-120px] left-1/2 h-[500px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/30 via-pink-500/20 to-rose-500/25 blur-[130px]" />
          <div
            className="animate-aurora absolute right-[-140px] top-[30%] h-[380px] w-[380px] rounded-full bg-gradient-to-br from-pink-500/20 to-violet-600/20 blur-[110px]"
            style={{ animationDelay: "-7s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="glass-card mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-300 border border-violet-500/30 shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              <span>Built Out of Necessity • Engineered for Absolute Stealth &amp; Speed</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-display mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Built by developers, <br />
              <span
                className="text-gradient"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                for developers worldwide
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              CocoAI started when we froze during a high-stakes technical interview. It grew into a
              category-defining open-source stealth engine that every developer deserves access to.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ─── 1. Engineering Evolution Timeline ─── */}
      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <Reveal>
          <AboutTimeline />
        </Reveal>
      </div>

      {/* ─── 2. 3D Holographic Developer Cards ─── */}
      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <Reveal className="mb-10 text-center">
          <SectionTag label="The Developers" />
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Meet the Engineers Behind CocoAI
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Hover over each developer card to inspect 3D tilt effects and code contributions
          </p>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2">
          {/* Roushan Card */}
          <Reveal>
            <DeveloperCard
              name="Roushan Kumar"
              role="Founder & Lead Architect"
              handle="Hey-Astreon"
              githubUrl={ROUSHAN_GITHUB}
              portfolioUrl={ROUSHAN_PORTFOLIO}
              portfolioDomain="Astreon.me"
              avatarLetter="R"
              glowColor="violet"
              bio="Full-stack engineer and indie builder obsessed with high-craft software. Roushan architected the native C++ DirectX SetWindowDisplayAffinity stealth binding, the Cerebras ultra-fast LLM pipeline, and the VAD audio transcript engine."
              skills={["Electron", "C++ DirectX", "Cerebras LPU", "React", "Node.js"]}
              snippetTitle="DirectX Window Stealth Binding (C++)"
              snippetCode={`// Windows OS-level screen share protection
const HWND hwnd = (HWND)window->GetNativeWindow();
SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE);
// Verified 0% window leakage on Zoom / Meet / OBS`}
            />
          </Reveal>

          {/* Ayushi Card */}
          <Reveal delay={100}>
            <DeveloperCard
              name="Ayushi Raj"
              role="Co-Developer & UX Lead"
              handle="Silenttears-cloud"
              githubUrl={AYUSHI_GITHUB}
              portfolioUrl={AYUSHI_PORTFOLIO}
              portfolioDomain="Ayushiraj.me"
              avatarLetter="A"
              glowColor="pink"
              bio="The eye for quality behind CocoAI. Ayushi brings UX empathy, design system rigor, and attention to micro-interactions. She designed CocoAI's sleek HUD overlay language, component architecture, and seamless keyboard workflow."
              skills={["UI/UX Design", "TypeScript", "React", "TailwindCSS", "Design Systems"]}
              snippetTitle="HUD Overlay State Manager (React/TS)"
              snippetCode={`// Real-time HUD opacity & hotkey controller
const [hudState, setHudState] = useState<HudConfig>({
  opacity: 0.9,
  stealthMode: true,
  vadTrigger: true
});`}
            />
          </Reveal>
        </div>
      </div>

      {/* ─── 3. Anti-Track Privacy & Security Auditor ─── */}
      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <Reveal>
          <PrivacyAuditWidget />
        </Reveal>
      </div>

      {/* ─── 4. 100% Open Source Callout ─── */}
      <Reveal>
        <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-zinc-950/90 p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl">
            <div
              className="pointer-events-none absolute -inset-8 opacity-20 blur-3xl"
              style={{
                background: "radial-gradient(circle, #8b5cf6 0%, #ec4899 60%, transparent 80%)",
              }}
              aria-hidden="true"
            />

            <Code2 className="mx-auto h-12 w-12 text-violet-400" />
            <h3 className="font-display text-3xl font-extrabold text-white mt-4">
              100% Open Source &amp; Transparent
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-300">
              CocoAI is built in the open. You can inspect the code, fork it, submit pull requests, or
              verify that zero trackers exist. No black boxes. No hidden telemetry.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={COCO_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-500/30 transition-all duration-200 hover:scale-105"
              >
                <Github className="h-4 w-4" />
                View Repository on GitHub
              </a>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ─── Back Navigation ─── */}
      <div className="pb-16 text-center">
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-sm font-mono text-zinc-400 transition-colors hover:text-violet-400 cursor-pointer"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}
