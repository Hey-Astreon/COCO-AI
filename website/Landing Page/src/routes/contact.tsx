import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seoHead({
      title: "Contact Us — CocoAI",
      description:
        "Found a bug, facing a technical issue, or have feedback? Send CocoAI a message and we'll respond within 24 hours.",
      path: "/contact",
    }),
  component: lazyRouteComponent(() => import("@/components/landing/contact-page"), "ContactPage"),
});
