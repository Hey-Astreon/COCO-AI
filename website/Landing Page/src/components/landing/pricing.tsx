import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Reveal } from "./reveal";
import { SectionTag } from "./section-tag";
import { useAuth } from "@/lib/auth-context";

interface PlanProps {
  name: string;
  price: string;
  period: string;
  tagline: string;
  badge?: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  onSubscribe?: () => void;
}

function PlanCard({ name, price, period, tagline, badge, features, highlighted, ctaLabel, onSubscribe }: PlanProps) {
  return (
    <div
      className={`glass-card relative flex flex-col overflow-hidden rounded-2xl p-8 sm:p-10 transition-all duration-300 ${
        highlighted
          ? "gradient-top-border ring-1 ring-lavender/30 scale-[1.03] shadow-[0_0_60px_-12px_rgba(139,92,246,0.25)]"
          : "border border-border/40 hover:border-border/80"
      }`}
    >
      {/* Badge */}
      {badge && (
        <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
          <Sparkles className="h-3 w-3" />
          {badge}
        </span>
      )}

      {/* Plan Name */}
      <h3 className="font-display text-lg font-bold text-foreground">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>

      {/* Price */}
      <div className="mt-6 flex items-end gap-2">
        <span className="font-display text-5xl font-extrabold tracking-tight text-foreground">
          {price}
        </span>
        <span className="pb-1.5 text-sm text-muted-foreground">{period}</span>
      </div>

      {/* Features */}
      <ul className="mt-8 flex flex-1 flex-col gap-3">
        {features.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlighted ? "text-lavender" : "text-rose"}`} />
            {item}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSubscribe}
        className={`mt-10 flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 ${
          highlighted
            ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02]"
            : "border border-border bg-background text-foreground hover:bg-accent"
        }`}
      >
        {highlighted && <Zap className="h-4 w-4" />}
        {ctaLabel}
      </button>
    </div>
  );
}

const FREE_FEATURES = [
  "50,000 AI tokens / month",
  "30 minutes live audio transcription",
  "Cerebras + Groq LLM streaming",
  "Basic stealth overlay",
  "Community support",
];

const STANDARD_FEATURES = [
  "5,00,000 AI tokens / month",
  "120 minutes live audio transcription",
  "Cerebras + Groq + Gemini Vision",
  "Full stealth suite (ghost mode, opacity)",
  "Resume context injection",
  "Session export (Markdown, JSON, TXT)",
  "Email support",
];

const PRO_FEATURES = [
  "20,00,000 AI tokens / month",
  "500 minutes live audio transcription",
  "All AI engines (Cerebras, Groq, Gemini, NVIDIA)",
  "Multi-screenshot screen analysis",
  "Priority model routing (fastest response)",
  "Custom keyword boosting",
  "Priority support (Discord DM)",
  "Early access to new features",
];

export function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = (plan: string) => {
    if (!user) {
      // Not signed in — send to signup first
      navigate({ to: "/signup" });
      return;
    }
    // Already signed in — will wire to Razorpay checkout later
    console.log(`Subscribe to ${plan} — user: ${user.email}`);
  };

  return (
    <section id="pricing" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <SectionTag label="Pricing" />
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Plans That Scale With You
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start free, upgrade when you're ready. Cancel anytime.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Plan */}
          <Reveal delay={100}>
            <PlanCard
              name="Free"
              price="₹0"
              period="forever"
              tagline="Try CocoAI with your own API keys"
              features={FREE_FEATURES}
              ctaLabel="Get Started Free"
              onSubscribe={() => handleSubscribe("free")}
            />
          </Reveal>

          {/* Standard Plan — Highlighted */}
          <Reveal delay={200}>
            <PlanCard
              name="Standard"
              price="₹299"
              period="/ month"
              tagline="For serious interview prep"
              badge="Most Popular"
              features={STANDARD_FEATURES}
              highlighted={true}
              ctaLabel="Subscribe to Standard"
              onSubscribe={() => handleSubscribe("standard")}
            />
          </Reveal>

          {/* Pro Plan */}
          <Reveal delay={300}>
            <PlanCard
              name="Pro"
              price="₹499"
              period="/ month"
              tagline="Unlimited power for heavy users"
              features={PRO_FEATURES}
              ctaLabel="Subscribe to Pro"
              onSubscribe={() => handleSubscribe("pro")}
            />
          </Reveal>
        </div>

        <Reveal delay={400}>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            All plans include lifetime updates and the full stealth overlay.
            <br />
            Subscriptions can be cancelled anytime — no questions asked.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
