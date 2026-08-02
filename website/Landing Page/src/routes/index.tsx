import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Hero } from "@/components/landing/hero";
import { DownloadModal } from "@/components/landing/download-modal";
import { seoHead } from "@/lib/seo";

// Every section below the hero is code-split into its own chunk. Instead of
// fetching them all on load, each <LazySection> starts importing its chunk
// once the user scrolls within ~1200px or clicks its navbar link.
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
 * Renders fallback until sentinel scrolls within 1200px OR nav click / hash targets it,
 * then mounts the section instantly.
 */
function LazySection({
  sectionId,
  loader,
  children,
}: {
  sectionId: string;
  loader: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    // Check if initial hash matches this section
    const currentHash = window.location.hash.replace("#", "");
    if (currentHash === sectionId) {
      setNear(true);
      loader();
      return;
    }

    const handleMount = (e: Event) => {
      const custom = e as CustomEvent<{ id: string }>;
      if (custom.detail?.id === sectionId) {
        setNear(true);
        loader();
      }
    };

    window.addEventListener("coco-mount-section", handleMount);

    const el = ref.current;
    if (!el || near) {
      return () => window.removeEventListener("coco-mount-section", handleMount);
    }

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

    return () => {
      window.removeEventListener("coco-mount-section", handleMount);
      io.disconnect();
    };
  }, [near, loader, sectionId]);

  return (
    <div ref={ref} id={sectionId}>
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

      <LazySection sectionId="platforms" loader={loadPlatforms}>
        <Platforms />
      </LazySection>
      <LazySection sectionId="features" loader={loadFeatures}>
        <Features />
      </LazySection>
      <LazySection sectionId="comparison" loader={loadComparison}>
        <Comparison />
      </LazySection>
      <LazySection sectionId="pricing" loader={loadPricing}>
        <Pricing />
      </LazySection>
      <LazySection sectionId="faq" loader={loadFaq}>
        <Faq />
      </LazySection>
      <LazySection sectionId="giveaway" loader={loadGiveaway}>
        <Giveaway />
      </LazySection>
      <LazySection sectionId="contributors" loader={loadContributorForm}>
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

// Import factories
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
