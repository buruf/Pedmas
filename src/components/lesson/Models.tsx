/**
 * Visual models for whole-number arithmetic.
 *
 * Base-ten blocks are the standard concrete model for place value, and every
 * regrouping idea in 2- and 3-digit arithmetic is really a statement about
 * trading blocks: ten ones for one ten, one ten for ten ones. Showing the
 * trade is what makes "carrying" and "borrowing" mean something rather than
 * being a rule to memorise.
 */
import { MathText } from "@/components/MathText";

const U = 7; // one unit cube edge
const GAP = 3;
const ROD_H = U * 10;

const COLOURS = {
  hundreds: "#7c3aed",
  tens: "#0d9488",
  ones: "#d97706",
  ghost: "#cbd5e1",
} as const;

/** A column of `n` unit cubes, wrapping every 5 so it stays short. */
function OnesCluster({ n, x, colour }: { n: number; x: number; colour: string }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const col = Math.floor(i / 5);
        const row = i % 5;
        return (
          <rect
            key={i}
            x={x + col * (U + GAP)}
            y={ROD_H - (row + 1) * (U + GAP) + GAP}
            width={U}
            height={U}
            rx="1"
            fill={colour}
          />
        );
      })}
    </g>
  );
}

/**
 * Base-ten blocks for a number. `trade` optionally rings a group of ten ones
 * to show the ten about to be exchanged.
 */
export function BaseTen({
  hundreds = 0,
  tens = 0,
  ones = 0,
  label,
  ringOnes = 0,
  faded = false,
}: {
  hundreds?: number;
  tens?: number;
  ones?: number;
  label?: string;
  /** Draw a ring around the first N ones — the ten being traded. */
  ringOnes?: number;
  faded?: boolean;
}) {
  const flatW = U * 10;
  const onesCols = Math.ceil(ones / 5);
  const width =
    hundreds * (flatW + GAP * 2) +
    tens * (U + GAP) +
    onesCols * (U + GAP) +
    (hundreds ? 8 : 0) +
    (tens ? 8 : 0) +
    6;
  const opacity = faded ? 0.35 : 1;
  let x = 2;
  const hx = x;
  x += hundreds * (flatW + GAP * 2) + (hundreds ? 8 : 0);
  const tx = x;
  x += tens * (U + GAP) + (tens ? 8 : 0);
  const ox = x;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${Math.max(width, 40)} ${ROD_H + 4}`}
        width="100%"
        style={{ maxWidth: Math.max(width, 40) * 1.6 }}
        role="img"
        aria-label={label ?? `${hundreds} hundreds, ${tens} tens, ${ones} ones`}
        opacity={opacity}
      >
        {/* hundreds — flats */}
        {Array.from({ length: hundreds }, (_, i) => (
          <g key={i}>
            <rect
              x={hx + i * (flatW + GAP * 2)}
              y={0}
              width={flatW}
              height={ROD_H}
              rx="2"
              fill={COLOURS.hundreds}
            />
            {Array.from({ length: 9 }, (_, k) => (
              <line
                key={k}
                x1={hx + i * (flatW + GAP * 2)}
                y1={(k + 1) * U}
                x2={hx + i * (flatW + GAP * 2) + flatW}
                y2={(k + 1) * U}
                stroke="#fff"
                strokeWidth="0.6"
              />
            ))}
          </g>
        ))}
        {/* tens — rods */}
        {Array.from({ length: tens }, (_, i) => (
          <g key={i}>
            <rect x={tx + i * (U + GAP)} y={0} width={U} height={ROD_H} rx="1.5" fill={COLOURS.tens} />
            {Array.from({ length: 9 }, (_, k) => (
              <line
                key={k}
                x1={tx + i * (U + GAP)}
                y1={(k + 1) * U}
                x2={tx + i * (U + GAP) + U}
                y2={(k + 1) * U}
                stroke="#fff"
                strokeWidth="0.6"
              />
            ))}
          </g>
        ))}
        {/* ones — cubes */}
        <OnesCluster n={ones} x={ox} colour={COLOURS.ones} />
        {ringOnes > 0 && (
          <rect
            x={ox - 2.5}
            y={ROD_H - Math.min(ringOnes, 5) * (U + GAP) - 0.5}
            width={Math.ceil(ringOnes / 5) * (U + GAP) + 3}
            height={Math.min(ringOnes, 5) * (U + GAP) + 3}
            rx="3"
            fill="none"
            stroke="#e11d48"
            strokeWidth="1.6"
            strokeDasharray="3 2"
          />
        )}
      </svg>
      {label && (
        <figcaption className="mt-1 text-sm font-semibold text-ink-700">
          <MathText text={label} />
        </figcaption>
      )}
    </figure>
  );
}

/** Small legend so a parent or child knows what the colours mean. */
export function BaseTenKey() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-ink-700">
      {[
        ["hundreds", "hundred"],
        ["tens", "ten"],
        ["ones", "one"],
      ].map(([k, name]) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block rounded-sm"
            style={{
              background: COLOURS[k as keyof typeof COLOURS],
              width: k === "hundreds" ? 14 : k === "tens" ? 5 : 8,
              height: k === "ones" ? 8 : 14,
            }}
          />
          1 {name}
        </span>
      ))}
    </div>
  );
}

/**
 * The vertical algorithm, laid out in place-value columns so the written
 * method lines up with the blocks above it.
 */
export function ColumnSum({
  top,
  bottom,
  op,
  answer,
  carries = {},
  highlight,
  strikeTop = {},
}: {
  top: number;
  bottom: number;
  op: "+" | "−";
  answer?: number;
  /** column index from the right (0 = ones) -> small digit shown above */
  carries?: Record<number, string>;
  /** column index from the right to highlight */
  highlight?: number;
  /** column index -> replacement digit, for showing a regrouped top row */
  strikeTop?: Record<number, string>;
}) {
  const width = Math.max(String(top).length, String(bottom).length, String(answer ?? "").length);
  const cols = Array.from({ length: width }, (_, i) => width - 1 - i); // left..right index from right
  const digit = (n: number, place: number) => {
    const s = String(n);
    const idx = s.length - 1 - place;
    return idx >= 0 ? s[idx] : "";
  };
  const cell = (content: React.ReactNode, place: number, extra = "") => (
    <td
      key={place}
      className={`px-2 text-center tabular-nums ${
        highlight === place ? "rounded-md bg-warn-100" : ""
      } ${extra}`}
    >
      {content}
    </td>
  );

  return (
    <table className="mx-auto border-collapse text-2xl font-bold text-ink-900">
      <tbody>
        <tr className="text-sm text-err-600">
          <td />
          {cols.map((p) => cell(carries[p] ?? "", p))}
        </tr>
        <tr>
          <td />
          {cols.map((p) =>
            cell(
              strikeTop[p] !== undefined ? (
                <span>
                  <span className="text-base text-ink-300 line-through">{digit(top, p)}</span>
                  <span className="ml-0.5 text-err-600">{strikeTop[p]}</span>
                </span>
              ) : (
                digit(top, p)
              ),
              p
            )
          )}
        </tr>
        <tr className="border-b-2 border-ink-900">
          <td className="pr-1 text-ink-500">{op}</td>
          {cols.map((p) => cell(digit(bottom, p), p, "pb-1"))}
        </tr>
        {answer !== undefined && (
          <tr className="text-ok-600">
            <td />
            {cols.map((p) => cell(digit(answer, p), p, "pt-1"))}
          </tr>
        )}
      </tbody>
    </table>
  );
}

/**
 * Area model: a rectangle split by place value, which is what makes
 * multi-digit multiplication a set of facts the child already knows.
 */
export function AreaModel({
  rows,
  parts,
  showProducts = true,
}: {
  rows: number;
  /** the multiplicand split by place value, e.g. [20, 4] */
  parts: number[];
  showProducts?: boolean;
}) {
  const total = parts.reduce((a, b) => a + b, 0);
  return (
    <div className="mx-auto max-w-sm">
      <div className="flex items-stretch gap-2">
        <div className="flex w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-lg font-bold text-brand-700">
          {rows}
        </div>
        <div className="flex flex-1 gap-1.5">
          {parts.map((p, i) => (
            <div
              key={i}
              className="rounded-lg border-2 border-brand-300 bg-brand-50 px-2 py-4 text-center"
              style={{ flexGrow: p / total }}
            >
              <div className="text-sm font-semibold text-ink-500">{p}</div>
              {showProducts && (
                <div className="mt-1 text-lg font-black text-brand-700">{rows * p}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showProducts && (
        <p className="mt-2 text-center text-sm font-semibold text-ink-700">
          {parts.map((p) => rows * p).join(" + ")} = {rows * total}
        </p>
      )}
    </div>
  );
}

/** Equal groups for sharing — the concrete meaning of division. */
export function ShareGroups({
  groups,
  tensEach,
  onesEach,
  label,
}: {
  groups: number;
  tensEach: number;
  onesEach: number;
  label?: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: groups }, (_, i) => (
          <div key={i} className="rounded-xl border-2 border-dashed border-ink-300 bg-paper p-2">
            <BaseTen tens={tensEach} ones={onesEach} />
          </div>
        ))}
      </div>
      {label && (
        <p className="mt-2 text-center text-sm font-semibold text-ink-700">
          <MathText text={label} />
        </p>
      )}
    </div>
  );
}
