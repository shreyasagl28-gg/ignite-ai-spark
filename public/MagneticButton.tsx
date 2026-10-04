import type { MouseEvent, ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/** The Register button gently follows the cursor when it's close. Use once per screen. */
export function MagneticButton({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={`inline-flex items-center rounded-xl bg-[#E50913] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#B0070F] ${className}`}
    >
      {children}
    </motion.a>
  );
}
