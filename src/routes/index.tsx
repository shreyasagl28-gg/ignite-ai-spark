import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteNav, Hero, Stakes, Journey, PartnersAndPrizes, Curriculum, StateBoard, Mentors, RegistrationAndSparkCard, SchoolsAndParents, FAQ, ClosingAndFooter } from "@/components/IaibSections";

function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let destroy = () => {};
    const sync = async () => {
      destroy();
      destroy = () => {};
      if (motion.matches) return;
      const [{ default: Lenis }, { ScrollTrigger }] = await Promise.all([import("lenis"), import("gsap/ScrollTrigger")]);
      if (disposed || motion.matches) return;
      const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 1.2, easing: t => 1 - Math.pow(1 - t, 3) });
      const off = lenis.on("scroll", ScrollTrigger.update);
      destroy = () => { off(); lenis.destroy(); };
    };
    void sync();
    motion.addEventListener("change", sync);
    return () => { disposed = true; motion.removeEventListener("change", sync); destroy(); };
  }, []);
  return null;
}

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "IAIB · Ignite AI Buildathon · Season 01" },
    { name: "description", content: "Ignite AI Buildathon is free for students in Classes 9 to 12. Learn AI from zero, build a working product and pitch it to VCs." },
    { property: "og:title", content: "IAIB · Ignite AI Buildathon · Season 01" },
    { property: "og:description", content: "India's next AI builders start here. A free national AI buildathon for students in Classes 9 to 12." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="top">
        <Hero />
        <Stakes />
        <Journey />
        <PartnersAndPrizes />
        <Curriculum />
        <StateBoard />
        <Mentors />
        <RegistrationAndSparkCard />
        <SchoolsAndParents />
        <FAQ />
        <ClosingAndFooter />
      </main>
    </>
  );
}
