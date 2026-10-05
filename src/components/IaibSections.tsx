import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { faqs, mentors, schools, recentRegistrations } from "@/content/iaib-data";
import { IndiaStateMap } from "@/components/IndiaStateMap";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { CurriculumStory } from "@/components/CurriculumStory";
import { JourneyLadder } from "@/components/JourneyLadder";
import { Marquee } from "@/components/motion/Marquee";
import { TiltCard } from "@/components/motion/TiltCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Sparkbots } from "@/components/motion/Sparkbots";
import { CloseCountdown, NavPulseDot, sparkBurst } from "@/components/cta/RegisterCta";
import { IaibLogo } from "@/components/IaibLogo";

function Action({ children, href, ghost = false }: { children: React.ReactNode; href: string; ghost?: boolean }) {
  return <Button asChild variant={ghost ? "iaibOutline" : "iaib"}><a href={href}>{children}</a></Button>;
}
export function SiteNav() {
  return <header className="nav solid" id="nav"><div className="wrap">
    <a className="brand" href="#top" aria-label="IAIB home"><IaibLogo className="nav-logo" title="IAIB · Ignite AI Buildathon" /></a>
    <nav className="nav-links" aria-label="Main"><a href="#journey">How it works</a><a href="#prizes">Prizes</a><a href="#curriculum">Curriculum</a><a href="#mentors">Mentors</a><a href="#faqs">FAQs</a></nav>
    <div className="nav-cta"><Action href="#register"><NavPulseDot />Register free</Action></div>
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
  return (
    <section className="hero night" aria-labelledby="hero-h">
      <StaticSparks studentCount={studentsRegistered} />
      <Sparkbots studentCount={studentsRegistered} />
      <div className="wrap">
        <p className="hero-credits">
          <span className="hc-org"><img src="/government-of-karnataka.webp" alt="" width={56} height={48} /><span>Government of<br />Karnataka</span></span>
          <span className="hc-x" aria-hidden="true">×</span>
          <img className="hc-upgrad" src="/upgrad-sot-on-dark.webp" alt="upGrad School of Technology" width={135} height={40} />
          <span className="hc-present">present</span>
        </p>
        <h1 id="hero-h" className="hero-name"><span>Ignite <em>AI</em></span> <span>Buildathon</span></h1>
        <p className="hero-tag">Learn AI from zero. Build a real product. Pitch it to VCs.</p>
        <ul className="hero-facts">
          <li><span className="live-dot" aria-hidden="true" />Season 01 · Registrations open 8 Oct 2026</li>
          <li>Free for Classes 9–12</li>
          <li>₹25L in prizes</li>
          <li>Finale in Bengaluru</li>
        </ul>
        <div className="hero-row">
          <div className="hero-actions"><MagneticButton href="#register" className="btn-hero">Register free</MagneticButton><CloseCountdown /><Action href="#journey" ghost>See how it works</Action></div>
          <div className="counter" aria-label="Registrations, demo data"><div><b className="hot">{studentsRegistered.toLocaleString("en-IN")}</b><span>students registered</span></div><div><b>214</b><span>schools</span></div><div><b>19</b><span>states and UTs</span></div></div>
        </div>
        <p className="counter-disclaimer">Demo data</p>
      </div>
    </section>
  );
}
export function RecentRegistrations() {
  return <aside className="registration-strip night" aria-label="Sample recent registrations">
    <span className="registration-strip-label">Demo data</span>
    <Marquee label="Sample recent registrations" speed={60}>
      {recentRegistrations.map(([firstName, city, number]) =>
        <span className="registration-update" key={number}>{firstName} from {city} just became Spark <strong>#{number.toLocaleString("en-IN")}</strong></span>
      )}
    </Marquee>
  </aside>;
}
const art = (name: string) => ({ src: `/art/${name}.webp`, srcSet: `/art/${name}-sm.webp 512w, /art/${name}.webp 1024w` });
export function Stakes() {
  return (
    <section className="stakes night" id="prizes-top" aria-labelledby="stakes-h">
      <div className="wrap">
        <Reveal><p className="eyebrow">Prizes</p><h2 id="stakes-h">What's on the table this season.</h2></Reveal>
        <div className="sk">
          <div className="sk-row">
            <div className="sk-copy"><b className="sk-num sk-red">₹2 Cr</b><p>in scholarships for standout builders</p></div>
            <img className="sk-img" {...art("ember")} sizes="(max-width: 900px) 100vw, 55vw" alt="" width={1024} height={559} loading="lazy" decoding="async" />
          </div>
          <div className="sk-row sk-row-flip">
            <img className="sk-img" {...art("trophy")} sizes="(max-width: 900px) 100vw, 55vw" alt="" width={1024} height={559} loading="lazy" decoding="async" />
            <div className="sk-copy"><b className="sk-num">₹25L</b><p>in prizes at the grand finale</p></div>
          </div>
        </div>
      </div>
      <div className="sk-band">
        <img src="/art/finale-hall.webp" alt="" width={816} height={434} loading="lazy" decoding="async" />
        <div className="wrap sk-band-copy">
          <div><b className="sk-num">100</b><p>finalists build live for 36 hours</p></div>
          <div><b className="sk-num">VCs</b><p>hear your pitch on finale day</p></div>
        </div>
      </div>
      <div className="wrap"><p className="ratio">Thousands will learn. <em>Only 100 make the finale.</em></p></div>
    </section>
  );
}
const journeySteps = [
  { when: "From 8 Oct 2026", title: "Register", body: "Sign up on your own or through your school. Open to Classes 9 to 12.", rank: "You become a Spark" },
  { when: "Dates to be announced", title: "Learn live", body: "30 live sessions with industry mentors, from AI fundamentals and LLMs to agentic AI.", rank: "You become an Ember" },
  { when: "Dates to be announced", title: "Screen and build", body: "Clear a 40-minute online test, then vibe code a working prototype with AI tools.", rank: "You become a Flame" },
  { when: "Finale, Bengaluru", title: "Grand finale", body: "36 hours, offline. Build, pitch to VCs and compete for ₹25L in prizes.", rank: "You join the Ignited 100" },
];

export function Journey() {
  return (
    <section className="journey night" id="journey" aria-labelledby="journey-h">
      <div className="wrap">
        <div className="journey-head">
          <Reveal><p className="eyebrow">How it works</p><h2 id="journey-h">Four steps. One spark to a fire.</h2></Reveal>
          <p>Every step earns you a rank. Start as a Spark. Finish as one of the Ignited 100.</p>
        </div>
        <JourneyLadder steps={journeySteps} />
      </div>
    </section>
  );
}
const partners = [
  { role: "Supported by", name: "Government of Karnataka", logo: "/government-of-karnataka.png", shape: "emblem" },
  { role: "Organised by", name: "upGrad School of Technology", logo: "/upgrad-school-of-technology.png", shape: "wordmark" },
  { role: "University partner", name: "Sri Siddhartha Academy of Higher Education", logo: "/ssahe.png", shape: "emblem" },
] as const;
const buildPartners = ["AI Partner", "Build Partner", "Voice Partner"];
export function PartnersAndPrizes() {
  return (
    <section className="partners day" id="prizes" aria-labelledby="partners-h">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><p className="eyebrow">Partners</p><h2 id="partners-h">Backed by people who build.</h2></Reveal>
          <p className="lead partners-lead">Every build partner runs its own prize track, so there's more than one way to win.</p>
        </div>
        <ul className="pw">
          {partners.map((p) => (
            <li key={p.name} className="pw-tile">
              <span className="pw-role">{p.role}</span>
              <span className={`pw-logo pw-logo-${p.shape}`}><img src={p.logo} alt={p.name} loading="lazy" /></span>
              <span className="pw-name">{p.name}</span>
            </li>
          ))}
        </ul>
        <div className="pw-build">
          <img className="pw-seal" src="/art/partner-seal-sm.webp" srcSet="/art/partner-seal-sm.webp 512w, /art/partner-seal.webp 1024w" sizes="(max-width: 900px) 90vw, 30vw" alt="" width={1024} height={559} loading="lazy" decoding="async" />
          <p className="pw-role">Build partners</p>
          <ul className="pw-slots">
            {buildPartners.map((name) => (
              <li key={name} className="pw-slot">
                <span className="pw-slot-mark" aria-hidden="true" />
                <span className="pw-slot-name">{name}</span>
                <span className="pw-soon">soon</span>
              </li>
            ))}
          </ul>
        </div>
        <RevealGroup className="prize-row">
          <RevealItem><article className="prize grand"><h3>Grand prize</h3><div className="amt">₹25L</div><p>Total prize pool for the finale winners. Breakdown by rank to be announced.</p></article></RevealItem>
          <RevealItem><article className="prize"><h3>Partner prize tracks</h3><p>Best use of each build partner's tool, judged on that partner's own criteria. Tracks open as partners are announced.</p></article></RevealItem>
          <RevealItem><article className="prize"><h3>Scholarships</h3><div className="amt amt-sm">₹2 Cr</div><p>Eligibility and amounts per student to be announced.</p></article></RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
function Accordion({ title, detail, children, initial = false, id }: { title: string; detail?: string; children: React.ReactNode; initial?: boolean; id: string }) {
  const [open, setOpen] = useState(initial);
  return <div className={`mod${open ? " open" : ""}`}><Button variant="ghost" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span className="mod-title">{title}</span><span className="mod-tail">{detail && <span className="mod-meta">{detail}</span>}<span className="plus" aria-hidden="true">+</span></span></Button><div className="mod-body" id={id} aria-hidden={!open}><div className="mod-inner">{children}</div></div></div>;
}
export function Curriculum() {
  return (
    <section className="curriculum night" id="curriculum" aria-labelledby="cur-h">
      <div className="wrap">
        <div className="cur-head sec-head">
          <Reveal><p className="eyebrow">Curriculum</p><h2 id="cur-h">Starts from zero. Ends with you shipping an agent.</h2></Reveal>
          <p className="lead">Six modules, 30 live sessions on weekend mornings. No prior coding needed.</p>
        </div>
        <CurriculumStory />
      </div>
    </section>
  );
}
export function StateBoard() { return <section className="board night" aria-labelledby="board-h"><div className="wrap"><div className="board-head"><Reveal><p className="eyebrow">Leaderboard</p><h2 id="board-h">Which state is lighting up first?</h2></Reveal><span className="demo-tag">Demo data. Live counts appear once registrations open.</span></div><div className="board-grid"><IndiaStateMap /><div><h3>Top schools this week</h3><ol className="schools">{schools.map(([name, city, count], i) => <li key={name}><span className="pos">{i + 1}</span><span className="nm">{name}<small>{city}</small></span><span className="ct">{count}</span></li>)}</ol><a className="board-cta" href="#register">Register your school →</a></div></div></div></section>; }
const mentorPhoto: Record<string, string> = { "Vishwa Mohan": "/vishwa-mohan.webp", "Rishi Saraf": "/rishi-saraf.webp", "Gaurav Kaushik": "/gaurav-kaushik.png", "Gladden Rumao": "/gladden-rumao.webp", "Jyoti Nigam": "/jyoti-nigam.webp", "Rishabh Bafna": "/rishabh-bafna.png", "Mithun S": "/mithun-s.webp", "Piyush Jain": "/piyush-jain.png" };
// Current and past companies, as listed on each mentor's public profile. Confirm with each mentor before launch.
const mentorLogos: Record<string, Array<[string, string]>> = {
  "Vishwa Mohan": [["/upgrad.webp", "upGrad"], ["/linkedin.webp", "LinkedIn"], ["/walmart.webp", "Walmart"], ["/paypal.webp", "PayPal"], ["/oracle.webp", "Oracle"], ["/pw.webp", "Physics Wallah"]],
  "Rishi Saraf": [["/hotstar.webp", "Hotstar"], ["/vmware.webp", "VMware"], ["/walmart.webp", "Walmart"]],
  "Gaurav Kaushik": [["/salesforce.webp", "Salesforce"], ["/microsoft.webp", "Microsoft"], ["/paypal.webp", "PayPal"]],
  "Gladden Rumao": [["/upgrad.webp", "upGrad"], ["/barclays.webp", "Barclays"]],
  "Jyoti Nigam": [["/upgrad.webp", "upGrad"]],
  "Rishabh Bafna": [["/upgrad.webp", "upGrad"]],
  "Mithun S": [["/cisco.webp", "Cisco"], ["/ineuron.webp", "iNeuron"]],
  "Piyush Jain": [["/upgrad.webp", "upGrad"]],
};
export function Mentors() {
  return (
    <section className="mentors day" id="mentors" aria-labelledby="m-h">
      <div className="wrap">
        <Reveal><p className="eyebrow">Mentors</p><h2 id="m-h">Learn from people shipping AI today.</h2></Reveal>
        <RevealGroup className="m-grid">
          {mentors.map(([name, role]) => (
            <RevealItem key={name}>
              <div className="m-photo">
                {mentorPhoto[name] ? <img className="portrait" src={mentorPhoto[name]} alt={name} loading="lazy" width={400} height={500} /> : <div className="portrait" aria-hidden="true">{name.split(" ").map((word: string) => word[0]).join("").slice(0, 2)}</div>}
              </div>
              <h3>{name}</h3>
              <p>{role}</p>
              {mentorLogos[name] && (
                <ul className="m-logos" aria-label={`${name} has worked at`}>
                  {mentorLogos[name]!.map(([src, company]) => <li key={company}><img src={src} alt={company} loading="lazy" height={18} /></li>)}
                </ul>
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
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
  const submitRef = useRef<HTMLButtonElement>(null);
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
    sparkBurst(submitRef.current);
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
  return <section className="register night" id="register" aria-labelledby="reg-h"><div className="wrap reg-grid"><div><Reveal><p className="eyebrow">Register</p><h2 id="reg-h">Claim your Spark.</h2></Reveal><p className="lead">Registration takes under a minute and it's free. You'll get your Spark card to share.</p><form onSubmit={submit} noValidate>
    <div className="two"><div className="field"><label htmlFor="f-name">First name</label><input id="f-name" autoComplete="given-name" maxLength={40} value={first} aria-invalid={!!errors.first} aria-describedby={errors.first ? "f-name-error" : undefined} onChange={e => { setFirst(e.target.value.split(/\s/)[0] ?? ""); changed(); }} />{errors.first && <small id="f-name-error" role="alert">{errors.first}</small>}</div><div className="field"><label htmlFor="f-class">Class</label><select id="f-class" value={classroom} aria-invalid={!!errors.classroom} aria-describedby={errors.classroom ? "f-class-error" : undefined} onChange={e => { setClassroom(e.target.value); changed(); }}><option value="">Select</option><option>9</option><option>10</option><option>11</option><option>12</option></select>{errors.classroom && <small id="f-class-error" role="alert">{errors.classroom}</small>}</div></div>
    <div className="field"><label htmlFor="f-school">School</label><input id="f-school" maxLength={100} value={school} aria-invalid={!!errors.school} aria-describedby={errors.school ? "f-school-error" : undefined} onChange={e => { setSchool(e.target.value); changed(); }} />{errors.school && <small id="f-school-error" role="alert">{errors.school}</small>}</div>
    <div className="two"><div className="field"><label htmlFor="f-city">City</label><input id="f-city" maxLength={80} value={city} aria-invalid={!!errors.city} aria-describedby={errors.city ? "f-city-error" : undefined} onChange={e => { setCity(e.target.value); changed(); }} />{errors.city && <small id="f-city-error" role="alert">{errors.city}</small>}</div><div className="field"><label htmlFor="f-email">Parent's email</label><input id="f-email" type="email" autoComplete="email" maxLength={255} value={email} aria-invalid={!!errors.email} aria-describedby={errors.email ? "f-email-error" : undefined} onChange={e => { setEmail(e.target.value); changed(); }} />{errors.email && <small id="f-email-error" role="alert">{errors.email}</small>}</div></div>
    <label className="consent"><input type="checkbox" checked={consent} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "f-consent-error" : undefined} onChange={e => { setConsent(e.target.checked); changed(); }} />My parent or guardian has read the terms and agrees to my participation. We'll email them to confirm.</label>{errors.consent && <small className="consent-error" id="f-consent-error" role="alert">{errors.consent}</small>}
    <div className="reg-actions"><Button ref={submitRef} variant="iaib" type="submit">Register free</Button>{confirmed && <Button variant="iaibOutline" type="button" onClick={download} disabled={downloading} aria-label="Download demo Spark card as PNG">{downloading ? "Preparing PNG…" : "Download Spark card ↓"}</Button>}</div><p className="form-msg" role="status">{message || "Preview only — no registration is submitted."}</p>
  </form></div>
   <div className={`card-stage${confirmed ? " card-ready" : ""}`}><TiltCard><div ref={cardRef} className="spark-card" aria-label="Your Spark card preview, demo data"><div className="sc-top"><span>Ignite AI Buildathon</span><span>Season 01</span></div><div className="sc-ticket"><div className="sc-rank">Spark</div><div className="sc-num">{sparkNumber}</div><span className="sc-demo">DEMO · NOT AN ISSUED REGISTRATION</span></div><div className="sc-holder"><div className="sc-name">{first.trim() || "Your name"}</div><div className="sc-school">{school.trim() || "Your school"}</div><div className="sc-city">{city.trim() || "Your city"}</div></div><div className="sc-foot"><span>{classroom ? `Class ${classroom}` : "Class"}</span><span>Demo preview</span></div></div></TiltCard></div></div></section>;
}
export function SchoolsAndParents() { return <section className="audiences day" aria-label="For schools and parents"><RevealGroup className="wrap aud-grid">
  <RevealItem><article className="aud dark"><div className="aud-art"><img src="/art/schools.webp" srcSet="/art/schools-sm.webp 512w, /art/schools.webp 1024w" sizes="(max-width: 900px) 90vw, 45vw" alt="" width={1024} height={559} loading="lazy" decoding="async" /></div><h3>Bring it to your school.</h3><p>Your students are ready to build the future. Give them free AI learning, real projects and a national stage.</p><ul><li>Free AI learning for every student</li><li>A national competition</li><li>₹25L in prizes and ₹2 Cr in scholarships</li></ul><Action href="#register">Register your school</Action></article></RevealItem>
  <RevealItem><article className="aud"><div className="aud-art"><img src="/art/parents.webp" srcSet="/art/parents-sm.webp 512w, /art/parents.webp 1024w" sizes="(max-width: 900px) 90vw, 45vw" alt="" width={1024} height={559} loading="lazy" decoding="async" /></div><h3>For parents.</h3><p>Your child learns online on weekend mornings, so it never clashes with school. Finalists travel to the finale with full supervision.</p><ul><li>Free to join, no hidden costs</li><li>Parental consent before any participation</li><li>Supervised travel and stay for finalists</li></ul><Action href="#faqs" ghost>Read parent FAQs</Action></article></RevealItem>
  </RevealGroup></section>; }
export function FAQ() { return <section className="faq day" id="faqs" aria-labelledby="faq-h"><div className="wrap faq-grid"><Reveal><p className="eyebrow">FAQs</p><h2 id="faq-h">Questions, answered.</h2></Reveal><div id="faqlist">{faqs.map(([question, answer], i) => <Accordion key={question} id={`fb${i}`} title={question}><p className="faq-answer">{answer}</p></Accordion>)}</div></div></section>; }
function FooterDialog({ label }: { label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return <><button type="button" className="foot-link" onClick={() => ref.current?.showModal()}>{label}</button><dialog ref={ref} className="foot-dialog" aria-label={label} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}><h3>{label}</h3><p>This page is being finalised and will be published before registrations open.</p><button type="button" className="btn btn-red" onClick={() => ref.current?.close()}>Close</button></dialog></>;
}
export function ClosingAndFooter() {
  return (
    <section className="closing night" aria-label="Ignite AI Buildathon">
      <img className="closing-art" src="/art/closing.webp" srcSet="/art/closing-sm.webp 512w, /art/closing.webp 1024w" sizes="100vw" alt="" width={1024} height={434} loading="lazy" decoding="async" />
      <div className="finale-mark">
        <div className="wrap">
          <IaibLogo animate className="finale-logo" />
          <div className="finale-cta"><MagneticButton href="#register">Register free</MagneticButton></div>
        </div>
        <div className="finale-crew"><Sparkbots studentCount={12480} /></div>
      </div>
      <div className="wrap">
        <footer className="foot">
          <div className="foot-credits">
            <span className="foot-credit"><span className="foot-label">Organised by</span><img src="/upgrad-sot-on-dark.webp" alt="upGrad School of Technology" width={120} height={36} loading="lazy" /></span>
            <span className="foot-credit"><span className="foot-label">Supported by</span><img src="/government-of-karnataka.webp" alt="" width={42} height={36} loading="lazy" /><span>Government of Karnataka</span></span>
          </div>
          <div className="foot-base">
            <span>© 2026 Ignite AI Buildathon</span>
            <nav aria-label="Footer">{["Privacy policy", "Terms", "Code of conduct"].map((label) => <FooterDialog key={label} label={label} />)}</nav>
          </div>
        </footer>
      </div>
    </section>
  );
}
