import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import approvedHtml from "@/content/iaib-body.html?raw";
import { modules, faqs, mentors, states, schools } from "@/content/iaib-data";

function approvedSection(start: string, end: string) {
  return approvedHtml.split(`<!-- ${start} -->`)[1]?.split(`<!-- ${end} -->`)[0]?.trim() ?? "";
}
function Approved({ start, end }: { start: string; end: string }) {
  return <div className="contents" dangerouslySetInnerHTML={{ __html: approvedSection(start, end) }} />;
}
function Action({ children, href, ghost = false }: { children: React.ReactNode; href: string; ghost?: boolean }) {
  return <Button asChild variant={ghost ? "iaibOutline" : "iaib"}><a href={href}>{children}</a></Button>;
}
export function SiteNav() {
  return <header className="nav solid" id="nav"><div className="wrap">
    <a className="brand" href="#top" aria-label="IAIB home"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-7z" /></svg></span>IAIB</a>
    <nav className="nav-links" aria-label="Main"><a href="#journey">How it works</a><a href="#prizes">Prizes</a><a href="#curriculum">Curriculum</a><a href="#mentors">Mentors</a><a href="#faqs">FAQs</a></nav>
    <div className="nav-cta"><Action href="#register">Register free</Action></div>
  </div></header>;
}
function StaticSparks() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(width * .5, height * 1.05, 0, width * .5, height * 1.05, height * .9);
      glow.addColorStop(0, "rgba(229,9,19,.22)"); glow.addColorStop(1, "rgba(229,9,19,0)");
      context.fillStyle = glow; context.fillRect(0, 0, width, height);
      const colors = ["229,9,19", "255,77,46", "255,138,61"];
      const count = Math.min(220, Math.floor(width / 5));
      for (let i = 0; i < count; i++) {
        const noise = (seed: number) => { const x = Math.sin(seed * 127.1 + 37.7) * 43758.5453; return x - Math.floor(x); };
        const x = width * (.14 + noise(i + 1) * .72);
        const y = height * (.08 + noise(i + 402) * .9);
        const r = .55 + noise(i + 901) * 1.8;
        const opacity = (.1 + noise(i + 1200) * .72) * (y / height);
        context.beginPath(); context.arc(x, y, r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${colors[i % colors.length]},${opacity})`; context.fill();
      }
    };
    draw();
    window.addEventListener("resize", draw, { passive: true });
    return () => window.removeEventListener("resize", draw);
  }, []);
  return <canvas id="sparks" ref={ref} aria-hidden="true" />;
}
export function Hero() {
  return <section className="hero night" aria-labelledby="hero-h"><StaticSparks /><div className="wrap">
    <p className="season"><span className="live-dot" aria-hidden="true" />Season 01 is live. Registrations open 8 Oct 2026.</p>
    <h1 id="hero-h">India's next AI builders start here.</h1>
    <div className="hero-row"><div className="hero-copy"><p>Ignite AI Buildathon is free for students in Classes 9 to 12. Learn AI from zero, test what you know, then build a working product and pitch it to VCs.</p><div className="hero-actions"><Action href="#register">Register free</Action><Action href="#journey" ghost>See how it works</Action></div></div>
    <div className="counter" aria-label="Registrations, demo data"><div><b className="hot">12,480</b><span>students registered</span></div><div><b>214</b><span>schools</span></div><div><b>19</b><span>states and UTs</span></div></div></div>
    <p className="counter-disclaimer">Demo data</p>
    <div className="support"><span>Supported by <strong>Government of Karnataka</strong></span><span>University partner <strong>Sri Siddhartha Academy of Higher Education</strong></span><span>Organised by <strong>upGrad School of Technology</strong></span></div>
  </div></section>;
}
export function Stakes() { return <Approved start="STAKES" end="JOURNEY" />; }
export function Journey() { return <Approved start="JOURNEY" end="PARTNERS & PRIZES" />; }
export function PartnersAndPrizes() { return <Approved start="PARTNERS & PRIZES" end="CURRICULUM" />; }
function Accordion({ title, detail, children, initial = false, id }: { title: string; detail?: string; children: React.ReactNode; initial?: boolean; id: string }) {
  const [open, setOpen] = useState(initial);
  return <div className={`mod${open ? " open" : ""}`}><Button variant="ghost" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span className="mod-title">{title}</span><span className="mod-tail">{detail && <span className="mod-meta">{detail}</span>}<span className="plus" aria-hidden="true">+</span></span></Button><div className="mod-body" id={id} aria-hidden={!open}><div className="mod-inner">{children}</div></div></div>;
}
export function Curriculum() { return <section className="curriculum day" id="curriculum" aria-labelledby="cur-h"><div className="wrap cur-grid"><div><h2 id="cur-h">Starts from zero. Ends with you shipping an agent.</h2><p className="lead">Six modules, 30 live sessions on weekend mornings. No prior coding needed.</p></div><div id="modules">{modules.map((m, i) => <Accordion key={m[0]} id={`mb${i}`} title={m[0]} detail={m[1]} initial={i === 0}><p>{m[2]}</p><ol>{m[3].map((item: string) => <li key={item}>{item}</li>)}</ol></Accordion>)}</div></div></section>; }
export function StateBoard() { return <section className="board night" aria-labelledby="board-h"><div className="wrap"><div className="board-head"><h2 id="board-h">Which state is lighting up first?</h2><span className="demo-tag">Demo data, updates live in production</span></div><div className="board-grid"><div className="states" aria-label="Registrations by state, demo data">{states.map((name, i) => { const count = i < 19 ? Math.max(0, Math.round(2400 * Math.pow(.82, i) + 40)) : 0; return <div className={`st heat-${Math.min(9, Math.round(count / 2440 * 9))}`} key={name}><b>{count.toLocaleString("en-IN")}</b><span>{name}</span></div>; })}</div><div><h3>Top schools this week</h3><ol className="schools">{schools.map(([name, city, count], i) => <li key={name}><span className="pos">{i + 1}</span><span className="nm">{name}<small>{city}</small></span><span className="ct">{count}</span></li>)}</ol></div></div></div></section>; }
export function Mentors() { return <section className="mentors day" id="mentors" aria-labelledby="m-h"><div className="wrap"><h2 id="m-h">Learn from people shipping AI today.</h2><div className="m-grid">{mentors.map(([name, role]) => <div key={name}><div className="portrait" aria-hidden="true">{name.split(" ").map((word: string) => word[0]).join("").slice(0, 2)}</div><h3>{name}</h3><p>{role}</p></div>)}</div></div></section>; }
export function RegistrationAndSparkCard() {
  const [first, setFirst] = useState(""); const [school, setSchool] = useState(""); const [city, setCity] = useState(""); const [classroom, setClassroom] = useState(""); const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setMessage("Preview only — registration and parent confirmation are not available yet. Nothing was sent."); };
  return <section className="register night" id="register" aria-labelledby="reg-h"><div className="wrap reg-grid"><div><h2 id="reg-h">Claim your spark.</h2><p className="lead">Registration takes under a minute and it's free. You'll get your Spark card to share.</p><form onSubmit={submit}><div className="two"><div className="field"><label htmlFor="f-name">First name</label><input id="f-name" autoComplete="given-name" required value={first} onChange={e => setFirst(e.target.value)} /></div><div className="field"><label htmlFor="f-class">Class</label><select id="f-class" required value={classroom} onChange={e => setClassroom(e.target.value)}><option value="">Select</option><option>9</option><option>10</option><option>11</option><option>12</option></select></div></div><div className="field"><label htmlFor="f-school">School</label><input id="f-school" required value={school} onChange={e => setSchool(e.target.value)} /></div><div className="two"><div className="field"><label htmlFor="f-city">City</label><input id="f-city" required value={city} onChange={e => setCity(e.target.value)} /></div><div className="field"><label htmlFor="f-email">Parent's email</label><input id="f-email" type="email" autoComplete="email" required /></div></div><label className="consent"><input type="checkbox" required />My parent or guardian has read the terms and agrees to my participation. We'll email them to confirm.</label><Button variant="iaib" type="submit">Register free</Button><p className="form-msg" role="status">{message || "Preview only — no registration is submitted."}</p></form></div>
  <div className="card-stage"><div className="spark-card" aria-label="Your Spark card preview, demo data"><div className="sc-top"><span>Ignite AI Buildathon</span><span>Season 01</span></div><div><div className="sc-rank">Spark</div><div className="sc-num">#12,481</div></div><div><div className="sc-name">{first.trim().split(/\s+/)[0] || "Your name"}</div><div className="sc-school">{school.trim() || "Your school"}</div></div><div className="sc-foot"><span>{classroom ? `Class ${classroom}` : "Class"}</span><span>Demo preview</span></div></div></div></div></section>;
}
export function SchoolsAndParents() { return <section className="audiences day" aria-label="For schools and parents"><div className="wrap aud-grid">
  <article className="aud dark"><h3>Bring it to your school.</h3><p>Your students are ready to build the future. Give them free AI learning, real projects and a national stage.</p><ul><li>Free AI learning for every student</li><li>A national competition</li><li>₹25L in prizes and ₹2 Cr in scholarships</li></ul><Action href="#register">Register your school</Action></article>
  <article className="aud"><h3>For parents.</h3><p>Your child learns online on weekend mornings, so it never clashes with school. Finalists travel to the finale with full supervision.</p><ul><li>Free to join, no hidden costs</li><li>Parental consent before any participation</li><li>Supervised travel and stay for finalists</li></ul><Action href="#faqs" ghost>Read parent FAQs</Action></article>
  </div></section>; }
export function FAQ() { return <section className="faq day" id="faqs" aria-labelledby="faq-h"><div className="wrap faq-grid"><h2 id="faq-h">Questions, answered.</h2><div id="faqlist">{faqs.map(([question, answer], i) => <Accordion key={question} id={`fb${i}`} title={question}><p className="faq-answer">{answer}</p></Accordion>)}</div></div></section>; }
export function ClosingAndFooter() { return <section className="closing night" aria-labelledby="close-h"><div className="wrap"><h2 id="close-h">Season 01 is filling up. Don't watch it happen.</h2><Action href="#register">Register free</Action><footer className="foot"><span>Ignite AI Buildathon, by upGrad School of Technology</span><nav aria-label="Footer"><a href="#">Privacy policy</a><a href="#">Terms</a><a href="#">Code of conduct</a><a href="#">Instagram</a><a href="#">LinkedIn</a><a href="#">YouTube</a></nav></footer></div></section>; }
