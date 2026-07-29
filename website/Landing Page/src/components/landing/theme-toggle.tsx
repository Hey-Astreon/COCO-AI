import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggleTheme() {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    const isDark = root.classList.toggle("dark");
    try {
      localStorage.setItem("coco-theme", isDark ? "dark" : "light");
    } catch {
      /* storage unavailable — theme simply won't persist */
    }
    window.setTimeout(() => root.classList.remove("theme-anim"), 450);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      className={`glass-card grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors duration-300 ease-premium hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
      {/* Icons follow the .dark class on <html> — no JS state, no hydration mismatch */}
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}
