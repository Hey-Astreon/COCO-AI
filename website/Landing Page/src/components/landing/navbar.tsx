import { useEffect, useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { useNavigation } from "@/lib/navigation";
import logo from "@/assets/coco_logo_nobg.png";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { label: "Features", href: "#features", id: "features" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
  { label: "Giveaway", href: "#giveaway", id: "giveaway" },
  { label: "Contributors", href: "#contributors", id: "contributors" },
];

export function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const { navigate } = useNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const { scrollY } = window;
      setScrolled(scrollY > 24);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { threshold: [0.25, 0.5], rootMargin: "-30% 0px -40% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = () => setUserMenuOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [userMenuOpen]);

  const tierLabel = profile?.subscription_tier === "developer"
    ? "Developer"
    : profile?.subscription_tier === "pro"
      ? "Pro"
      : profile?.subscription_tier === "standard"
        ? "Standard"
        : "Free";

  const tierColor = profile?.subscription_tier === "developer"
    ? "text-amber-400"
    : profile?.subscription_tier === "pro"
      ? "text-pink-400"
      : profile?.subscription_tier === "standard"
        ? "text-violet-400"
        : "text-muted-foreground";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border/60 bg-background/70 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      {/* Scroll progress hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-lavender/70"
        style={{ transform: `scaleX(${progress})` }}
      />

      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="glass-card flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5">
          <img src={logo} alt="CocoAI logo" className="h-6 w-auto" />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            CocoAI
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ease-premium ${
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Auth Buttons */}
          {!loading && !user && (
            <div className="hidden items-center gap-2 md:flex">
              <a
                href="/login"
                onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                Sign In
              </a>
              <a
                href="/signup"
                onClick={(e) => { e.preventDefault(); navigate("/signup"); }}
                className="rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/40"
              >
                Get Started
              </a>
            </div>
          )}

          {/* Signed-in User Avatar & Menu */}
          {!loading && user && (
            <div className="relative hidden md:block">
              <button
                onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}
                className="flex items-center gap-2 rounded-full border border-border/40 bg-background/60 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-accent"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-pink-600">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                  {profile?.display_name || user.email?.split("@")[0]}
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border/60 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-border/40 px-3 py-2">
                    <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
                    <p className={`mt-0.5 text-xs font-semibold ${tierColor}`}>
                      {tierLabel} Plan
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      setUserMenuOpen(false);
                      const payload = {
                        user: { id: user.id, email: user.email },
                        profile: profile || { subscription_tier: "free" },
                      };
                      const jsonStr = JSON.stringify(payload);
                      try {
                        await navigator.clipboard.writeText(jsonStr);
                      } catch (err) {
                        console.error(err);
                      }
                      window.location.href = `cocoai://auth?session=${encodeURIComponent(jsonStr)}`;
                      alert("🚀 Opening CocoAI Desktop App! Check your CocoAI desktop window.");
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-violet-400 transition-colors hover:bg-accent hover:text-violet-300"
                  >
                    🚀 Open &amp; Sync Desktop App
                  </button>

                  <button
                    onClick={async () => {
                      setUserMenuOpen(false);
                      const payload = {
                        user: { id: user.id, email: user.email },
                        profile: profile || { subscription_tier: "free" },
                      };
                      const jsonStr = JSON.stringify(payload);
                      try {
                        await navigator.clipboard.writeText(jsonStr);
                        alert("🔑 Desktop Auth Key copied to your clipboard! Open CocoAI Desktop App and click 'Paste Desktop Auth Key'.");
                      } catch (err) {
                        alert("Failed to copy key: " + (err as any).message);
                      }
                    }}
                    className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-pink-400 transition-colors hover:bg-accent hover:text-pink-300"
                  >
                    🔑 Copy Desktop Auth Key
                  </button>

                  <button
                    onClick={() => { signOut(); setUserMenuOpen(false); }}
                    className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="glass-card rounded-full p-2 text-foreground md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-b border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((link) => {
              const isActive = activeId === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            {/* Mobile auth buttons */}
            {!loading && !user && (
              <>
                <div className="my-2 h-px bg-border/40" />
                <a
                  href="/login"
                  onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate("/login"); }}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate("/signup"); }}
                  className="rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </a>
              </>
            )}

            {/* Mobile signed-in info */}
            {!loading && user && (
              <>
                <div className="my-2 h-px bg-border/40" />
                <div className="flex items-center gap-3 px-4 py-2">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-pink-600">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{profile?.display_name || user.email?.split("@")[0]}</p>
                    <p className={`text-xs font-semibold ${tierColor}`}>{tierLabel} Plan</p>
                  </div>
                </div>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
