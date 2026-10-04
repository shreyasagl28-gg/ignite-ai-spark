"use client";

import type { ReactNode } from "react";

/**
 * Marquee — a slow, infinite horizontal loop of its children. The content is
 * rendered twice; the second copy is aria-hidden. Pauses under
 * prefers-reduced-motion (content stays fully visible and static).
 */
export function Marquee({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="marquee" role="group" aria-label={label}>
      <div className="marquee-track">
        <div className="marquee-set">{children}</div>
        <div className="marquee-set" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
