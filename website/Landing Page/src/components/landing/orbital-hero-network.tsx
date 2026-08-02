import { useState, useEffect } from "react";
import { ShieldCheck, Zap } from "lucide-react";
import cocoLogo from "@/assets/coco_logo_nobg.webp";

import zoomLogo from "@/assets/platform-logos/zoom.webp";
import meetLogo from "@/assets/platform-logos/google-meet.webp";
import teamsLogo from "@/assets/platform-logos/microsoft-teams.webp";
import discordLogo from "@/assets/platform-logos/discord.webp";
import leetcodeLogo from "@/assets/platform-logos/leetcode.webp";
import hackerrankLogo from "@/assets/platform-logos/hackerrank.webp";
import codesignalLogo from "@/assets/platform-logos/codesignal.webp";
import codilityLogo from "@/assets/platform-logos/codility.webp";
import hirevueLogo from "@/assets/platform-logos/hirevue.webp";
import coderpadLogo from "@/assets/platform-logos/coderpad.webp";
import webexLogo from "@/assets/platform-logos/webex.webp";
import chimeLogo from "@/assets/platform-logos/amazon-chime.webp";

// Custom count-up hook for center latency metric
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const stepTime = Math.abs(Math.floor(duration / end));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export function OrbitalHeroNetwork() {
  const count = useCountUp(18, 1500); // 0 to 18 (representing 0.18s)

  return (
    <div className="relative mx-auto flex items-center justify-center h-[340px] w-[340px] xs:h-[420px] xs:w-[420px] sm:h-[540px] sm:w-[540px] md:h-[600px] md:w-[600px] max-w-full select-none overflow-hidden sm:overflow-visible">
      {/* Central Ambient Glow */}
      <div
        className="pointer-events-none absolute h-48 w-48 sm:h-64 sm:w-64 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, #ec4899 60%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* ─── Center Core Orb ─── */}
      <div className="z-10 flex flex-col items-center justify-center rounded-full border border-violet-500/40 bg-card text-card-foreground p-5 sm:p-6 text-center shadow-2xl shadow-violet-500/20 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-pink-500/60">
        <div className="flex items-center gap-1.5 text-pink-500 mb-1">
          <Zap className="h-3.5 w-3.5 fill-pink-500/20" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Cerebras LPU</span>
        </div>
        <div className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          0.{count < 10 ? `0${count}` : count}s
        </div>
        <div className="mt-0.5 text-[10px] sm:text-[11px] font-semibold text-muted-foreground">First Answer Latency</div>
      </div>

      {/* ─── Orbit 1 (Innermost: 220px) ─── */}
      <div className="animate-orbit-cw-30 absolute h-[180px] w-[180px] sm:h-[220px] sm:w-[220px] rounded-full border border-violet-500/30 bg-transparent">
        {/* Node 1: CocoAI Core Logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit-ccw-60 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-violet-500/40 bg-card p-2 shadow-lg shadow-violet-500/20 backdrop-blur-md">
            <img
              src={cocoLogo}
              alt="CocoAI Logo"
              width={32}
              height={32}
              decoding="async"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Node 2: DirectX Stealth Shield */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="animate-orbit-ccw-60 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-pink-500/40 bg-card p-2 text-pink-500 shadow-lg shadow-pink-500/20 backdrop-blur-md">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>

      {/* ─── Orbit 2 (Middle: 340px - Video Meeting Apps) ─── */}
      <div className="animate-orbit-ccw-60 absolute h-[260px] w-[260px] sm:h-[340px] sm:w-[340px] rounded-full border border-pink-500/20 bg-transparent">
        {/* Zoom */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit-cw-40 flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-border bg-card p-2 sm:p-2.5 shadow-md backdrop-blur-md">
            <img src={zoomLogo} alt="Zoom" width={28} height={28} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Google Meet */}
        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit-cw-40 flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-border bg-card p-2 sm:p-2.5 shadow-md backdrop-blur-md">
            <img src={meetLogo} alt="Google Meet" width={28} height={28} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* MS Teams */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="animate-orbit-cw-40 flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-border bg-card p-2 sm:p-2.5 shadow-md backdrop-blur-md">
            <img src={teamsLogo} alt="MS Teams" width={28} height={28} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Discord */}
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit-cw-40 flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-border bg-card p-2 sm:p-2.5 shadow-md backdrop-blur-md">
            <img src={discordLogo} alt="Discord" width={28} height={28} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>
      </div>

      {/* ─── Orbit 3 (Outer-Mid: 460px - Coding Platforms) ─── */}
      <div className="animate-orbit-cw-40 absolute h-[340px] w-[340px] sm:h-[460px] sm:w-[460px] rounded-full border border-violet-500/20 bg-transparent">
        {/* LeetCode */}
        <div className="absolute top-6 left-6 sm:top-10 sm:left-10 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit-ccw-60 flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-xl border border-border bg-card p-2 sm:p-2.5 shadow-md backdrop-blur-md">
            <img src={leetcodeLogo} alt="LeetCode" width={28} height={28} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* HackerRank */}
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit-ccw-60 flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-xl border border-border bg-card p-2 sm:p-2.5 shadow-md backdrop-blur-md">
            <img src={hackerrankLogo} alt="HackerRank" width={28} height={28} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* CodeSignal */}
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 translate-x-1/2 translate-y-1/2">
          <div className="animate-orbit-ccw-60 flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-xl border border-border bg-card p-2 sm:p-2.5 shadow-md backdrop-blur-md">
            <img src={codesignalLogo} alt="CodeSignal" width={28} height={28} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Codility */}
        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 -translate-x-1/2 translate-y-1/2">
          <div className="animate-orbit-ccw-60 flex h-10 w-10 sm:h-13 sm:w-13 items-center justify-center rounded-xl border border-border bg-card p-2 sm:p-2.5 shadow-md backdrop-blur-md">
            <img src={codilityLogo} alt="Codility" width={28} height={28} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>
      </div>

      {/* ─── Orbit 4 (Outermost: 570px - Enterprise Tools) ─── */}
      <div className="animate-orbit-ccw-60 absolute h-[420px] w-[420px] sm:h-[570px] sm:w-[570px] rounded-full border border-pink-500/15 bg-transparent">
        {/* HireVue */}
        <div className="absolute top-4 left-1/3 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit-cw-50 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-border bg-card p-1.5 sm:p-2 shadow-md backdrop-blur-md">
            <img src={hirevueLogo} alt="HireVue" width={24} height={24} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* CoderPad */}
        <div className="absolute top-1/3 right-1 sm:right-2 translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit-cw-50 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-border bg-card p-1.5 sm:p-2 shadow-md backdrop-blur-md">
            <img src={coderpadLogo} alt="CoderPad" width={24} height={24} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Webex */}
        <div className="absolute bottom-4 right-1/3 translate-x-1/2 translate-y-1/2">
          <div className="animate-orbit-cw-50 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-border bg-card p-1.5 sm:p-2 shadow-md backdrop-blur-md">
            <img src={webexLogo} alt="Webex" width={24} height={24} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Amazon Chime */}
        <div className="absolute bottom-1/3 left-1 sm:left-2 -translate-x-1/2 translate-y-1/2">
          <div className="animate-orbit-cw-50 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-border bg-card p-1.5 sm:p-2 shadow-md backdrop-blur-md">
            <img src={chimeLogo} alt="Amazon Chime" width={24} height={24} decoding="async" className="h-full w-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
