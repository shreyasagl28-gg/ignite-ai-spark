import { useEffect, useRef, useState } from "react";

/**
 * Prize-pool moment: ₹ glyphs fall through the dark while a counter races
 * from ₹0 to the season's combined pool. The rain pours while the counter
 * runs, then settles to a drizzle. Pauses off-screen; reduced motion shows
 * the final figure and a still frame.
 */
const TOTAL = 22_500_000; // ₹2 Cr scholarships + ₹25L prizes

type Drop = { x: number; y: number; vy: number; size: number; rot: number; vr: number; red: boolean; alpha: number };

export function MoneyRain({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(TOTAL);
  const intensity = useRef(0.25);

  // counter: races up the first time the block is on screen
  useEffect(() => {
    const box = boxRef.current;
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (box.getBoundingClientRect().top < window.innerHeight * 0.8) return;
    setValue(0);
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), duration = 2600;
      intensity.current = 1;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        setValue(Math.round(TOTAL * eased));
        intensity.current = 1 - t * 0.75;
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(box);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  // rain
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let w = 0, h = 0, raf = 0, last = 0, inView = false;
    let drops: Drop[] = [];
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-display") || "Poppins, sans-serif";

    const spawn = (y = -30): Drop => {
      const size = 12 + Math.random() * 26;
      return { x: Math.random() * w, y, vy: 40 + size * 4 + Math.random() * 60, size, rot: (Math.random() - 0.5) * 0.8, vr: (Math.random() - 0.5) * 1.2, red: Math.random() < 0.28, alpha: 0.25 + Math.random() * 0.55 };
    };
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      if (!w || !h) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const target = Math.round(w / 28);
      drops = Array.from({ length: target }, () => spawn(Math.random() * h));
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const d of drops) {
        ctx.save();
        ctx.translate(d.x, d.y); ctx.rotate(d.rot);
        ctx.font = `600 ${d.size}px ${font}`;
        const fade = Math.min(1, d.y / 80) * Math.min(1, (h - d.y) / 120);
        ctx.fillStyle = d.red ? `rgba(229,9,19,${d.alpha * fade})` : `rgba(242,242,239,${d.alpha * 0.55 * fade})`;
        ctx.fillText("₹", 0, 0);
        ctx.restore();
      }
    };
    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const speed = 0.55 + intensity.current * 1.2;
      for (const d of drops) { d.y += d.vy * dt * speed; d.rot += d.vr * dt; }
      drops = drops.filter((d) => d.y < h + 40);
      const target = Math.round((w / 28) * (0.6 + intensity.current * 1.6));
      while (drops.length < target) drops.push(spawn());
      draw();
      raf = requestAnimationFrame(step);
    };
    const sync = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      if (!reduced.matches && inView && !document.hidden) raf = requestAnimationFrame(step);
      else draw();
    };
    const io = new IntersectionObserver(([entry]) => { inView = !!entry?.isIntersecting; sync(); });
    const ro = new ResizeObserver(resize);
    resize(); io.observe(canvas); ro.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className={`money ${className}`} ref={boxRef}>
      <canvas ref={canvasRef} className="money-rain" aria-hidden="true" />
      <div className="money-pot">
        <span className="sk-label">On the table, combined</span>
        <b className="money-total" aria-hidden="true">₹{value.toLocaleString("en-IN")}</b>
        <span className="sr-only">₹2,25,00,000</span>
        <p>₹2 Cr in scholarships + ₹25L in prizes</p>
      </div>
    </div>
  );
}
