import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { useNavigation } from "@/lib/navigation";
import { Reveal } from "./reveal";
import { SectionTag } from "./section-tag";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
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
  const { navigate } = useNavigation();
  const { user, refreshProfile } = useAuth();

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      // Not signed in — send to signup first
      navigate("/signup");
      return;
    }

    if (plan === "free") {
      toast.info("You are already on the Free tier.");
      return;
    }

    const price = plan === "standard" ? 299 : 499;
    toast.loading("Opening checkout secure screen...", { id: "checkout" });

    // Load Razorpay script dynamically
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load secure Razorpay gateway. Please check your internet connection.", { id: "checkout" });
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TJRsQ4Cs8JqQhu",
      amount: price * 100, // in paise
      currency: "INR",
      name: "CocoAI",
      description: `CocoAI ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription Plan`,
      image: "https://coco-ai-cyan.vercel.app/favicon.png",
      handler: async function (response: any) {
        toast.loading("Verifying transaction status...", { id: "checkout" });
        try {
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({
              subscription_tier: plan as any,
              tokens_limit: plan === "pro" ? 500000 : 150000,
              tokens_remaining: plan === "pro" ? 500000 : 150000,
            })
            .eq("id", user.id);

          if (updateError) {
            console.error("Subscription update failed:", updateError.message);
            toast.error("Payment received, but failed to update profile. Please contact support.", { id: "checkout" });
          } else {
            await refreshProfile();
            toast.success(`Welcome to CocoAI ${plan.charAt(0).toUpperCase() + plan.slice(1)}! Subscription activated. 🚀`, { id: "checkout", duration: 5000 });
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
        }
      }
    };

    toast.dismiss("checkout");
    const rzp = new (window as any).Razorpay(options);
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
