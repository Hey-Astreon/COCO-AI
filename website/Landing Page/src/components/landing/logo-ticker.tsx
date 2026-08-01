import zoomLogo from "@/assets/platform-logos/zoom.webp";
import meetLogo from "@/assets/platform-logos/google-meet.webp";
import teamsLogo from "@/assets/platform-logos/microsoft-teams.webp";
import discordLogo from "@/assets/platform-logos/discord.webp";
import leetcodeLogo from "@/assets/platform-logos/leetcode.webp";
import hackerrankLogo from "@/assets/platform-logos/hackerrank.webp";
import codesignalLogo from "@/assets/platform-logos/codesignal.webp";
import codilityLogo from "@/assets/platform-logos/codility.webp";
import coderpadLogo from "@/assets/platform-logos/coderpad.webp";
import hirevueLogo from "@/assets/platform-logos/hirevue.webp";
import webexLogo from "@/assets/platform-logos/webex.webp";
import chimeLogo from "@/assets/platform-logos/amazon-chime.webp";
import hackerearthLogo from "@/assets/platform-logos/hackerearth.webp";
import larkLogo from "@/assets/platform-logos/lark.webp";
import vidcruiterLogo from "@/assets/platform-logos/vidcruiter.webp";

const LOGOS = [
  { name: "Zoom", src: zoomLogo },
  { name: "Google Meet", src: meetLogo },
  { name: "Microsoft Teams", src: teamsLogo },
  { name: "Discord", src: discordLogo },
  { name: "LeetCode", src: leetcodeLogo },
  { name: "HackerRank", src: hackerrankLogo },
  { name: "CodeSignal", src: codesignalLogo },
  { name: "Codility", src: codilityLogo },
  { name: "CoderPad", src: coderpadLogo },
  { name: "HireVue", src: hirevueLogo },
  { name: "Webex", src: webexLogo },
  { name: "Amazon Chime", src: chimeLogo },
  { name: "HackerEarth", src: hackerearthLogo },
  { name: "Lark", src: larkLogo },
  { name: "VidCruiter", src: vidcruiterLogo },
];

export function LogoTicker() {
  const tickerItems = [...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <div className="w-full border-t border-b border-border bg-card/70 py-6 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 mb-3 text-center">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
          ⚡ Verified 100% Invisible Across 15+ Video Call &amp; Coding Platforms
        </span>
      </div>

      <div className="ticker-mask-edges relative overflow-hidden w-full">
        <div className="animate-ticker-scroll flex w-max items-center gap-12 sm:gap-16">
          {tickerItems.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex shrink-0 items-center justify-center gap-3 rounded-xl border border-border bg-background px-5 py-2.5 shadow-sm transition-all duration-200 hover:border-violet-500/40 hover:scale-105"
            >
              <img
                src={logo.src}
                alt={`${logo.name} logo`}
                className="h-6 w-auto object-contain max-w-[100px]"
                loading="lazy"
              />
              <span className="font-sans text-xs font-medium text-foreground">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
