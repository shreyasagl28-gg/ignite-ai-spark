import { useEffect, useRef, useState } from "react";
import { modules } from "@/content/iaib-data";

/**
 * Curriculum as a scroll story. On desktop the module's object stays pinned on
 * the left and changes as each module scrolls past on the right. On phones and
 * under reduced motion every module simply carries its own image.
 */
const art = ["mod-01-foundations", "mod-02-python", "mod-03-llms", "mod-04-agents", "mod-05-vibe", "mod-06-finale"];
const src = (name: string) => `/art/${name}.webp`;
const srcSet = (name: string) => `/art/${name}-sm.webp 512w, /art/${name}.webp 1024w`;

export function CurriculumStory() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = itemRefs.current.indexOf(entry.target as HTMLLIElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of itemRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="cs">
      <div className="cs-media" aria-hidden="true">
        <div className="cs-frame">
          {art.map((name, i) => (
            <img key={name} className={i === active ? "on" : undefined} src={src(name)} srcSet={srcSet(name)} sizes="(max-width: 900px) 90vw, 45vw" alt="" width={1024} height={1024} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
          ))}
        </div>
        <div className="cs-progress">
          <span className="cs-count">{String(active + 1).padStart(2, "0")} / {String(modules.length).padStart(2, "0")}</span>
          <span className="cs-bars">{modules.map((m, i) => <i key={m[0]} className={i <= active ? "on" : undefined} />)}</span>
        </div>
      </div>

      <ol className="cs-list">
        {modules.map(([name, sessions, description, topics], i) => (
          <li key={name} ref={(el) => { itemRefs.current[i] = el; }} className={`cs-item${i === active ? " on" : ""}`}>
            <img className="cs-item-img" src={src(art[i]!)} srcSet={srcSet(art[i]!)} sizes="90vw" alt="" width={1024} height={1024} loading="lazy" decoding="async" />
            <p className="cs-meta"><span className="cs-num">{String(i + 1).padStart(2, "0")}</span>{sessions}</p>
            <h3>{name}</h3>
            <p className="cs-desc">{description}</p>
            <ul className="cs-topics">{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
