import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { seoHead } from "@/lib/seo";

const AuthPage = lazy(() =>
  import("@/components/auth/auth-page").then((m) => ({ default: m.AuthPage })),
);

export const Route = createFileRoute("/login")({
  head: () =>
    seoHead({
      title: "Sign In — CocoAI",
      description:
        "Sign in to your CocoAI account to manage your subscription and access the dashboard.",
      path: "/login",
    }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthPage defaultMode="login" onClose={() => navigate({ to: "/" })} />
    </Suspense>
  );
}
