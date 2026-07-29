import { ArrowUpRight, Star, UserPlus } from "lucide-react";
import { COCOAI_DEVELOPER_URL, COCOAI_REPO_URL } from "@/lib/links";
import { Reveal } from "./reveal";
import { SectionTag } from "./section-tag";

const RULES = [
  {
    icon: UserPlus,
    text: (
      <>
        Follow{" "}
        <a
          href={COCOAI_DEVELOPER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lavender underline-offset-4 hover:underline"
        >
          the developer
        </a>{" "}
        on GitHub.
      </>
    ),
  },
  {
    icon: Star,
    text: (
      <>
        Give a Star (⭐) to{" "}
        <a
          href={COCOAI_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lavender underline-offset-4 hover:underline"
        >
          our official GitHub repository
        </a>
        .
      </>
    ),
  },
];

export function Giveaway() {
  return (
    <section id="giveaway" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="glass-card gradient-top-border relative overflow-hidden rounded-2xl p-8 sm:p-12">
            <SectionTag label="Launch Offer" />

            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Launch Giveaway — Get Pro for Free
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              The first 5 developers to participate will receive a lifetime CocoAI Pro license
              for free!
            </p>

            <ol className="mt-8 flex flex-col gap-4">
              {RULES.map((rule, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-accent text-sm font-bold text-foreground">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm leading-relaxed text-foreground sm:text-base">
                    {rule.text}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href={COCOAI_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-colors duration-300 ease-premium hover:bg-accent"
              >
                Participate on GitHub
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <span className="text-xs text-muted-foreground">
                Winners announced on the repository — only 5 lifetime licenses.
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
