import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Mic,
  Shield,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import cocoLogo from "@/assets/coco_logo_nobg.webp";
import { passwordStrength } from "@/lib/password-strength";
import { useCardEntrance } from "@/hooks/use-card-entrance";
import { Magnetic } from "@/components/landing/magnetic";
import { Spotlight } from "@/components/landing/spotlight";
import { WordReveal } from "@/components/landing/word-reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthPageProps {
  onClose?: () => void;
  defaultMode?: "login" | "signup";
}

/** Demo transcript that cycles through the left-panel "live overlay" window. */
const DEMO_LINES = [
  { speaker: "INTERVIEWER", text: "Walk me through how you'd design a rate limiter." },
  { speaker: "CANDIDATE", text: "I'd start with a token bucket per user, backed by Redis…" },
  {
    speaker: "⚡ ANSWER",
    text: "Token bucket + Redis INCR with expiry → 429 on overflow. Handle distributed clock skew.",
  },
  { speaker: "INTERVIEWER", text: "How would you scale that horizontally?" },
  {
    speaker: "⚡ ANSWER",
    text: "Shard by user ID, use a Lua script for atomic refill, cache decisions locally for 1s.",
  },
];

export function AuthPage({ onClose, defaultMode = "login" }: AuthPageProps) {
  const { signIn, signUp, signInWithGoogle, signInWithGithub, resetPassword } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(email);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const entranceStyle = useCardEntrance();
  const [demoLine, setDemoLine] = useState(2);

  // Cycle the left-panel overlay demo — disabled under prefers-reduced-motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      setDemoLine((l) => (l + 1) % DEMO_LINES.length);
    }, 2400);
    return () => window.clearInterval(t);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await signUp(email, password, fullName);
        if (err) {
          setError(err.message);
        } else {
          setSuccess("Account created! Check your email to confirm, then sign in.");
          setMode("login");
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError(err.message);
        } else {
          if (onClose) onClose();
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    try {
      const { error: err } = await signInWithGoogle();
      if (err) setError(err.message);
    } catch (e: unknown) {
      setError(
        "Google Sign-In error: " +
          (e instanceof Error ? e.message : "Please enable Google Auth in Supabase Dashboard."),
      );
    }
  }

  async function handleGithubSignIn() {
    setError(null);
    try {
      const { error: err } = await signInWithGithub();
      if (err) setError(err.message);
    } catch (e: unknown) {
      setError(
        "GitHub Sign-In error: " +
          (e instanceof Error ? e.message : "Please enable GitHub Auth in Supabase Dashboard."),
      );
    }
  }

  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    setResetError(null);
    setResetSent(false);
    setResetLoading(true);
    try {
      const { error: err } = await resetPassword(resetEmail);
      if (err) {
        setResetError(err.message);
      } else {
        setResetSent(true);
      }
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setResetLoading(false);
    }
  }

  const switchMode = (next: "login" | "signup") => {
    setMode(next);
    setError(null);
    setSuccess(null);
  };
  const strength = passwordStrength(password);
  // Always keep a 3-line window (newest line at the bottom) — wraps via modulo
  // so the feed never collapses to a single line when the cycle restarts.
  const demoVisible = Array.from({ length: 3 }, (_, i) => {
    const idx = (demoLine - 2 + i + DEMO_LINES.length * 3) % DEMO_LINES.length;
    return DEMO_LINES[idx];
  });

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-background">
      {/* ─── Left Brand Panel ─────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-card p-12 lg:flex lg:w-[46%]">
        {/* Animated aurora orbs + floating grid */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-aurora absolute -top-[10%] -left-[5%] h-[420px] w-[420px] rounded-full bg-violet-600/25 blur-[100px]" />
          <div
            className="animate-aurora absolute -bottom-[15%] -right-[5%] h-[380px] w-[380px] rounded-full bg-pink-600/20 blur-[100px]"
            style={{ animationDelay: "-6s" }}
          />
          <div
            className="animate-aurora absolute top-[40%] left-[30%] h-[200px] w-[200px] rounded-full bg-lavender/20 blur-[90px]"
            style={{ animationDelay: "-11s" }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={cocoLogo}
            alt="CocoAI"
            width={256}
            height={201}
            className="h-9 w-9 rounded-xl"
          />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            CocoAI
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="font-display text-4xl leading-[1.15] font-bold tracking-tight text-foreground">
            <WordReveal
              words={[
                { text: "Your" },
                { text: "invisible" },
                { text: "AI", className: "text-gradient-animate" },
                { text: "copilot" },
                { text: "for" },
                { text: "every" },
                { text: "interview" },
              ]}
              stagger={70}
            />
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Real-time answers. Stealth overlay. Powered by Cerebras ultra-fast inference.
          </p>
        </div>

        {/* Live overlay demo — cycling transcript window */}
        <div className="relative z-10">
          <div className="relative">
            {/* Floating status chips */}
            <div className="animate-float absolute -top-6 -left-4 z-10 hidden sm:block">
              <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-xl">
                <Mic className="h-3 w-3 text-lavender" />
                Question detected
              </div>
            </div>
            <div
              className="animate-float absolute -right-3 -bottom-5 z-10 hidden sm:block"
              style={{ animationDelay: "-2.5s" }}
            >
              <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-xl">
                <EyeOff className="h-3 w-3 text-lavender" />
                Invisible on share
              </div>
            </div>

            {/* Overlay window */}
            <div className="glass-card relative overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2.5">
                <span className="animate-live-pulse h-1.5 w-1.5 shrink-0 rounded-full bg-lavender" />
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  cocoai — stealth overlay active
                </span>
              </div>

              <div className="space-y-3 p-4">
                {demoVisible.map((line, i) => (
                  <div
                    key={`${demoLine}-${i}`}
                    className={`flex items-start gap-2.5 ${
                      i === demoVisible.length - 1 ? "opacity-100" : "opacity-45"
                    }`}
                    style={{
                      transition: "opacity 0.4s ease",
                      animation:
                        i === demoVisible.length - 1
                          ? "tab-enter 0.45s cubic-bezier(0.16,1,0.3,1) both"
                          : undefined,
                    }}
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase ${
                        line.speaker === "⚡ ANSWER"
                          ? "bg-gradient-brand text-white"
                          : line.speaker === "INTERVIEWER"
                            ? "bg-accent text-foreground"
                            : "bg-lavender/15 text-lavender"
                      }`}
                    >
                      {line.speaker}
                    </span>
                    <p className="text-xs leading-relaxed text-muted-foreground">{line.text}</p>
                  </div>
                ))}
              </div>

              {/* Scan-line sweep */}
              <div
                aria-hidden="true"
                className="animate-feature-scan pointer-events-none absolute right-0 left-0 h-px bg-gradient-to-r from-transparent via-lavender/70 to-transparent"
              />
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {[
            { icon: Sparkles, text: "Real-time AI assistance" },
            { icon: Shield, text: "Invisible stealth mode" },
            { icon: Zap, text: "Cerebras & Groq speed" },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground"
            >
              <Icon className="h-3 w-3 text-lavender" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Right Auth Panel ─────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-6 py-12">
        {/* Ambient top glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[100px]"
          aria-hidden="true"
        />
        {/* Floating ambience orbs + faint grid — mirrors the left panel */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="animate-float absolute top-[18%] -left-8 h-40 w-40 rounded-full bg-violet-600/10 blur-[70px]"
            style={{ animationDelay: "-4s" }}
          />
          <div
            className="animate-float absolute right-[8%] bottom-[22%] h-48 w-48 rounded-full bg-lavender/10 blur-[80px]"
            style={{ animationDelay: "-8s" }}
          />
          <div
            className="animate-float absolute top-[55%] left-[12%] h-24 w-24 rounded-full bg-pink-600/10 blur-[60px]"
            style={{ animationDelay: "-1.5s" }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>{" "}
        <div className="relative z-10 w-full max-w-[420px]" style={entranceStyle}>
          {/* Back button */}
          {onClose && (
            <button
              onClick={onClose}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </button>
          )}

          {/* ── Card: animated gradient border + cursor spotlight ── */}
          <Spotlight className="gradient-border-animated relative">
            <div className="glass-card relative overflow-hidden rounded-3xl p-8">
              {/* Soft interior glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl"
              />

              {/* Logo + heading */}
              <div className="relative flex flex-col items-center text-center">
                <div className="bg-gradient-brand flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-violet-500/25">
                  <img
                    src={cocoLogo}
                    alt="CocoAI"
                    width={256}
                    height={201}
                    className="h-9 w-9 rounded-xl"
                  />
                </div>
                <h1 className="font-display mt-5 text-2xl font-bold tracking-tight text-foreground">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Sign in to access your CocoAI dashboard"
                    : "Start using CocoAI — your invisible copilot"}
                </p>
              </div>

              {/* Segmented mode toggle */}
              <div className="relative mt-6 grid grid-cols-2 rounded-full border border-border bg-background/70 p-1">
                <div
                  aria-hidden="true"
                  className={`bg-gradient-brand absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full shadow-md shadow-violet-500/25 transition-transform duration-300 ease-premium ${
                    mode === "signup" ? "translate-x-[100%]" : "translate-x-0"
                  }`}
                />
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => switchMode(m)}
                    className={`relative z-10 rounded-full py-2 text-sm font-semibold transition-colors duration-300 ${
                      mode === m ? "text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* ── Social OAuth Buttons (magnetic) ── */}
              <div className="mt-6 flex flex-col gap-3">
                <Magnetic strength={4}>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-lavender/40 hover:bg-accent disabled:opacity-50"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </Magnetic>

                <Magnetic strength={4}>
                  <button
                    onClick={handleGithubSignIn}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-lavender/40 hover:bg-accent disabled:opacity-50"
                  >
                    <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    Continue with GitHub
                  </button>
                </Magnetic>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or continue with email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                      <input
                        id="auth-name"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Roushan Kumar"
                        className="input-flat w-full rounded-xl py-3 pr-4 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-flat w-full rounded-xl py-3 pr-4 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="input-flat w-full rounded-xl py-3 pr-11 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password (login) */}
                {mode === "login" && (
                  <div className="-mt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setResetSent(false);
                        setResetError(null);
                        setResetOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-lavender"
                    >
                      <KeyRound className="h-3 w-3" />
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Password strength meter (signup) */}
                {mode === "signup" && password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className="h-1 flex-1 overflow-hidden rounded-full bg-border"
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              strength.score >= bar
                                ? bar <= 1
                                  ? "bg-rose"
                                  : bar === 2
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                : "bg-transparent"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-right text-[11px] font-medium text-muted-foreground">
                      {strength.label} password
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-shine bg-gradient-brand relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/45 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>

              {/* Toggle hint */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => switchMode("signup")}
                      className="font-semibold text-lavender transition-colors hover:text-foreground"
                    >
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => switchMode("login")}
                      className="font-semibold text-lavender transition-colors hover:text-foreground"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </Spotlight>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground/70">
            By continuing, you agree to CocoAI&apos;s{" "}
            <span className="text-muted-foreground">Terms of Service</span> and{" "}
            <span className="text-muted-foreground">Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* ─── Reset Password Dialog ────────────────────────────── */}
      <Dialog
        open={resetOpen}
        onOpenChange={(open) => {
          setResetOpen(open);
          if (!open) {
            setResetError(null);
            setResetSent(false);
          }
        }}
      >
        <DialogContent className="gradient-border-animated z-[60] max-w-sm rounded-2xl border-border p-0">
          <div className="glass-card rounded-2xl p-6">
            <DialogHeader>
              <div className="bg-gradient-brand flex h-10 w-10 items-center justify-center rounded-xl shadow-md shadow-violet-500/20">
                <KeyRound className="h-4 w-4 text-white" />
              </div>
              <DialogTitle className="font-display mt-3 text-lg font-bold tracking-tight text-foreground">
                Reset your password
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a secure reset link.
              </DialogDescription>
            </DialogHeader>

            {resetSent ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Reset link sent! Check your inbox (and spam folder).</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-flat w-full rounded-xl py-3 pr-4 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn-shine bg-gradient-brand relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/45 disabled:opacity-60"
                >
                  {resetLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
