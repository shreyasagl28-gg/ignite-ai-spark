import { useEffect, useRef, useState } from "react";

/**
 * Section label that decodes from random glyphs into its text the first time
 * it scrolls into view. SSR and reduced motion render the plain text; the
 * real label is always exposed to assistive tech.
 */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>_";

export function Eyebrow({ children }: { children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(children);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const total = 520 + children.length * 28;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / total);
        const fixed = Math.floor(t * children.length);
        setShown(children.split("").map((ch, i) => (i < fixed || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]!)).join(""));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 1 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [children]);

  return (
    <p className="eyebrow" ref={ref}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">{shown}</span>
    </p>
  );
}
