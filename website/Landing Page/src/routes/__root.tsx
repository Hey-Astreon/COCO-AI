import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import {
  HeadContent,
  Link,
  Outlet,
  createRootRouteWithContext,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Compass, Home, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Background } from "@/components/landing/background";
import { Magnetic } from "@/components/landing/magnetic";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { BackToTop } from "@/components/landing/back-to-top";
import { StateScreen } from "@/components/landing/state-screen";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <StateScreen
      code="404"
      chip="This page went off-grid"
      chipIcon={Compass}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved — maybe it was too stealthy even for CocoAI."
      actions={
        <>
          <Magnetic strength={6}>
            <Link
              to="/"
              className="btn-shine bg-gradient-brand relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/45"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Magnetic>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-lavender/40 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </>
      }
    />
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("[Router Error]", error);
  const router = useRouter();

  return (
    <StateScreen
      variant="card"
      icon={RefreshCcw}
      title="This page didn't load"
      description={error?.message || "Something went wrong on our end."}
      actions={
        <>
          <Magnetic strength={6}>
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="btn-shine bg-gradient-brand relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/45"
            >
              <RefreshCcw className="h-4 w-4" />
              Try again
            </button>
          </Magnetic>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-lavender/40 hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </>
      }
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

const defaultQueryClient = new QueryClient();

function RootComponent() {
  const routeContext = Route.useRouteContext();
  const [queryClient] = useState(() => routeContext?.queryClient || defaultQueryClient);

  const pathname = useLocation().pathname;
  const isAuthRoute =
    pathname === "/login" || pathname === "/signup" || pathname === "/reset-password";
  const mainRef = useRef<HTMLElement>(null);

  // Toast theme follows the .dark class on <html> (toggled by ThemeToggle).
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : true,
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    // Follow the OS theme live while no explicit override is pinned.
    // (index.html's pre-paint script already set the correct class on load;
    // ThemeToggle writes coco-theme to pin a choice.)
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      try {
        const saved = localStorage.getItem("coco-theme");
        if (saved === "light" || saved === "dark") {
          root.classList.toggle("dark", saved === "dark");
          sync();
          return;
        }
      } catch {
        /* storage unavailable — fall through to system preference */
      }
      root.classList.toggle("dark", media.matches);
      sync();
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", applyTheme);
    };
  }, []);

  // Move focus to the page content on route change for keyboard/screen-reader users.
  // preventScroll keeps the router's scrollRestoration from being clobbered on back-nav.
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground">
          <Background />
          <HeadContent />
          {!isAuthRoute && <Navbar />}
          {/* key={pathname} remounts the page on navigation → tab-enter crossfade */}
          <main ref={mainRef} tabIndex={-1} key={pathname} className="tab-enter outline-none">
            <Outlet />
          </main>
          {!isAuthRoute && <Footer />}
          {!isAuthRoute && <BackToTop />}
          <Toaster theme={isDark ? "dark" : "light"} position="bottom-right" richColors />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
