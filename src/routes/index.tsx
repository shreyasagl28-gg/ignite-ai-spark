import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, Hero, RecentRegistrations, Stakes, Journey, PartnersAndPrizes, Curriculum, StateBoard, Mentors, RegistrationAndSparkCard, SchoolsAndParents, FAQ, ClosingAndFooter } from "@/components/IaibSections";
import { StickyRegisterBar } from "@/components/cta/RegisterCta";

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
      <SiteNav />
      <main id="top">
        <Hero />
        <RecentRegistrations />
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
      <StickyRegisterBar count={12480} />
    </>
  );
}
