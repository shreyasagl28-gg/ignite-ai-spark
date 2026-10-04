import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import approvedHtml from "@/content/iaib-body.html?raw";
import { modules, faqs, mentors, schools } from "@/content/iaib-data";
import { IndiaStateMap } from "@/components/IndiaStateMap";
import { BentoStakes } from "@/components/motion/BentoStakes";
import { Reveal } from "@/components/motion/Reveal";
import { StackedJourney } from "@/components/motion/StackedJourney";
import { HorizontalScroll } from "@/components/motion/HorizontalScroll";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import iaibLogo from "@/assets/iaib-logo-dark.png.asset.json";

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
    <a className="brand" href="#top" aria-label="IAIB home"><img src={iaibLogo.url} alt="IAIB · Ignite AI Buildathon" width="126" height="61" /></a>
    <nav className="nav-links" aria-label="Main"><a href="#journey">How it works</a><a href="#prizes">Prizes</a><a href="#curriculum">Curriculum</a><a href="#mentors">Mentors</a><a href="#faqs">FAQs</a></nav>
    <div className="nav-cta"><Action href="#register">Register free</Action></div>
  </div></header>;
}
function StaticSparks({ studentCount }: { studentCount: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const flareRef = useRef<(() => void) | null>(null);
  const previousCount = useRef(studentCount);
  useEffect(() => {
    if (studentCount > previousCount.current) flareRef.current?.();
    previousCount.current = studentCount;
  }, [studentCount]);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const colors = ["229,9,19", "255,77,46", "255,138,61"];
    const noise = (seed: number) => {
      const value = Math.sin(seed * 127.1 + 37.7) * 43758.5453;
      return value - Math.floor(value);
    };
    type Spark = { x: number; y: number; speed: number; drift: number; radius: number; tone: number; opacity: number; square: boolean };
    let width = 0;
    let height = 0;
    let sparks: Spark[] = [];
    let frame = 0;
    let lastFrame = 0;
    let flareStarted = -Infinity;
    let inView = true;

    const makeSpark = (i: number): Spark => ({
      x: .12 + noise(i + 1) * .76,
      y: noise(i + 402),
      speed: .055 + noise(i + 719) * .12,
      drift: (noise(i + 815) - .5) * .018,
      radius: .65 + noise(i + 901) * 1.45,
      tone: i % colors.length,
      opacity: .2 + noise(i + 1200) * .55,
      square: i % 13 === 0,
    });
     const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      const flare = Math.max(0, 1 - (now - flareStarted) / 850);
      const glow = context.createRadialGradient(width * .5, height * 1.03, 0, width * .5, height * 1.03, height * .85);
      glow.addColorStop(0, `rgba(229,9,19,${.16 + flare * .24})`);
      glow.addColorStop(1, "rgba(229,9,19,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
       for (const [index, spark] of sparks.entries()) {
         // A handful of original square sparks briefly find one another, then disperse.
         // This happens inside the existing particle budget rather than adding a second scene.
         const assembly = reducedMotion.matches ? 0 : Math.max(0, 1 - Math.abs((now / 1000 + index * .055) % 10 - 2) / 1.25);
         const gather = index < 12 ? assembly * assembly * (3 - 2 * assembly) * .75 : 0;
         const targetX = (.43 + (index % 4) * .045) * width;
         const targetY = (.68 + Math.floor(index / 4) * .045) * height;
         const x = spark.x * width * (1 - gather) + targetX * gather;
         const y = spark.y * height * (1 - gather) + targetY * gather;
        const fade = Math.min(1, (1 - spark.y) * 3) * Math.min(1, spark.y * 5);
        const intensity = 1 + flare * (1.8 + Math.max(0, 1 - Math.abs(spark.x - .5) * 2));
         const alpha = Math.min(1, spark.opacity * fade * intensity + gather * .25);
        context.fillStyle = `rgba(${colors[spark.tone]},${alpha * .2})`;
        context.beginPath();
        context.arc(x, y, spark.radius * (3 + flare * 2), 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(${colors[spark.tone]},${alpha})`;
        const size = spark.radius * (1 + flare * .6);
        if (spark.square) context.fillRect(x - size, y - size, size * 2, size * 2);
        else { context.beginPath(); context.arc(x, y, size, 0, Math.PI * 2); context.fill(); }
      }
      context.globalCompositeOperation = "source-over";
    };
    const tick = (now: number) => {
      if (now - lastFrame >= 32) {
        const elapsed = lastFrame ? Math.min((now - lastFrame) / 1000, .06) : 0;
        lastFrame = now;
        for (const spark of sparks) {
          spark.y -= spark.speed * elapsed;
          spark.x += spark.drift * elapsed;
          if (spark.y < -.03 || spark.x < .04 || spark.x > .96) {
            spark.y = 1.02;
            spark.x = .12 + noise(now + spark.speed * 1000) * .76;
          }
        }
        draw(now);
      }
      frame = window.requestAnimationFrame(tick);
    };
    const shouldAnimate = () => !reducedMotion.matches && inView && !document.hidden;
    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      if (shouldAnimate()) frame = window.requestAnimationFrame(tick);
      else draw(performance.now());
    };
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width <= 700 ? Math.min(90, Math.floor(width / 4)) : Math.min(260, Math.floor(width / 5));
      sparks = Array.from({ length: count }, (_, i) => makeSpark(i));
      draw(performance.now());
    };
    flareRef.current = () => {
      if (reducedMotion.matches || !inView || document.hidden) return;
      flareStarted = performance.now();
      draw(flareStarted);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      sync();
    });
    const resizer = new ResizeObserver(resize);
    resize();
    observer.observe(canvas);
    resizer.observe(canvas);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      flareRef.current = null;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return <canvas id="sparks" ref={ref} aria-hidden="true" />;
}
export function Hero({ studentsRegistered = 12480 }: { studentsRegistered?: number }) {
  return <section className="hero night" aria-labelledby="hero-h"><StaticSparks studentCount={studentsRegistered} /><div className="wrap">
    <div className="hero-identity"><img src={iaibLogo.url} alt="IAIB · Ignite AI Buildathon" width="160" height="77" /><span className="hero-identity-line" aria-hidden="true" /></div>
    <p className="season"><span className="live-dot" aria-hidden="true" />Season 01 is live. Registrations open 8 Oct 2026.</p>
    <h1 id="hero-h">India's next AI builders start here.</h1>
    <div className="hero-row"><div className="hero-copy"><p>Ignite AI Buildathon is free for students in Classes 9 to 12. Learn AI from zero, test what you know, then build a working product and pitch it to VCs.</p><div className="hero-actions"><Action href="#register">Register free</Action><Action href="#journey" ghost>See how it works</Action></div></div>
    <div className="counter" aria-label="Registrations, demo data"><div><b className="hot">{studentsRegistered.toLocaleString("en-IN")}</b><span>students registered</span></div><div><b>214</b><span>schools</span></div><div><b>19</b><span>states and UTs</span></div></div></div>
    <p className="counter-disclaimer">Demo data</p>
    <div className="support"><span>Supported by <strong>Government of Karnataka</strong></span><span>University partner <strong>Sri Siddhartha Academy of Higher Education</strong></span><span>Organised by <strong>upGrad School of Technology</strong></span></div>
  </div></section>;
}
export function Stakes() {
  return (
    <section className="stakes night" id="prizes-top" aria-labelledby="stakes-h">
      <div className="wrap">
        <Reveal>
          <h2 id="stakes-h">What's on the table this season.</h2>
        </Reveal>
        <BentoStakes />
        <p className="ratio">Thousands will learn. <em>Only 100 make the finale.</em></p>
      </div>
    </section>
  );
}
const journeySteps = [
  { when: "From 8 Oct", title: "Register", body: "Sign up on your own or through your school. Open to Classes 9 to 12.", rank: "You become a Spark" },
  { when: "Dates to be announced", title: "Learn live", body: "30 live sessions with industry mentors, from AI fundamentals and LLMs to agentic AI.", rank: "You become an Ember" },
  { when: "Dates to be announced", title: "Screen and build", body: "Clear a 40-minute online test, then vibe code a working prototype with AI tools.", rank: "You become a Flame" },
  { when: "Finale, Bengaluru", title: "Grand finale", body: "36 hours, offline. Build, pitch to VCs and compete for ₹25L in prizes.", rank: "You join the Ignited 100" },
];

export function Journey() {
  return (
    <section className="journey night" id="journey" aria-labelledby="journey-h">
      <div className="wrap">
        <div className="journey-head">
          <h2 id="journey-h">Four steps. One spark to a fire.</h2>
          <p>Every step earns you a rank. Start as a Spark. Finish as one of the Ignited 100.</p>
        </div>
        <StackedJourney steps={journeySteps} />
      </div>
    </section>
  );
}
export function PartnersAndPrizes() { return <Approved start="PARTNERS & PRIZES" end="CURRICULUM" />; }
function Accordion({ title, detail, children, initial = false, id }: { title: string; detail?: string; children: React.ReactNode; initial?: boolean; id: string }) {
  const [open, setOpen] = useState(initial);
  return <div className={`mod${open ? " open" : ""}`}><Button variant="ghost" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span className="mod-title">{title}</span><span className="mod-tail">{detail && <span className="mod-meta">{detail}</span>}<span className="plus" aria-hidden="true">+</span></span></Button><div className="mod-body" id={id} aria-hidden={!open}><div className="mod-inner">{children}</div></div></div>;
}
export function Curriculum() {
  const titleBlock = (
    <div className="cur-head">
      <h2 id="cur-h">Starts from zero. Ends with you shipping an agent.</h2>
      <p className="lead">Six modules, 30 live sessions on weekend mornings. No prior coding needed.</p>
    </div>
  );
  return (
    <section className="curriculum day" id="curriculum" aria-labelledby="cur-h">
      <HorizontalScroll title={titleBlock}>
        {modules.map((m) => (
          <SpotlightCard key={m[0]} tone="light" className="mod-card">
            <span className="mod-num">{m[1]}</span>
            <h3>{m[0]}</h3>
            <p className="mod-desc">{m[2]}</p>
            <ol>{m[3].map((item: string) => <li key={item}>{item}</li>)}</ol>
          </SpotlightCard>
        ))}
      </HorizontalScroll>
    </section>
  );
}
export function StateBoard() { return <section className="board night" aria-labelledby="board-h"><div className="wrap"><div className="board-head"><h2 id="board-h">Which state is lighting up first?</h2><span className="demo-tag">Demo data, updates live in production</span></div><div className="board-grid"><IndiaStateMap /><div><h3>Top schools this week</h3><ol className="schools">{schools.map(([name, city, count], i) => <li key={name}><span className="pos">{i + 1}</span><span className="nm">{name}<small>{city}</small></span><span className="ct">{count}</span></li>)}</ol></div></div></div></section>; }
const mentorPhoto: Record<string, string> = { "Vishwa Mohan": "/vishwa-mohan.webp", "Rishi Saraf": "/rishi-saraf.webp", "Gaurav Kaushik": "/gaurav-kaushik.png", "Gladden Rumao": "/gladden-rumao.webp", "Jyoti Nigam": "/jyoti-nigam.webp", "Rishabh Bafna": "/rishabh-bafna.png", "Mithun S": "/mithun-s.webp", "Piyush Jain": "/piyush-jain.png" };
export function Mentors() { return <section className="mentors day" id="mentors" aria-labelledby="m-h"><div className="wrap"><h2 id="m-h">Learn from people shipping AI today.</h2><div className="m-grid">{mentors.map(([name, role]) => <div key={name}>{mentorPhoto[name] ? <img className="portrait" src={mentorPhoto[name]} alt={name} loading="lazy" width={400} height={500} /> : <div className="portrait" aria-hidden="true">{name.split(" ").map((word: string) => word[0]).join("").slice(0, 2)}</div>}<h3>{name}</h3><p>{role}</p></div>)}</div></div></section>; }
const registrationSchema = z.object({
  first: z.string().trim().min(1, "Enter your first name.").max(40, "Use 40 characters or fewer.").regex(/^[\p{L}\p{M}][\p{L}\p{M}'’-]*$/u, "Enter a first name only, without a surname."),
  classroom: z.enum(["9", "10", "11", "12"], { errorMap: () => ({ message: "Select your class." }) }),
  school: z.string().trim().min(1, "Enter your school.").max(100, "Use 100 characters or fewer."),
  city: z.string().trim().min(1, "Enter your city.").max(80, "Use 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid parent email.").max(255, "Use 255 characters or fewer."),
  consent: z.literal(true, { errorMap: () => ({ message: "Parent or guardian consent is required." }) }),
});
type RegistrationField = keyof z.infer<typeof registrationSchema>;
export function RegistrationAndSparkCard() {
  const [first, setFirst] = useState(""); const [school, setSchool] = useState(""); const [city, setCity] = useState(""); const [classroom, setClassroom] = useState(""); const [email, setEmail] = useState(""); const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<RegistrationField, string>>>({});
  const [confirmed, setConfirmed] = useState(false); const [message, setMessage] = useState(""); const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const changed = () => { setConfirmed(false); setMessage(""); setErrors({}); };
  // A local, deterministic preview number: never a real registration or allocated identifier.
  const seed = `${first.trim().toLocaleLowerCase()}|${school.trim().toLocaleLowerCase()}|${city.trim().toLocaleLowerCase()}|${classroom}`;
  const number = Array.from(seed).reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 0);
  const sparkNumber = `#${(seed === "|||" ? 12481 : 12481 + number % 80000).toLocaleString("en-IN")}`;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = registrationSchema.safeParse({ first, school, city, classroom, email, consent });
    if (!result.success) {
      const next: Partial<Record<RegistrationField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as RegistrationField;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next); setConfirmed(false); setMessage("Please check the highlighted fields. Nothing was sent.");
      return;
    }
    setErrors({}); setConfirmed(true); setMessage("Spark card ready. This is a demo preview — no registration or parent email was sent.");
  };
  const download = async () => {
    if (!confirmed || !cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const png = await toPng(cardRef.current, { canvasWidth: 1080, canvasHeight: 1350, pixelRatio: 1, cacheBust: true });
      const link = document.createElement("a");
      link.download = `iaib-spark-${first.trim().toLocaleLowerCase()}.png`;
      link.href = png;
      link.click();
      setMessage("Demo Spark card downloaded. No registration or parent email was sent.");
    } catch {
      setMessage("The image couldn't be saved. Please try again.");
    } finally { setDownloading(false); }
  };
  return <section className="register night" id="register" aria-labelledby="reg-h"><div className="wrap reg-grid"><div><h2 id="reg-h">Claim your spark.</h2><p className="lead">Registration takes under a minute and it's free. You'll get your Spark card to share.</p><form onSubmit={submit} noValidate>
    <div className="two"><div className="field"><label htmlFor="f-name">First name</label><input id="f-name" autoComplete="given-name" maxLength={40} value={first} aria-invalid={!!errors.first} aria-describedby={errors.first ? "f-name-error" : undefined} onChange={e => { setFirst(e.target.value.split(/\s/)[0] ?? ""); changed(); }} />{errors.first && <small id="f-name-error" role="alert">{errors.first}</small>}</div><div className="field"><label htmlFor="f-class">Class</label><select id="f-class" value={classroom} aria-invalid={!!errors.classroom} aria-describedby={errors.classroom ? "f-class-error" : undefined} onChange={e => { setClassroom(e.target.value); changed(); }}><option value="">Select</option><option>9</option><option>10</option><option>11</option><option>12</option></select>{errors.classroom && <small id="f-class-error" role="alert">{errors.classroom}</small>}</div></div>
    <div className="field"><label htmlFor="f-school">School</label><input id="f-school" maxLength={100} value={school} aria-invalid={!!errors.school} aria-describedby={errors.school ? "f-school-error" : undefined} onChange={e => { setSchool(e.target.value); changed(); }} />{errors.school && <small id="f-school-error" role="alert">{errors.school}</small>}</div>
    <div className="two"><div className="field"><label htmlFor="f-city">City</label><input id="f-city" maxLength={80} value={city} aria-invalid={!!errors.city} aria-describedby={errors.city ? "f-city-error" : undefined} onChange={e => { setCity(e.target.value); changed(); }} />{errors.city && <small id="f-city-error" role="alert">{errors.city}</small>}</div><div className="field"><label htmlFor="f-email">Parent's email</label><input id="f-email" type="email" autoComplete="email" maxLength={255} value={email} aria-invalid={!!errors.email} aria-describedby={errors.email ? "f-email-error" : undefined} onChange={e => { setEmail(e.target.value); changed(); }} />{errors.email && <small id="f-email-error" role="alert">{errors.email}</small>}</div></div>
    <label className="consent"><input type="checkbox" checked={consent} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "f-consent-error" : undefined} onChange={e => { setConsent(e.target.checked); changed(); }} />My parent or guardian has read the terms and agrees to my participation. We'll email them to confirm.</label>{errors.consent && <small className="consent-error" id="f-consent-error" role="alert">{errors.consent}</small>}
    <div className="reg-actions"><Button variant="iaib" type="submit">Register free</Button>{confirmed && <Button variant="iaibOutline" type="button" onClick={download} disabled={downloading} aria-label="Download demo Spark card as PNG">{downloading ? "Preparing PNG…" : "Download Spark card ↓"}</Button>}</div><p className="form-msg" role="status">{message || "Preview only — no registration is submitted."}</p>
  </form></div>
   <div className={`card-stage${confirmed ? " card-ready" : ""}`}><div ref={cardRef} className="spark-card" aria-label="Your Spark card preview, demo data"><div className="sc-top"><span>Ignite AI Buildathon</span><span>Season 01</span></div><div className="sc-ticket"><div className="sc-rank">Spark</div><div className="sc-num">{sparkNumber}</div><span className="sc-demo">DEMO · NOT AN ISSUED REGISTRATION</span></div><div className="sc-holder"><div className="sc-name">{first.trim() || "Your name"}</div><div className="sc-school">{school.trim() || "Your school"}</div><div className="sc-city">{city.trim() || "Your city"}</div></div><div className="sc-foot"><span>{classroom ? `Class ${classroom}` : "Class"}</span><span>Demo preview</span></div></div></div></div></section>;
}
export function SchoolsAndParents() { return <section className="audiences day" aria-label="For schools and parents"><div className="wrap aud-grid">
  <article className="aud dark"><h3>Bring it to your school.</h3><p>Your students are ready to build the future. Give them free AI learning, real projects and a national stage.</p><ul><li>Free AI learning for every student</li><li>A national competition</li><li>₹25L in prizes and ₹2 Cr in scholarships</li></ul><Action href="#register">Register your school</Action></article>
  <article className="aud"><h3>For parents.</h3><p>Your child learns online on weekend mornings, so it never clashes with school. Finalists travel to the finale with full supervision.</p><ul><li>Free to join, no hidden costs</li><li>Parental consent before any participation</li><li>Supervised travel and stay for finalists</li></ul><Action href="#faqs" ghost>Read parent FAQs</Action></article>
  </div></section>; }
export function FAQ() { return <section className="faq day" id="faqs" aria-labelledby="faq-h"><div className="wrap faq-grid"><h2 id="faq-h">Questions, answered.</h2><div id="faqlist">{faqs.map(([question, answer], i) => <Accordion key={question} id={`fb${i}`} title={question}><p className="faq-answer">{answer}</p></Accordion>)}</div></div></section>; }
export function ClosingAndFooter() { return <section className="closing night" aria-labelledby="close-h"><div className="wrap"><h2 id="close-h">Season 01 is filling up. Don't watch it happen.</h2><Action href="#register">Register free</Action><footer className="foot"><span>Ignite AI Buildathon, by upGrad School of Technology</span><nav aria-label="Footer"><a href="#">Privacy policy</a><a href="#">Terms</a><a href="#">Code of conduct</a><a href="#">Instagram</a><a href="#">LinkedIn</a><a href="#">YouTube</a></nav></footer></div></section>; }
