import { useRef, type MouseEvent, type ReactNode } from "react";

/**
 * A box with a soft red light that follows the cursor on hover.
 * Dark by default; pass tone="light" for paper sections.
 */
export function SpotlightCard({
  children,
  className = "",
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  const base =
    tone === "dark"
      ? "border-[#2A2A2D] bg-[#141416] text-[#F4F3EF]"
      : "border-[#E3E3DE] bg-white text-[#1A1A1A]";
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-3xl border transition-colors duration-300 hover:border-[#E50913]/40 ${base} ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(229,9,19,0.16), transparent 60%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
