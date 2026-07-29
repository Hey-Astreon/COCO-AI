import { useEffect, useRef, type ReactNode } from "react";

type SpotlightProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Card wrapper with a faint cursor-tracking light (the `.spotlight` utility).
 * Writes --mx/--my CSS variables on pointermove; inert on touch devices.
 */
export function Spotlight({ children, className = "" }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      element.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    element.addEventListener("pointermove", onPointerMove);
    return () => element.removeEventListener("pointermove", onPointerMove);
  }, []);

  return (
    <div ref={ref} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
