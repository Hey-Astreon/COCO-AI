import { Loader2 } from "lucide-react";
import cocoLogo from "@/assets/coco_logo_nobg.webp";

/**
 * Premium full-screen loading fallback shown while the auth-page chunk is
 * being fetched. Rendered inside the route's <Suspense>, so it must live in
 * its own module — NOT inside the lazy chunk it's covering.
 */
export function AuthLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
      {/* Aurora orbs — same ambience as the auth page itself */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-aurora absolute -top-[10%] -left-[5%] h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[100px]" />
        <div
          className="animate-aurora absolute -right-[5%] -bottom-[15%] h-[380px] w-[380px] rounded-full bg-pink-600/15 blur-[100px]"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="animate-aurora absolute top-[40%] left-[45%] h-[200px] w-[200px] rounded-full bg-lavender/15 blur-[90px]"
          style={{ animationDelay: "-11s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="bg-gradient-brand flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-violet-500/25">
          <img
            src={cocoLogo}
            alt="CocoAI"
            width={256}
            height={201}
            className="h-10 w-10 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-lavender" />
          Loading CocoAI…
        </div>
      </div>
    </div>
  );
}
