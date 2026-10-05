import { useEffect, useRef, useState } from "react";

/**
 * "Try your first prompt": pick a prompt and watch a tutor reply type out,
 * the way Session 03 feels. Replies are pre-written and the panel says so;
 * nothing is sent anywhere.
 */
const PROMPTS = [
  {
    label: "Explain photosynthesis like I'm 14",
    reply: "Think of a leaf as a tiny solar kitchen. It takes in sunlight, water from the roots and carbon dioxide from the air, and cooks them into glucose, which is the plant's food. Oxygen is the leftover it breathes out, which is lucky for us. Want a 3-question quiz to check you've got it?",
  },
  {
    label: "Quiz me on Newton's laws",
    reply: "Question 1 of 3: you're in a bus that brakes suddenly and you lurch forward. Which law explains that? A) First law, inertia  B) Second law, F = ma  C) Third law, action and reaction. Reply with A, B or C and I'll explain the answer either way.",
  },
  {
    label: "Help me plan a science fair project with AI",
    reply: "Let's pick something you can build in a weekend. Idea: a plant-health checker. You photograph leaves, and a small image model trained on healthy and spotted leaves flags problems. Step 1: collect 50 photos of each. Step 2: train with a free no-code tool. Step 3: test it on new leaves and note where it's wrong. Shall I write the checklist?",
  },
];

export function PromptDemo() {
  const [active, setActive] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearInterval(timer.current), []);

  const run = (index: number) => {
    window.clearInterval(timer.current);
    setActive(index); setDone(false);
    const full = PROMPTS[index]!.reply;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTyped(full); setDone(true); return; }
    let i = 0;
    setTyped("");
    window.setTimeout(() => {
      timer.current = window.setInterval(() => {
        i = Math.min(full.length, i + 2 + Math.round(Math.random() * 3));
        setTyped(full.slice(0, i));
        if (i >= full.length) { window.clearInterval(timer.current); setDone(true); }
      }, 28);
    }, 550);
  };

  const prompt = active === null ? null : PROMPTS[active]!;
  return (
    <div className="pd">
      <div className="pd-intro">
        <p className="pd-kicker">Try it · Session 03 preview</p>
        <h3>Your first prompt.</h3>
        <p>Pick one and watch an AI tutor answer. In the live sessions you write these yourself, then build apps around them.</p>
        <ul className="pd-prompts">
          {PROMPTS.map((p, i) => (
            <li key={p.label}>
              <button type="button" className={`pd-chip${active === i ? " on" : ""}`} onClick={() => run(i)} aria-pressed={active === i}>{p.label}</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="pd-window">
        <div className="pd-bar"><i /><i /><i /><span>ai-tutor · demo</span></div>
        <div className="pd-body">
          {!prompt && <p className="pd-empty">Choose a prompt to start →</p>}
          {prompt && (
            <>
              <p className="pd-you"><span>You</span>{prompt.label}</p>
              <p className="pd-ai"><span>AI tutor</span>{typed}{!done && <i className="pd-caret" aria-hidden="true" />}</p>
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">{done && prompt ? `AI tutor: ${prompt.reply}` : ""}</p>
        <p className="pd-note">Demo with pre-written replies. Nothing is sent anywhere.</p>
      </div>
    </div>
  );
}
