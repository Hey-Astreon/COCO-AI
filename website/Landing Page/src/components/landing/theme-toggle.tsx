import { MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const isDarkNow = root.classList.contains("dark");
    const nextDark = !isDarkNow;

    const applyDOMChange = () => {
      root.classList.toggle("dark", nextDark);
      try {
        localStorage.setItem("coco-theme", nextDark ? "dark" : "light");
      } catch {
        /* storage unavailable */
      }
    };

    // Check for View Transitions API support (Chrome 111+, Edge, Safari 18+)
    if (typeof document.startViewTransition === "function") {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        applyDOMChange();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: nextDark ? clipPath.reverse() : clipPath,
          },
          {
            duration: 500,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: nextDark
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
          }
        );
      });
    } else {
      // Fallback for browsers without View Transitions API
      root.classList.add("theme-anim");
      applyDOMChange();
      window.setTimeout(() => root.classList.remove("theme-anim"), 500);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle Light / Dark theme"
      className={`glass-card relative grid h-9 w-9 place-items-center overflow-hidden rounded-full text-muted-foreground transition-all duration-300 ease-premium hover:bg-accent hover:text-foreground hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer ${className}`}
    >
      {/* Sun Icon — visible in Light Mode, spins out when transitioning to Dark Mode */}
      <Sun className="h-4 w-4 text-amber-500 transition-transform duration-500 ease-premium transform dark:-rotate-90 dark:scale-0 block dark:hidden" />
      {/* Moon Icon — visible in Dark Mode, spins in when transitioning to Dark Mode */}
      <Moon className="h-4 w-4 text-violet-400 transition-transform duration-500 ease-premium transform rotate-90 scale-0 dark:rotate-0 dark:scale-100 hidden dark:block" />
    </button>
  );
}
