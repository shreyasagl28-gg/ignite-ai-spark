import { useEffect, useRef } from "react";
import { drawBot, type Bot } from "@/components/motion/Sparkbots";

/**
 * Reading progress as a Sparkbot: a thin red bar under the nav fills as you
 * scroll, and one pixel bot walks along it, stopping when you stop and
 * celebrating at the end of the page. Decorative; reduced motion keeps the
 * bar and a standing bot.
 */
const W = 34, H = 36, SCALE = 2 / 3;

export function ScrollBot() {
  const fillRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fill = fillRef.current, canvas = botRef.current;
    const ctx = canvas?.getContext("2d");
    if (!fill || !canvas || !ctx) return;
    canvas.width = W; canvas.height = H;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bot: Bot = { id: 0, gear: "antenna", action: "waving", x: W / 2, tx: W / 2, y: H - 2 - 32, vy: 0, phase: 0, leaving: false, spark: 0, city: "" };
    let frame = 0, raf = 0, idle = 0, lastStep = 0, progress = 0;

    const paint = (walking: boolean) => {
      ctx.clearRect(0, 0, W, H);
      bot.action = progress > 0.985 ? "celebrating" : "waving";
      drawBot(ctx, bot, reduced ? 0 : frame, walking && !reduced);
    };
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = `scaleX(${progress})`;
      const track = fill.parentElement!.clientWidth - W * SCALE;
      canvas.style.transform = `translateX(${Math.round(progress * track)}px)`;
      const now = performance.now();
      if (now - lastStep > 110) { frame = (frame + 1) % 4; lastStep = now; }
      paint(true);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => paint(false), 180);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); paint(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // keep celebrating at the bottom
    const party = window.setInterval(() => { if (progress > 0.985 && !reduced) { frame = (frame + 1) % 4; paint(false); } }, 220);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf); window.clearTimeout(idle); window.clearInterval(party);
    };
  }, []);

  return (
    <div className="scrollbot" aria-hidden="true">
      <div className="scrollbot-fill" ref={fillRef} />
      <canvas className="scrollbot-bot" ref={botRef} />
    </div>
  );
}
