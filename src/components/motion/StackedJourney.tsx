import { useEffect, useRef, type CSSProperties } from "react";

export type JourneyStep = { when: string; title: string; body: string; rank: string };

/**
 * The four journey steps as stacked cards. On desktop with motion allowed,
 * each card sticks and the next one slides over it while the red line fills
 * node to node; on mobile and under reduced motion it is a plain column.
 * Copy arrives from the approved fragment — never edited here.
 */
export function StackedJourney({ steps }: { steps: JourneyStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const fill = fillRef.current;
    if (!el || !fill) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".step"));
    const line = el.querySelector<HTMLElement>(".sj-line");
    const mql = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    let raf = 0;
    let onScroll: (() => void) | null = null;

    const detach = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (onScroll) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        onScroll = null;
      }
    };

    const setStatic = () => {
      detach();
      cards.forEach((card) => { card.classList.add("on"); card.classList.remove("past"); });
      fill.style.height = "100%";
    };

    const update = () => {
      raf = 0;
      const gate = window.innerHeight * 0.62;
      let reached = -1;
      cards.forEach((card, index) => {
        const node = card.querySelector<HTMLElement>(".node");
        if ((node ?? card).getBoundingClientRect().top <= gate) reached = index;
      });
      cards.forEach((card, index) => {
        card.classList.toggle("on", index <= reached);
        card.classList.toggle("past", index < reached);
      });
      if (!line) return;
      const target = cards[reached];
      if (!target) { fill.style.height = "0px"; return; }
      const node = target.querySelector<HTMLElement>(".node");
      const rect = (node ?? target).getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      fill.style.height = `${Math.max(0, rect.top + rect.height / 2 - lineRect.top)}px`;
    };

    const apply = () => {
      if (!mql.matches) { setStatic(); return; }
      detach();
      cards.forEach((card) => card.classList.remove("on", "past"));
      fill.style.height = "0px";
      onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    };

    apply();
    mql.addEventListener("change", apply);
    return () => { mql.removeEventListener("change", apply); detach(); };
  }, []);

  return (
    <div className="sj" ref={ref}>
      <div className="sj-line" aria-hidden="true"><div className="sj-fill" ref={fillRef} /></div>
      {steps.map((step, index) => (
        <div
          className="step"
          key={step.title}
          style={{ "--sj-i": index } as CSSProperties}
        >
          <span className="node" aria-hidden="true" />
          <p className="when">{step.when}</p>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
          <span className="rank">{step.rank}</span>
        </div>
      ))}
    </div>
  );
}
