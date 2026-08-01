import { useEffect, useState, type CSSProperties } from "react";

/**
 * Transform-only entrance style shared by the auth and reset-password cards.
 *
 * The card is painted at full opacity from the first frame (fast FCP/LCP, no
 * opacity:0 start) and only slides up into place. Transforms never count
 * toward CLS. Skipped entirely under prefers-reduced-motion.
 */
export function useCardEntrance(): CSSProperties {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return {
    transform: reduceMotion || mounted ? "translateY(0)" : "translateY(18px)",
    transition: reduceMotion ? "none" : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
  };
}
