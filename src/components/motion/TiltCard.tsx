import { useEffect, useRef, type ReactNode } from "react";

const MAX_DEG = 6;
const LERP = 0.12;

/**
 * Client-only pointer tilt. Renders children untouched on SSR, touch devices
 * and reduced motion; on hover-capable desktops the card leans gently toward
 * the cursor and settles back on leave. Transform stays on this wrapper, so
 * anything measured inside (e.g. the Spark card PNG export) is unaffected.
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let curX = 0, curY = 0; // current degrees
    let tgtX = 0, tgtY = 0; // target degrees
    let hovering = false;

    const tick = () => {
      curX += (tgtX - curX) * LERP;
      curY += (tgtY - curY) * LERP;
      el.style.transform = `perspective(900px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;
      const settled = Math.abs(tgtX - curX) < 0.02 && Math.abs(tgtY - curY) < 0.02;
      if (!settled || hovering) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        el.style.transform = "";
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      tgtY = Math.max(-1, Math.min(1, px * 2)) * MAX_DEG;
      tgtX = Math.max(-1, Math.min(1, -py * 2)) * MAX_DEG;
      schedule();
    };
    const onLeave = () => {
      hovering = false;
      tgtX = 0;
      tgtY = 0;
      schedule();
    };
    const onEnter = () => {
      hovering = true;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
