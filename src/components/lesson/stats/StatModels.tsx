/**
 * Visual models for statistics and probability.
 *
 * Statistics is the one strand where the picture *is* the mathematics: a mean
 * is a levelling of bars, a median is a position in a line, correlation is the
 * shape of a cloud of dots, and a probability is an area you can point at.
 * Describing those in words gives a child nothing to check their thinking
 * against, so every idea in this tranche is taught against a drawn display.
 *
 * These live beside the statistics lessons rather than in `Models.tsx` because
 * nothing outside this folder needs a dice grid or a scatter plot.
 */
import { MathText } from "@/components/MathText";

const PALETTE = {
  brand: "#7c3aed",
  teal: "#0d9488",
  amber: "#d97706",
  rose: "#e11d48",
  sky: "#0284c7",
  grey: "#94a3b8",
} as const;

export type StatColour = keyof typeof PALETTE;

const GRID = "#cbd5e1";
const AXIS = "#475569";
const LABEL = "#475569";
const DARK = "#0f172a";

function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
      <MathText text={text} />
    </figcaption>
  );
}

/**
 * Bar chart with an explicit axis.
 *
 * `from` exists so a lesson can draw the *same* data honestly and dishonestly:
 * a bar chart only lets you compare lengths when the axis starts at zero, and
 * that is impossible to argue in words but obvious in two pictures.
 */
export function BarChart({
  bars,
  from = 0,
  to,
  step,
  meanLine,
  meanLabel,
  showValues = true,
  title,
  caption,
  width = 300,
  axisWidth = 34,
}: {
  bars: { label: string; value: number; colour?: StatColour }[];
  /** where the value axis starts — not always zero, deliberately */
  from?: number;
  to: number;
  step: number;
  /** dashed reference line, used to show the mean levelling the bars */
  meanLine?: number;
  meanLabel?: string;
  showValues?: boolean;
  title?: string;
  caption?: string;
  width?: number;
  axisWidth?: number;
}) {
  const W = width;
  const H = 172;
  const padL = axisWidth;
  const padR = 10;
  const padT = title ? 24 : 14;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const y = (v: number) => padT + plotH * (1 - (v - from) / (to - from));
  const slot = plotW / bars.length;
  const bw = Math.min(40, slot * 0.6);

  const ticks: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) ticks.push(Math.round(v * 1000) / 1000);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label={title ?? `bar chart of ${bars.map((b) => `${b.label} ${b.value}`).join(", ")}`}
      >
        {title && (
          <text x={W / 2} y={13} fontSize="11" fontWeight="700" textAnchor="middle" fill={DARK}>
            {title}
          </text>
        )}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 4} y={y(t) + 3} fontSize="9" textAnchor="end" fill={LABEL}>
              {t}
            </text>
          </g>
        ))}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={AXIS} strokeWidth="1.5" />
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke={AXIS} strokeWidth="1.5" />
        {bars.map((b, i) => {
          const cx = padL + slot * (i + 0.5);
          const top = y(Math.min(b.value, to));
          const h = Math.max(0, padT + plotH - top);
          return (
            <g key={`${b.label}-${i}`}>
              <rect
                x={cx - bw / 2}
                y={top}
                width={bw}
                height={h}
                rx="2"
                fill={PALETTE[b.colour ?? "brand"]}
              />
              {showValues && (
                <text x={cx} y={top - 3} fontSize="9.5" fontWeight="700" textAnchor="middle" fill={DARK}>
                  {b.value}
                </text>
              )}
              <text x={cx} y={padT + plotH + 13} fontSize="9" textAnchor="middle" fill={LABEL}>
                {b.label}
              </text>
            </g>
          );
        })}
        {meanLine !== undefined && (
          <g>
            <line
              x1={padL}
              y1={y(meanLine)}
              x2={W - padR}
              y2={y(meanLine)}
              stroke={PALETTE.rose}
              strokeWidth="1.8"
              strokeDasharray="5 3"
            />
            <text
              x={W - padR}
              y={y(meanLine) - 4}
              fontSize="9.5"
              fontWeight="700"
              textAnchor="end"
              fill={PALETTE.rose}
            >
              {meanLabel ?? `mean ${meanLine}`}
            </text>
          </g>
        )}
      </svg>
      <Caption text={caption} />
    </figure>
  );
}

/**
 * Picture graph. The key is drawn as loudly as the rows, because the whole
 * difficulty of a pictograph is that the count of symbols is not the answer.
 */
export function Pictograph({
  title,
  icon,
  rows,
  keyValue,
  noun,
  caption,
}: {
  title?: string;
  icon: string;
  /** `symbols` may be a half, e.g. 3.5 */
  rows: { label: string; symbols: number }[];
  keyValue: number;
  noun: string;
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div className="rounded-2xl border-2 border-ink-100 bg-white p-3">
        {title && <div className="mb-2 text-center text-sm font-bold text-ink-900">{title}</div>}
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-right text-xs font-semibold text-ink-700">{r.label}</span>
              <span className="flex items-center gap-0.5 text-lg leading-none">
                {Array.from({ length: Math.floor(r.symbols) }, (_, i) => (
                  <span key={i}>{icon}</span>
                ))}
                {r.symbols % 1 !== 0 && (
                  <span className="inline-block overflow-hidden" style={{ width: "0.5em" }}>
                    {icon}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-warn-100 px-2 py-1.5 text-center text-xs font-bold text-ink-900">
          Key: {icon} = {keyValue} {noun}
        </div>
      </div>
      <Caption text={caption} />
    </figure>
  );
}

/**
 * Line plot (dot plot). Each ✕ is one item of data, so the plot shows two
 * different numbers at once — what was measured, along the bottom, and how
 * often it happened, up the stack.
 */
export function DotPlot({
  from,
  to,
  counts,
  axisLabel,
  title,
  caption,
  highlight,
  width = 300,
}: {
  from: number;
  to: number;
  /** one count per value from `from` to `to` inclusive */
  counts: number[];
  axisLabel?: string;
  title?: string;
  caption?: string;
  /** value whose column is ringed */
  highlight?: number;
  width?: number;
}) {
  const W = width;
  const padL = 18;
  const padR = 12;
  const padT = title ? 22 : 10;
  const dotH = 13;
  const maxCount = Math.max(1, ...counts);
  const baseY = padT + maxCount * dotH + 6;
  const H = baseY + (axisLabel ? 32 : 20);
  const n = to - from + 1;
  const slot = (W - padL - padR) / n;
  const x = (i: number) => padL + slot * (i + 0.5);
  const r = 4;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label={title ?? "line plot"}
      >
        {title && (
          <text x={W / 2} y={13} fontSize="11" fontWeight="700" textAnchor="middle" fill={DARK}>
            {title}
          </text>
        )}
        {highlight !== undefined && (
          <rect
            x={x(highlight - from) - slot / 2 + 2}
            y={padT - 2}
            width={slot - 4}
            height={baseY - padT + 4}
            rx="5"
            fill="none"
            stroke={PALETTE.rose}
            strokeWidth="1.6"
            strokeDasharray="4 3"
          />
        )}
        <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke={AXIS} strokeWidth="1.5" />
        {counts.map((c, i) => (
          <g key={i}>
            <line x1={x(i)} y1={baseY} x2={x(i)} y2={baseY + 4} stroke={AXIS} strokeWidth="1.2" />
            <text x={x(i)} y={baseY + 15} fontSize="10" fontWeight="700" textAnchor="middle" fill={LABEL}>
              {from + i}
            </text>
            {Array.from({ length: c }, (_, k) => {
              const cy = baseY - 8 - k * dotH;
              return (
                <g key={k} stroke={PALETTE.brand} strokeWidth="2" strokeLinecap="round">
                  <line x1={x(i) - r} y1={cy - r} x2={x(i) + r} y2={cy + r} />
                  <line x1={x(i) - r} y1={cy + r} x2={x(i) + r} y2={cy - r} />
                </g>
              );
            })}
          </g>
        ))}
        {axisLabel && (
          <text x={W / 2} y={H - 4} fontSize="9.5" textAnchor="middle" fill={LABEL}>
            {axisLabel}
          </text>
        )}
      </svg>
      <Caption text={caption} />
    </figure>
  );
}

/**
 * Scatter plot, with an optional line of best fit and an optional prediction
 * drawn as dashed guides so "read off the line" is something a child can see
 * happening rather than a phrase.
 */
export function ScatterPlot({
  points,
  xMax,
  yMax,
  xStep,
  yStep,
  xLabel,
  yLabel,
  line,
  predict,
  title,
  caption,
  width = 300,
}: {
  points: { x: number; y: number }[];
  xMax: number;
  yMax: number;
  xStep: number;
  yStep: number;
  xLabel?: string;
  yLabel?: string;
  /** y = m x + b, drawn right across the plot */
  line?: { m: number; b: number };
  /** an x value to read off the line */
  predict?: number;
  title?: string;
  caption?: string;
  width?: number;
}) {
  const W = width;
  const H = 200;
  const padL = 32;
  const padR = 12;
  const padT = title ? 24 : 12;
  const padB = yLabel || xLabel ? 34 : 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const px = (v: number) => padL + (v / xMax) * plotW;
  const py = (v: number) => padT + plotH * (1 - v / yMax);

  const xTicks: number[] = [];
  for (let v = 0; v <= xMax + 1e-9; v += xStep) xTicks.push(Math.round(v * 100) / 100);
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax + 1e-9; v += yStep) yTicks.push(Math.round(v * 100) / 100);

  const predY = line && predict !== undefined ? line.m * predict + line.b : undefined;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label={title ?? "scatter plot"}
      >
        {title && (
          <text x={W / 2} y={13} fontSize="11" fontWeight="700" textAnchor="middle" fill={DARK}>
            {title}
          </text>
        )}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={padL} y1={py(t)} x2={W - padR} y2={py(t)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 4} y={py(t) + 3} fontSize="8.5" textAnchor="end" fill={LABEL}>
              {t}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={`x${t}`} x={px(t)} y={padT + plotH + 12} fontSize="8.5" textAnchor="middle" fill={LABEL}>
            {t}
          </text>
        ))}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={AXIS} strokeWidth="1.5" />
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke={AXIS} strokeWidth="1.5" />
        {line && (
          <line
            x1={px(0)}
            y1={py(Math.min(line.b, yMax))}
            x2={px(xMax)}
            y2={py(Math.min(line.m * xMax + line.b, yMax))}
            stroke={PALETTE.teal}
            strokeWidth="2"
          />
        )}
        {points.map((p, i) => (
          <circle key={i} cx={px(p.x)} cy={py(p.y)} r="3.6" fill={PALETTE.brand} />
        ))}
        {predY !== undefined && predict !== undefined && (
          <g>
            <line
              x1={px(predict)}
              y1={padT + plotH}
              x2={px(predict)}
              y2={py(predY)}
              stroke={PALETTE.rose}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <line
              x1={padL}
              y1={py(predY)}
              x2={px(predict)}
              y2={py(predY)}
              stroke={PALETTE.rose}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <circle cx={px(predict)} cy={py(predY)} r="4" fill="#fff" stroke={PALETTE.rose} strokeWidth="2" />
          </g>
        )}
        {xLabel && (
          <text x={padL + plotW / 2} y={H - 4} fontSize="9" textAnchor="middle" fill={LABEL}>
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text x={6} y={padT + plotH / 2} fontSize="9" textAnchor="middle" fill={LABEL} transform={`rotate(-90 6 ${padT + plotH / 2})`}>
            {yLabel}
          </text>
        )}
      </svg>
      <Caption text={caption} />
    </figure>
  );
}

/**
 * A spinner drawn as equal sectors. Equal sectors are the point: they are what
 * makes each outcome equally likely, and what a "two outcomes so it is a half"
 * argument quietly assumes without checking.
 */
export function Spinner({
  sections,
  caption,
  size = 130,
}: {
  sections: { label: string; colour: StatColour }[];
  caption?: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2 + 6;
  const r = size / 2 - 10;
  const n = sections.length;
  const sweep = (2 * Math.PI) / n;
  const point = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${size} ${size + 10}`}
        width="100%"
        style={{ maxWidth: size }}
        role="img"
        aria-label={`spinner with ${n} equal sections`}
      >
        {sections.map((s, i) => {
          const a0 = -Math.PI / 2 + i * sweep;
          const a1 = a0 + sweep;
          const [x0, y0] = point(a0);
          const [x1, y1] = point(a1);
          const [lx, ly] = [
            cx + r * 0.6 * Math.cos(a0 + sweep / 2),
            cy + r * 0.6 * Math.sin(a0 + sweep / 2),
          ];
          return (
            <g key={i}>
              <path
                d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`}
                fill={PALETTE[s.colour]}
                stroke="#fff"
                strokeWidth="1.5"
              />
              <text x={lx} y={ly + 3} fontSize="10" fontWeight="700" textAnchor="middle" fill="#fff">
                {s.label}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="4" fill="#fff" stroke={AXIS} strokeWidth="1.5" />
        <path d={`M ${cx - 6} 4 L ${cx + 6} 4 L ${cx} 14 Z`} fill={AXIS} />
      </svg>
      <Caption text={caption} />
    </figure>
  );
}

/** Coloured counters in a bag — the concrete version of "out of how many?". */
export function Counters({
  groups,
  caption,
}: {
  groups: { n: number; colour: StatColour; label?: string }[];
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-ink-300 bg-paper p-3">
        {groups.map((g, gi) =>
          Array.from({ length: g.n }, (_, i) => (
            <span
              key={`${gi}-${i}`}
              className="inline-block h-5 w-5 rounded-full"
              style={{ background: PALETTE[g.colour] }}
            />
          ))
        )}
      </div>
      <Caption text={caption} />
    </figure>
  );
}

/**
 * Two-stage tree. Used for coins and for the counting principle, so the
 * probabilities are optional — without them it is simply a picture of every
 * way a pair of choices can be made.
 */
export function ProbTree({
  stage1,
  stage2,
  leafLabel,
  leafProb,
  highlight = [],
  caption,
  width = 300,
}: {
  stage1: { label: string; prob?: string }[];
  stage2: { label: string; prob?: string }[];
  leafLabel?: (a: string, b: string) => string;
  leafProb?: (i: number, j: number) => string;
  /** leaf labels drawn in the highlight colour */
  highlight?: string[];
  caption?: string;
  width?: number;
}) {
  const rowH = 26;
  const leaves = stage1.length * stage2.length;
  const H = leaves * rowH + 14;
  const W = width;
  const rootX = 10;
  const nodeX = 84;
  const leafX = 156;
  const label = leafLabel ?? ((a: string, b: string) => `${a}${b}`);
  const nodeY = (i: number) => (i * stage2.length + stage2.length / 2) * rowH + 7;
  const leafY = (i: number, j: number) => (i * stage2.length + j + 0.5) * rowH + 7;
  const rootY = H / 2;

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="tree diagram">
        <circle cx={rootX} cy={rootY} r="3.5" fill={AXIS} />
        {stage1.map((s, i) => (
          <g key={i}>
            <line x1={rootX} y1={rootY} x2={nodeX} y2={nodeY(i)} stroke={PALETTE.grey} strokeWidth="1.6" />
            <text
              x={(rootX + nodeX) / 2}
              y={(rootY + nodeY(i)) / 2 - 3}
              fontSize="9.5"
              fontWeight="700"
              textAnchor="middle"
              fill={PALETTE.brand}
            >
              {s.label}
              {s.prob ? ` (${s.prob})` : ""}
            </text>
            <circle cx={nodeX} cy={nodeY(i)} r="3.5" fill={AXIS} />
            {stage2.map((t, j) => {
              const text = label(s.label, t.label);
              const hot = highlight.includes(text);
              return (
                <g key={j}>
                  <line
                    x1={nodeX}
                    y1={nodeY(i)}
                    x2={leafX}
                    y2={leafY(i, j)}
                    stroke={hot ? PALETTE.rose : PALETTE.grey}
                    strokeWidth={hot ? "2.2" : "1.4"}
                  />
                  <text
                    x={(nodeX + leafX) / 2}
                    y={(nodeY(i) + leafY(i, j)) / 2 - 3}
                    fontSize="9"
                    textAnchor="middle"
                    fill={PALETTE.teal}
                  >
                    {t.label}
                    {t.prob ? ` (${t.prob})` : ""}
                  </text>
                  <text
                    x={leafX + 6}
                    y={leafY(i, j) + 3.5}
                    fontSize="10"
                    fontWeight={hot ? "700" : "600"}
                    fill={hot ? PALETTE.rose : DARK}
                  >
                    {text}
                    {leafProb ? `  ${leafProb(i, j)}` : ""}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <Caption text={caption} />
    </figure>
  );
}

/**
 * The 36 outcomes of two dice, each cell showing the total.
 *
 * This is the only honest way to kill "a total of 7 and a total of 2 are both
 * just one total, so they are equally likely" — you can count the diagonal.
 */
export function DiceGrid({
  highlight,
  caption,
  cell = 26,
}: {
  /** total whose cells are picked out */
  highlight?: number;
  caption?: string;
  cell?: number;
}) {
  const faces = [1, 2, 3, 4, 5, 6];
  const W = cell * 7 + 2;
  const H = cell * 7 + 2;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W * 1.15 }}
        role="img"
        aria-label="grid of the 36 outcomes of two dice"
      >
        {faces.map((a) => (
          <text
            key={`h${a}`}
            x={cell * a + cell / 2 + 1}
            y={cell * 0.65}
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            fill={PALETTE.brand}
          >
            {a}
          </text>
        ))}
        {faces.map((b) => (
          <text
            key={`v${b}`}
            x={cell / 2 + 1}
            y={cell * b + cell * 0.65}
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            fill={PALETTE.teal}
          >
            {b}
          </text>
        ))}
        {faces.map((b) =>
          faces.map((a) => {
            const total = a + b;
            const hot = highlight === total;
            return (
              <g key={`${a}-${b}`}>
                <rect
                  x={cell * a + 1}
                  y={cell * b + 1}
                  width={cell - 2}
                  height={cell - 2}
                  rx="3"
                  fill={hot ? PALETTE.rose : "#f8fafc"}
                  stroke={GRID}
                  strokeWidth="1"
                />
                <text
                  x={cell * a + cell / 2}
                  y={cell * b + cell * 0.65}
                  fontSize="10.5"
                  fontWeight={hot ? "700" : "500"}
                  textAnchor="middle"
                  fill={hot ? "#fff" : LABEL}
                >
                  {total}
                </text>
              </g>
            );
          })
        )}
      </svg>
      <Caption text={caption} />
    </figure>
  );
}

/**
 * Every pairing of two lists as a grid — the picture behind multiplying
 * choices instead of adding them. Each row is one choice from the first list
 * opening a full copy of the second.
 */
export function ChoiceGrid({
  rowsLabel,
  colsLabel,
  rowItems,
  colItems,
  caption,
}: {
  rowsLabel: string;
  colsLabel: string;
  rowItems: string[];
  colItems: string[];
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="px-1 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-500">
                {rowsLabel} \ {colsLabel}
              </th>
              {colItems.map((c) => (
                <th key={c} className="px-2 py-1 text-[11px] font-bold text-ink-700">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowItems.map((r) => (
              <tr key={r}>
                <th className="px-2 py-1 text-[11px] font-bold text-brand-700">{r}</th>
                {colItems.map((c) => (
                  <td key={c} className="border border-ink-100 bg-paper px-2 py-1.5 font-semibold text-ink-700">
                    {r}
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Caption text={caption} />
    </figure>
  );
}

/**
 * A row of value chips, optionally sorted, with the middle one picked out.
 * The median is a *position*, so it needs a picture that shows position.
 */
export function ValueStrip({
  values,
  middle,
  label,
  tone = "brand",
}: {
  values: (number | string)[];
  /** index of the chip to pick out */
  middle?: number;
  label?: string;
  tone?: "brand" | "rose";
}) {
  const hot = tone === "rose" ? "border-err-600 bg-err-100 text-ink-900" : "border-ok-600 bg-ok-100 text-ink-900";
  return (
    <div className="my-2">
      {label && <div className="mb-1 text-xs font-semibold text-ink-500">{label}</div>}
      <div className="flex flex-wrap items-center gap-1.5">
        {values.map((v, i) => (
          <span
            key={i}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border-2 px-2 text-sm font-bold ${
              i === middle ? hot : "border-ink-100 bg-white text-ink-700"
            }`}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
