import { useState } from "react";
import { ShieldCheck, Video, Code, MonitorPlay, Sparkles, Check } from "lucide-react";

type PlatformCategory = "all" | "video" | "coding" | "async";

interface Platform {
  name: string;
  category: "video" | "coding" | "async";
  categoryLabel: string;
  badge: string;
  color: string;
  icon: JSX.Element;
}

const PLATFORMS: Platform[] = [
  // ── Video Interviews ──
  {
    name: "Zoom",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#2D8CFF",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#2D8CFF" />
        <path fill="white" d="M8 17a3 3 0 013-3h18a3 3 0 013 3v14a3 3 0 01-3 3H11a3 3 0 01-3-3V17z" />
        <path fill="#2D8CFF" d="M32 22l8-5v14l-8-5V22z" />
      </svg>
    ),
  },
  {
    name: "Google Meet",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#00875A",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#1e1e2e" border="1px solid #333" />
        <path fill="#ea4335" d="M12 14h10v10H12z" />
        <path fill="#4285f4" d="M22 14h14v10H22z" />
        <path fill="#fbbc04" d="M12 24h10v10H12z" />
        <path fill="#34a853" d="M22 24h10v10H22z" />
        <path fill="#00875A" d="M32 20l8-4v16l-8-4z" />
      </svg>
    ),
  },
  {
    name: "Microsoft Teams",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#6264A7",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#6264A7" />
        <path fill="white" d="M29 14a4 4 0 110 8 4 4 0 010-8zm4 10h-8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-4-2a5 5 0 100-10 5 5 0 000 10zm-10 0a3 3 0 100-6 3 3 0 000 6zm0 2c-3.3 0-10 1.7-10 5v2h10v-2c0-1.4.4-2.7 1.2-3.8-.4-.1-.8-.2-1.2-.2z" />
      </svg>
    ),
  },
  {
    name: "Webex",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#00BEF2",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#00BEF2" />
        <path fill="white" d="M24 10c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14S31.7 10 24 10zm5.5 20l-5.5-8.5L18.5 30 13 18h4l1.5 8 5-8 5 8 1.5-8H34l-4.5 12z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#5865F2",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#5865F2" />
        <path fill="white" d="M33.5 13a22.7 22.7 0 00-5.8-1.8l-.3.5a15.8 15.8 0 00-4 0l-.3-.5A22.3 22.3 0 0017.4 13C14.1 18 13.2 22.8 13.6 27.5a23 23 0 007 3.5 17 17 0 001.5-2.5l-2.4-1.1.6-.5 2.5 1.2a14.9 14.9 0 0010.5 0l2.5-1.2.6.5-2.4 1.1a17 17 0 001.5 2.5 23 23 0 007-3.5c.5-5.4-1-10.1-3-14.5zM20 25c-1.1 0-2-1-2-2.3S18.9 20.3 20 20.3s2 1.1 2 2.4S21.1 25 20 25zm8 0c-1.1 0-2-1-2-2.3S26.9 20.3 28 20.3s2 1.1 2 2.4S29.1 25 28 25z" />
      </svg>
    ),
  },
  {
    name: "Amazon Chime",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#1A9C8D",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#1A9C8D" />
        <path fill="white" d="M14 18h20v4H14zm0 8h14v4H14z" />
      </svg>
    ),
  },
  {
    name: "Lark / Feishu",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#00D6B9",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#00D6B9" />
        <path fill="white" d="M16 16l16 8-16 8V16z" />
      </svg>
    ),
  },

  // ── Coding Rounds ──
  {
    name: "LeetCode",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#FFA116",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#282828" />
        <path fill="#FFA116" d="M28 12l-8 8 8 8M16 28l16 8" stroke="#FFA116" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "HackerRank",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#2EC4B6",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#00EA64" />
        <path fill="black" d="M18 12h4v24h-4zm8 0h4v24h-4z" />
      </svg>
    ),
  },
  {
    name: "CodeSignal",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#040D21",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#1565C0" />
        <path fill="white" d="M14 16l10 16 10-16H14z" />
      </svg>
    ),
  },
  {
    name: "Codility",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#F5A623",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#F5A623" />
        <path fill="black" d="M16 16h8v16h-8z" />
      </svg>
    ),
  },
  {
    name: "CoderPad",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#E63946",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#E63946" />
        <path fill="white" d="M16 18l-5 6 5 6m16-12l5 6-5 6" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "HackerEarth",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#323754",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#323754" />
        <path fill="#2C71F6" d="M16 14h6v20h-6zm10 0h6v20h-6z" />
      </svg>
    ),
  },

  // ── Async & Enterprise ──
  {
    name: "HireVue",
    category: "async",
    categoryLabel: "Async interviews",
    badge: "100% Supported",
    color: "#6B5B95",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#1C2331" />
        <path fill="#FF6F61" d="M18 16h6v16h-6zm8 0h6v16h-6z" />
      </svg>
    ),
  },
  {
    name: "VidCruiter",
    category: "async",
    categoryLabel: "Async interviews",
    badge: "100% Supported",
    color: "#00A896",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0">
        <rect width="48" height="48" rx="12" fill="#00A896" />
        <circle cx="24" cy="24" r="8" fill="white" />
      </svg>
    ),
  },
];

export function Platforms() {
  const [activeCategory, setActiveCategory] = useState<PlatformCategory>("all");

  const filteredPlatforms =
    activeCategory === "all"
      ? PLATFORMS
      : PLATFORMS.filter(p => p.category === activeCategory);

  return (
    <section id="platforms" className="relative py-24 px-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 h-[450px] w-[900px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(ellipse, hsl(262 83% 58%) 0%, hsl(196 80% 50%) 40%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "hsl(262 83% 58% / 0.12)",
              border: "1px solid hsl(262 83% 58% / 0.25)",
              color: "hsl(262 83% 72%)",
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Universal Compatibility
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Works with Every{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(262 83% 68%), hsl(196 80% 60%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Interview Platform
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Use CocoAI alongside the video, live coding, and asynchronous interview tools
            companies already use. Completely invisible to screen sharing and proctoring tools.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all",    label: "All Platforms (15+)", icon: Sparkles },
              { id: "video",  label: "Video Interviews",    icon: Video },
              { id: "coding", label: "Coding Rounds",       icon: Code },
              { id: "async",  label: "Async & Assessment",  icon: MonitorPlay },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id as PlatformCategory)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, hsl(262 83% 58%), hsl(196 80% 55%))"
                      : "hsl(240 6% 10%)",
                    border: isActive
                      ? "1px solid transparent"
                      : "1px solid hsl(240 6% 18%)",
                    color: isActive ? "#ffffff" : "hsl(240 5% 65%)",
                    boxShadow: isActive
                      ? "0 4px 20px hsl(262 83% 58% / 0.35)"
                      : "none",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Grid of Platform Cards ─── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {filteredPlatforms.map((p, i) => (
            <div
              key={p.name}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 transition-all duration-300"
              style={{
                background: "hsl(240 6% 8% / 0.85)",
                border: "1px solid hsl(240 6% 16%)",
                backdropFilter: "blur(16px)",
                animation: `fadeInUp 0.35s ease ${i * 0.04}s both`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}55`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 10px 36px ${p.color}18`;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(240 6% 16%)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              {/* Subtle top brand accent line on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: p.color }}
              />

              {/* Top row: Logo + Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="transition-transform duration-300 group-hover:scale-105">
                  {p.icon}
                </div>

                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    background: "hsl(142 70% 45% / 0.12)",
                    border: "1px solid hsl(142 70% 45% / 0.25)",
                    color: "hsl(142 70% 60%)",
                  }}
                >
                  <Check className="h-2.5 w-2.5" />
                  {p.badge}
                </span>
              </div>

              {/* Bottom row: Name + Category */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-foreground group-hover:text-white transition-colors">
                  {p.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.categoryLabel}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Stealth Guarantee Banner ─── */}
        <div
          className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl p-6 sm:p-8"
          style={{
            background: "linear-gradient(135deg, hsl(262 83% 58% / 0.1), hsl(196 80% 50% / 0.06))",
            border: "1px solid hsl(262 83% 58% / 0.2)",
          }}
        >
          <div className="flex items-start gap-4 text-left">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "hsl(262 83% 58% / 0.2)",
                border: "1px solid hsl(262 83% 58% / 0.3)",
              }}
            >
              <ShieldCheck className="h-6 w-6" style={{ color: "hsl(262 83% 72%)" }} />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                🔒 Guaranteed 100% Invisible to Screen Sharing
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                CocoAI uses native Windows OS DirectX content protection (`SetWindowDisplayAffinity`).
                Zoom, Google Meet, Teams, Discord, and proctoring scripts only capture a black void or see straight through the window.
              </p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
