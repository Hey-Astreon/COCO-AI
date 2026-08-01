import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { passwordStrength } from "@/lib/password-strength";
import { Check, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import cocoLogo from "@/assets/coco_logo_nobg.webp";
import { useCardEntrance } from "@/hooks/use-card-entrance";
import { Magnetic } from "@/components/landing/magnetic";
import { Spotlight } from "@/components/landing/spotlight";
import { toast } from "sonner";

type ResetStatus = "checking" | "ready" | "invalid" | "done";

/** Full-screen premium page where users set a new password after clicking the recovery link. */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, signOut } = useAuth();

  const [status, setStatus] = useState<ResetStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entranceStyle = useCardEntrance();

  // Detect the recovery session. With PKCE the code is auto-exchanged by the
  // client (detectSessionInUrl), which fires PASSWORD_RECOVERY — and
  // getSession() is the fallback for sessions established before mount.
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" && session?.user) {
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) setStatus("ready");
    });

    // No session after a few seconds → expired or invalid link.
    const timeout = window.setTimeout(() => {
      if (!mounted) return;
      setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 4000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  const strength = passwordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirm;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!passwordsMatch) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await updatePassword(password);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      // Recovery session is single-use — sign out so the user logs in fresh
      // with their new password.
      await signOut();
      setStatus("done");
      toast.success("Password updated — sign in with your new password.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const goToLogin = () => navigate({ to: "/login" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background px-4">
      {/* Aurora orbs — same ambience as the auth page */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-aurora absolute -top-[10%] -left-[5%] h-[420px] w-[420px] rounded-full bg-violet-600/25 blur-[100px]" />
        <div
          className="animate-aurora absolute -right-[5%] -bottom-[15%] h-[380px] w-[380px] rounded-full bg-pink-600/20 blur-[100px]"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="animate-aurora absolute top-[38%] left-[38%] h-[220px] w-[220px] rounded-full bg-lavender/20 blur-[90px]"
          style={{ animationDelay: "-11s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px]" style={entranceStyle}>
        {/* ── Card: animated gradient border + cursor spotlight ── */}
        <Spotlight className="gradient-border-animated relative">
          <div className="glass-card relative overflow-hidden rounded-3xl p-8">
            {/* Logo */}
            <div className="flex flex-col items-center text-center">
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
                Set a new password
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Choose a strong password for your CocoAI account
              </p>
            </div>

            {/* Checking state */}
            {status === "checking" && (
              <div className="mt-8 flex items-center justify-center gap-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-lavender" />
                Verifying your recovery link…
              </div>
            )}

            {/* Invalid / expired link */}
            {status === "invalid" && (
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>
                    This recovery link is invalid or has expired. Request a new one from the sign-in
                    page.
                  </span>
                </div>
                <Magnetic strength={6}>
                  <button
                    onClick={goToLogin}
                    className="btn-shine bg-gradient-brand relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/45"
                  >
                    <KeyRound className="h-4 w-4" />
                    Back to sign in
                  </button>
                </Magnetic>
              </div>
            )}

            {/* Success state */}
            {status === "done" && (
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Password updated successfully!</span>
                </div>
                <Magnetic strength={6}>
                  <button
                    onClick={goToLogin}
                    className="btn-shine bg-gradient-brand relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/45"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Sign in with your new password
                  </button>
                </Magnetic>
              </div>
            )}

            {/* Ready state — the form */}
            {status === "ready" && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="input-flat w-full rounded-xl py-3 pr-4 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
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
                      {!passwordsMatch && confirm.length > 0 && (
                        <span className="ml-2 text-red-400">— passwords don&apos;t match</span>
                      )}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-shine bg-gradient-brand relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/45 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </button>
              </form>
            )}
          </div>
        </Spotlight>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          By continuing, you agree to CocoAI&apos;s{" "}
          <span className="text-muted-foreground">Terms of Service</span> and{" "}
          <span className="text-muted-foreground">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
