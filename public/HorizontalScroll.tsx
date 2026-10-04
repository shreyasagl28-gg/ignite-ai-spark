import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Pins the section and moves a row of boxes sideways as you scroll down.
 * Use for the curriculum modules. On mobile (<768px) it falls back to a swipeable row.
 */
export function HorizontalScroll({ children, title }: { children: ReactNode; title?: ReactNode }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
  if (reduce || !isDesktop) {
    return (
      <div className="py-24">
        {title}
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6">{children}</div>
      </div>
    );
  }

  return (
    <div ref={section} style={{ height: `calc(100vh + ${distance}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {title}
        <motion.div ref={track} style={{ x }} className="mt-12 flex gap-6 pl-6 md:pl-[max(24px,calc((100vw-1240px)/2))]">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
