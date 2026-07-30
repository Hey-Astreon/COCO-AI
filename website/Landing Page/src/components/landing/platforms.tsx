import { Zap } from "lucide-react";

const PLATFORMS = [
  {
    name: "Google Meet",
    color: "#1a73e8",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <path fill="#4CAF50" d="M29 19h-2v-3h-6v3H19v2h2v6h-2v2h10v-2h-2v-6h2z"/>
        <path fill="#1565C0" d="M32 12H16c-2.2 0-4 1.8-4 4v16c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z"/>
        <path fill="#4CAF50" d="M36 20l-8 4 8 4z"/>
        <path fill="#fff" d="M20 20h8v8h-8z"/>
        <path fill="#1565C0" d="M20 20h4v4h-4z"/>
        <path fill="#4CAF50" d="M24 20h4v4h-4z"/>
        <path fill="#4CAF50" d="M20 24h4v4h-4z"/>
        <path fill="#1976D2" d="M24 24h4v4h-4z"/>
      </svg>
    ),
  },
  {
    name: "Zoom",
    color: "#2d8cff",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="10" fill="#2D8CFF"/>
        <path fill="white" d="M8 17a3 3 0 013-3h18a3 3 0 013 3v14a3 3 0 01-3 3H11a3 3 0 01-3-3V17z"/>
        <path fill="#2D8CFF" d="M32 22l8-5v14l-8-5V22z"/>
      </svg>
    ),
  },
  {
    name: "Discord",
    color: "#5865f2",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="10" fill="#5865F2"/>
        <path fill="white" d="M33.5 13a22.7 22.7 0 00-5.8-1.8l-.3.5a15.8 15.8 0 00-4 0l-.3-.5A22.3 22.3 0 0017.4 13C14.1 18 13.2 22.8 13.6 27.5a23 23 0 007 3.5 17 17 0 001.5-2.5l-2.4-1.1.6-.5 2.5 1.2a14.9 14.9 0 0010.5 0l2.5-1.2.6.5-2.4 1.1a17 17 0 001.5 2.5 23 23 0 007-3.5c.5-5.4-1-10.1-3-14.5zM20 25c-1.1 0-2-1-2-2.3S18.9 20.3 20 20.3s2 1.1 2 2.4S21.1 25 20 25zm8 0c-1.1 0-2-1-2-2.3S26.9 20.3 28 20.3s2 1.1 2 2.4S29.1 25 28 25z"/>
      </svg>
    ),
  },
  {
    name: "Microsoft Teams",
    color: "#6264a7",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="10" fill="#6264A7"/>
        <path fill="white" d="M29 14a4 4 0 110 8 4 4 0 010-8zm4 10h-8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-4-2a5 5 0 100-10 5 5 0 000 10zm-10 0a3 3 0 100-6 3 3 0 000 6zm0 2c-3.3 0-10 1.7-10 5v2h10v-2c0-1.4.4-2.7 1.2-3.8-.4-.1-.8-.2-1.2-.2z"/>
      </svg>
    ),
  },
  {
    name: "Skype",
    color: "#00aff0",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="24" fill="#00AFF0"/>
        <path fill="white" d="M35.6 27.4a12 12 0 01-15 9.2A7 7 0 0112.4 24c.1-1.2.5-2.3 1-3.3a12 12 0 0115-9.2A7 7 0 0135.6 24c-.1 1.2-.5 2.3-1 3.4zm-11-10c-4 0-6 1.9-6 4.3 0 5.7 8.7 4.5 8.7 7.3 0 1.1-1 1.7-2.8 1.7-2.5 0-3.5-1.3-3.5-2.3H18c0 2.9 2.4 4.6 6.6 4.6 3.8 0 6-1.8 6-4.4 0-5.8-8.7-4.6-8.7-7.3 0-1 .9-1.6 2.6-1.6 2 0 3.1 1 3.1 2.2H30c0-2.7-2.2-4.5-5.4-4.5z"/>
      </svg>
    ),
  },
  {
    name: "Webex",
    color: "#00bef2",
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7">
        <rect width="48" height="48" rx="10" fill="#00BEF2"/>
        <path fill="white" d="M24 10c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14S31.7 10 24 10zm5.5 20l-5.5-8.5L18.5 30 13 18h4l1.5 8 5-8 5 8 1.5-8H34l-4.5 12z"/>
      </svg>
    ),
  },
];

export function Platforms() {
  return (
    <section id="platforms" className="relative py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "hsl(142 70% 45% / 0.1)", border: "1px solid hsl(142 70% 45% / 0.25)", color: "hsl(142 70% 60%)" }}
          >
            <Zap className="h-3 w-3" />
            Tested & Verified
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl text-foreground">
            Works invisibly on{" "}
            <span style={{
              background: "linear-gradient(135deg, hsl(142 70% 55%), hsl(196 80% 55%))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>every platform</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            CocoAI has been rigorously tested to remain completely invisible across all major video conferencing platforms. Your interviewer will never see it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PLATFORMS.map((p, i) => (
            <div
              key={p.name}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-5 text-center transition-all duration-300 glass-card"
              style={{
                border: "1px solid hsl(240 6% 15%)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}44`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${p.color}18`;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(240 6% 15%)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% 0%, ${p.color}10, transparent 60%)` }}
                aria-hidden="true"
              />
              <div className="relative z-10">
                {p.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{p.name}</p>
                <p className="mt-0.5 text-[10px]" style={{ color: "hsl(142 70% 55%)" }}>✓ Invisible</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          + Works on any other screen-sharing software that uses Windows DirectX capture
        </p>
      </div>
    </section>
  );
}
