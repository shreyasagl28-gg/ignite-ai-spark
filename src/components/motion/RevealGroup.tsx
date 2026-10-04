import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

/**
 * RevealGroup / RevealItem — quiet scroll reveals for a row or grid of cards.
 * Content renders visible in SSR (no-JS safe); with motion allowed, items hide
 * on mount and fade up together when the group enters the viewport, staggered
 * by 80ms per card. Standalone items (no group box, e.g. inside the horizontal
 * track) observe themselves instead.
 */
type GroupApi = {
  container: React.RefObject<HTMLDivElement | null>;
  register: (el: HTMLElement) => number;
  unregister: (el: HTMLElement) => void;
};

const GroupContext = createContext<GroupApi | null>(null);

const canAnimate = () =>
  typeof window !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  typeof IntersectionObserver !== "undefined";

const arm = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  // Never arm content already scrolled past or parked offscreen horizontally.
  if (rect.bottom < 0) return false;
  if (rect.left >= window.innerWidth || rect.right <= 0) return false;
  el.classList.add("reveal-armed");
  return true;
};

export function RevealGroup({ children, className, bare = false }: { children: ReactNode; className?: string; bare?: boolean }) {
  const container = useRef<HTMLDivElement | null>(null);
  const items = useRef(new Map<HTMLElement, number>());

  const api = useRef<GroupApi>({
    container,
    register: (el) => {
      let index = items.current.get(el);
      if (index === undefined) {
        index = items.current.size;
        items.current.set(el, index);
      }
      return index;
    },
    unregister: (el) => {
      items.current.delete(el);
    },
  }).current;

  useEffect(() => {
    if (bare || !canAnimate()) return;
    const groupEl = container.current;
    const entries = [...items.current.entries()].filter(([, index]) => index >= 0).filter(([el]) => el.isConnected);
    if (!groupEl || !entries.length) return;
    // Observe the group box only; the armed/in classes belong to the cards.
    if (groupEl.getBoundingClientRect().bottom < 0) return;
    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (!observerEntries.some((entry) => entry.isIntersecting)) return;
        for (const [el, index] of entries) {
          el.style.transitionDelay = `${index * 80}ms`;
          el.classList.add("reveal-in");
        }
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(groupEl);
    return () => observer.disconnect();
  }, [bare]);

  return (
    <GroupContext.Provider value={api}>
      {bare ? children : <div ref={container} className={className}>{children}</div>}
    </GroupContext.Provider>
  );
}

export function RevealItem({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const group = useContext(GroupContext);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canAnimate()) return;
    const managed = group && group.container.current;
    if (managed) {
      group!.register(el);
      return () => group!.unregister(el);
    }
    if (!arm(el)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        el.classList.add("reveal-in");
        observer.disconnect();
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [group]);

  return <div ref={ref} className="reveal-item">{children}</div>;
}
