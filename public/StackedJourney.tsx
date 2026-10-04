import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export type JourneyStep = {
  when: string;
  title: string;
  body: string;
  rank: string;
};

/**
 * Journey as boxes that stack on top of each other as you scroll.
 * Each card pins, then shrinks and dims as the next one slides over it.
 */
export function StackedJourney({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="relative">
      {steps.map((s, i) => (
        <StackCard key={s.title} step={s} index={i} total={steps.length} />
      ))}
    </div>
  );
}

function StackCard({ step, index, total }: { step: JourneyStep; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const dim = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const isLast = index === total - 1;

  return (
    <div ref={ref} className={isLast ? "h-auto" : "h-[85vh]"}>
      <motion.article
        style={reduce ? { top: 96 + index * 28 } : { scale, opacity: dim, top: 96 + index * 28 }}
        className="sticky grid min-h-[60vh] origin-top grid-cols-1 gap-8 rounded-[28px] border border-[#2A2A2D] bg-[#141416] p-8 text-[#F4F3EF] md:grid-cols-[1fr_1.2fr] md:p-14"
      >
        <div className="flex flex-col justify-between">
          <span className="font-mono text-sm text-[#9A9A9F]">
            Step {index + 1} of {total} · {step.when}
          </span>
          <span className="font-[Poppins] text-[clamp(96px,14vw,200px)] font-semibold leading-none tracking-[-0.06em] text-[#E50913]">
            {index + 1}
          </span>
        </div>
        <div className="flex flex-col justify-end">
          <h3 className="font-[Poppins] text-4xl font-semibold tracking-[-0.03em] md:text-6xl">{step.title}</h3>
          <p className="mt-4 max-w-[40ch] text-lg text-[#BDBBB6]">{step.body}</p>
          <span className="mt-8 inline-flex w-fit rounded-full border border-[#E50913] px-4 py-2 text-sm">
            {step.rank}
          </span>
        </div>
      </motion.article>
    </div>
  );
}
