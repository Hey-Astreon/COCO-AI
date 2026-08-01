import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { seoHead } from "@/lib/seo";

const ResetPasswordPage = lazy(() =>
  import("@/components/auth/reset-password").then((m) => ({ default: m.ResetPasswordPage })),
);

export const Route = createFileRoute("/reset-password")({
  head: () =>
    seoHead({
      title: "Reset Password — CocoAI",
      description: "Set a new password for your CocoAI account using your recovery link.",
      path: "/reset-password",
    }),
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
