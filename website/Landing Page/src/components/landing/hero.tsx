import { ArrowUpRight, Download, Github, ShieldCheck, Star } from "lucide-react";
import heroPreview from "@/assets/real_cocoai_ui_preview.png";
import { COCOAI_DOWNLOAD_URL, COCOAI_RELEASES_URL, COCOAI_REPO_URL } from "@/lib/links";
import { Reveal } from "./reveal";

const HERO_BADGES = ["100% Local & Private", "Invisible on Screen Share", "v1.0.38 for Windows"];

export function Hero() {
  return (
    <section id="top" className="relative px-4 pt-32 pb-16 sm:px-6 sm:pt-40">
      <div className="mx-auto max-w-6xl text-center">
        <Reveal>
          <div className="glass-card mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-lavender" />
            Stealth copilot for live coding &amp; system design interviews
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="font-display mx-auto mt-6 max-w-4xl text-4xl leading-[1.08] font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Ace Your Technical Interviews. <span className="text-gradient">Invisibly.</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Real-time question detection, personalized answers based on your resume, and a fully
            customizable stealth overlay. Running locally, safely, and securely.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={COCOAI_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-glow inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-bold text-background sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Download CocoAI for Windows
            </a>
            <a
              href={COCOAI_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-lift inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground sm:w-auto"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
              <Star className="h-3.5 w-3.5 text-lavender" />
            </a>
            <a
              href={COCOAI_RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-lift inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground sm:w-auto"
            >
              View Releases
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {HERO_BADGES.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-faint" />
                {badge}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Browser mockup */}
        <Reveal delay={500} className="mt-16">
          <div className="relative mx-auto max-w-5xl">
            {/* Faint purple-pink ambient backlight — the only glow on the page */}
            <div
              aria-hidden="true"
              className="bg-gradient-brand absolute -inset-8 rounded-[2rem] opacity-10 blur-2xl"
            />
            <div className="glass-card relative overflow-hidden rounded-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                  <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                  <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                </div>
                <div className="glass-card mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full px-4 py-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-lavender" />
                  cocoai — stealth overlay active
                </div>
                <div className="w-10" />
              </div>
              <img
                src={heroPreview}
                alt="CocoAI live interview copilot interface showing AI answers and a real-time transcript feed"
                className="block w-full"
                loading="eager"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
