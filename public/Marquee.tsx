import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Endless ticker. Use for partner logos, or for a live strip like
 * "Priya from Mysuru just registered". Pauses for reduced motion.
 */
export function Marquee({
  children,
  speed = 40,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={`flex flex-wrap gap-12 ${className}`}>{children}</div>;
  return (
    <div className={`relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}>
      <motion.div
        className="flex w-max gap-12"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
