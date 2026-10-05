/**
 * Product-style graphics built in HTML/CSS, so they stay crisp, on-brand and
 * themeable without image files. Each one is decorative (aria-hidden) because
 * the surrounding copy already says the same thing in words. Sizes scale with
 * the container (container queries), so one component works in a bento tile,
 * a journey card and on a phone.
 */
import type { ReactNode } from "react";

function Mock({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`mk ${className}`} aria-hidden="true">{children}</div>;
}

/* ---------- Journey ---------- */

const callFaces = ["/vishwa-mohan.webp", "/jyoti-nigam.webp", "/gladden-rumao.webp", "/mithun-s.webp"];

export function LiveClassArt() {
  return (
    <Mock className="mk-call">
      <div className="mk-row mk-call-bar"><span className="mk-live">Live</span><span className="mk-mono mk-dim">Sat · 10:00 IST</span></div>
      <div className="mk-call-grid">
        <div className="mk-call-slide">
          <span className="mk-mono">Prompting 101</span>
          <i style={{ width: "80%" }} /><i style={{ width: "64%" }} /><i className="mk-red" style={{ width: "46%" }} />
        </div>
        {callFaces.map((src) => <img key={src} src={src} alt="" loading="lazy" decoding="async" />)}
      </div>
      <div className="mk-call-dock"><i /><i /><i className="mk-end" /></div>
    </Mock>
  );
}

export function ScreeningArt() {
  return (
    <Mock className="mk-test">
      <div className="mk-row mk-test-head"><span className="mk-mono">Screening test</span><b className="mk-mono">39:12</b></div>
      <div className="mk-progress"><span style={{ width: "40%" }} /></div>
      <p className="mk-test-q">Q12 · Which prompt gives the model the clearest goal?</p>
      <ul className="mk-options">
        <li><i />A</li>
        <li className="on"><i />B</li>
        <li><i />C</li>
        <li><i />D</li>
      </ul>
    </Mock>
  );
}

/* ---------- Schools & parents ---------- */

export function SchoolArt() {
  const rows = [["AK", "Class 11"], ["RS", "Class 10"], ["MP", "Class 12"], ["DV", "Class 9"]];
  return (
    <Mock className="mk-roster">
      <div className="mk-row mk-roster-head"><span className="mk-mono">Your school · IAIB</span><b className="mk-mono">32 students</b></div>
      <ul>{rows.map(([initials, cls]) => <li key={initials}><span className="mk-avatar">{initials}</span><i /><span className="mk-mono mk-dim">{cls}</span><span className="mk-check">✓</span></li>)}</ul>
    </Mock>
  );
}

export function ParentArt() {
  return (
    <Mock className="mk-phone">
      <div className="mk-phone-body">
        <div className="mk-phone-notch" />
        <p className="mk-mono mk-dim">Inbox · now</p>
        <div className="mk-mail">
          <p className="mk-mail-from">IAIB · upGrad School of Technology</p>
          <p className="mk-mail-subject">Please confirm your child's registration</p>
          <i style={{ width: "90%" }} /><i style={{ width: "76%" }} />
          <span className="mk-mail-btn">I give consent</span>
        </div>
      </div>
    </Mock>
  );
}
