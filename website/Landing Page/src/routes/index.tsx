import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Background } from "@/components/landing/background";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Giveaway } from "@/components/landing/giveaway";
import { ContributorForm } from "@/components/landing/contributor-form";
import { Footer } from "@/components/landing/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CocoAI — Invisible Real-Time Interview Copilot" },
      {
        name: "description",
        content:
          "Ace your technical interviews invisibly. Real-time question detection, personalized answers based on your resume, and a fully customizable stealth overlay. Running locally, safely, and securely.",
      },
      { property: "og:title", content: "CocoAI — Invisible Real-Time Interview Copilot" },
      {
        property: "og:description",
        content:
          "Ace your technical interviews invisibly. Real-time question detection, personalized answers based on your resume, and a fully customizable stealth overlay. Running locally, safely, and securely.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
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
      <Toaster theme="dark" position="bottom-right" richColors />
    </div>
  );
}
