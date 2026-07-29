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
