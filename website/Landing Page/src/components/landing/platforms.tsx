import { useState } from "react";
import { ShieldCheck, Video, Code, MonitorPlay, Sparkles, Check } from "lucide-react";
import amazonChime from "@/assets/platform-logos/amazon-chime.webp";
import coderpad from "@/assets/platform-logos/coderpad.webp";
import codesignal from "@/assets/platform-logos/codesignal.webp";
import codility from "@/assets/platform-logos/codility.webp";
import discord from "@/assets/platform-logos/discord.webp";
import googleMeet from "@/assets/platform-logos/google-meet.webp";
import hackerearth from "@/assets/platform-logos/hackerearth.webp";
import hackerrank from "@/assets/platform-logos/hackerrank.webp";
import hirevue from "@/assets/platform-logos/hirevue.webp";
import lark from "@/assets/platform-logos/lark.webp";
import leetcode from "@/assets/platform-logos/leetcode.webp";
import microsoftTeams from "@/assets/platform-logos/microsoft-teams.webp";
import vidcruiter from "@/assets/platform-logos/vidcruiter.webp";
import webex from "@/assets/platform-logos/webex.webp";
import zoom from "@/assets/platform-logos/zoom.webp";

type PlatformCategory = "all" | "video" | "coding" | "async";

interface Platform {
  name: string;
  category: "video" | "coding" | "async";
  categoryLabel: string;
  badge: string;
  color: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
}

const PLATFORMS: Platform[] = [
  // ── Video Interviews ──
  {
    name: "Zoom",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#2D8CFF",
    logo: zoom,
    logoWidth: 300,
    logoHeight: 300,
  },
  {
    name: "Google Meet",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#00875A",
    logo: googleMeet,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "Microsoft Teams",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#6264A7",
    logo: microsoftTeams,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "Webex",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#00BEF2",
    logo: webex,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "Discord",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#5865F2",
    logo: discord,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "Amazon Chime",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#1A9C8D",
    logo: amazonChime,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "Lark / Feishu",
    category: "video",
    categoryLabel: "Live video",
    badge: "100% Invisible",
    color: "#00D6B9",
    logo: lark,
    logoWidth: 256,
    logoHeight: 256,
  },

  // ── Coding Rounds ──
  {
    name: "LeetCode",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#FFA116",
    logo: leetcode,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "HackerRank",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#2EC4B6",
    logo: hackerrank,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "CodeSignal",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#040D21",
    logo: codesignal,
    logoWidth: 256,
    logoHeight: 134,
  },
  {
    name: "Codility",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#F5A623",
    logo: codility,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "CoderPad",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#E63946",
    logo: coderpad,
    logoWidth: 256,
    logoHeight: 256,
  },
  {
    name: "HackerEarth",
    category: "coding",
    categoryLabel: "Coding rounds",
    badge: "100% Supported",
    color: "#323754",
    logo: hackerearth,
    logoWidth: 256,
    logoHeight: 256,
  },

  // ── Async & Enterprise ──
  {
    name: "HireVue",
    category: "async",
    categoryLabel: "Async interviews",
    badge: "100% Supported",
    color: "#6B5B95",
    logo: hirevue,
    logoWidth: 307,
    logoHeight: 307,
  },
  {
    name: "VidCruiter",
    category: "async",
    categoryLabel: "Async interviews",
    badge: "100% Supported",
    color: "#00A896",
    logo: vidcruiter,
    logoWidth: 256,
    logoHeight: 256,
  },
];

export function Platforms() {
  const [activeCategory, setActiveCategory] = useState<PlatformCategory>("all");

  const filteredPlatforms =
    activeCategory === "all" ? PLATFORMS : PLATFORMS.filter((p) => p.category === activeCategory);

  return (
    <section id="platforms" className="relative py-24 px-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 h-[450px] w-[900px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(ellipse, hsl(262 83% 58%) 0%, hsl(196 80% 50%) 40%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lavender/25 bg-lavender/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-lavender uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            Universal Compatibility
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Works with Every <span className="text-gradient">Interview Platform</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Use CocoAI alongside the video, live coding, and asynchronous interview tools companies
            already use. Completely invisible to screen sharing and proctoring tools.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "All Platforms (15+)", icon: Sparkles },
              { id: "video", label: "Video Interviews", icon: Video },
              { id: "coding", label: "Coding Rounds", icon: Code },
              { id: "async", label: "Async & Assessment", icon: MonitorPlay },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id as PlatformCategory)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-brand text-white shadow-md shadow-violet-500/30"
                      : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
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
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-300"
              style={{
                backdropFilter: "blur(16px)",
                animation: `fadeInUp 0.35s ease ${i * 0.04}s both`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}55`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 10px 36px ${p.color}18`;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              {/* Brand-colored glow wash that fades in on hover */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(120% 90% at 50% 0%, ${p.color}30 0%, transparent 70%)`,
                }}
              />

              {/* Subtle top brand accent line on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: p.color }}
              />

              {/* Tooltip — platform name + category on hover (handy on tight grids) */}
              <div className="pointer-events-none absolute -top-2 left-1/2 z-20 max-w-[14rem] -translate-x-1/2 -translate-y-full truncate rounded-lg border border-border/60 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover:-top-3 group-hover:opacity-100">
                <span
                  className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                  style={{ background: p.color }}
                />
                {p.name}
                <span className="ml-1 font-normal text-muted-foreground">{p.categoryLabel}</span>
              </div>

              {/* Top row: Logo + Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105 dark:ring-white/15">
                  <img
                    src={p.logo}
                    alt={`${p.name} logo`}
                    width={p.logoWidth}
                    height={p.logoHeight}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>

                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-500">
                  <Check className="h-2.5 w-2.5" />
                  {p.badge}
                </span>
              </div>

              {/* Bottom row: Name + Category */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-foreground transition-colors">{p.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.categoryLabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Stealth Guarantee Banner ─── */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-lavender/20 bg-gradient-to-r from-violet-600/10 to-pink-600/5 p-6 sm:p-8">
          <div className="flex items-start gap-4 text-left">
            <div className="bg-gradient-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-violet-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                🔒 Guaranteed 100% Invisible to Screen Sharing
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                CocoAI uses native Windows OS DirectX content protection
                (`SetWindowDisplayAffinity`). Zoom, Google Meet, Teams, Discord, and proctoring
                scripts only capture a black void or see straight through the window.
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
