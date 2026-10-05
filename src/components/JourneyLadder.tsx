/**
 * The four journey steps, each with the object a student meets at that stage
 * and the rank it earns. Copy is unchanged from the approved mock.
 */
export type JourneyStep = { when: string; title: string; body: string; rank: string };

const stepArt = [
  { name: "spark-card", className: "" },
  { name: "journey-live", className: "" },
  { name: "journey-screening", className: "" },
  { name: "finale-hall", className: " jl-photo-stage" },
];

export function JourneyLadder({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="jl">
      {steps.map((step, index) => {
        const art = stepArt[index] ?? stepArt[0]!;
        return (
          <li key={step.title} className={`jl-step jl-step-${index}`}>
            <div className="jl-art jl-art-photo" aria-hidden="true">
              {art.name === "finale-hall"
                ? <img className={`jl-photo${art.className}`} src="/art/finale-hall.webp" alt="" width={816} height={434} loading="lazy" decoding="async" />
                : <img className="jl-photo" src={`/art/${art.name}-sm.webp`} srcSet={`/art/${art.name}-sm.webp 512w, /art/${art.name}.webp 1024w`} sizes="(max-width: 560px) 90vw, 25vw" alt="" width={1024} height={559} loading="lazy" decoding="async" />}
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
