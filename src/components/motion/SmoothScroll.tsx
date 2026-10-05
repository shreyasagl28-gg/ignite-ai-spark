import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let destroy = () => {};
    const sync = async () => {
      destroy();
      destroy = () => {};
      if (motion.matches) return;
      const { default: Lenis } = await import("lenis");
      if (disposed || motion.matches) return;
      const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 1.2, easing: t => 1 - Math.pow(1 - t, 3) });
      destroy = () => lenis.destroy();
    };
    void sync();
    motion.addEventListener("change", sync);
    return () => { disposed = true; motion.removeEventListener("change", sync); destroy(); };
  }, []);
  return null;
}