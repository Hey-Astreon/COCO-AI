import { Github } from "lucide-react";
import logo from "@/assets/coco_logo_nobg.png";
import { COCOAI_CO_DEVELOPER_URL, COCOAI_DEVELOPER_URL, COCOAI_REPO_URL } from "@/lib/links";

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <div className="flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
          <a href="#top" className="flex items-center gap-2.5">
            <img src={logo} alt="CocoAI logo" className="h-7 w-auto" />
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              CocoAI
            </span>
          </a>

          <p className="text-sm text-muted-foreground">
            The invisible real-time copilot for technical interviews.
          </p>

          <a
            href={COCOAI_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CocoAI on GitHub"
            className="glass-card rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>

        <div className="w-full border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
          <p>
            © 2026 CocoAI. Built with 💜 by{" "}
            <a
              href={COCOAI_DEVELOPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors duration-300 ease-premium hover:underline"
            >
              Hey-Astreon
            </a>{" "}
            &amp;{" "}
            <a
              href={COCOAI_CO_DEVELOPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors duration-300 ease-premium hover:underline"
            >
              Silenttears-cloud
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
