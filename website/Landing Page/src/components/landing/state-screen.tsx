import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Aurora orb backdrop shared by every state screen. */
export function StateBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="animate-aurora absolute -top-[12%] -left-[6%] h-[460px] w-[460px] rounded-full bg-violet-600/20 blur-[110px]" />
      <div
        className="animate-aurora absolute -right-[6%] -bottom-[14%] h-[420px] w-[420px] rounded-full bg-pink-600/15 blur-[110px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="animate-aurora absolute top-[30%] left-[42%] h-[220px] w-[220px] rounded-full bg-lavender/15 blur-[90px]"
        style={{ animationDelay: "-11s" }}
      />
    </div>
  );
}

interface StateScreenProps {
  /** Big gradient digits rendered above the title (e.g. "404"). */
  code?: string;
  /** Eyebrow label above the title. Defaults to `Error {code}` when `code` is set. */
  badge?: string;
  /** Floating glass chip above the content (e.g. "This page went off-grid"). */
  chip?: string;
  /** Icon for the floating chip. */
  chipIcon?: LucideIcon;
  /** Icon tile shown in the card variant (e.g. RefreshCcw for errors). */
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Action buttons rendered in a centered row. */
  actions?: ReactNode;
  /** "plain" — open content (404 style); "card" — glass card (error style). */
  variant?: "plain" | "card";
  className?: string;
}

/**
 * Reusable premium error / empty-state screen: aurora backdrop, optional
 * floating chip, gradient code digits or an icon tile, title + description,
 * and an actions row. Used by the router 404 and error surfaces.
 */
export function StateScreen({
  code,
  badge,
  chip,
  chipIcon: ChipIcon,
  icon: Icon,
  title,
  description,
  actions,
  variant = "plain",
  className,
}: StateScreenProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-24",
        className,
      )}
    >
      <StateBackdrop />

      {variant === "card" ? (
        <div className="glass-card gradient-top-border relative z-10 w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
          {Icon && (
            <div className="bg-gradient-brand mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-violet-500/25">
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
          <h1
            className={`font-display text-2xl font-bold tracking-tight text-foreground ${
              Icon ? "mt-6" : "mt-0"
            }`}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {actions && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>
          )}
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md text-center">
          {chip && (
            <div className="animate-float absolute -top-8 left-1/2 hidden -translate-x-1/2 sm:block">
              <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-xl">
                {ChipIcon && <ChipIcon className="h-3 w-3 text-lavender" />}
                {chip}
              </div>
            </div>
          )}

          {(code || badge) && (
            <p className="font-mono text-xs font-bold tracking-[0.3em] text-lavender uppercase">
              {badge ?? `Error ${code}`}
            </p>
          )}
          {code && (
            <h1 className="font-display mt-3 text-8xl font-bold tracking-tight">
              {code.split("").map((digit, i) => (
                <span key={i} className={i % 2 === 0 ? "text-gradient" : "text-foreground"}>
                  {digit}
                </span>
              ))}
            </h1>
          )}

          <h2
            className={`font-display text-2xl font-bold tracking-tight text-foreground ${
              code || badge ? "mt-2" : "mt-0"
            }`}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {actions && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>
          )}
        </div>
      )}
    </div>
  );
}
