import { useState } from "react";
import { Check, Zap, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Reveal } from "./reveal";
import { SectionTag } from "./section-tag";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}
import { toast } from "sonner";

interface RazorpayInstance {
  open: () => void;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

type SubscriptionTier = "free" | "standard" | "pro" | "developer";

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

function PlanCard({
  name,
  price,
  period,
  tagline,
  badge,
  features,
  highlighted,
  ctaLabel,
  onSubscribe,
}: PlanProps) {
  return (
    <div
      className={`gradient-border-animated relative flex h-full flex-col overflow-hidden rounded-2xl bg-card p-8 sm:p-10 ${
        highlighted
          ? "ring-1 ring-lavender/30 scale-[1.03] shadow-[0_0_60px_-12px_rgba(139,92,246,0.35)]"
          : "glass-card border border-border/40 transition-all duration-300 hover:border-lavender/30 hover:-translate-y-1 hover:shadow-[0_20px_60px_-25px_rgba(139,92,246,0.25)]"
      }`}
    >
      {/* Badge */}
      {badge && (
        <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1 text-[11px] font-semibold tracking-wide text-white uppercase shadow-lg shadow-violet-500/30">
          <Sparkles className="h-3 w-3" />
          {badge}
        </span>
      )}

      {/* Plan Name */}
      <h3 className="font-display text-lg font-bold text-foreground">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>

      {/* Price */}
      <div className="mt-6 flex items-end gap-2">
        <span
          className={`font-display text-5xl font-extrabold tracking-tight ${highlighted ? "text-gradient" : "text-foreground"}`}
        >
          {price}
        </span>
        <span className="pb-1.5 text-sm text-muted-foreground">{period}</span>
      </div>

      {/* Features */}
      <ul className="mt-8 flex flex-1 flex-col gap-3">
        {features.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                highlighted ? "bg-gradient-brand text-white" : "bg-rose/10 text-rose"
              }`}
            >
              <Check className="h-3 w-3" />
            </span>
            {item}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSubscribe}
        className={`btn-shine mt-10 flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 ${
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
  "50,000 AI tokens / month (Monthly Reset)",
  "30 minutes live audio transcription",
  "Basic Screen Capture (30 Screenshots / month)",
  "Cerebras + Groq LLM streaming",
  "Basic stealth overlay",
  "Community support",
];

const STANDARD_FEATURES = [
  "150,000 AI tokens / month",
  "120 minutes live audio transcription",
  "Basic Screen Capture (120 Screenshots / month)",
  "Cerebras + Groq + Gemini Vision",
  "Full stealth suite (ghost mode, opacity)",
  "Resume context injection",
  "Session export (Markdown, JSON, TXT)",
  "Email support",
];

const PRO_FEATURES = [
  "500,000 AI tokens / month",
  "300 minutes live audio transcription",
  "Multi-screenshot screen analysis",
  "All AI engines (Cerebras, Groq, Gemini, NVIDIA)",
  "Priority model routing (fastest response)",
  "Custom keyword boosting",
  "Priority support (Discord DM)",
  "Early access to new features",
];

type BillingPeriod = "monthly" | "yearly";

export function Pricing() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const isYearly = billing === "yearly";
  const standardPrice = isYearly ? "₹2,388" : "₹299";
  const proPrice = isYearly ? "₹3,988" : "₹499";
  const period = isYearly ? "/ yr (save 33%)" : "/ month";

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      // Not signed in — send to signup first
      navigate({ to: "/signup" });
      return;
    }

    if (plan === "free") {
      toast.info("You are already on the Free tier.");
      return;
    }

    const price = plan === "standard" ? (isYearly ? 2388 : 299) : isYearly ? 3988 : 499;
    toast.loading("Opening checkout secure screen...", { id: "checkout" });

    // Load Razorpay script dynamically
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error(
        "Failed to load secure Razorpay gateway. Please check your internet connection.",
        { id: "checkout" },
      );
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TJRsQ4Cs8JqQhu",
      amount: price * 100, // in paise
      currency: "INR",
      name: "CocoAI",
      description: `CocoAI ${plan.charAt(0).toUpperCase() + plan.slice(1)} ${isYearly ? "Yearly" : "Monthly"} Subscription Plan`,
      image: "https://coco-ai-cyan.vercel.app/favicon.png",
      handler: async function () {
        toast.loading("Verifying transaction status...", { id: "checkout" });
        try {
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({
              subscription_tier: plan as SubscriptionTier,
              tokens_limit: plan === "pro" ? 500000 : 150000,
              tokens_remaining: plan === "pro" ? 500000 : 150000,
            })
            .eq("id", user.id);

          if (updateError) {
            console.error("Subscription update failed:", updateError.message);
            toast.error("Payment received, but failed to update profile. Please contact support.", {
              id: "checkout",
            });
          } else {
            await refreshProfile();
            toast.success(
              `Welcome to CocoAI ${plan.charAt(0).toUpperCase() + plan.slice(1)}! Subscription activated. 🚀`,
              { id: "checkout", duration: 5000 },
            );
          }
        } catch (e) {
          toast.error("An error occurred during sync. Please contact support.", { id: "checkout" });
        }
      },
      prefill: {
        email: user.email || "",
      },
      theme: {
        color: "#8b5cf6",
      },
      modal: {
        ondismiss: function () {
          toast.dismiss("checkout");
        },
      },
    };

    toast.dismiss("checkout");
    const rzp = new window.Razorpay!(options);
    rzp.open();
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

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                !isYearly
                  ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-500/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                isYearly
                  ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-500/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  isYearly ? "bg-white/20 text-white" : "bg-rose/15 text-rose"
                }`}
              >
                Save 33%
              </span>
            </button>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Plan */}
          <Reveal delay={100} className="h-full">
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
          <Reveal delay={200} className="h-full">
            <PlanCard
              name="Standard"
              price={standardPrice}
              period={period}
              tagline="For serious interview prep"
              badge="Most Popular"
              features={STANDARD_FEATURES}
              highlighted={true}
              ctaLabel="Subscribe to Standard"
              onSubscribe={() => handleSubscribe("standard")}
            />
          </Reveal>

          {/* Pro Plan */}
          <Reveal delay={300} className="h-full">
            <PlanCard
              name="Pro"
              price={proPrice}
              period={period}
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
