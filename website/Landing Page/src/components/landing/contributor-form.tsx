import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Github, Loader2, Send } from "lucide-react";
import {
  contributorApplicationSchema,
  type ContributorApplicationInput,
} from "@/lib/contributor-schema";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Reveal } from "./reveal";
import { SectionTag } from "./section-tag";

const inputClass =
  "input-flat h-11 w-full rounded-lg px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50";

const labelClass = "mb-2 block text-sm font-medium text-muted-foreground";

export function ContributorForm() {
  const [submitted, setSubmitted] = useState(false);
  const { user, refreshProfile } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContributorApplicationInput>({
    resolver: zodResolver(contributorApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      githubUsername: "",
      resumeUrl: "",
      motivation: "",
    },
  });

  async function onSubmit(values: ContributorApplicationInput) {
    try {
      const { error: dbError } = await supabase.from("contributor_applications").insert({
        full_name: values.fullName,
        email: values.email,
        github_username: values.githubUsername,
        resume_url: values.resumeUrl,
        motivation: values.motivation,
      });

      if (dbError) throw dbError;

      // If user is logged in, automatically upgrade them to Developer tier!
      if (user) {
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ subscription_tier: "developer" })
          .eq("id", user.id);

        if (updateError) {
          console.warn("[Contributor] Profile upgrade failed:", updateError.message);
        } else {
          await refreshProfile();
          toast.success("Welcome aboard! You have been upgraded to the Developer Tier 👑");
        }
      }

      setSubmitted(true);
      reset();
      toast.success("Application received! We'll be in touch soon.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not submit your application. Please try again.",
      );
    }
  }

  return (
    <section id="contributors" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <SectionTag label="Contributions" />
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Join the Open Source Core Team
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            If you are a dedicated developer looking to contribute to an early-stage stealth
            product, fill out the form below. I will choose 5 developers to become core
            contributors, granting them early access to beta features and repository access.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="glass-card gradient-top-border relative mt-12 overflow-hidden rounded-2xl p-6 sm:p-10">
            {submitted ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="bg-gradient-brand flex h-16 w-16 items-center justify-center rounded-full shadow-lg shadow-violet-500/25">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </span>
                <h3 className="font-display mt-6 text-2xl font-bold text-foreground">
                  Application submitted!
                </h3>
                <p className="mt-3 max-w-md text-sm text-muted-foreground">
                  Thanks for applying to the CocoAI core team. If you're shortlisted, we'll reach
                  out via email with next steps and repository access.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-8 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 ease-premium hover:bg-accent"
                >
                  Submit another application
                </button>
                <p className="mt-4 text-xs text-muted-foreground">
                  🎉 Contributing developers are upgraded to the Developer Tier 👑
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className={labelClass}>
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Ada Lovelace"
                      autoComplete="name"
                      className={inputClass}
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="ada@example.com"
                      autoComplete="email"
                      className={inputClass}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="githubUsername" className={labelClass}>
                      GitHub Username
                    </label>
                    <div className="relative">
                      <Github className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="githubUsername"
                        type="text"
                        placeholder="ada-lovelace"
                        className={`${inputClass} pl-10`}
                        {...register("githubUsername")}
                      />
                    </div>
                    {errors.githubUsername && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.githubUsername.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="resumeUrl" className={labelClass}>
                      Google Drive Link to Resume
                    </label>
                    <input
                      id="resumeUrl"
                      type="url"
                      placeholder="https://drive.google.com/file/d/…"
                      className={inputClass}
                      {...register("resumeUrl")}
                    />
                    {errors.resumeUrl && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.resumeUrl.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="motivation" className={labelClass}>
                    Brief Description of why you want to contribute
                  </label>
                  <textarea
                    id="motivation"
                    rows={5}
                    placeholder="Tell us about your experience, what excites you about CocoAI, and how you'd like to contribute…"
                    className="input-flat w-full resize-y rounded-lg px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50"
                    {...register("motivation")}
                  />
                  {errors.motivation && (
                    <p className="mt-1.5 text-xs text-destructive">{errors.motivation.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-shine mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 ease-premium hover:scale-[1.01] hover:shadow-violet-500/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Apply as Contributor
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
