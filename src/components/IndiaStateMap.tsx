import { useEffect, useMemo, useState } from "react";
import { geoBounds, geoContains, geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import indiaBoundaries from "@/content/india-states.json";
import { states } from "@/content/iaib-data";

// Boundaries: Survey of India-derived SOI_States.parquet, republished by India Geodata
// (https://github.com/yashveeeeeeer/india-geodata/releases/tag/admin/states), CC BY 4.0.
// Simplified locally at 0.014 degrees. This is an attributed derivative, not an official certified map.
const boundaries = indiaBoundaries as FeatureCollection<Geometry, { name: string }>;
const sourceNames: Record<string, string> = {
  "J&K": "JAMMU AND KASHMIR", "Arunachal": "ARUNACHAL PRADESH",
  "A&N Islands": "ANDAMAN & NICOBAR", "DNH & DD": "DADRA & NAGAR HAVELI & DAMAN & DIU",
};
const initialCounts = Object.fromEntries(states.map((name, index) => [name, index < 19 ? Math.round(2400 * Math.pow(.82, index) + 40) : 0])) as Record<string, number>;
const compactStates = new Set(["Goa", "Delhi", "Sikkim", "Tripura", "Puducherry", "Chandigarh", "Lakshadweep", "A&N Islands"]);

export function IndiaStateMap() {
  const [counts, setCounts] = useState(initialCounts);
  const [active, setActive] = useState<string | null>(null);
  const [spark, setSpark] = useState<{ x: number; y: number; id: number } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const { shapes, projection } = useMemo(() => {
    const projection = geoMercator().fitExtent([[28, 12], [572, 530]], boundaries);
    const path = geoPath(projection);
    return {
      projection,
      shapes: states.map((name) => {
        const feature = boundaries.features.find((item) => item.properties.name === (sourceNames[name] ?? name.toUpperCase()));
        if (!feature) return null;
        const centroid = path.centroid(feature);
        const fallback = projection([...(geoBounds(feature)[0])] as [number, number]);
        const center = centroid.every(Number.isFinite) ? centroid : fallback ?? [300, 260];
        return { name, feature, path: path(feature) ?? "", center };
      }).filter((shape): shape is NonNullable<typeof shape> => shape !== null),
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let step = 0;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const target = shapes[step % 19];
      step += 1;
      if (!target) return;
      setCounts((previous) => ({ ...previous, [target.name]: (previous[target.name] ?? 0) + 1 }));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setFlash(target.name);
      // Sample inside the chosen polygon; a centroid alone can fall outside multipart islands.
      const [westSouth, eastNorth] = geoBounds(target.feature);
      let point = target.center;
      for (let i = 0; i < 80; i += 1) {
        const candidate: [number, number] = [westSouth[0] + Math.random() * (eastNorth[0] - westSouth[0]), westSouth[1] + Math.random() * (eastNorth[1] - westSouth[1])];
        if (geoContains(target.feature, candidate)) {
          point = projection(candidate) ?? target.center;
          break;
        }
      }
      setSpark({ x: point[0], y: point[1], id: step });
    }, 2600);
    return () => window.clearInterval(timer);
  }, [shapes, projection]);

  const highest = Math.max(...Object.values(counts));
  const lit = Object.values(counts).filter((count) => count > 0).length;
  const selected = shapes.find((shape) => shape.name === active);
  return <div className="india-board">
    <div className="india-map-wrap" onPointerLeave={() => setActive(null)}>
      <svg className="india-map" viewBox="0 0 600 550" role="group" aria-label="Interactive map of registrations by Indian state and union territory, demo data">
        {shapes.map(({ name, path }) => <path key={name} d={path} className={`map-state${flash === name ? " map-flash" : ""}`} style={{ "--map-heat": `${Math.round((counts[name] ?? 0) / highest * 100)}%` } as React.CSSProperties}
          onAnimationEnd={() => { if (flash === name) setFlash(null); }}
          onPointerEnter={() => setActive(name)} onClick={() => setActive(name)} onFocus={() => setActive(name)}
          tabIndex={0} role="button" aria-label={`${name}, ${(counts[name] ?? 0).toLocaleString("en-IN")} students, demo data`} />)}
        {shapes.filter(({ name }) => compactStates.has(name)).map(({ name, center }) => <circle key={`hit-${name}`} className="map-hit" cx={center[0]} cy={center[1]} r="13"
          onPointerEnter={() => setActive(name)} onClick={() => setActive(name)} aria-hidden="true" />)}
        {spark && !reduced && <circle key={spark.id} className="map-spark" cx={spark.x} cy={spark.y} r="2" onAnimationEnd={() => setSpark(null)} aria-hidden="true" />}
      </svg>
      {selected && <div className="map-tooltip" role="status" style={{ left: `${selected.center[0] / 6}%`, top: `${selected.center[1] / 5.5}%` }}>{selected.name} · {(counts[selected.name] ?? 0).toLocaleString("en-IN")} students</div>}
    </div>
    <div className="map-scale" aria-label={`Registration density from zero to ${highest.toLocaleString("en-IN")}`}><span>0</span><div className="map-ramp" /><span>{highest.toLocaleString("en-IN")}</span></div>
    <p className="map-lit">{lit} of 36 states and UTs are lit.</p>
     <div className="map-accessible-table sr-only"><table><caption>Demo registrations by state and union territory</caption><thead><tr><th scope="col">State or UT</th><th scope="col">Students</th></tr></thead><tbody>{states.map((name) => <tr key={name}><th scope="row">{name}</th><td>{(counts[name] ?? 0).toLocaleString("en-IN")}</td></tr>)}</tbody></table></div>
  </div>;
}