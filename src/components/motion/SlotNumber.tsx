import { useEffect, useRef, useState } from "react";

/**
 * A figure whose digits spin into place like a slot machine the first time it
 * scrolls into view (e.g. "₹2 Cr", "₹25L", "100"). Non-digit characters stay
 * still. Screen readers get the plain value; SSR and reduced motion show it
 * settled.
 */
export function SlotNumber({ value, className = "", onLoad = false }: { value: string; className?: string; onLoad?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"settled" | "armed" | "rolling">("settled");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (onLoad) {
      // above the fold: spin once shortly after the page appears
      setState("armed");
      const t = window.setTimeout(() => requestAnimationFrame(() => setState("rolling")), 450);
      return () => window.clearTimeout(t);
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return; // already on screen: leave it
    setState("armed");
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      requestAnimationFrame(() => setState("rolling"));
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [onLoad]);

  let digitIndex = 0;
  return (
    <span ref={ref} className={`slot ${className} is-${state}`}>
      <span className="sr-only">{value}</span>
      {value.split("").map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} className="slot-ch" aria-hidden="true">{ch === " " ? "\u00A0" : ch}</span>;
        const d = Number(ch);
        const order = digitIndex++;
        return (
          <span key={i} className="slot-digit" aria-hidden="true" style={{ "--d": d, "--o": order } as React.CSSProperties}>
            <span className="slot-ghost">{ch}</span>
            <span className="slot-reel">{"01234567890123456789".split("").map((n, k) => <span key={k}>{n}</span>)}</span>
          </span>
        );
      })}
    </span>
  );
}
