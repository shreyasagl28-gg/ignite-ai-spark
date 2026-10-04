import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide inertial smooth scroll. Render once, e.g. in App.tsx: <SmoothScroll />
 * Skipped automatically for users who prefer reduced motion.
 * Requires: npm i lenis
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let id = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);
  return null;
}
