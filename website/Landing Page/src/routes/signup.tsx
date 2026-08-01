import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { seoHead } from "@/lib/seo";

const AuthPage = lazy(() =>
  import("@/components/auth/auth-page").then((m) => ({ default: m.AuthPage })),
);

export const Route = createFileRoute("/signup")({
  head: () =>
    seoHead({
      title: "Create Account — CocoAI",
      description:
        "Sign up for CocoAI — your invisible real-time interview copilot. Start free today.",
      path: "/signup",
    }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthPage defaultMode="signup" onClose={() => navigate({ to: "/" })} />
    </Suspense>
  );
}
