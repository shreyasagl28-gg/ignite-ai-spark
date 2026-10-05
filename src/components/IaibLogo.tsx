import { useEffect, useRef, useState } from "react";

/**
 * The IAIB mark as vector, drawn from the supplied logo: </ IAIB > with pixel
 * squares above both I's and the IGNITE AI BUILDATHON wordmark. The neutral
 * parts use currentColor so the mark works on dark and light; "AI" stays red.
 * With `animate`, the parts assemble once when the mark scrolls into view.
 */
export function IaibLogo({ animate = false, className = "", title = "IAIB · Ignite AI Buildathon" }: { animate?: boolean; className?: string; title?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [inView, setInView] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setInView(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [animate]);

  return (
    <svg
      ref={ref}
      className={`iaib-logo${animate ? " iaib-logo-anim" : ""}${inView ? " is-in" : ""} ${className}`}
      viewBox="0 150 1600 530"
      role="img"
      aria-label={title}
    >
      <g className="lg-lt"><path d="M222 256v78L92 412l130 78v76L12 443v-62z" /></g>
      <g className="lg-slash"><path d="M442 168h73L297 658h-75z" /></g>
      <g className="lg-i1"><path d="M503 255h74v316h-74z" /></g>
      <g className="lg-a lg-red"><path fillRule="evenodd" d="M728 255h73l141 316h-77l-29-68H690l-27 68h-74zM716 448h99l-51-120z" /></g>
      <g className="lg-i2 lg-red"><path d="M958 255h72v316h-72z" /></g>
      <g className="lg-b"><path fillRule="evenodd" d="M1072 255h158c80 0 115 40 115 85 0 35-20 57-40 67 35 11 55 40 55 79 0 54-40 85-120 85h-168zM1143 311v74h75c37 0 52-14 52-37s-15-37-52-37zM1143 438v77h83c40 0 61-14 61-39s-21-38-61-38z" /></g>
      <g className="lg-gt"><path d="M1376 256l209 125v62l-209 123v-76l131-78-131-78z" /></g>
      {/* pixel squares above each I: the "spark" of the mark */}
      <g className="lg-px lg-px-1"><path d="M560 241h33v32h-33zM596 232h16v17h-16zM603 215h10v10h-10z" /></g>
      <g className="lg-px lg-px-2 lg-red"><path d="M1014 241h33v32h-33zM1050 232h16v17h-16zM1057 215h10v10h-10z" /></g>
      <text className="lg-word" x="503" y="657" textLength="857" lengthAdjust="spacingAndGlyphs">IGNITE AI BUILDATHON</text>
    </svg>
  );
}
