import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const PULL = 0.22;
const MAX_PX = 8;
const LERP = 0.16;

/**
 * Magnetic primary action. Renders a normal link on SSR, touch devices and
 * reduced motion; on hover-capable desktops the button leans gently toward
 * the cursor and settles back on leave. Transform only — layout untouched.
 */
export function MagneticButton({ href, children }: { href: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let curX = 0, curY = 0;
    let tgtX = 0, tgtY = 0;
    let hovering = false;

    const tick = () => {
      curX += (tgtX - curX) * LERP;
      curY += (tgtY - curY) * LERP;
      el.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
      const settled = Math.abs(tgtX - curX) < 0.05 && Math.abs(tgtY - curY) < 0.05;
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
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      tgtX = Math.max(-MAX_PX, Math.min(MAX_PX, dx * PULL));
      tgtY = Math.max(-MAX_PX, Math.min(MAX_PX, dy * PULL));
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
    <Button asChild variant="iaib">
      <a ref={ref} href={href} style={{ willChange: "transform" }}>
        {children}
      </a>
    </Button>
  );
}
