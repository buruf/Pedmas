/**
 * Visual models for the geometry and measurement lessons.
 *
 * Geometry is the one strand that cannot be taught in words. A child who is
 * told "the hypotenuse is the longest side" learns a sentence; a child who
 * sees the 9-square and 16-square land exactly on the 25-square learns the
 * theorem. Every figure here exists to make one specific misconception
 * visible — the wrong protractor scale, the fold that does not match, the
 * doubled rectangle that holds four times as much.
 *
 * Local to this tranche on purpose: the shared `Models.tsx` covers number and
 * arithmetic, and nothing here belongs in it.
 */
import { MathText } from "@/components/MathText";

const C = {
  brand: "#7c3aed",
  brandSoft: "#ede9fe",
  teal: "#0d9488",
  tealSoft: "#ccfbf1",
  amber: "#d97706",
  amberSoft: "#fef3c7",
  red: "#e11d48",
  redSoft: "#ffe4e6",
  ink: "#334155",
  line: "#475569",
  soft: "#94a3b8",
  faint: "#cbd5e1",
  paper: "#f8fafc",
} as const;

export const GEO_COLOURS = C;

/** Shared figure chrome: a responsive SVG plus an optional caption. */
function Frame({
  w,
  h,
  max,
  label,
  caption,
  children,
}: {
  w: number;
  h: number;
  max?: number;
  label: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        style={{ maxWidth: max ?? w * 1.5 }}
        role="img"
        aria-label={label}
        className="mx-auto block"
      >
        {children}
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
          <MathText text={caption} />
        </figcaption>
      )}
    </figure>
  );
}

/** Row of figures that wraps on a small screen. */
export function FigRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex flex-wrap items-end justify-center gap-5">{children}</div>;
}

/* ------------------------------------------------------------------ rectangle */

/**
 * A rectangle with its sides labelled.
 *
 * `mode` decides which question the picture is answering: "perimeter" walks
 * the edge and labels all four sides, "area" tiles the inside with unit
 * squares. Showing both on the same rectangle is what separates the two ideas.
 */
export function LabelledRect({
  w,
  h,
  unit = "cm",
  mode = "plain",
  tile = false,
  caption,
  foldLines = [],
  note,
  colour,
  maxPx = 210,
}: {
  w: number;
  h: number;
  unit?: string;
  mode?: "plain" | "perimeter" | "area";
  tile?: boolean;
  caption?: string;
  /** dashed fold lines: v = vertical, h = horizontal, d = diagonal */
  foldLines?: ("v" | "h" | "d")[];
  note?: string;
  colour?: string;
  maxPx?: number;
}) {
  const s = Math.max(9, Math.min(22, maxPx / w, 120 / h));
  const PL = 40;
  const PT = mode === "perimeter" ? 22 : 12;
  const PR = mode === "perimeter" ? 46 : 14;
  const PB = 26;
  const W = PL + w * s + PR;
  const H = PT + h * s + PB;
  const stroke = colour ?? (mode === "perimeter" ? C.amber : C.brand);
  const fill = mode === "area" ? C.brandSoft : "#ffffff";

  return (
    <Frame
      w={W}
      h={H}
      max={W * 1.5}
      label={`rectangle ${w} by ${h} ${unit}`}
      caption={caption}
    >
      <rect
        x={PL}
        y={PT}
        width={w * s}
        height={h * s}
        fill={fill}
        stroke={stroke}
        strokeWidth={mode === "perimeter" ? 4 : 2}
      />
      {tile &&
        Array.from({ length: w * h }, (_, i) => {
          const cx = i % w;
          const cy = Math.floor(i / w);
          return (
            <rect
              key={i}
              x={PL + cx * s}
              y={PT + cy * s}
              width={s}
              height={s}
              fill="none"
              stroke={C.faint}
              strokeWidth="0.8"
            />
          );
        })}
      {foldLines.includes("v") && (
        <line
          x1={PL + (w * s) / 2}
          y1={PT}
          x2={PL + (w * s) / 2}
          y2={PT + h * s}
          stroke={C.teal}
          strokeWidth="2"
          strokeDasharray="5 3"
        />
      )}
      {foldLines.includes("h") && (
        <line
          x1={PL}
          y1={PT + (h * s) / 2}
          x2={PL + w * s}
          y2={PT + (h * s) / 2}
          stroke={C.teal}
          strokeWidth="2"
          strokeDasharray="5 3"
        />
      )}
      {foldLines.includes("d") && (
        <line
          x1={PL}
          y1={PT + h * s}
          x2={PL + w * s}
          y2={PT}
          stroke={C.red}
          strokeWidth="2"
          strokeDasharray="5 3"
        />
      )}
      {note && (
        <text
          x={PL + (w * s) / 2}
          y={PT + (h * s) / 2 + 5}
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fill={C.line}
        >
          {note}
        </text>
      )}
      {/* bottom */}
      <text
        x={PL + (w * s) / 2}
        y={PT + h * s + 18}
        fontSize="12"
        fontWeight="700"
        textAnchor="middle"
        fill={C.line}
      >
        {w} {unit}
      </text>
      {/* left */}
      <text
        x={PL - 7}
        y={PT + (h * s) / 2 + 4}
        fontSize="12"
        fontWeight="700"
        textAnchor="end"
        fill={C.line}
      >
        {h} {unit}
      </text>
      {mode === "perimeter" && (
        <>
          <text
            x={PL + (w * s) / 2}
            y={PT - 7}
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            fill={C.amber}
          >
            {w} {unit}
          </text>
          <text
            x={PL + w * s + 7}
            y={PT + (h * s) / 2 + 4}
            fontSize="12"
            fontWeight="700"
            textAnchor="start"
            fill={C.amber}
          >
            {h} {unit}
          </text>
        </>
      )}
    </Frame>
  );
}

/**
 * A triangle with its base and perpendicular height marked, optionally inside
 * the rectangle it is exactly half of.
 */
export function TriangleFig({
  base,
  height,
  unit = "cm",
  ghostRect = false,
  caption,
  apexAt = 0.35,
}: {
  base: number;
  height: number;
  unit?: string;
  ghostRect?: boolean;
  caption?: string;
  /** where the apex sits along the base, 0..1 */
  apexAt?: number;
}) {
  const s = Math.max(10, Math.min(20, 200 / base, 110 / height));
  const PL = 34;
  const PT = 12;
  const bw = base * s;
  const bh = height * s;
  const W = PL + bw + 22;
  const H = PT + bh + 28;
  const ax = PL + bw * apexAt;
  return (
    <Frame w={W} h={H} max={W * 1.5} label={`triangle base ${base} height ${height}`} caption={caption}>
      {ghostRect && (
        <rect x={PL} y={PT} width={bw} height={bh} fill={C.paper} stroke={C.faint} strokeWidth="1.5" strokeDasharray="5 3" />
      )}
      <polygon
        points={`${PL},${PT + bh} ${PL + bw},${PT + bh} ${ax},${PT}`}
        fill={C.tealSoft}
        stroke={C.teal}
        strokeWidth="2"
      />
      {/* height */}
      <line x1={ax} y1={PT} x2={ax} y2={PT + bh} stroke={C.amber} strokeWidth="1.8" strokeDasharray="4 3" />
      <path d={`M ${ax} ${PT + bh - 9} h 9 v 9`} fill="none" stroke={C.amber} strokeWidth="1.4" />
      <text x={ax + 6} y={PT + bh / 2} fontSize="12" fontWeight="700" fill={C.amber}>
        {height} {unit}
      </text>
      <text x={PL + bw / 2} y={PT + bh + 18} fontSize="12" fontWeight="700" textAnchor="middle" fill={C.line}>
        {base} {unit}
      </text>
    </Frame>
  );
}

/* ---------------------------------------------------------------- angles */

/**
 * Two arms and the turn between them. `arm` changes only how long the lines
 * are drawn — which is exactly the point when a child believes a bigger
 * drawing means a bigger angle.
 */
export function AngleFig({
  deg,
  arm = 70,
  caption,
  colour = C.brand,
  showLabel = true,
}: {
  deg: number;
  arm?: number;
  caption?: string;
  colour?: string;
  showLabel?: boolean;
}) {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  // An obtuse angle throws its second arm back past the vertex, so the vertex
  // has to start further right or the drawing runs off the canvas.
  const vx = 16 + Math.max(0, -arm * cos);
  const H = Math.max(70, 24 + arm * Math.sin(rad) + 14);
  const vy = H - 20;
  const W = vx + arm + 30;
  const ex = vx + arm * cos;
  const ey = vy - arm * Math.sin(rad);
  const ar = Math.min(26, arm * 0.42);
  const arcEndX = vx + ar * Math.cos(rad);
  const arcEndY = vy - ar * Math.sin(rad);
  const lx = vx + (ar + 15) * Math.cos(rad / 2);
  const ly = vy - (ar + 15) * Math.sin(rad / 2);
  return (
    <Frame w={W} h={H} max={W * 1.6} label={`an angle of ${deg} degrees`} caption={caption}>
      <line x1={vx} y1={vy} x2={vx + arm} y2={vy} stroke={C.line} strokeWidth="2.4" strokeLinecap="round" />
      <line x1={vx} y1={vy} x2={ex} y2={ey} stroke={C.line} strokeWidth="2.4" strokeLinecap="round" />
      {deg === 90 ? (
        <path d={`M ${vx + 12} ${vy} v -12 h -12`} fill="none" stroke={colour} strokeWidth="2" />
      ) : (
        <path
          d={`M ${vx + ar} ${vy} A ${ar} ${ar} 0 0 0 ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke={colour}
          strokeWidth="2.2"
        />
      )}
      <circle cx={vx} cy={vy} r="2.6" fill={C.line} />
      {showLabel && (
        <text x={lx} y={ly + 4} fontSize="13" fontWeight="800" fill={colour}>
          {deg}°
        </text>
      )}
    </Frame>
  );
}

/**
 * A protractor with both scales printed, and one arm laid on the baseline.
 *
 * The double scale is the whole difficulty: the same ray sits against two
 * numbers that add to 180, and only one of them is the answer.
 */
export function Protractor({
  angle,
  caption,
  showReadings = true,
}: {
  angle: number;
  caption?: string;
  showReadings?: boolean;
}) {
  const R = 104;
  const cx = 128;
  const cy = 124;
  const W = 256;
  const H = 146;
  const pt = (deg: number, r: number) => [
    cx + r * Math.cos((deg * Math.PI) / 180),
    cy - r * Math.sin((deg * Math.PI) / 180),
  ] as const;
  const ticks: number[] = [];
  for (let d = 0; d <= 180; d += 5) ticks.push(d);
  const labels = [0, 30, 60, 90, 120, 150, 180];
  const [rx, ry] = pt(angle, R);
  const [ix, iy] = pt(angle, R - 30);
  const [ox, oy] = pt(angle, R - 12);

  return (
    <Frame w={W} h={H} max={330} label={`protractor showing an angle of ${angle} degrees`} caption={caption}>
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`}
        fill={C.paper}
        stroke={C.soft}
        strokeWidth="1.6"
      />
      {ticks.map((d) => {
        const major = d % 10 === 0;
        const [x1, y1] = pt(d, R);
        const [x2, y2] = pt(d, R - (major ? 9 : 5));
        return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.soft} strokeWidth={major ? 1.2 : 0.7} />;
      })}
      {/* outer scale: zero on the left */}
      {labels.map((d) => {
        const [x, y] = pt(d, R - 17);
        return (
          <text key={`o${d}`} x={x} y={y + 3} fontSize="8.5" fontWeight="700" textAnchor="middle" fill={C.teal}>
            {180 - d}
          </text>
        );
      })}
      {/* inner scale: zero on the right */}
      {labels.map((d) => {
        const [x, y] = pt(d, R - 33);
        return (
          <text key={`i${d}`} x={x} y={y + 3} fontSize="8.5" fontWeight="700" textAnchor="middle" fill={C.amber}>
            {d}
          </text>
        );
      })}
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={C.line} strokeWidth="1.6" />
      {/* the angle itself */}
      <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={C.brand} strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={rx} y2={ry} stroke={C.brand} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="3.4" fill={C.brand} />
      {showReadings && (
        <>
          <circle cx={ix} cy={iy} r="9" fill={C.amberSoft} stroke={C.amber} strokeWidth="1.6" />
          <text x={ix} y={iy + 3.5} fontSize="9" fontWeight="800" textAnchor="middle" fill={C.amber}>
            {angle}
          </text>
          <circle cx={ox} cy={oy} r="9" fill={C.tealSoft} stroke={C.teal} strokeWidth="1.6" />
          <text x={ox} y={oy + 3.5} fontSize="9" fontWeight="800" textAnchor="middle" fill={C.teal}>
            {180 - angle}
          </text>
        </>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------- solids */

/**
 * A box drawn in three dimensions, optionally ruled into unit cubes so the
 * layers can be counted rather than trusted to a formula.
 */
export function BoxFig({
  l,
  w,
  h,
  unit = "cm",
  cubes = false,
  caption,
  colour = C.brand,
  labels = true,
  maxPx = 26,
}: {
  l: number;
  w: number;
  h: number;
  unit?: string;
  cubes?: boolean;
  caption?: string;
  colour?: string;
  labels?: boolean;
  maxPx?: number;
}) {
  const s = Math.max(9, Math.min(maxPx, 150 / l, 90 / h, 120 / (l + w * 0.5)));
  const L = l * s;
  const Hh = h * s;
  const d = w * s * 0.5;
  const PL = 16;
  const PT = 14;
  const x0 = PL;
  const y0 = PT + d;
  const W = PL + L + d + 46;
  const HH = PT + d + Hh + 30;
  const soft = colour === C.brand ? C.brandSoft : C.tealSoft;

  return (
    <Frame w={W} h={HH} max={W * 1.6} label={`a box ${l} by ${w} by ${h} ${unit}`} caption={caption}>
      {/* top face */}
      <polygon
        points={`${x0},${y0} ${x0 + L},${y0} ${x0 + L + d},${y0 - d} ${x0 + d},${y0 - d}`}
        fill={soft}
        stroke={colour}
        strokeWidth="1.8"
      />
      {/* right face */}
      <polygon
        points={`${x0 + L},${y0} ${x0 + L + d},${y0 - d} ${x0 + L + d},${y0 - d + Hh} ${x0 + L},${y0 + Hh}`}
        fill="#ffffff"
        stroke={colour}
        strokeWidth="1.8"
      />
      {/* front face */}
      <rect x={x0} y={y0} width={L} height={Hh} fill={soft} fillOpacity="0.55" stroke={colour} strokeWidth="2" />
      {cubes && (
        <g stroke={colour} strokeOpacity="0.45" strokeWidth="0.8">
          {Array.from({ length: l - 1 }, (_, i) => (
            <line key={`fv${i}`} x1={x0 + (i + 1) * s} y1={y0} x2={x0 + (i + 1) * s} y2={y0 + Hh} />
          ))}
          {Array.from({ length: h - 1 }, (_, i) => (
            <line key={`fh${i}`} x1={x0} y1={y0 + (i + 1) * s} x2={x0 + L} y2={y0 + (i + 1) * s} />
          ))}
          {Array.from({ length: l - 1 }, (_, i) => (
            <line
              key={`tv${i}`}
              x1={x0 + (i + 1) * s}
              y1={y0}
              x2={x0 + (i + 1) * s + d}
              y2={y0 - d}
            />
          ))}
          {Array.from({ length: w - 1 }, (_, i) => {
            const k = ((i + 1) * d) / w;
            return <line key={`td${i}`} x1={x0 + k} y1={y0 - k} x2={x0 + L + k} y2={y0 - k} />;
          })}
          {Array.from({ length: w - 1 }, (_, i) => {
            const k = ((i + 1) * d) / w;
            return <line key={`rd${i}`} x1={x0 + L + k} y1={y0 - k} x2={x0 + L + k} y2={y0 - k + Hh} />;
          })}
          {Array.from({ length: h - 1 }, (_, i) => (
            <line
              key={`rh${i}`}
              x1={x0 + L}
              y1={y0 + (i + 1) * s}
              x2={x0 + L + d}
              y2={y0 - d + (i + 1) * s}
            />
          ))}
        </g>
      )}
      {labels && (
        <>
          <text x={x0 + L / 2} y={y0 + Hh + 17} fontSize="11.5" fontWeight="700" textAnchor="middle" fill={C.line}>
            {l} {unit}
          </text>
          <text x={x0 + L + d + 5} y={y0 - d + Hh / 2 + 4} fontSize="11.5" fontWeight="700" fill={C.line}>
            {h} {unit}
          </text>
          <text x={x0 + L + d / 2 + 4} y={y0 - d / 2 - 4} fontSize="11.5" fontWeight="700" fill={C.line}>
            {w} {unit}
          </text>
        </>
      )}
    </Frame>
  );
}

/** The net of a box, with every face's area written on it. */
export function NetFig({
  l,
  w,
  h,
  unit = "cm",
  caption,
}: {
  l: number;
  w: number;
  h: number;
  unit?: string;
  caption?: string;
}) {
  const s = Math.max(8, Math.min(20, 250 / (2 * l + 2 * w), 130 / (2 * w + h)));
  const PAD = 8;
  const W = PAD * 2 + (2 * l + 2 * w) * s;
  const H = PAD * 2 + (2 * w + h) * s;
  const y1 = PAD;
  const y2 = PAD + w * s;
  const y3 = y2 + h * s;
  const xLeft = PAD;
  const xFront = xLeft + w * s;
  const xRight = xFront + l * s;
  const xBack = xRight + w * s;
  const face = (
    x: number,
    y: number,
    fw: number,
    fh: number,
    area: number,
    fill: string,
    key: string
  ) => (
    <g key={key}>
      <rect x={x} y={y} width={fw * s} height={fh * s} fill={fill} stroke={C.line} strokeWidth="1.4" />
      <text
        x={x + (fw * s) / 2}
        y={y + (fh * s) / 2 + 4}
        fontSize="10.5"
        fontWeight="800"
        textAnchor="middle"
        fill={C.line}
      >
        {area}
      </text>
    </g>
  );
  return (
    <Frame w={W} h={H} max={W * 1.5} label={`the net of a ${l} by ${w} by ${h} box`} caption={caption}>
      {face(xFront, y1, l, w, l * w, C.tealSoft, "top")}
      {face(xLeft, y2, w, h, w * h, C.amberSoft, "left")}
      {face(xFront, y2, l, h, l * h, C.brandSoft, "front")}
      {face(xRight, y2, w, h, w * h, C.amberSoft, "right")}
      {face(xBack, y2, l, h, l * h, C.brandSoft, "back")}
      {face(xFront, y3, l, w, l * w, C.tealSoft, "bottom")}
    </Frame>
  );
}

type SolidKind =
  | "cube"
  | "rectangular prism"
  | "triangular prism"
  | "square pyramid"
  | "cylinder"
  | "cone"
  | "sphere";

/** A named 3D solid, with the edges you cannot see drawn dashed. */
export function SolidFig({
  kind,
  caption,
  colour = C.brand,
  hideHidden = false,
}: {
  kind: SolidKind;
  caption?: string;
  colour?: string;
  /** Draw only what a photograph would show — used to make hidden faces the point. */
  hideHidden?: boolean;
}) {
  const soft = C.brandSoft;
  const dash = { stroke: C.soft, strokeWidth: 1.4, strokeDasharray: "4 3", fill: "none" } as const;
  const solid = { stroke: colour, strokeWidth: 2 } as const;
  let body: React.ReactNode = null;

  if (kind === "cube" || kind === "rectangular prism") {
    const fw = kind === "cube" ? 58 : 74;
    const fh = 58;
    const dx = 24;
    const dy = 20;
    const x = 18;
    const y = 32;
    body = (
      <>
        <polygon points={`${x},${y} ${x + fw},${y} ${x + fw + dx},${y - dy} ${x + dx},${y - dy}`} fill={soft} {...solid} />
        <polygon
          points={`${x + fw},${y} ${x + fw + dx},${y - dy} ${x + fw + dx},${y - dy + fh} ${x + fw},${y + fh}`}
          fill="#ffffff"
          {...solid}
        />
        <rect x={x} y={y} width={fw} height={fh} fill={soft} fillOpacity="0.5" {...solid} />
        {!hideHidden && (
          <>
            <line x1={x} y1={y + fh} x2={x + dx} y2={y - dy + fh} {...dash} />
            <line x1={x + dx} y1={y - dy + fh} x2={x + fw + dx} y2={y - dy + fh} {...dash} />
            <line x1={x + dx} y1={y - dy + fh} x2={x + dx} y2={y - dy} {...dash} />
          </>
        )}
      </>
    );
  } else if (kind === "triangular prism") {
    const A = [22, 88] as const;
    const B = [86, 88] as const;
    const T = [54, 40] as const;
    const dx = 24;
    const dy = 20;
    const A2 = [A[0] + dx, A[1] - dy] as const;
    const B2 = [B[0] + dx, B[1] - dy] as const;
    const T2 = [T[0] + dx, T[1] - dy] as const;
    body = (
      <>
        <polygon points={`${B[0]},${B[1]} ${T[0]},${T[1]} ${T2[0]},${T2[1]} ${B2[0]},${B2[1]}`} fill="#ffffff" {...solid} />
        <polygon points={`${B2[0]},${B2[1]} ${T2[0]},${T2[1]} ${A2[0]},${A2[1]}`} fill={soft} {...solid} />
        <polygon points={`${A[0]},${A[1]} ${B[0]},${B[1]} ${T[0]},${T[1]}`} fill={soft} fillOpacity="0.6" {...solid} />
        {!hideHidden && (
          <>
            <line x1={A[0]} y1={A[1]} x2={A2[0]} y2={A2[1]} {...dash} />
            <line x1={A2[0]} y1={A2[1]} x2={B2[0]} y2={B2[1]} {...dash} />
            <line x1={A2[0]} y1={A2[1]} x2={T2[0]} y2={T2[1]} {...dash} />
          </>
        )}
      </>
    );
  } else if (kind === "square pyramid") {
    const bl = [22, 90] as const;
    const br = [82, 90] as const;
    const bbr = [104, 72] as const;
    const bbl = [44, 72] as const;
    const apex = [63, 22] as const;
    body = (
      <>
        <polygon points={`${bl[0]},${bl[1]} ${br[0]},${br[1]} ${apex[0]},${apex[1]}`} fill={soft} fillOpacity="0.6" {...solid} />
        <polygon points={`${br[0]},${br[1]} ${bbr[0]},${bbr[1]} ${apex[0]},${apex[1]}`} fill="#ffffff" {...solid} />
        {!hideHidden && (
          <>
            <line x1={bl[0]} y1={bl[1]} x2={bbl[0]} y2={bbl[1]} {...dash} />
            <line x1={bbl[0]} y1={bbl[1]} x2={bbr[0]} y2={bbr[1]} {...dash} />
            <line x1={bbl[0]} y1={bbl[1]} x2={apex[0]} y2={apex[1]} {...dash} />
          </>
        )}
      </>
    );
  } else if (kind === "cylinder") {
    body = (
      <>
        <path d={`M 26 34 L 26 84 A 37 12 0 0 0 100 84 L 100 34`} fill={soft} fillOpacity="0.5" {...solid} />
        <ellipse cx={63} cy={34} rx={37} ry={12} fill={soft} {...solid} />
        {!hideHidden && <path d={`M 26 84 A 37 12 0 0 1 100 84`} {...dash} />}
      </>
    );
  } else if (kind === "cone") {
    body = (
      <>
        <path d={`M 63 22 L 26 84 A 37 12 0 0 0 100 84 Z`} fill={soft} fillOpacity="0.6" {...solid} />
        {!hideHidden && <path d={`M 26 84 A 37 12 0 0 1 100 84`} {...dash} />}
      </>
    );
  } else {
    body = (
      <>
        <circle cx={63} cy={58} r={36} fill={soft} fillOpacity="0.6" {...solid} />
        <path d={`M 27 58 A 36 12 0 0 0 99 58`} fill="none" stroke={colour} strokeWidth="1.4" />
        {!hideHidden && <path d={`M 27 58 A 36 12 0 0 1 99 58`} {...dash} />}
      </>
    );
  }

  return (
    <Frame w={128} h={110} max={170} label={`a ${kind}`} caption={caption}>
      {body}
    </Frame>
  );
}

/* --------------------------------------------------------- coordinate plane */

export interface GridPoint {
  x: number;
  y: number;
  label?: string;
  colour?: string;
  hollow?: boolean;
}
export interface GridPoly {
  pts: [number, number][];
  colour?: string;
  fill?: string;
  dashed?: boolean;
  label?: string;
}
export interface GridSeg {
  from: [number, number];
  to: [number, number];
  colour?: string;
  dashed?: boolean;
  label?: string;
}

/**
 * A coordinate grid. One component covers plotting, quadrants, distances,
 * reflections and translations — every lesson that needs a grid needs the same
 * grid, and drawing them all the same way keeps the plane recognisable.
 */
export function CoordGrid({
  xMin = -1,
  xMax = 8,
  yMin = -1,
  yMax = 8,
  points = [],
  polys = [],
  segments = [],
  vLines = [],
  hLines = [],
  quadrants = false,
  size = 220,
  caption,
}: {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  points?: GridPoint[];
  polys?: GridPoly[];
  segments?: GridSeg[];
  vLines?: { x: number; colour?: string; label?: string }[];
  hLines?: { y: number; colour?: string; label?: string }[];
  quadrants?: boolean;
  size?: number;
  caption?: string;
}) {
  const spanX = xMax - xMin;
  const spanY = yMax - yMin;
  const s = size / Math.max(spanX, spanY);
  const PAD = 24;
  const W = PAD * 2 + spanX * s;
  const H = PAD * 2 + spanY * s;
  const px = (x: number) => PAD + (x - xMin) * s;
  const py = (y: number) => PAD + (yMax - y) * s;
  const xs: number[] = [];
  for (let v = Math.ceil(xMin); v <= xMax; v++) xs.push(v);
  const ys: number[] = [];
  for (let v = Math.ceil(yMin); v <= yMax; v++) ys.push(v);
  const showAxisX = yMin <= 0 && yMax >= 0;
  const showAxisY = xMin <= 0 && xMax >= 0;
  const tickEvery = spanX > 12 || spanY > 12 ? 2 : 1;

  return (
    <Frame w={W} h={H} max={Math.min(W * 1.5, 380)} label="coordinate grid" caption={caption}>
      <rect x={PAD} y={PAD} width={spanX * s} height={spanY * s} fill="#ffffff" />
      {xs.map((v) => (
        <line key={`gx${v}`} x1={px(v)} y1={PAD} x2={px(v)} y2={PAD + spanY * s} stroke={C.faint} strokeWidth="0.8" />
      ))}
      {ys.map((v) => (
        <line key={`gy${v}`} x1={PAD} y1={py(v)} x2={PAD + spanX * s} y2={py(v)} stroke={C.faint} strokeWidth="0.8" />
      ))}
      {quadrants &&
        (
          [
            ["I", xMax * 0.55, yMax * 0.55],
            ["II", xMin * 0.55, yMax * 0.55],
            ["III", xMin * 0.55, yMin * 0.55],
            ["IV", xMax * 0.55, yMin * 0.55],
          ] as [string, number, number][]
        ).map(([t, qx, qy]) => (
          <text key={t} x={px(qx)} y={py(qy)} fontSize="13" fontWeight="800" textAnchor="middle" fill={C.faint}>
            {t}
          </text>
        ))}
      {showAxisX && (
        <line x1={PAD} y1={py(0)} x2={PAD + spanX * s} y2={py(0)} stroke={C.line} strokeWidth="1.8" />
      )}
      {showAxisY && (
        <line x1={px(0)} y1={PAD} x2={px(0)} y2={PAD + spanY * s} stroke={C.line} strokeWidth="1.8" />
      )}
      {showAxisX &&
        xs
          .filter((v) => v !== 0 && v % tickEvery === 0)
          .map((v) => (
            <text key={`tx${v}`} x={px(v)} y={py(0) + 13} fontSize="9" textAnchor="middle" fill={C.ink}>
              {v}
            </text>
          ))}
      {showAxisY &&
        ys
          .filter((v) => v !== 0 && v % tickEvery === 0)
          .map((v) => (
            <text key={`ty${v}`} x={px(0) - 6} y={py(v) + 3} fontSize="9" textAnchor="end" fill={C.ink}>
              {v}
            </text>
          ))}
      {showAxisX && showAxisY && (
        <text x={px(0) - 6} y={py(0) + 13} fontSize="9" textAnchor="end" fill={C.ink}>
          0
        </text>
      )}
      <text x={PAD + spanX * s - 2} y={(showAxisX ? py(0) : PAD + spanY * s) - 6} fontSize="10" fontWeight="700" textAnchor="end" fill={C.ink}>
        x
      </text>
      <text x={(showAxisY ? px(0) : PAD) + 6} y={PAD + 9} fontSize="10" fontWeight="700" fill={C.ink}>
        y
      </text>

      {vLines.map((v, i) => (
        <g key={`v${i}`}>
          <line
            x1={px(v.x)}
            y1={PAD}
            x2={px(v.x)}
            y2={PAD + spanY * s}
            stroke={v.colour ?? C.red}
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          {v.label && (
            <text x={px(v.x)} y={PAD - 8} fontSize="10" fontWeight="800" textAnchor="middle" fill={v.colour ?? C.red}>
              {v.label}
            </text>
          )}
        </g>
      ))}
      {hLines.map((v, i) => (
        <g key={`h${i}`}>
          <line
            x1={PAD}
            y1={py(v.y)}
            x2={PAD + spanX * s}
            y2={py(v.y)}
            stroke={v.colour ?? C.red}
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          {v.label && (
            <text x={PAD + spanX * s - 2} y={py(v.y) - 5} fontSize="10" fontWeight="800" textAnchor="end" fill={v.colour ?? C.red}>
              {v.label}
            </text>
          )}
        </g>
      ))}

      {polys.map((p, i) => (
        <g key={`p${i}`}>
          <polygon
            points={p.pts.map(([x, y]) => `${px(x)},${py(y)}`).join(" ")}
            fill={p.fill ?? "none"}
            stroke={p.colour ?? C.brand}
            strokeWidth="2.2"
            strokeDasharray={p.dashed ? "5 4" : undefined}
          />
          {p.label && (
            <text
              x={px(p.pts.reduce((a, b) => a + b[0], 0) / p.pts.length)}
              y={py(p.pts.reduce((a, b) => a + b[1], 0) / p.pts.length) + 4}
              fontSize="11"
              fontWeight="800"
              textAnchor="middle"
              fill={p.colour ?? C.brand}
            >
              {p.label}
            </text>
          )}
        </g>
      ))}

      {segments.map((g, i) => {
        const mx = (px(g.from[0]) + px(g.to[0])) / 2;
        const my = (py(g.from[1]) + py(g.to[1])) / 2;
        return (
          <g key={`s${i}`}>
            <line
              x1={px(g.from[0])}
              y1={py(g.from[1])}
              x2={px(g.to[0])}
              y2={py(g.to[1])}
              stroke={g.colour ?? C.amber}
              strokeWidth="2.4"
              strokeDasharray={g.dashed ? "5 4" : undefined}
            />
            {g.label && (
              <text x={mx + 5} y={my - 5} fontSize="10.5" fontWeight="800" fill={g.colour ?? C.amber}>
                {g.label}
              </text>
            )}
          </g>
        );
      })}

      {points.map((p, i) => (
        <g key={`d${i}`}>
          <circle
            cx={px(p.x)}
            cy={py(p.y)}
            r="5"
            fill={p.hollow ? "#ffffff" : p.colour ?? C.brand}
            stroke={p.colour ?? C.brand}
            strokeWidth="2"
          />
          {p.label && (
            <text x={px(p.x) + 8} y={py(p.y) - 7} fontSize="11" fontWeight="800" fill={p.colour ?? C.brand}>
              {p.label}
            </text>
          )}
        </g>
      ))}
    </Frame>
  );
}

/* --------------------------------------------------------------- right angles */

/**
 * A right triangle, optionally with the actual squares drawn on all three
 * sides. Seeing 9 + 16 fill 25 is the proof; the formula is only the summary.
 */
export function RightTriangleFig({
  a,
  b,
  c,
  unit = "cm",
  squares = false,
  unknown,
  caption,
  labelSides = true,
}: {
  /** vertical leg */
  a: number;
  /** horizontal leg */
  b: number;
  /** hypotenuse; drawn as a label only */
  c?: number | string;
  unit?: string;
  squares?: boolean;
  unknown?: "a" | "b" | "c";
  caption?: string;
  labelSides?: boolean;
}) {
  const s = squares
    ? Math.min(15, 300 / (2 * a + b), 250 / (a + 2 * b))
    : Math.min(24, 170 / b, 120 / a);
  const xMin = squares ? -a : 0;
  const xMax = squares ? b + a : b;
  const yMin = squares ? -b : 0;
  const yMax = squares ? a + b : a;
  const PAD = 20;
  const W = PAD * 2 + (xMax - xMin) * s;
  const H = PAD * 2 + (yMax - yMin) * s;
  const X = (x: number) => PAD + (x - xMin) * s;
  const Y = (y: number) => PAD + (yMax - y) * s;
  const cLabel = unknown === "c" ? "c = ?" : c !== undefined ? `${c} ${unit}` : "";
  const aLabel = unknown === "a" ? "?" : `${a} ${unit}`;
  const bLabel = unknown === "b" ? "?" : `${b} ${unit}`;

  return (
    <Frame w={W} h={H} max={Math.min(W * 1.5, 360)} label={`right triangle with legs ${a} and ${b}`} caption={caption}>
      {squares && (
        <>
          {/* square on the vertical leg */}
          <rect x={X(-a)} y={Y(a)} width={a * s} height={a * s} fill={C.tealSoft} stroke={C.teal} strokeWidth="1.6" />
          <text x={X(-a / 2)} y={Y(a / 2)} fontSize="13" fontWeight="800" textAnchor="middle" fill={C.teal}>
            {a * a}
          </text>
          <text x={X(-a / 2)} y={Y(a / 2) + 13} fontSize="9.5" fontWeight="700" textAnchor="middle" fill={C.teal}>
            side {aLabel}
          </text>
          {/* square on the horizontal leg */}
          <rect x={X(0)} y={Y(0)} width={b * s} height={b * s} fill={C.amberSoft} stroke={C.amber} strokeWidth="1.6" />
          <text x={X(b / 2)} y={Y(-b / 2)} fontSize="13" fontWeight="800" textAnchor="middle" fill={C.amber}>
            {b * b}
          </text>
          <text x={X(b / 2)} y={Y(-b / 2) + 13} fontSize="9.5" fontWeight="700" textAnchor="middle" fill={C.amber}>
            side {bLabel}
          </text>
          {/* square on the hypotenuse */}
          <polygon
            points={`${X(b)},${Y(0)} ${X(0)},${Y(a)} ${X(a)},${Y(a + b)} ${X(a + b)},${Y(b)}`}
            fill={C.brandSoft}
            stroke={C.brand}
            strokeWidth="1.6"
          />
          <text
            x={X((a + b) / 2)}
            y={Y((a + b) / 2)}
            fontSize="13"
            fontWeight="800"
            textAnchor="middle"
            fill={C.brand}
          >
            {typeof c === "number" ? c * c : "?"}
          </text>
          <text
            x={X((a + b) / 2)}
            y={Y((a + b) / 2) + 13}
            fontSize="9.5"
            fontWeight="700"
            textAnchor="middle"
            fill={C.brand}
          >
            side {cLabel || "?"}
          </text>
        </>
      )}
      <polygon
        points={`${X(0)},${Y(0)} ${X(b)},${Y(0)} ${X(0)},${Y(a)}`}
        fill="#ffffff"
        fillOpacity={squares ? 1 : 0.9}
        stroke={C.line}
        strokeWidth="2.2"
      />
      <path d={`M ${X(0) + 10} ${Y(0)} v -10 h -10`} fill="none" stroke={C.red} strokeWidth="1.6" />
      {labelSides && !squares && (
        <>
          <text x={X(0) - 5} y={Y(a / 2) + 4} fontSize="11" fontWeight="800" textAnchor="end" fill={C.teal}>
            {aLabel}
          </text>
          <text x={X(b / 2)} y={Y(0) + 14} fontSize="11" fontWeight="800" textAnchor="middle" fill={C.amber}>
            {bLabel}
          </text>
          {cLabel && (
            <text x={X(b / 2) + 6} y={Y(a / 2) - 4} fontSize="11" fontWeight="800" fill={C.brand}>
              {cLabel}
            </text>
          )}
        </>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------- circles */

/** A circle with the radius and/or diameter drawn and labelled. */
export function CircleFig({
  r,
  unit = "cm",
  show = ["radius"],
  fill = false,
  ring = false,
  caption,
  px = 68,
}: {
  r: number;
  unit?: string;
  show?: ("radius" | "diameter")[];
  fill?: boolean;
  ring?: boolean;
  caption?: string;
  px?: number;
}) {
  const cx = px + 22;
  const cy = px + 14;
  const W = cx * 2;
  const H = cy + px + 18;
  return (
    <Frame w={W} h={H} max={W * 1.4} label={`circle with radius ${r} ${unit}`} caption={caption}>
      <circle
        cx={cx}
        cy={cy}
        r={px}
        fill={fill ? C.brandSoft : "#ffffff"}
        stroke={ring ? C.amber : C.brand}
        strokeWidth={ring ? 4.5 : 2.2}
      />
      {show.includes("diameter") && (
        <>
          <line x1={cx - px} y1={cy} x2={cx + px} y2={cy} stroke={C.teal} strokeWidth="2.4" />
          <text x={cx} y={cy - 7} fontSize="11.5" fontWeight="800" textAnchor="middle" fill={C.teal}>
            d = {2 * r} {unit}
          </text>
        </>
      )}
      {show.includes("radius") && (
        <>
          <line x1={cx} y1={cy} x2={cx + px} y2={cy} stroke={C.red} strokeWidth="2.6" />
          <text x={cx + px / 2} y={cy + 15} fontSize="11.5" fontWeight="800" textAnchor="middle" fill={C.red}>
            r = {r} {unit}
          </text>
        </>
      )}
      <circle cx={cx} cy={cy} r="3.2" fill={C.line} />
    </Frame>
  );
}

/**
 * The diameter laid out three-and-a-bit times along the circumference — the
 * picture that makes π a measured fact rather than a magic button.
 */
export function PiUnrollFig({ caption }: { caption?: string }) {
  const d = 62;
  const y = 44;
  const x0 = 12;
  const total = 3.14 * d;
  return (
    <Frame w={x0 * 2 + total} h={72} max={300} label="the circumference is about 3.14 diameters" caption={caption}>
      <line x1={x0} y1={y} x2={x0 + total} y2={y} stroke={C.amber} strokeWidth="5" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={x0 + i * d}
          y1={y - 12}
          x2={x0 + i * d}
          y2={y + 12}
          stroke={C.teal}
          strokeWidth="1.8"
        />
      ))}
      {[0, 1, 2].map((i) => (
        <text
          key={i}
          x={x0 + i * d + d / 2}
          y={y - 17}
          fontSize="10.5"
          fontWeight="800"
          textAnchor="middle"
          fill={C.teal}
        >
          diameter {i + 1}
        </text>
      ))}
      <text x={x0 + total} y={y + 24} fontSize="10" fontWeight="800" textAnchor="end" fill={C.red}>
        and 0.14 more
      </text>
    </Frame>
  );
}

/* ------------------------------------------------------- polygons & symmetry */

/**
 * The n lines of symmetry of a regular n-gon: an odd polygon joins each vertex
 * to the middle of the opposite side, an even one pairs opposite vertices and
 * opposite side-middles.
 */
function symLines(
  sides: number,
  pts: readonly (readonly [number, number])[],
  mid: (i: number) => readonly [number, number]
): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  if (sides % 2 === 1) {
    for (let i = 0; i < sides; i++) {
      const m = mid((i + Math.floor(sides / 2)) % sides);
      out.push([pts[i][0], pts[i][1], m[0], m[1]]);
    }
  } else {
    const half = sides / 2;
    for (let i = 0; i < half; i++) {
      const o = pts[i + half];
      out.push([pts[i][0], pts[i][1], o[0], o[1]]);
      const m1 = mid(i);
      const m2 = mid(i + half);
      out.push([m1[0], m1[1], m2[0], m2[1]]);
    }
  }
  return out;
}

/** A regular polygon, optionally with its lines of symmetry or its triangles. */
export function PolygonFig({
  sides,
  r = 52,
  symmetryLines = false,
  triangles = false,
  caption,
  colour = C.brand,
}: {
  sides: number;
  r?: number;
  symmetryLines?: boolean;
  triangles?: boolean;
  caption?: string;
  colour?: string;
}) {
  const cx = r + 16;
  const cy = r + 16;
  const W = cx * 2;
  const H = cy * 2;
  const start = -Math.PI / 2;
  const pts = Array.from({ length: sides }, (_, i) => {
    const t = start + (i * 2 * Math.PI) / sides;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
  });
  const mid = (i: number) => {
    const j = (i + 1) % sides;
    return [(pts[i][0] + pts[j][0]) / 2, (pts[i][1] + pts[j][1]) / 2] as const;
  };
  return (
    <Frame w={W} h={H} max={W * 1.4} label={`a regular polygon with ${sides} sides`} caption={caption}>
      <polygon points={pts.map((p) => `${p[0]},${p[1]}`).join(" ")} fill={C.brandSoft} stroke={colour} strokeWidth="2.2" />
      {symmetryLines && symLines(sides, pts, mid).map((ln, i) => (
        <line
          key={i}
          x1={ln[0]}
          y1={ln[1]}
          x2={ln[2]}
          y2={ln[3]}
          stroke={C.teal}
          strokeWidth="1.6"
          strokeDasharray="5 3"
        />
      ))}
      {triangles &&
        Array.from({ length: sides - 3 }, (_, i) => (
          <line
            key={i}
            x1={pts[0][0]}
            y1={pts[0][1]}
            x2={pts[i + 2][0]}
            y2={pts[i + 2][1]}
            stroke={C.amber}
            strokeWidth="1.8"
          />
        ))}
    </Frame>
  );
}

/**
 * A rectangle folded along its diagonal, with the folded half drawn where it
 * actually lands. It does not match — which is the whole point.
 */
export function DiagonalFoldFig({ w, h, caption }: { w: number; h: number; caption?: string }) {
  const s = Math.min(26, 180 / w, 110 / h);
  const PAD = 14;
  // reflect the corner (w, 0) across the diagonal from (0,0) to (w,h)
  const k = (w * w) / (w * w + h * h);
  const rx = 2 * k * w - w;
  const ry = 2 * k * h;
  const maxY = Math.max(h, ry);
  const W = PAD * 2 + Math.max(w, rx) * s;
  const H = PAD * 2 + maxY * s;
  const X = (x: number) => PAD + x * s;
  const Y = (y: number) => PAD + (maxY - y) * s;
  return (
    <Frame w={W} h={H} max={Math.min(W * 1.5, 340)} label="folding a rectangle along its diagonal" caption={caption}>
      <rect x={X(0)} y={Y(h)} width={w * s} height={h * s} fill="#ffffff" stroke={C.brand} strokeWidth="2" />
      <line x1={X(0)} y1={Y(0)} x2={X(w)} y2={Y(h)} stroke={C.red} strokeWidth="2" strokeDasharray="5 3" />
      <polygon
        points={`${X(0)},${Y(0)} ${X(rx)},${Y(ry)} ${X(w)},${Y(h)}`}
        fill={C.redSoft}
        fillOpacity="0.85"
        stroke={C.red}
        strokeWidth="1.8"
      />
      <text x={X(rx)} y={Y(ry) - 6} fontSize="10.5" fontWeight="800" textAnchor="middle" fill={C.red}>
        sticks out
      </text>
    </Frame>
  );
}

/* ---------------------------------------------------------------- measuring */

/** The same length tiled by two different units — the root of every conversion. */
export function TileBar({
  units,
  unitName,
  colour = C.teal,
  caption,
  width = 230,
}: {
  units: number;
  unitName: string;
  colour?: string;
  caption?: string;
  width?: number;
}) {
  const H = 44;
  const cell = width / units;
  return (
    <Frame w={width + 8} h={H} max={width + 8} label={`a desk measured as ${units} ${unitName}`} caption={caption}>
      {Array.from({ length: units }, (_, i) => (
        <rect
          key={i}
          x={4 + i * cell}
          y={8}
          width={cell}
          height={22}
          fill={i % 2 ? "#ffffff" : colour}
          fillOpacity={i % 2 ? 1 : 0.35}
          stroke={colour}
          strokeWidth="1.4"
        />
      ))}
      <text x={4 + width / 2} y={41} fontSize="11" fontWeight="800" textAnchor="middle" fill={colour}>
        {units} {unitName}
      </text>
    </Frame>
  );
}

/** A ruler with an object laid on it — which may not start at zero. */
export function RulerFig({
  start,
  end,
  max = 15,
  unit = "cm",
  caption,
}: {
  start: number;
  end: number;
  max?: number;
  unit?: string;
  caption?: string;
}) {
  const s = 240 / max;
  const PAD = 12;
  const W = PAD * 2 + max * s;
  const H = 92;
  const ry = 40;
  return (
    <Frame w={W} h={H} max={W * 1.3} label={`an object from ${start} to ${end} ${unit} on a ruler`} caption={caption}>
      <rect x={PAD + start * s} y={12} width={(end - start) * s} height={20} rx="4" fill={C.amberSoft} stroke={C.amber} strokeWidth="2" />
      <rect x={PAD} y={ry} width={max * s} height={34} fill={C.paper} stroke={C.soft} strokeWidth="1.4" />
      {Array.from({ length: max + 1 }, (_, i) => (
        <g key={i}>
          <line x1={PAD + i * s} y1={ry} x2={PAD + i * s} y2={ry + 11} stroke={C.line} strokeWidth="1.2" />
          <text x={PAD + i * s} y={ry + 24} fontSize="9" textAnchor="middle" fill={C.ink}>
            {i}
          </text>
        </g>
      ))}
      <line x1={PAD + start * s} y1={12} x2={PAD + start * s} y2={ry} stroke={C.red} strokeWidth="1.2" strokeDasharray="3 2" />
      <line x1={PAD + end * s} y1={12} x2={PAD + end * s} y2={ry} stroke={C.red} strokeWidth="1.2" strokeDasharray="3 2" />
      <text x={PAD + ((start + end) / 2) * s} y={86} fontSize="10.5" fontWeight="800" textAnchor="middle" fill={C.line}>
        {unit}
      </text>
    </Frame>
  );
}

/** An analogue clock face. */
export function ClockFig({ h, m, caption, colour = C.brand }: { h: number; m: number; caption?: string; colour?: string }) {
  const R = 54;
  const cx = R + 12;
  const cy = R + 12;
  const W = cx * 2;
  const minAngle = (m / 60) * 2 * Math.PI - Math.PI / 2;
  const hourAngle = (((h % 12) + m / 60) / 12) * 2 * Math.PI - Math.PI / 2;
  return (
    <Frame w={W} h={W} max={160} label={`a clock showing ${h}:${String(m).padStart(2, "0")}`} caption={caption}>
      <circle cx={cx} cy={cy} r={R} fill="#ffffff" stroke={colour} strokeWidth="2.4" />
      {Array.from({ length: 12 }, (_, i) => {
        const t = (i / 12) * 2 * Math.PI - Math.PI / 2;
        return (
          <text
            key={i}
            x={cx + (R - 13) * Math.cos(t)}
            y={cy + (R - 13) * Math.sin(t) + 4}
            fontSize="10.5"
            fontWeight="700"
            textAnchor="middle"
            fill={C.ink}
          >
            {i === 0 ? 12 : i}
          </text>
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={cx + R * 0.5 * Math.cos(hourAngle)}
        y2={cy + R * 0.5 * Math.sin(hourAngle)}
        stroke={C.line}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx + R * 0.76 * Math.cos(minAngle)}
        y2={cy + R * 0.76 * Math.sin(minAngle)}
        stroke={C.red}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="3" fill={C.line} />
    </Frame>
  );
}

/** A time line broken at the o'clock, which is where the counting-on works. */
export function TimeJumps({
  stops,
  caption,
}: {
  /** e.g. [{ at: "2:45" }, { gap: "15 min", at: "3:00" }, ...] */
  stops: { at: string; gap?: string }[];
  caption?: string;
}) {
  const gapPx = 78;
  const PAD = 26;
  const W = PAD * 2 + (stops.length - 1) * gapPx;
  const H = 74;
  const y = 50;
  return (
    <Frame w={W} h={H} max={Math.min(W * 1.2, 360)} label="counting on through the hour" caption={caption}>
      <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={C.soft} strokeWidth="2" />
      {stops.map((st, i) => (
        <g key={i}>
          <circle cx={PAD + i * gapPx} cy={y} r="4.5" fill={C.brand} />
          <text x={PAD + i * gapPx} y={y + 18} fontSize="10.5" fontWeight="800" textAnchor="middle" fill={C.ink}>
            {st.at}
          </text>
          {st.gap && i > 0 && (
            <>
              <path
                d={`M ${PAD + (i - 1) * gapPx} ${y - 6} Q ${PAD + (i - 0.5) * gapPx} ${y - 30} ${PAD + i * gapPx} ${y - 6}`}
                fill="none"
                stroke={C.amber}
                strokeWidth="2"
              />
              <text
                x={PAD + (i - 0.5) * gapPx}
                y={y - 26}
                fontSize="10.5"
                fontWeight="800"
                textAnchor="middle"
                fill={C.amber}
              >
                {st.gap}
              </text>
            </>
          )}
        </g>
      ))}
    </Frame>
  );
}

/* -------------------------------------------------------------- scaling */

/**
 * Two similar rectangles tiled with unit squares, so the area ratio can be
 * counted instead of argued about.
 */
export function ScaleCompare({
  w,
  h,
  k,
  caption,
}: {
  w: number;
  h: number;
  k: number;
  caption?: string;
}) {
  const s = Math.min(15, 150 / (k * w), 110 / (k * h));
  const gap = 34;
  const PAD = 12;
  const W = PAD * 2 + w * s + gap + k * w * s;
  const H = PAD * 2 + k * h * s + 20;
  const base = PAD + k * h * s;
  const tile = (x0: number, cols: number, rows: number, colour: string, soft: string, key: string) => {
    const caption = `${cols * rows} squares`;
    // Keep a caption wider than its own rectangle inside the drawing.
    const half = caption.length * 2.8;
    const cx = Math.min(Math.max(x0 + (cols * s) / 2, half), W - half);
    return (
      <g key={key}>
        <rect x={x0} y={base - rows * s} width={cols * s} height={rows * s} fill={soft} stroke={colour} strokeWidth="2" />
        {Array.from({ length: cols * rows }, (_, i) => (
          <rect
            key={i}
            x={x0 + (i % cols) * s}
            y={base - rows * s + Math.floor(i / cols) * s}
            width={s}
            height={s}
            fill="none"
            stroke={colour}
            strokeOpacity="0.35"
            strokeWidth="0.8"
          />
        ))}
        <text x={cx} y={base + 15} fontSize="10" fontWeight="800" textAnchor="middle" fill={colour}>
          {caption}
        </text>
      </g>
    );
  };
  return (
    <Frame w={W} h={H} max={Math.min(W * 1.4, 360)} label={`a ${w} by ${h} rectangle beside one scaled by ${k}`} caption={caption}>
      {tile(PAD, w, h, C.teal, C.tealSoft, "small")}
      {tile(PAD + w * s + gap, k * w, k * h, C.brand, C.brandSoft, "big")}
    </Frame>
  );
}
