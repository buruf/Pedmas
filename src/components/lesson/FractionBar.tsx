/**
 * Visual fraction models.
 *
 * These exist because a child cannot learn fractions from notation alone — the
 * whole point of the Concrete → Visual → Symbolic progression is that the
 * picture carries the meaning before the symbols do. Plain SVG so it stays
 * sharp, costs no request and renders on a cheap phone.
 */
import { MathText } from "@/components/MathText";

const SHADE = {
  brand: { fill: "#7c3aed", soft: "#ede9fe" },
  teal: { fill: "#0d9488", soft: "#ccfbf1" },
  amber: { fill: "#d97706", soft: "#fef3c7" },
  rose: { fill: "#e11d48", soft: "#ffe4e6" },
} as const;

export type ShadeName = keyof typeof SHADE;

/**
 * A bar cut into `parts` equal pieces with `shaded` of them filled.
 * `ghost` draws extra pieces as outlines only — used to show a total that
 * overflows the whole, or the pieces still needed.
 */
export function FractionBar({
  parts,
  shaded,
  shade = "brand",
  label,
  width = 280,
  height = 46,
  showTicks = true,
}: {
  parts: number;
  shaded: number;
  shade?: ShadeName;
  label?: string;
  width?: number;
  height?: number;
  showTicks?: boolean;
}) {
  const c = SHADE[shade];
  const w = width / parts;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width }}
        role="img"
        aria-label={label ?? `${shaded} out of ${parts} equal parts shaded`}
      >
        <rect x="0" y="0" width={width} height={height} rx="6" fill={c.soft} />
        {Array.from({ length: parts }, (_, i) => (
          <rect
            key={i}
            x={i * w}
            y={0}
            width={w}
            height={height}
            rx={parts > 12 ? 0 : 3}
            fill={i < shaded ? c.fill : "transparent"}
          />
        ))}
        {showTicks &&
          Array.from({ length: parts - 1 }, (_, i) => (
            <line
              key={i}
              x1={(i + 1) * w}
              y1="0"
              x2={(i + 1) * w}
              y2={height}
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}
        <rect
          x="0.75"
          y="0.75"
          width={width - 1.5}
          height={height - 1.5}
          rx="6"
          fill="none"
          stroke={c.fill}
          strokeWidth="1.5"
        />
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
          <MathText text={label} />
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Two bars stacked so unequal piece sizes are obvious at a glance. This is the
 * picture that makes "you cannot add quarters to halves yet" self-evident.
 */
export function FractionCompare({
  rows,
  width = 280,
}: {
  rows: { parts: number; shaded: number; shade?: ShadeName; label: string }[];
  width?: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <FractionBar
          key={i}
          parts={r.parts}
          shaded={r.shaded}
          shade={r.shade ?? "brand"}
          label={r.label}
          width={width}
        />
      ))}
    </div>
  );
}
