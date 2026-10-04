"use client";

import { useRef, type ReactNode } from "react";

/**
 * SpotlightCard — a card with a soft red spotlight that follows the pointer.
 * tone="light" renders on paper; the spotlight is purely decorative and
 * disabled under prefers-reduced-motion.
 */
export function SpotlightCard({
  tone = "light",
  className = "",
  children,
}: {
  tone?: "light" | "dark";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      className={`spot-card spot-${tone} ${className}`}
      onPointerMove={onMove}
    >
      {children}
    </div>
  );
}
