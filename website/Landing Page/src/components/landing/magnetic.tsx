import { useEffect, useRef, type ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Maximum pull distance in pixels */
  strength?: number;
};

/**
 * Gently pulls the wrapped element toward the cursor (pointer-fine devices
 * only, disabled under prefers-reduced-motion). Uses a rAF-lerped transform.
 */
export function Magnetic({ children, className = "", strength = 5 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      element.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        if (targetX === 0 && targetY === 0) element.style.transform = "";
        raf = 0;
      }
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      targetX = Math.max(-strength, Math.min(strength, relX * strength));
      targetY = Math.max(-strength, Math.min(strength, relY * strength));
      start();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", onPointerLeave);
    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
