import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seoHead({
      title: "About Us — CocoAI",
      description:
        "CocoAI was built by developers, for developers. An invisible real-time interview copilot that levels the playing field — fully open source.",
      path: "/about",
    }),
  component: lazyRouteComponent(() => import("@/components/landing/about-page"), "AboutPage"),
});
