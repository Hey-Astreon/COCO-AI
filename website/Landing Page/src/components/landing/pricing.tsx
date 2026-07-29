import { Check, Zap } from "lucide-react";
import { COCOAI_DOWNLOAD_URL } from "@/lib/links";
import { Reveal } from "./reveal";
import { SectionTag } from "./section-tag";

const PLAN_FEATURES = [
  "Ultra-fast Cerebras Llama-3.3 streaming",
  "Dynamic resume context injection",
  "Custom keyword boosting (prevents spelling errors)",
  "Zero-delay screen solver",
  "Full lifetime updates",
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <SectionTag label="Pricing" />
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            One plan. Every stealth feature unlocked. No hidden tiers.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="mx-auto mt-14 max-w-lg">
            <div className="glass-card gradient-top-border relative overflow-hidden rounded-2xl p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-foreground">Starter Pro</h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  Early Access
                </span>
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="font-display text-5xl font-extrabold tracking-tight text-foreground">
                  299 INR
                </span>
                <span className="pb-1.5 text-sm text-muted-foreground">/ month</span>
              </div>

              <ul className="mt-8 flex flex-col gap-3.5">
                {PLAN_FEATURES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-lavender" />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={COCOAI_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-colors duration-300 ease-premium hover:bg-accent"
              >
                Get Started Now
              </a>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Cancel anytime. Lifetime updates included.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
