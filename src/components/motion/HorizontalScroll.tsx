"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * HorizontalScroll — on desktop with motion allowed, the section pins and the
 * card track slides sideways as the page scrolls. On mobile and under
 * prefers-reduced-motion it degrades to a plain horizontally swipeable row.
 * `title` is the headline block rendered above the track.
 */
export function HorizontalScroll({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mql = window.matchMedia(
      "(min-width: 901px) and (prefers-reduced-motion: no-preference)"
    );
    let raf = 0;

    const apply = () => {
      if (!mql.matches) {
        section.classList.remove("hs-pinned");
        section.style.height = "";
        track.style.transform = "";
        return;
      }
      const overflow = track.scrollWidth - track.clientWidth;
      if (overflow <= 0) {
        section.classList.remove("hs-pinned");
        section.style.height = "";
        track.style.transform = "";
        return;
      }
      section.classList.add("hs-pinned");
      section.style.height = `${window.innerHeight + overflow}px`;

      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      track.style.transform = `translate3d(${-progress * overflow}px,0,0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const onChange = () => apply();
    mql.addEventListener("change", onChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div ref={sectionRef} className="hs">
      <div className="hs-sticky">
        <div className="wrap">
          {title}
          <div ref={trackRef} className="hs-track">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
