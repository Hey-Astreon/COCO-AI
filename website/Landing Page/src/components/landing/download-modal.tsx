import { useState } from "react";
import { X, Copy, Check, Download, ShieldCheck, Key, Terminal, EyeOff } from "lucide-react";
import { COCOAI_DOWNLOAD_URL } from "@/lib/links";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLogin: () => void;
}

export function DownloadModal({ isOpen, onClose, onNavigateToLogin }: DownloadModalProps) {
  const { user } = useAuth();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  // Supabase URL & Anon Key for sync
  const SUPABASE_URL = "https://csntdpytzqcwceikdfyz.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbnRkcHl0enFjd2NlaWtkZnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNDY2MjQsImV4cCI6MjEwMDkyMjYyNH0.REQ3ClLtaCefbcuxviP_bsj72yuY7DFdNBz6pCFnGSE";

  const handleCopy = (text: string, type: "url" | "key") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast.success("Supabase URL copied to clipboard!");
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast.success("Supabase Anon Key copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="glass-card relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-border/40 bg-background/40 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <ShieldCheck className="h-5 w-5 text-violet-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Onboarding &amp; Setup Guide
          </h2>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Follow these simple steps to run CocoAI invisibly on your local Windows system.
        </p>

        {/* Steps */}
        <div className="mt-6 flex flex-col gap-6">
          {/* Step 1: Download */}
          <div className="flex gap-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-xs font-bold text-violet-400">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Download Desktop Installer</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Get the latest build (v1.0.38) for Windows 10 or 11.
              </p>
              <a
                href={COCOAI_DOWNLOAD_URL}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-95"
              >
                <Download className="h-3.5 w-3.5" />
                Download Installer (.exe)
              </a>
            </div>
          </div>

          {/* Step 2: Sync API Keys */}
          <div className="flex gap-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-xs font-bold text-violet-400">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Connect Your Profile</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Paste these keys into the local desktop client settings to sync your subscription status, telemetry, and tokens.
              </p>

              {user ? (
                <div className="mt-3 flex flex-col gap-2.5 rounded-xl border border-border/40 bg-accent/30 p-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Supabase Connection URL
                    </label>
                    <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-background/50 px-2 py-1.5 border border-border/20">
                      <code className="text-[11px] text-foreground truncate font-mono">{SUPABASE_URL}</code>
                      <button
                        onClick={() => handleCopy(SUPABASE_URL, "url")}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        {copiedUrl ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Supabase Anon Key
                    </label>
                    <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-background/50 px-2 py-1.5 border border-border/20">
                      <code className="text-[11px] text-foreground truncate font-mono max-w-[280px]">
                        {SUPABASE_ANON_KEY}
                      </code>
                      <button
                        onClick={() => handleCopy(SUPABASE_ANON_KEY, "key")}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        {copiedKey ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-border/60 bg-accent/10 p-4 text-center">
                  <Key className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Please sign in to retrieve your account connection keys.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToLogin();
                    }}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent/80"
                  >
                    Sign In to Retrieve Keys
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Run & Hotkeys */}
          <div className="flex gap-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-xs font-bold text-violet-400">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Launch Stealth Overlay</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Run the executable. Use these shortcuts to control CocoAI invisibly during live calls:
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium text-foreground">
                <div className="flex items-center gap-2 rounded-lg bg-accent/20 px-2 py-1.5 border border-border/10">
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span><kbd className="font-mono bg-background border border-border px-1 py-0.5 rounded text-[10px]">Ctrl+Shift+O</kbd> Show/Hide</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-accent/20 px-2 py-1.5 border border-border/10">
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  <span><kbd className="font-mono bg-background border border-border px-1 py-0.5 rounded text-[10px]">Ctrl+Shift+T</kbd> Toggle Translucency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
