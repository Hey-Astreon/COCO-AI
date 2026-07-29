import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Background } from "@/components/landing/background";
import { AuthPage } from "@/components/auth/auth-page";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — CocoAI" },
      { name: "description", content: "Sign up for CocoAI — your invisible real-time interview copilot. Start free today." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();

  return (
    <>
      <Background />
      <AuthPage
        defaultMode="signup"
        onClose={() => navigate({ to: "/" })}
      />
    </>
  );
}
