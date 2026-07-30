import React, { useState, useEffect, Component, type ErrorInfo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import { Background } from "@/components/landing/background";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Giveaway } from "@/components/landing/giveaway";
import { ContributorForm } from "@/components/landing/contributor-form";
import { Footer } from "@/components/landing/footer";
import { AuthPage } from "@/components/auth/auth-page";
import { NavigationContext } from "@/lib/navigation";

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Uncaught Error]", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0b14] text-foreground p-6 font-mono overflow-auto">
          <div className="max-w-2xl w-full border border-red-900 bg-red-950/20 rounded-xl p-8 shadow-2xl">
            <h1 className="text-xl font-bold text-red-500">Render Error Occurred</h1>
            <p className="mt-2 text-sm text-red-400">{this.state.error?.toString()}</p>
            <pre className="mt-4 p-4 bg-black/55 text-xs text-muted-foreground rounded-lg border border-border/40 overflow-x-auto">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [path, setPath] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", to);
      setPath(to);
    }
  };

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NavigationContext.Provider value={{ path, navigate }}>
          <AuthProvider>
            <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground">
              <Background />
              <Navbar />
              <main>
                <Hero />
                <Features />
                <Pricing />
                <Giveaway />
                <ContributorForm />
              </main>
              <Footer />

              {/* Auth Modals */}
              {path === "/login" && (
                <AuthPage defaultMode="login" onClose={() => navigate("/")} />
              )}
              {path === "/signup" && (
                <AuthPage defaultMode="signup" onClose={() => navigate("/")} />
              )}

              <Toaster theme="dark" position="bottom-right" richColors />
            </div>
          </AuthProvider>
        </NavigationContext.Provider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
