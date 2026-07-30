import React, { useState, useEffect } from "react";
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

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
