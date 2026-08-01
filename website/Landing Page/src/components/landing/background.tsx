import { useEffect, useRef } from "react";

export function Background() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;

    const tick = () => {
      element.style.setProperty("--mx", `${targetX}px`);
      element.style.setProperty("--my", `${targetY}px`);
      raf = 0;
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Base faint grid */}
      <div className="bg-grid absolute inset-0" />
      {/* Cursor-tracking flashlight — a slightly stronger grid revealed by a radial mask. */}
      <div className="grid-flashlight absolute inset-0" />
      {/* Aurora orbs — deep ambient color that drifts slowly */}
      <div className="animate-aurora absolute top-[-20%] left-[-10%] h-[60vh] w-[60vh] rounded-full bg-violet-600/15 blur-[120px]" />
      <div
        className="animate-aurora absolute right-[-15%] top-[30%] h-[55vh] w-[55vh] rounded-full bg-pink-600/10 blur-[120px]"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="animate-aurora absolute bottom-[-25%] left-[20%] h-[50vh] w-[50vh] rounded-full bg-rose-500/10 blur-[120px]"
        style={{ animationDelay: "-12s" }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 60% at 50% 0%, transparent 40%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
