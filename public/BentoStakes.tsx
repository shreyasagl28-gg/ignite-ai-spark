import { motion, useReducedMotion } from "framer-motion";
import { SpotlightCard } from "./SpotlightCard";
import { CountUp } from "./CountUp";
import { RevealGroup, RevealItem } from "./Reveal";

/**
 * "What's on the table" as a bento grid of boxes, replacing a plain text row.
 * Edit the numbers here; copy stays as on the site.
 */
export function BentoStakes() {
  return (
    <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
      {/* Big tile: scholarships */}
      <RevealItem className="md:col-span-2 md:row-span-2">
        <SpotlightCard className="flex h-full min-h-[320px] flex-col justify-between p-8 md:p-10">
          <p className="text-sm text-[#9A9A9F]">Scholarships for standout builders</p>
          <div>
            <CountUp
              to={2}
              prefix="₹"
              suffix=" Cr"
              className="block font-[Poppins] text-[clamp(72px,10vw,148px)] font-semibold leading-none tracking-[-0.05em] text-[#E50913]"
            />
            <p className="mt-4 max-w-[28ch] text-[#BDBBB6]">
              For the students who stand out across the season, not just on finale day.
            </p>
          </div>
        </SpotlightCard>
      </RevealItem>

      {/* Prize pool */}
      <RevealItem>
        <SpotlightCard className="flex h-full min-h-[200px] flex-col justify-between p-8">
          <p className="text-sm text-[#9A9A9F]">Prize pool</p>
          <CountUp
            to={25}
            prefix="₹"
            suffix="L"
            className="font-[Poppins] text-6xl font-semibold tracking-[-0.045em]"
          />
        </SpotlightCard>
      </RevealItem>

      {/* 100 finalists with a 10x10 dot grid */}
      <RevealItem>
        <SpotlightCard className="flex h-full min-h-[200px] flex-col justify-between p-8">
          <div className="flex items-start justify-between">
            <p className="text-sm text-[#9A9A9F]">Finalists</p>
            <DotGrid />
          </div>
          <CountUp to={100} className="font-[Poppins] text-6xl font-semibold tracking-[-0.045em]" />
        </SpotlightCard>
      </RevealItem>

      {/* VCs */}
      <RevealItem className="md:col-span-2">
        <SpotlightCard className="flex h-full min-h-[200px] items-end justify-between gap-6 p-8">
          <div>
            <p className="text-sm text-[#9A9A9F]">Finale day</p>
            <p className="mt-3 font-[Poppins] text-5xl font-semibold tracking-[-0.04em]">Pitch to VCs</p>
          </div>
          <p className="max-w-[22ch] text-right text-[#BDBBB6]">36 hours of building, then the room that funds companies.</p>
        </SpotlightCard>
      </RevealItem>
    </RevealGroup>
  );
}

/** 100 dots that light up one by one: thousands learn, only 100 make it. */
function DotGrid() {
  const reduce = useReducedMotion();
  return (
    <div className="grid grid-cols-10 gap-[3px]" aria-hidden>
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.span
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-[#2A2A2D]"
          initial={reduce ? false : { backgroundColor: "#2A2A2D" }}
          whileInView={{ backgroundColor: "#E50913" }}
          viewport={{ once: true }}
          transition={{ delay: reduce ? 0 : 0.3 + i * 0.012, duration: 0.2 }}
        />
      ))}
    </div>
  );
}
