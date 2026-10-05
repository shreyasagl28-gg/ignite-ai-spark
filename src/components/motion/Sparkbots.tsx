import { useEffect, useRef, useState } from "react";
import { recentRegistrations } from "@/content/iaib-data";

/**
 * Sparkbots: a crew of 32×32 pixel-art robots drawn on ONE low-resolution canvas,
 * scaled up with image-rendering: pixelated. Frames advance at ~7fps.
 * Pauses off-screen; reduced motion shows frame 0 and skips drop-ins.
 */
const BODY = "#F4F3EF";
const RED = "#E50913";
const INK = "#0B0B0C";
const SPARK = "#FF4D2E";
const CELL = 32;
const FPS_MS = 1000 / 7;

type Gear = "antenna" | "headphones" | "cap" | "backpack" | "goggles" | "none";
type Action = "typing" | "carrying" | "waving" | "celebrating";
export type Bot = { id: number; gear: Gear; action: Action; x: number; tx: number; y: number; vy: number; phase: number; leaving: boolean; spark: number; city: string };

const GEARS: Gear[] = ["antenna", "headphones", "cap", "backpack", "goggles", "none"];
const ACTIONS: Action[] = ["typing", "carrying", "waving", "celebrating"];

function px(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}
/** Filled rect with 1px ink outline. */
function box(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill = BODY) {
  px(c, x - 1, y - 1, w + 2, h + 2, INK);
  px(c, x, y, w, h, fill);
}

export function drawBot(c: CanvasRenderingContext2D, bot: Bot, frame: number, walking: boolean) {
  const ox = Math.round(bot.x - CELL / 2);
  const f = (frame + bot.phase) % 4;
  let oy = Math.round(bot.y);
  const act = walking ? "walk" : bot.action;
  if (act === "celebrating" && (f === 1 || f === 2)) oy -= f === 1 ? 2 : 3;
  const X = (n: number) => ox + n;
  const Y = (n: number) => oy + n;

  // Carrying: growing stack beside the bot (behind it).
  if (act === "carrying") {
    const height = f; // 0..3 blocks, resets each loop
    for (let i = 0; i < height; i++) box(c, X(26), Y(26 - i * 4), 4, 3);
  }
  if (bot.gear === "backpack") box(c, X(7), Y(18), 3, 7);

  // Legs
  const legLift = act === "walk" ? (f % 2 ? 1 : 0) : 0;
  box(c, X(12), Y(27) - legLift, 2, 3);
  box(c, X(18), Y(27) - (legLift ? 0 : act === "walk" ? 1 : 0), 2, 3);
  // Body
  box(c, X(10), Y(17), 12, 9);
  px(c, X(14), Y(20), 4, 1, INK); // chest seam
  // Arms
  const armL = { x: 8, y: 18, h: 5 };
  const armR = { x: 22, y: 18, h: 5 };
  if (act === "typing") { armL.y = 20 + (f % 2); armR.y = 21 - (f % 2); armL.h = armR.h = 3; }
  if (act === "carrying") { armL.y = 13; armR.y = 13; }
  if (act === "waving") { armR.y = f % 2 ? 12 : 13; armR.x = f % 2 ? 23 : 22; }
  if (act === "celebrating") { if (f === 1 || f === 2) { armL.y = 12; armR.y = 12; } }
  if (act === "walk") { armL.y = 18 + (f % 2); armR.y = 19 - (f % 2); }
  box(c, X(armL.x), Y(armL.y), 1, armL.h);
  box(c, X(armR.x), Y(armR.y), 1, armR.h);
  if (act === "carrying") box(c, X(13), Y(10) - 1, 6, 3); // block held overhead — drawn after head below

  // Head
  box(c, X(9), Y(6), 14, 10);
  if (bot.gear === "goggles") px(c, X(8), Y(9), 16, 4, INK);
  px(c, X(11), Y(9), 10, 3, RED); // visor
  px(c, X(12), Y(9), 2, 1, BODY); // glint
  if (bot.gear === "antenna") { px(c, X(15), Y(2), 2, 4, INK); px(c, X(15), Y(1), 2, 2, RED); }
  if (bot.gear === "headphones") { px(c, X(9), Y(3), 14, 2, INK); px(c, X(7), Y(8), 2, 5, INK); px(c, X(23), Y(8), 2, 5, INK); }
  if (bot.gear === "cap") { px(c, X(9), Y(3), 14, 3, INK); px(c, X(22), Y(5), 5, 1, INK); }
  // Antenna tip is the brand cue; every bot carries a tiny red tip except headphones/cap wearers.
  if (bot.gear === "goggles" || bot.gear === "backpack" || bot.gear === "none") { px(c, X(15), Y(4), 2, 2, INK); px(c, X(15), Y(3), 2, 1, RED); }

  if (act === "carrying") { box(c, X(13), Y(1), 6, 3); }
  // Laptop in front
  if (act === "typing") {
    px(c, X(17), Y(20), 9, 5, INK);
    px(c, X(18), Y(21), 7, 3, f % 2 ? "#2A2A2D" : "#1A1A1C");
    px(c, X(15), Y(25), 12, 1, INK);
  }
}

function burst(c: CanvasRenderingContext2D, x: number, y: number, age: number) {
  const r = 3 + age * 3;
  const pts: Array<[number, number]> = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [-1, -1], [1, 1], [-1, 1]];
  for (const [dx, dy] of pts) {
    const k = dx !== 0 && dy !== 0 ? 0.7 : 1;
    px(c, Math.round(x + dx * r * k), Math.round(y + dy * r * k), 1, 1, age % 2 ? SPARK : RED);
  }
}

export function Sparkbots({ studentCount }: { studentCount: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const addRef = useRef<((n: number) => void) | null>(null);
  const prev = useRef(studentCount);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    if (studentCount > prev.current) addRef.current?.(studentCount);
    prev.current = studentCount;
  }, [studentCount]);

  useEffect(() => {
    const canvas = ref.current;
    const c = canvas?.getContext("2d");
    if (!canvas || !c) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scale = 3, W = 0, H = CELL + 4, base = H - 2;
    let bots: Bot[] = [];
    let frame = 0, raf = 0, last = 0, inView = true, nextId = 0;
    let bursts: { x: number; y: number; age: number }[] = [];

    const cityFor = (i: number) => recentRegistrations[i % recentRegistrations.length]![1];
    const slotX = (i: number, n: number) => Math.round(((i + 0.5) / n) * W);
    const make = (i: number, n: number, spark: number): Bot => {
      const id = nextId++;
      return { id, gear: GEARS[id % GEARS.length]!, action: ACTIONS[(id * 3 + 1) % ACTIONS.length]!, x: slotX(i, n), tx: slotX(i, n), y: base - CELL, vy: 0, phase: id % 4, leaving: false, spark, city: cityFor(id) };
    };
    const layout = () => {
      const wide = canvas.clientWidth > 700;
      scale = wide ? 3 : 2;
      W = Math.max(64, Math.floor(canvas.clientWidth / scale));
      canvas.width = W;
      canvas.height = H;
      const n = wide ? 14 : 6;
      const top = prev.current;
      nextId = 0;
      bots = Array.from({ length: n }, (_, i) => make(i, n, top - (n - 1 - i)));
    };
    const draw = () => {
      c.clearRect(0, 0, W, H);
      px(c, 0, base, W, 1, "#2A2A2D");
      for (const b of bots) drawBot(c, b, reduced.matches ? 0 : frame, Math.abs(b.x - b.tx) > 0.5 || b.leaving);
      for (const s of bursts) burst(c, s.x, s.y, s.age);
    };
    const step = () => {
      frame++;
      for (const b of bots) {
        if (b.leaving) b.x -= 3;
        else if (b.x !== b.tx) b.x += Math.sign(b.tx - b.x) * Math.min(3, Math.abs(b.tx - b.x));
        if (b.y < base - CELL) { b.vy += 2; b.y = Math.min(base - CELL, b.y + b.vy); if (b.y === base - CELL) bursts.push({ x: b.x, y: base - 6, age: 0 }); }
      }
      bots = bots.filter((b) => b.x > -CELL);
      bursts = bursts.map((s) => ({ ...s, age: s.age + 1 })).filter((s) => s.age < 4);
    };
    const tick = (now: number) => {
      if (now - last >= FPS_MS) { last = now; step(); draw(); }
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (!reduced.matches && inView && !document.hidden) raf = requestAnimationFrame(tick);
      else draw();
    };
    addRef.current = (count) => {
      if (reduced.matches) return;
      const active = bots.filter((b) => !b.leaving);
      const n = active.length;
      if (!n) return;
      active[0]!.leaving = true;
      active.slice(1).forEach((b, i) => { b.tx = slotX(i, n); });
      const nb = make(n - 1, n, count);
      nb.y = -CELL;
      bots.push(nb);
      bursts.push({ x: nb.x, y: 6, age: 0 });
    };
    const hit = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      const lx = ((clientX - r.left) / r.width) * W;
      const ly = ((clientY - r.top) / r.height) * H;
      const b = bots.find((b) => !b.leaving && Math.abs(lx - b.x) < 9 && ly > b.y && ly < b.y + CELL);
      if (!b) { setTip(null); canvas.style.cursor = ""; return; }
      canvas.style.cursor = "pointer";
      setTip({ x: Math.min(r.width - 90, Math.max(90, (b.x / W) * r.width)), y: ((b.y + 2) / H) * r.height, text: `Spark #${b.spark.toLocaleString("en-IN")} · ${b.city}` });
    };
    const onMove = (e: PointerEvent) => hit(e.clientX, e.clientY);
    const onLeave = () => setTip(null);

    layout(); draw();
    const io = new IntersectionObserver(([e]) => { inView = e?.isIntersecting ?? false; sync(); });
    const ro = new ResizeObserver(() => { layout(); draw(); });
    io.observe(canvas); ro.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      addRef.current = null;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className="sparkbots">
      <canvas ref={ref} aria-hidden="true" />
      {tip && <div className="sparkbot-tip" role="status" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
    </div>
  );
}
