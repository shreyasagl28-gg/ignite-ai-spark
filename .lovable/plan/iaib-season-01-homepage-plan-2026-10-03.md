# IAIB Season 01 homepage plan

## Scope for this build
Recreate `iaib-mock.html` as the homepage at `/`, preserving its exact section order, copy, palette, Poppins/Inter/JetBrains Mono typography, layout and spacing. Use the supplied HTML as the visual and editorial source of truth. Build mobile-first and inspect the result at 375px, 768px and 1440px. This phase is **static**: no animated sparks, smooth scrolling, ScrollTrigger effects, or simulated live changes. The reference screenshots mentioned in the message were not present among the available uploads; the HTML remains the authoritative reference unless they are supplied.

## Section components, in page order
1. **SiteNav** — IAIB mark, section links, registration CTA and the mock's registration status/countdown area.
2. **Hero** — Season 01 label, headline, supporting copy, CTAs, static spark-field backdrop, three demo statistics and support credits.
3. **Stakes** — four key figures and the “Only 100” statement.
4. **Journey** — four stages, dates, descriptions and ranks, with an unanimated connecting line.
5. **PartnersAndPrizes** — monochrome partner wordmarks/placeholders and the three prize descriptions.
6. **Curriculum** — six modules with accessible expandable session lists.
7. **StateBoard** — static state tiles and five demo school rankings, explicitly labelled as demo figures.
8. **Mentors** — eight named mentors with the clean initial-based placeholders from the mock; no invented portraits.
9. **RegistrationAndSparkCard** — the existing form copy, parental-consent checkbox and a local card preview showing first name and school only. Submission stays a clearly labelled demo and does not claim an email was sent.
10. **SchoolsAndParents** — both audience callouts and their original links.
11. **FAQ** — six accessible expandable questions and answers.
12. **ClosingAndFooter** — closing statement, CTA and original footer labels.

## Hero spark field: later motion phase
Use a 2D canvas, not WebGL: small device-scaled particles in the approved red-to-orange range are sufficient and less costly on mid-range Android phones. Cap pixel ratio and particle count, pause work when out of view and use no animation when `prefers-reduced-motion` is active. For this build, show a static field matching the mock's visual placement. Later, if canvas is unavailable, the device is low-end, or motion is reduced, keep that same static backdrop without a running render loop.

## Journey line: later motion phase
Keep the line and four nodes in normal responsive layout now. In the motion phase, register GSAP ScrollTrigger only on the client: map scroll progress across the journey section to the line's fill and activate nodes in sequence. On narrow screens, draw a vertical line along the stacked stages. Disable ScrollTrigger and show a complete, static line and legible nodes for reduced motion. Lenis can be introduced only with that motion phase and must not be necessary for navigation.

## Mock data and privacy
- **Counter:** 12,480 students, 214 schools and 19 states/UTs, with a static `#12,481` card sequence preview. Do not increment the numbers to imply a real feed.
- **State board:** the 36 state/UT labels and deterministic demo values from the supplied mock; the first 19 have nonzero counts, the remainder zero. **Schools:** the five names, cities and demo counts exactly as supplied.
- **Spark card:** local form state for first name, class and school; the mock's card preview can reflect those fields. Never show a student's full name or parent email on the card or rankings. Parent/guardian consent remains required on the form. No registration record, confirmation email or real allocation of Spark numbers is made in the static phase.
- Keep “demo data” visibly attached to every presented count/leaderboard. A future real registration flow requires storage, verified parental consent, and confirmation delivery before a real success state is shown.

## Technical implementation
Use TanStack Start's existing `/` route and React section components; preserve the site's existing router. Centralize the approved palette and typography in semantic Tailwind v4/CSS tokens. Reuse the existing design-system Button for actions and use native, accessible form/accordion semantics. Keep section CSS faithful to the mock while avoiding remote CSS imports; load the three font families through the root document head. Add homepage-specific title and social metadata. Check text wrapping, section proportions, state-grid density, form layout and overflow at all three requested widths.

## Not in this phase
No working signup, email delivery, real statistics, motion, or replacement photography. The mock's unconfirmed prize, finale and registration dates remain as provided, pending confirmation before production use.
