/**
 * Rewards beyond money, each with a pixel icon in the Sparkbot style.
 * Icons are 12×12 maps: "#" body, "r" red accent, "." empty.
 */
const ICONS: Record<string, string[]> = {
  letter: [
    "............",
    "############",
    "##........##",
    "#.#......#.#",
    "#..#....#..#",
    "#...#..#...#",
    "#....rr....#",
    "#....rr....#",
    "#..........#",
    "############",
    "............",
    "............",
  ],
  certificate: [
    "############",
    "#..........#",
    "#.########.#",
    "#..........#",
    "#.######...#",
    "#..........#",
    "#......rr..#",
    "#.....rrrr.#",
    "######rrrr##",
    "......r..r..",
    "......r..r..",
    "............",
  ],
  hoodie: [
    "....####....",
    "...#....#...",
    "..##.rr.##..",
    ".####rr####.",
    "############",
    "##.######.##",
    "##.######.##",
    "##.##rr##.##",
    "##.##rr##.##",
    "...######...",
    "...######...",
    "............",
  ],
};

function PixelIcon({ name }: { name: keyof typeof ICONS }) {
  const map = ICONS[name]!;
  return (
    <svg viewBox="0 0 12 12" className="perk-icon" aria-hidden="true" shapeRendering="crispEdges">
      {map.flatMap((row, y) => [...row].map((ch, x) => ch === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className={ch === "r" ? "px-red" : "px-body"} />))}
    </svg>
  );
}

const PERKS: Array<{ icon: keyof typeof ICONS; title: string; body: string }> = [
  { icon: "letter", title: "Letters of recommendation", body: "For standout builders, to strengthen college and internship applications." },
  { icon: "certificate", title: "Certificates", body: "A certificate for every student who completes the learning sessions." },
  { icon: "hoodie", title: "IAIB goodies", body: "Hoodies and goodies for finalists in Bengaluru." },
];

export function Perks() {
  return (
    <div className="perks">
      <p className="sk-label perks-label">More than money</p>
      <ul className="perks-grid">
        {PERKS.map((perk) => (
          <li key={perk.title} className="perk">
            <PixelIcon name={perk.icon} />
            <div>
              <h3>{perk.title}</h3>
              <p>{perk.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
