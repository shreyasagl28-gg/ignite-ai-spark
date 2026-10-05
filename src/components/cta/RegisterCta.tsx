import { useEffect, useState } from "react";
import { registrationClosesAt, SHOW_LIVE_STATS } from "@/content/iaib-data";

const CLOSE = registrationClosesAt ? new Date(registrationClosesAt).getTime() : null;

/** Ticks once a minute on the client; null during SSR to avoid hydration mismatch. */
function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useRegistrationsOpen() {
  const now = useNow();
  return now !== null && CLOSE !== null && now < CLOSE;
}

export function CloseCountdown() {
  const now = useNow();
  if (now === null || CLOSE === null || now >= CLOSE) return null;
  const mins = Math.floor((CLOSE - now) / 60000);
  const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return <span className="close-countdown" aria-live="off">Closes in {d}d {p(h)}h {p(m)}m</span>;
}

export function NavPulseDot() {
  return useRegistrationsOpen() ? <span className="nav-pulse" aria-hidden="true" /> : null;
}

/** Fixed mobile bar: visible below 768px after the hero, hidden while #register is on screen. */
export function StickyRegisterBar({ count }: { count: number }) {
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(".hero");
    const form = document.getElementById("register");
    const io1 = new IntersectionObserver(([e]) => setPastHero(!!e && !e.isIntersecting && e.boundingClientRect.top < 0));
    const io2 = new IntersectionObserver(([e]) => setFormVisible(!!e?.isIntersecting), { threshold: 0.15 });
    if (hero) io1.observe(hero);
    if (form) io2.observe(form);
    return () => { io1.disconnect(); io2.disconnect(); };
  }, []);
  const show = pastHero && !formVisible;
  return (
    <div className={`sticky-reg${show ? " is-on" : ""}`} aria-hidden={!show} inert={!show}>
      {SHOW_LIVE_STATS && <div className="sticky-reg-count"><b>{count.toLocaleString("en-IN")}</b><span>students registered</span></div>}
      <a className="sticky-reg-btn" href="#register" tabIndex={show ? 0 : -1}>Register free</a>
    </div>
  );
}

/** Short burst of red square sparks from an element. No-op with reduced motion. */
export function sparkBurst(from: HTMLElement | null) {
  if (!from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = from.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.className = "spark-burst";
  layer.style.left = `${r.left + r.width / 2}px`;
  layer.style.top = `${r.top + r.height / 2}px`;
  const tones = ["#E50913", "#FF4D2E", "#FF8A3D"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("i");
    const a = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 40 + Math.random() * 50;
    s.style.background = tones[i % 3]!;
    s.animate(
      [{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(.4)`, opacity: 0 }],
      { duration: 650 + Math.random() * 250, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
    );
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  window.setTimeout(() => layer.remove(), 1000);
}
