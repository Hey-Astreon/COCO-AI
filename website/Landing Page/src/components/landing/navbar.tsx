import { useEffect, useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/coco_logo_nobg.webp";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { usePageProgress } from "@/lib/use-page-progress";

type PageHref = "/about" | "/contact";

interface NavLink {
  label: string;
  href: string;
  id: string;
  page: boolean;
  to?: PageHref;
}

const NAV_LINKS: NavLink[] = [
  { label: "Platforms", href: "#platforms", id: "platforms", page: false },
  { label: "Features", href: "#features", id: "features", page: false },
  { label: "Comparison", href: "#comparison", id: "comparison", page: false },
  { label: "Pricing", href: "#pricing", id: "pricing", page: false },
  { label: "FAQ", href: "#faq", id: "faq", page: false },
  { label: "About Us", href: "/about", id: "about", page: true, to: "/about" },
  { label: "Contact Us", href: "/contact", id: "contact", page: true, to: "/contact" },
];

// Section links tracked by the scroll-spy (page links light up via the route).
const SECTION_IDS = NAV_LINKS.filter((link) => !link.page).map((link) => link.id);

// Sections are lazy-mounted, so the target may not exist yet when a nav link
// is clicked (or right after navigating back to "/"). Poll briefly until the
// element appears, then smooth-scroll it under the fixed header.
function scrollToSection(id: string) {
  const attempt = () => {
    const el = document.getElementById(id);
    if (!el) return false;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
    return true;
  };
  if (attempt()) return;
  let tries = 0;
  const timer = window.setInterval(() => {
    tries += 1;
    if (attempt() || tries > 40) window.clearInterval(timer);
  }, 50);
}

function handleNavClick(link: NavLink, navigate: ReturnType<typeof useNavigate>) {
  if (link.page && link.to) {
    navigate({ to: link.to });
  } else {
    const currentPath = window.location.pathname;
    if (currentPath !== "/") {
      navigate({ to: "/", hash: link.id });
      // The home page (and the lazy section) needs a beat to mount.
      window.setTimeout(() => scrollToSection(link.id), 60);
    } else {
      scrollToSection(link.id);
    }
  }
}

export function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const progress = usePageProgress();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: the section whose top has crossed an activation line (~1/3 of
  // the viewport) is "current". A scroll-position picker is stable (no flicker
  // between adjacent sections) and also clears when you reach the hero at the
  // top. Page routes highlight their own link. A MutationObserver re-scans as
  // lazy sections mount/unmount (spy re-arms on route changes via pathname).
  useEffect(() => {
    let ticking = false;

    const scan = () => {
      ticking = false;

      // On page routes the matching nav link is highlighted instead.
      if (pathname === "/about" || pathname === "/contact") {
        setActiveId(pathname.slice(1));
        return;
      }
      if (pathname !== "/") {
        setActiveId(null);
        return;
      }

      // Home: last section whose top passed the line wins.
      const line = window.innerHeight * 0.32;
      let current: string | null = null;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(scan);
      }
    };

    scan();
    window.addEventListener("scroll", onScroll, { passive: true });
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
    };
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = () => setUserMenuOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [userMenuOpen]);

  const tierLabel =
    profile?.subscription_tier === "developer"
      ? "Developer"
      : profile?.subscription_tier === "pro"
        ? "Pro"
        : profile?.subscription_tier === "standard"
          ? "Standard"
          : "Free";

  const tierColor =
    profile?.subscription_tier === "developer"
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
        <a
          href="#top"
          className="glass-card flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5"
        >
          <img src={logo} alt="CocoAI logo" width={256} height={201} className="h-6 w-auto" />
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
                onMouseEnter={() => {
                  // Warm the chunk cache so navigation feels instant.
                  if (link.page && link.to) void router.preloadRoute({ to: link.to });
                }}
                onFocus={() => {
                  if (link.page && link.to) void router.preloadRoute({ to: link.to });
                }}
                onClick={(e) => {
                  // Always intercept: sections are lazy-mounted, so native anchor
                  // jumps can target an element that doesn't exist yet. The polling
                  // scrollToSection handles both lazy and eager targets.
                  e.preventDefault();
                  handleNavClick(link, navigate);
                }}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-premium after:pointer-events-none after:absolute after:bottom-0.5 after:left-1/2 after:h-0.5 after:-translate-x-1/2 after:rounded-full after:bg-gradient-to-r after:from-violet-500 after:to-pink-500 after:transition-all after:duration-300 ${
                  isActive
                    ? "bg-accent text-foreground shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)] after:w-5 after:opacity-100"
                    : "text-muted-foreground after:w-0 after:opacity-0 hover:bg-accent hover:text-foreground"
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
                onMouseEnter={() => void router.preloadRoute({ to: "/login" })}
                onFocus={() => void router.preloadRoute({ to: "/login" })}
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ to: "/login" });
                }}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                Sign In
              </a>
              <a
                href="/signup"
                onMouseEnter={() => void router.preloadRoute({ to: "/signup" })}
                onFocus={() => void router.preloadRoute({ to: "/signup" })}
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ to: "/signup" });
                }}
                className="btn-shine rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/40"
              >
                Get Started
              </a>
            </div>
          )}

          {/* Signed-in User Avatar & Menu */}
          {!loading && user && (
            <div className="relative hidden md:block">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen((v) => !v);
                }}
                className="flex items-center gap-2 rounded-full border border-border/40 bg-background/60 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-accent"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={28}
                    height={28}
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
                    <p className={`mt-0.5 text-xs font-semibold ${tierColor}`}>{tierLabel} Plan</p>
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
                        alert(
                          "🔑 Desktop Auth Key copied to your clipboard! Open CocoAI Desktop App and click 'Paste Desktop Auth Key'.",
                        );
                      } catch (err) {
                        alert(
                          "Failed to copy key: " +
                            (err instanceof Error ? err.message : String(err)),
                        );
                      }
                    }}
                    className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-pink-400 transition-colors hover:bg-accent hover:text-pink-300"
                  >
                    🔑 Copy Desktop Auth Key
                  </button>

                  <button
                    onClick={() => {
                      signOut();
                      setUserMenuOpen(false);
                    }}
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
                  onClick={(e) => {
                    setMenuOpen(false);
                    e.preventDefault();
                    handleNavClick(link, navigate);
                  }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    navigate({ to: "/login" });
                  }}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    navigate({ to: "/signup" });
                  }}
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
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-pink-600">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {profile?.display_name || user.email?.split("@")[0]}
                    </p>
                    <p className={`text-xs font-semibold ${tierColor}`}>{tierLabel} Plan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
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
