import type { MouseEvent, ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

/** 3D tilt that follows the cursor. Use on the Spark card. */
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 15 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div style={{ perspective: 1200 }} onMouseMove={onMove} onMouseLeave={reset}>
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className={className}>
        {children}
      </motion.div>
    </div>
  );
}
