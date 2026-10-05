import type { ComponentType } from "react";
import { LiveClassArt, ScreeningArt } from "@/components/Mockups";

/**
 * The four journey steps, each with the thing a student meets at that stage
 * and the rank it earns. Copy is unchanged from the approved mock.
 */
export type JourneyStep = { when: string; title: string; body: string; rank: string };

function SparkCardPhoto() {
  return <img className="jl-photo" src="/art/spark-card-sm.webp" srcSet="/art/spark-card-sm.webp 512w, /art/spark-card.webp 1024w" sizes="(max-width: 560px) 90vw, 25vw" alt="" width={1024} height={559} loading="lazy" decoding="async" />;
}
function FinaleStagePhoto() {
  return <img className="jl-photo jl-photo-stage" src="/art/finale-hall.webp" alt="" width={816} height={434} loading="lazy" decoding="async" />;
}

const stepArt: Array<{ Art: ComponentType; photo: boolean }> = [
  { Art: SparkCardPhoto, photo: true },
  { Art: LiveClassArt, photo: false },
  { Art: ScreeningArt, photo: false },
  { Art: FinaleStagePhoto, photo: true },
];

export function JourneyLadder({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="jl">
      {steps.map((step, index) => {
        const { Art, photo } = stepArt[index] ?? stepArt[0]!;
        return (
          <li key={step.title} className={`jl-step jl-step-${index}`}>
            <div className={`jl-art${photo ? " jl-art-photo" : ""}`} aria-hidden="true">
              <Art />
              <span className="jl-rank-name">{step.rank.replace(/^You (become an?|join the) /, "")}</span>
            </div>
            <p className="jl-when">{step.when}</p>
            <h3 className="jl-title">{step.title}</h3>
            <p className="jl-body">{step.body}</p>
            <span className="jl-rank">{step.rank}</span>
          </li>
        );
      })}
    </ol>
  );
}
