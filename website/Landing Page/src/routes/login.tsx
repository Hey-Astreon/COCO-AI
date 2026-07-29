import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Background } from "@/components/landing/background";
import { AuthPage } from "@/components/auth/auth-page";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — CocoAI" },
      { name: "description", content: "Sign in to your CocoAI account to manage your subscription and access the dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <>
      <Background />
      <AuthPage
        defaultMode="login"
        onClose={() => navigate({ to: "/" })}
      />
    </>
  );
}
