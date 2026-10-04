"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Marquee — a slow, infinite horizontal loop of its children. The content is
 * rendered twice; the second copy is aria-hidden. Pauses under
 * prefers-reduced-motion (content stays fully visible and static).
 */
export function Marquee({
  children,
  label,
  speed,
}: {
  children: ReactNode;
  label?: string;
  speed?: number;
}) {
  const setRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number>();

  useEffect(() => {
    if (!speed || speed <= 0 || !setRef.current) return;
    const set = setRef.current;
    const observer = new ResizeObserver(() => setDuration(set.getBoundingClientRect().width / speed));
    observer.observe(set);
    return () => observer.disconnect();
  }, [speed]);

  return (
    <div className="marquee" role="group" aria-label={label}>
      <div className="marquee-track" style={duration ? { animationDuration: `${duration}s` } : undefined}>
        <div className="marquee-set" ref={setRef}>{children}</div>
        <div className="marquee-set" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
