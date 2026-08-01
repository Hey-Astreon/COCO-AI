import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Hero } from "@/components/landing/hero";
import { DownloadModal } from "@/components/landing/download-modal";
import { seoHead } from "@/lib/seo";

// Every section below the hero is code-split into its own chunk. Instead of
// fetching them all on load, each <LazySection> only starts importing its chunk
// once the user scrolls within ~1200px of it — a head start long enough for the
// chunk to finish downloading before the section enters the viewport.
const Platforms = lazy(() =>
  import("@/components/landing/platforms").then((m) => ({ default: m.Platforms })),
);
const Features = lazy(() =>
  import("@/components/landing/features").then((m) => ({ default: m.Features })),
);
const Comparison = lazy(() =>
  import("@/components/landing/comparison").then((m) => ({ default: m.Comparison })),
);
const Pricing = lazy(() =>
  import("@/components/landing/pricing").then((m) => ({ default: m.Pricing })),
);
const Faq = lazy(() => import("@/components/landing/faq").then((m) => ({ default: m.Faq })));
const Giveaway = lazy(() =>
  import("@/components/landing/giveaway").then((m) => ({ default: m.Giveaway })),
);
const ContributorForm = lazy(() =>
  import("@/components/landing/contributor-form").then((m) => ({
    default: m.ContributorForm,
  })),
);

// Spacer so the layout doesn't jump while a below-fold chunk loads.
function SectionFallback() {
  return <div className="min-h-[40vh]" aria-hidden="true" />;
}

/**
 * Renders nothing (just a spacer) until the sentinel scrolls within 1200px of
 * the viewport, then mounts the lazy section — triggering its chunk download
 * with enough time to finish before the user arrives.
 */
function LazySection({ loader, children }: { loader: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          loader();
          io.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, loader]);

  return (
    <div ref={ref}>
      {near ? <Suspense fallback={<SectionFallback />}>{children}</Suspense> : <SectionFallback />}
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      title: "CocoAI — Invisible Real-Time Interview Copilot",
      description:
        "Ace your technical interviews invisibly. Real-time question detection, personalized answers based on your resume, and a fully customizable stealth overlay. Running locally, safely, and securely.",
      path: "/",
    }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  return (
    <>
      <Hero onDownloadClick={() => setDownloadModalOpen(true)} />

      <LazySection loader={loadPlatforms}>
        <Platforms />
      </LazySection>
      <LazySection loader={loadFeatures}>
        <Features />
      </LazySection>
      <LazySection loader={loadComparison}>
        <Comparison />
      </LazySection>
      <LazySection loader={loadPricing}>
        <Pricing />
      </LazySection>
      <LazySection loader={loadFaq}>
        <Faq />
      </LazySection>
      <LazySection loader={loadGiveaway}>
        <Giveaway />
      </LazySection>
      <LazySection loader={loadContributorForm}>
        <ContributorForm />
      </LazySection>

      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onNavigateToLogin={() => navigate({ to: "/login" })}
      />
    </>
  );
}

// The import() factories — kept outside the lazy wrappers so <LazySection> can
// fire them early (React.lazy would otherwise defer the request to first render).
function loadPlatforms() {
  return import("@/components/landing/platforms");
}
function loadFeatures() {
  return import("@/components/landing/features");
}
function loadComparison() {
  return import("@/components/landing/comparison");
}
function loadPricing() {
  return import("@/components/landing/pricing");
}
function loadFaq() {
  return import("@/components/landing/faq");
}
function loadGiveaway() {
  return import("@/components/landing/giveaway");
}
function loadContributorForm() {
  return import("@/components/landing/contributor-form");
}
