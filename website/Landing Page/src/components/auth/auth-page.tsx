import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, ArrowLeft, Loader2, Sparkles, Shield, Zap } from "lucide-react";
import cocoLogo from "@/assets/coco_logo_nobg.png";

interface AuthPageProps {
  onClose?: () => void;
  defaultMode?: "login" | "signup";
}

export function AuthPage({ onClose, defaultMode = "login" }: AuthPageProps) {
  const { signIn, signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await signUp(email, password, fullName);
        if (err) { setError(err.message); }
        else { setSuccess("Account created! Check your email to confirm, then sign in."); setMode("login"); }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) { setError(err.message); }
        else { if (onClose) onClose(); }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    try {
      const { error: err } = await signInWithGoogle();
      if (err) setError(err.message);
    } catch (e: any) {
      setError("Google Sign-In error: " + (e.message || "Please enable Google Auth in Supabase Dashboard."));
    }
  }

  async function handleGithubSignIn() {
    setError(null);
    try {
      const { error: err } = await signInWithGithub();
      if (err) setError(err.message);
    } catch (e: any) {
      setError("GitHub Sign-In error: " + (e.message || "Please enable GitHub Auth in Supabase Dashboard."));
    }
  }

  const features = [
    { icon: Sparkles, text: "Real-time AI interview assistance" },
    { icon: Shield,   text: "Stealth mode — invisible to screen share" },
    { icon: Zap,      text: "Cerebras & Groq ultra-fast responses" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-hidden"
      style={{ background: "hsl(240 6% 5%)" }}
    >
      {/* ─── Left Brand Panel ─────────────────────────────────── */}
      <div
        className="relative hidden lg:flex lg:w-[46%] flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(248 50% 8%) 0%, hsl(240 6% 4%) 100%)" }}
      >
        {/* Animated orbs */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div
            className="absolute top-[-10%] left-[-5%] h-[420px] w-[420px] rounded-full opacity-25"
            style={{
              background: "radial-gradient(circle, hsl(262 83% 58%) 0%, transparent 70%)",
              animation: "orb1 8s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute bottom-[-15%] right-[-5%] h-[380px] w-[380px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, hsl(330 80% 60%) 0%, transparent 70%)",
              animation: "orb2 10s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute top-[40%] left-[30%] h-[200px] w-[200px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, hsl(196 80% 55%) 0%, transparent 70%)",
              animation: "orb3 12s ease-in-out infinite alternate",
            }}
          />
          {/* Floating grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={cocoLogo} alt="CocoAI" className="h-9 w-9 rounded-xl" />
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "hsl(0 0% 96%)" }}
          >
            CocoAI
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2
              className="text-4xl font-bold leading-tight tracking-tight"
              style={{ color: "hsl(0 0% 95%)" }}
            >
              Your invisible{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(262 83% 68%), hsl(330 80% 65%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI copilot
              </span>{" "}
              for every interview
            </h2>
            <p
              className="mt-4 text-base leading-relaxed"
              style={{ color: "hsl(240 5% 55%)" }}
            >
              Real-time answers. Stealth overlay. Powered by Cerebras ultra-fast inference.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, hsl(262 83% 58% / 0.25), hsl(330 80% 60% / 0.15))",
                    border: "1px solid hsl(262 83% 58% / 0.25)",
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: "hsl(262 83% 72%)" }} />
                </span>
                <span className="text-sm" style={{ color: "hsl(240 5% 65%)" }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom quote */}
        <div
          className="relative z-10 rounded-2xl p-5"
          style={{
            background: "hsl(240 6% 10% / 0.6)",
            border: "1px solid hsl(240 6% 18%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p className="text-sm italic" style={{ color: "hsl(240 5% 60%)" }}>
            "CocoAI helped me stay calm and land my offer. Having real-time hints when I got stuck made all the difference."
          </p>
          <p className="mt-3 text-xs font-semibold" style={{ color: "hsl(262 83% 72%)" }}>
            — Software Engineer, Google
          </p>
        </div>
      </div>

      {/* ─── Right Auth Panel ─────────────────────────────────── */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12"
        style={{ background: "hsl(240 6% 4%)" }}
      >
        {/* Subtle top glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] opacity-20"
          style={{
            background: "radial-gradient(ellipse at top, hsl(262 83% 58%), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div
          className="relative z-10 w-full max-w-[400px]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          {/* Back button */}
          {onClose && (
            <button
              onClick={onClose}
              className="mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: "hsl(240 5% 50%)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "hsl(0 0% 90%)")}
              onMouseLeave={e => (e.currentTarget.style.color = "hsl(240 5% 50%)")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </button>
          )}

          {/* ── Card ── */}
          <div
            className="relative rounded-2xl p-8"
            style={{
              background: "hsl(240 6% 8% / 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid hsl(240 6% 16%)",
              boxShadow: "0 24px 64px hsl(0 0% 0% / 0.5), 0 1px 0 hsl(240 6% 20%) inset",
            }}
          >
            {/* Gradient top accent line */}
            <div
              className="absolute top-0 left-8 right-8 h-px rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(262 83% 60% / 0.6), hsl(330 80% 60% / 0.6), transparent)",
              }}
            />

            {/* Logo + heading */}
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, hsl(262 83% 58% / 0.2), hsl(330 80% 58% / 0.1))",
                  border: "1px solid hsl(262 83% 58% / 0.25)",
                  boxShadow: "0 0 24px hsl(262 83% 58% / 0.12)",
                }}
              >
                <img src={cocoLogo} alt="CocoAI" className="h-9 w-9 rounded-xl" />
              </div>

              <h1
                className="mt-5 text-2xl font-bold tracking-tight"
                style={{ color: "hsl(0 0% 95%)" }}
              >
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: "hsl(240 5% 50%)" }}>
                {mode === "login"
                  ? "Sign in to access your CocoAI dashboard"
                  : "Start using CocoAI — your invisible copilot"}
              </p>
            </div>

            {/* ── Social OAuth Buttons ── */}
            <div className="mt-7 flex flex-col gap-3">
              {/* Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "hsl(240 6% 11%)",
                  border: "1px solid hsl(240 6% 20%)",
                  color: "hsl(0 0% 88%)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "hsl(240 6% 15%)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(240 6% 28%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px hsl(0 0% 0% / 0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "hsl(240 6% 11%)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(240 6% 20%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                onClick={handleGithubSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "hsl(240 6% 11%)",
                  border: "1px solid hsl(240 6% 20%)",
                  color: "hsl(0 0% 88%)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "hsl(240 6% 15%)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(240 6% 28%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px hsl(0 0% 0% / 0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "hsl(240 6% 11%)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(240 6% 20%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "hsl(240 6% 16%)" }} />
              <span className="text-xs" style={{ color: "hsl(240 5% 40%)" }}>or continue with email</span>
              <div className="h-px flex-1" style={{ background: "hsl(240 6% 16%)" }} />
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "hsl(240 5% 55%)" }}
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Roushan Kumar"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                    style={{
                      background: "hsl(240 6% 10%)",
                      border: "1px solid hsl(240 6% 18%)",
                      color: "hsl(0 0% 90%)",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "hsl(262 83% 58% / 0.6)";
                      e.target.style.boxShadow = "0 0 0 3px hsl(262 83% 58% / 0.1)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "hsl(240 6% 18%)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "hsl(240 5% 55%)" }}
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{
                    background: "hsl(240 6% 10%)",
                    border: "1px solid hsl(240 6% 18%)",
                    color: "hsl(0 0% 90%)",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "hsl(262 83% 58% / 0.6)";
                    e.target.style.boxShadow = "0 0 0 3px hsl(262 83% 58% / 0.1)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "hsl(240 6% 18%)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "hsl(240 5% 55%)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all duration-200"
                    style={{
                      background: "hsl(240 6% 10%)",
                      border: "1px solid hsl(240 6% 18%)",
                      color: "hsl(0 0% 90%)",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "hsl(262 83% 58% / 0.6)";
                      e.target.style.boxShadow = "0 0 0 3px hsl(262 83% 58% / 0.1)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "hsl(240 6% 18%)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "hsl(240 5% 45%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "hsl(0 0% 80%)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(240 5% 45%)")}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "hsl(0 70% 50% / 0.08)",
                    border: "1px solid hsl(0 70% 50% / 0.2)",
                    color: "hsl(0 80% 70%)",
                  }}
                >
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "hsl(142 70% 45% / 0.08)",
                    border: "1px solid hsl(142 70% 45% / 0.2)",
                    color: "hsl(142 70% 60%)",
                  }}
                >
                  <span className="mt-0.5 shrink-0">✅</span>
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, hsl(262 83% 58%), hsl(330 80% 55%))",
                  boxShadow: "0 4px 20px hsl(262 83% 58% / 0.35), 0 1px 0 hsl(0 0% 100% / 0.08) inset",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 6px 28px hsl(262 83% 58% / 0.5), 0 1px 0 hsl(0 0% 100% / 0.1) inset";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 20px hsl(262 83% 58% / 0.35), 0 1px 0 hsl(0 0% 100% / 0.08) inset";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Toggle Mode */}
            <p className="mt-6 text-center text-sm" style={{ color: "hsl(240 5% 50%)" }}>
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                    className="font-semibold transition-colors"
                    style={{ color: "hsl(262 83% 72%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "hsl(262 83% 82%)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(262 83% 72%)")}
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                    className="font-semibold transition-colors"
                    style={{ color: "hsl(262 83% 72%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "hsl(262 83% 82%)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(262 83% 72%)")}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs" style={{ color: "hsl(240 5% 35%)" }}>
            By continuing, you agree to CocoAI&apos;s{" "}
            <span style={{ color: "hsl(240 5% 45%)" }}>Terms of Service</span> and{" "}
            <span style={{ color: "hsl(240 5% 45%)" }}>Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* Orb animation keyframes */}
      <style>{`
        @keyframes orb1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.12); }
        }
        @keyframes orb2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-30px, -40px) scale(1.1); }
        }
        @keyframes orb3 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, -25px) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
