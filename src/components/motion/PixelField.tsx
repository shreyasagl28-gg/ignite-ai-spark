import { useEffect, useRef } from "react";

/**
 * Interactive pixel field: a grid of small squares that light up red around
 * the pointer (or finger) and fade back, with a few ambient sparks when idle.
 * Echoes the pixel squares in the IAIB mark. Pauses off-screen and in hidden
 * tabs; under reduced motion it draws one static frame.
 */
const CELL = 14;
const GAP = 3;

export function PixelField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cols = 0, rows = 0, w = 0, h = 0, raf = 0, inView = false, last = 0;
    let heat = new Float32Array(0);
    const pointer = { x: -1e4, y: -1e4, active: false };

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      if (!w || !h) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      cols = Math.ceil(w / (CELL + GAP)); rows = Math.ceil(h / (CELL + GAP));
      heat = new Float32Array(cols * rows);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        // fade the field towards the top and bottom edges
        const edge = Math.min(1, Math.min(r, rows - 1 - r) / 4);
        for (let c = 0; c < cols; c++) {
          const v = heat[r * cols + c]!;
          const x = c * (CELL + GAP), y = r * (CELL + GAP);
          ctx.fillStyle = `rgba(255,255,255,${0.035 * edge})`;
          ctx.fillRect(x, y, CELL, CELL);
          if (v > 0.02) {
            ctx.fillStyle = `rgba(229,9,19,${Math.min(1, v) * edge})`;
            ctx.fillRect(x, y, CELL, CELL);
          }
        }
      }
    };

    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const decay = Math.pow(0.08, dt); // ~1s afterglow
      for (let i = 0; i < heat.length; i++) heat[i]! > 0 && (heat[i] = heat[i]! * decay);
      if (pointer.active) {
        const pc = Math.floor(pointer.x / (CELL + GAP)), pr = Math.floor(pointer.y / (CELL + GAP));
        for (let dr = -3; dr <= 3; dr++) for (let dc = -3; dc <= 3; dc++) {
          const c = pc + dc, r = pr + dr;
          if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
          const d = Math.hypot(dc, dr);
          if (d > 3.2) continue;
          const i = r * cols + c;
          heat[i] = Math.max(heat[i]!, 1 - d / 3.4);
        }
      }
      // ambient sparks so the field is alive without a pointer
      if (Math.random() < 0.35 && heat.length) heat[(Math.random() * heat.length) | 0] = 0.55 + Math.random() * 0.45;
      draw();
      raf = requestAnimationFrame(step);
    };

    const sync = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      if (!reduced.matches && inView && !document.hidden) raf = requestAnimationFrame(step);
      else draw();
    };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
    };
    const leave = () => { pointer.active = false; };

    const io = new IntersectionObserver(([entry]) => { inView = !!entry?.isIntersecting; sync(); });
    const ro = new ResizeObserver(resize);
    resize(); io.observe(canvas); ro.observe(canvas);
    const host = canvas.parentElement ?? canvas;
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerdown", move);
    host.addEventListener("pointerleave", leave);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", move);
      host.removeEventListener("pointerleave", leave);
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <canvas ref={ref} className={`pixel-field ${className}`} aria-hidden="true" />;
}
