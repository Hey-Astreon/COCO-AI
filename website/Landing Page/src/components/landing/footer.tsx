import { Github } from "lucide-react";
import logo from "@/assets/coco_logo_nobg.png";
import { COCOAI_REPO_URL } from "@/lib/links";
import { useNavigation } from "@/lib/navigation";

const ROUSHAN_PORTFOLIO = "https://Astreon.me";
const AYUSHI_PORTFOLIO = "https://Ayushiraj.me";

export function Footer() {
  const { navigate } = useNavigation();

  return (
    <footer className="border-t border-border/60 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <div className="flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
            className="flex items-center gap-2.5"
          >
            <img src={logo} alt="CocoAI logo" className="h-7 w-auto" />
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              CocoAI
            </span>
          </a>

          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a
              href="/about"
              onClick={(e) => { e.preventDefault(); navigate("/about"); }}
              className="transition-colors hover:text-foreground"
            >
              About Us
            </a>
            <a
              href="/contact"
              onClick={(e) => { e.preventDefault(); navigate("/contact"); }}
              className="transition-colors hover:text-foreground"
            >
              Contact Us &amp; FAQ
            </a>
          </div>

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
              href={ROUSHAN_PORTFOLIO}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors duration-300 ease-premium hover:underline"
            >
              Hey-Astreon
            </a>{" "}
            &amp;{" "}
            <a
              href={AYUSHI_PORTFOLIO}
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
