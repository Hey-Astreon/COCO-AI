import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    try {
      localStorage.setItem("coco-theme", isDark ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle Light / Dark theme"
      className={`glass-card relative grid h-9 w-9 place-items-center overflow-hidden rounded-full text-muted-foreground transition-all duration-200 ease-premium hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer ${className}`}
    >
      {/* Sun Icon — visible in Light Mode, spins smoothly on mode swap */}
      <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 ease-out transform dark:-rotate-90 dark:scale-0 block dark:hidden" />
      {/* Moon Icon — visible in Dark Mode, spins smoothly on mode swap */}
      <Moon className="h-4 w-4 text-violet-400 transition-transform duration-300 ease-out transform rotate-90 scale-0 dark:rotate-0 dark:scale-100 hidden dark:block" />
    </button>
  );
}
