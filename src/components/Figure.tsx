import React from "react";
import { triangleFromAngles, type FigureSpec } from "@/engine/figures";

/**
 * Renders a FigureSpec as an accurate, self-contained SVG.
 *
 * Server-renderable and print-safe: strokes and text use currentColor so
 * the figure follows the page's ink in any theme and on paper; fills are
 * translucent currentColor. Angles are drawn at their TRUE measure and
 * triangles are constructed from their stated angles — a figure that lies
 * is worse than no figure.
 */

const S = 1.6; // stroke width
const F = 12; // label font size

function Svg({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="qfig"
      role="img"
      aria-hidden="true"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      <g stroke="currentColor" strokeWidth={S} fill="none" strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
    </svg>
  );
}

const Label = ({ x, y, children, anchor = "middle" }: { x: number; y: number; children: React.ReactNode; anchor?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} fontSize={F} fill="currentColor" stroke="none" textAnchor={anchor} fontFamily="inherit">
    {children}
  </text>
);

/** Arc path around a vertex from startDeg to endDeg (math orientation, y flipped). */
function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const a0 = (startDeg * Math.PI) / 180;
  const a1 = (endDeg * Math.PI) / 180;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy - r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy - r * Math.sin(a1);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 0 ${x1} ${y1}`;
}

/** Vertex sets for named shapes, in a 160×120 box. Regular n-gons by formula. */
function shapePoints(name: string): [number, number][] | null {
  const regular = (n: number, r = 58, cx = 80, cy = 62): [number, number][] =>
    Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  switch (name) {
    case "triangle":
    case "equilateral triangle":
      return regular(3, 62);
    case "isosceles triangle":
      return [[80, 8], [44, 116], [116, 116]];
    case "square":
      return [[30, 12], [130, 12], [130, 112], [30, 112]];
    case "rectangle":
      return [[10, 32], [150, 32], [150, 96], [10, 96]];
    case "rhombus":
      return [[80, 8], [136, 62], [80, 116], [24, 62]];
    case "parallelogram":
      return [[42, 30], [152, 30], [118, 98], [8, 98]];
    case "trapezoid":
    case "trapezium":
      return [[48, 28], [112, 28], [148, 100], [12, 100]];
    case "quadrilateral":
      return [[36, 18], [140, 34], [122, 108], [16, 88]];
    case "pentagon":
      return regular(5);
    case "hexagon":
      return regular(6);
    case "heptagon":
      return regular(7);
    case "octagon":
      return regular(8);
    default:
      return null;
  }
}

/** Shared coordinate grid for the point-based figures. */
function Grid({
  extent,
  quad,
  children,
}: {
  extent: number;
  quad: boolean;
  children: (toPx: (x: number, y: number) => [number, number]) => React.ReactNode;
}) {
  const max = Math.max(4, extent);
  const cell = Math.min(18, 130 / max);
  const half = max * cell;
  const ox = quad ? half + 14 : 26;
  const oy = half + 14;
  const toPx = (x: number, y: number): [number, number] => [ox + x * cell, oy - y * cell];
  const lines: React.ReactNode[] = [];
  for (let i = -(quad ? max : 0); i <= max; i++) {
    lines.push(
      <path key={`v${i}`} d={`M ${ox + i * cell} ${oy - half} V ${quad ? oy + half : oy}`} strokeWidth={0.5} strokeOpacity={i === 0 ? 0.9 : 0.2} />,
      <path key={`h${i}`} d={`M ${quad ? ox - half : ox} ${oy - i * cell} H ${ox + half}`} strokeWidth={0.5} strokeOpacity={i === 0 ? 0.9 : 0.2} />
    );
  }
  return (
    <Svg w={ox + half + 30} h={(quad ? oy + half : oy) + 22}>
      {lines}
      <Label x={ox + half + 12} y={oy + 4} anchor="start">x</Label>
      <Label x={ox - 2} y={oy - half - 6} anchor="end">y</Label>
      {children(toPx)}
    </Svg>
  );
}

const Pt = ({ at, label }: { at: [number, number]; label: string }) => (
  <>
    <circle cx={at[0]} cy={at[1]} r={3.4} fill="currentColor" stroke="none" />
    <Label x={at[0] + 8} y={at[1] - 6} anchor="start">{label}</Label>
  </>
);

export function Figure({ spec }: { spec: FigureSpec }) {
  switch (spec.fig) {
    case "rect": {
      const ratio = Math.max(0.6, Math.min(3, spec.ratio));
      const w = ratio >= 1 ? 170 : 170 * ratio;
      const h = ratio >= 1 ? 170 / ratio : 170;
      const H = Math.max(70, Math.min(140, h));
      const W = Math.max(90, Math.min(190, w));
      return (
        <Svg w={W + 70} h={H + 34}>
          <rect x={8} y={8} width={W} height={H} fill="currentColor" fillOpacity={0.06} />
          <Label x={8 + W / 2} y={H + 28}>{spec.wLabel}</Label>
          <Label x={W + 18} y={8 + H / 2 + 4} anchor="start">{spec.hLabel}</Label>
        </Svg>
      );
    }

    case "rect-cut": {
      const sc = 160 / Math.max(spec.W, spec.H);
      const W = spec.W * sc;
      const H = spec.H * sc;
      const w = spec.w * sc;
      const h = spec.h * sc;
      // Outer rectangle with the w×h notch removed from the top-right corner.
      const d = `M 8 8 H ${8 + W - w} V ${8 + h} H ${8 + W} V ${8 + H} H 8 Z`;
      return (
        <Svg w={W + 70} h={H + 34}>
          <path d={d} fill="currentColor" fillOpacity={0.06} />
          <path d={`M ${8 + W - w} 8 H ${8 + W} V ${8 + h}`} strokeDasharray="4 3" strokeOpacity={0.5} />
          <Label x={8 + W / 2} y={H + 28}>{`${spec.W} ${spec.unit}`}</Label>
          <Label x={W + 16} y={8 + H / 2 + 4} anchor="start">{`${spec.H} ${spec.unit}`}</Label>
          <Label x={8 + W - w / 2} y={4 + h / 2 + 4}>{`${spec.w}×${spec.h}`}</Label>
        </Svg>
      );
    }

    case "tri-base-height": {
      const ratio = Math.max(0.7, Math.min(2.5, spec.ratio));
      const B = ratio >= 1 ? 170 : 170 * ratio;
      const H = Math.max(70, Math.min(140, ratio >= 1 ? 170 / ratio : 170));
      const ax = 8 + B * 0.42;
      return (
        <Svg w={B + 80} h={H + 36}>
          <path d={`M 8 ${8 + H} L ${8 + B} ${8 + H} L ${ax} 8 Z`} fill="currentColor" fillOpacity={0.06} />
          <path d={`M ${ax} 8 V ${8 + H}`} strokeDasharray="4 3" strokeOpacity={0.6} />
          <path d={`M ${ax - 8} ${8 + H} v -8 h 8`} strokeWidth={1} />
          <Label x={8 + B / 2} y={H + 30}>{spec.baseLabel}</Label>
          <Label x={ax + 6} y={8 + H / 2} anchor="start">{spec.heightLabel}</Label>
        </Svg>
      );
    }

    case "tri-sides": {
      // Exact construction: base = the longest side, apex by law of cosines.
      const [p, q, r] = [spec.a, spec.b, spec.c].sort((x, y) => y - x);
      const sc = 170 / p;
      const B = p * sc;
      // Apex measured from the left end of the base: sides q (left) and r (right).
      const axU = (q * q + p * p - r * r) / (2 * p);
      const ayU = Math.sqrt(Math.max(0.1, q * q - axU * axU));
      const x0 = 20;
      const H = ayU * sc;
      const y0 = 16 + H;
      const apexX = x0 + axU * sc;
      return (
        <Svg w={B + 80} h={H + 40}>
          <path d={`M ${x0} ${y0} L ${x0 + B} ${y0} L ${apexX} 16 Z`} fill="currentColor" fillOpacity={0.06} />
          <Label x={x0 + B / 2} y={y0 + 18}>{`${p} ${spec.unit}`}</Label>
          <Label x={(x0 + apexX) / 2 - 8} y={(y0 + 16) / 2} anchor="end">{`${q} ${spec.unit}`}</Label>
          <Label x={(x0 + B + apexX) / 2 + 8} y={(y0 + 16) / 2} anchor="start">{`${r} ${spec.unit}`}</Label>
        </Svg>
      );
    }

    case "angle": {
      const d = spec.degrees;
      const r = 70;
      const cx = d > 180 ? 110 : 30;
      const cy = 96;
      const ex = cx + r * Math.cos((d * Math.PI) / 180);
      const ey = cy - r * Math.sin((d * Math.PI) / 180);
      const midRad = ((d / 2) * Math.PI) / 180;
      const lr = d < 60 ? 46 : 32;
      return (
        <Svg w={220} h={130}>
          <path d={`M ${cx + r} ${cy} H ${cx}`} />
          <path d={`M ${cx} ${cy} L ${ex} ${ey}`} />
          <path d={arc(cx, cy, 20, 0, d)} strokeOpacity={0.8} />
          <Label x={cx + lr * Math.cos(midRad)} y={cy - lr * Math.sin(midRad) + 4}>{`${d}°`}</Label>
        </Svg>
      );
    }

    case "angle-pair": {
      const cx = spec.total === 90 ? 30 : 110;
      const cy = 100;
      const r = 80;
      const k = spec.known;
      const ex = cx + r * Math.cos((k * Math.PI) / 180);
      const ey = cy - r * Math.sin((k * Math.PI) / 180);
      const endX = spec.total === 90 ? cx : cx - r;
      const other = spec.total - k;
      const midK = ((k / 2) * Math.PI) / 180;
      const midO = (((k + other / 2) * Math.PI) / 180);
      return (
        <Svg w={220} h={132}>
          <path d={`M ${cx + r} ${cy} H ${endX}`} />
          {spec.total === 90 && <path d={`M ${cx} ${cy} V ${cy - r}`} />}
          <path d={`M ${cx} ${cy} L ${ex} ${ey}`} />
          <path d={arc(cx, cy, 22, 0, k)} strokeOpacity={0.8} />
          <path d={arc(cx, cy, 30, k, spec.total)} strokeOpacity={0.8} />
          <Label x={cx + 48 * Math.cos(midK)} y={cy - 48 * Math.sin(midK) + 4}>{`${k}°`}</Label>
          <Label x={cx + 52 * Math.cos(midO)} y={cy - 52 * Math.sin(midO) + 4}>?</Label>
        </Svg>
      );
    }

    case "tri-angles": {
      const { ax, ay } = triangleFromAngles(spec.degA, spec.degB);
      const base = 180;
      const H = Math.min(120, ay * base);
      const sc = ay * base > 120 ? 120 / (ay * base) : 1;
      const x0 = 20;
      const y0 = 20 + Math.min(120, ay * base * sc);
      const apexX = x0 + ax * base * sc;
      const apexY = y0 - ay * base * sc;
      const x1 = x0 + base * sc;
      return (
        <Svg w={base + 60} h={y0 + 36 - Math.min(0, apexY)}>
          <path d={`M ${x0} ${y0} L ${x1} ${y0} L ${apexX} ${apexY} Z`} fill="currentColor" fillOpacity={0.06} />
          <Label x={x0 + 26} y={y0 - 6} anchor="start">{spec.labelA}</Label>
          <Label x={x1 - 26} y={y0 - 6} anchor="end">{spec.labelB}</Label>
          <Label x={apexX} y={apexY + 24}>{spec.labelC}</Label>
        </Svg>
      );
    }

    case "right-triangle": {
      const sc = 130 / Math.max(spec.a, spec.b);
      const A = spec.a * sc; // vertical leg
      const B = spec.b * sc; // horizontal leg
      const x0 = 14;
      const y0 = 16 + A;
      return (
        <Svg w={B + 110} h={A + 44}>
          <path d={`M ${x0} ${y0} h ${B} l ${-B} ${-A} Z`} fill="currentColor" fillOpacity={0.06} />
          <path d={`M ${x0} ${y0 - 12} h 12 v 12`} strokeWidth={1} />
          <Label x={x0 - 6} y={y0 - A / 2 + 4} anchor="end">{spec.aLabel}</Label>
          <Label x={x0 + B / 2} y={y0 + 20}>{spec.bLabel}</Label>
          <Label x={x0 + B / 2 + 14} y={y0 - A / 2 - 8} anchor="start">{spec.cLabel}</Label>
        </Svg>
      );
    }

    case "circle": {
      const r = 58;
      const cx = 78;
      const cy = 72;
      return (
        <Svg w={210} h={146}>
          <circle cx={cx} cy={cy} r={r} fill="currentColor" fillOpacity={0.06} />
          <circle cx={cx} cy={cy} r={1.8} fill="currentColor" stroke="none" />
          {spec.mode === "radius" ? (
            <path d={`M ${cx} ${cy} L ${cx + r * 0.94} ${cy - r * 0.34}`} />
          ) : (
            <path d={`M ${cx - r * 0.94} ${cy + r * 0.34} L ${cx + r * 0.94} ${cy - r * 0.34}`} />
          )}
          <Label x={cx + r + 8} y={cy - r * 0.34} anchor="start">{spec.label}</Label>
        </Svg>
      );
    }

    case "cube":
    case "cuboid": {
      const isCube = spec.fig === "cube";
      const l = isCube ? 1 : spec.l;
      const w = isCube ? 1 : spec.w;
      const h = isCube ? 1 : spec.h;
      const sc = 110 / Math.max(l, w, h);
      const L = l * sc;
      const H = h * sc;
      const D = w * sc * 0.5; // foreshortened depth
      const x0 = 14;
      const y0 = 20 + D;
      return (
        <Svg w={L + D + 110} h={H + D + 50}>
          <rect x={x0} y={y0} width={L} height={H} fill="currentColor" fillOpacity={0.06} />
          <path d={`M ${x0} ${y0} l ${D} ${-D} h ${L} l ${-D} ${D}`} fill="currentColor" fillOpacity={0.1} />
          <path d={`M ${x0 + L} ${y0} l ${D} ${-D} v ${H} l ${-D} ${D}`} fill="currentColor" fillOpacity={0.03} />
          <Label x={x0 + L / 2} y={y0 + H + 20}>{isCube ? spec.edgeLabel : spec.lLabel}</Label>
          {!isCube && (
            <>
              <Label x={x0 + L + D + 6} y={y0 + H / 2 - D / 2 + 4} anchor="start">{spec.hLabel}</Label>
              <Label x={x0 + L + D / 2 + 8} y={y0 + H + 8} anchor="start">{spec.wLabel}</Label>
            </>
          )}
        </Svg>
      );
    }

    case "poly": {
      const pts = shapePoints(spec.name);
      if (!pts) return null;
      const d = `M ${pts.map((p) => p.join(" ")).join(" L ")} Z`;
      return (
        <Svg w={168} h={128}>
          <path d={d} fill="currentColor" fillOpacity={0.06} />
        </Svg>
      );
    }

    case "letter":
      return (
        <Svg w={110} h={110}>
          <text x={55} y={82} fontSize={78} fontWeight={700} textAnchor="middle" fill="currentColor" stroke="none" fontFamily="inherit">
            {spec.ch}
          </text>
        </Svg>
      );

    case "grid-2pts": {
      const extent = Math.max(Math.abs(spec.x1), Math.abs(spec.y1), Math.abs(spec.x2), Math.abs(spec.y2)) + 1;
      const quad = spec.x1 < 0 || spec.y1 < 0 || spec.x2 < 0 || spec.y2 < 0;
      return (
        <Grid extent={extent} quad={quad}>
          {(toPx) => {
            const p1 = toPx(spec.x1, spec.y1);
            const p2 = toPx(spec.x2, spec.y2);
            let ext: React.ReactNode = null;
            if (spec.line) {
              // Extend the line through both points to the drawing's edge.
              const dx = p2[0] - p1[0];
              const dy = p2[1] - p1[1];
              const n = Math.hypot(dx, dy) || 1;
              const ux = dx / n;
              const uy = dy / n;
              ext = (
                <path
                  d={`M ${p1[0] - ux * 300} ${p1[1] - uy * 300} L ${p2[0] + ux * 300} ${p2[1] + uy * 300}`}
                  strokeOpacity={0.55}
                />
              );
            }
            return (
              <>
                {ext}
                {spec.segment && <path d={`M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`} strokeOpacity={0.7} />}
                <Pt at={p1} label={`${spec.l1}(${spec.x1}, ${spec.y1})`} />
                <Pt at={p2} label={`${spec.l2}(${spec.x2}, ${spec.y2})`} />
              </>
            );
          }}
        </Grid>
      );
    }

    case "grid-reflect": {
      const extent = Math.max(Math.abs(spec.x), Math.abs(spec.y)) + 1;
      return (
        <Grid extent={extent} quad>
          {(toPx) => {
            const p = toPx(spec.x, spec.y);
            const a0 = spec.axis === "x" ? toPx(-extent, 0) : toPx(0, -extent);
            const a1 = spec.axis === "x" ? toPx(extent, 0) : toPx(0, extent);
            return (
              <>
                <path d={`M ${a0[0]} ${a0[1]} L ${a1[0]} ${a1[1]}`} strokeWidth={2} strokeDasharray="5 4" strokeOpacity={0.7} />
                <Pt at={p} label={`P(${spec.x}, ${spec.y})`} />
              </>
            );
          }}
        </Grid>
      );
    }

    case "grid-map": {
      const extent = Math.max(Math.abs(spec.x1), Math.abs(spec.y1), Math.abs(spec.x2), Math.abs(spec.y2)) + 1;
      return (
        <Grid extent={extent} quad>
          {(toPx) => {
            const p1 = toPx(spec.x1, spec.y1);
            const p2 = toPx(spec.x2, spec.y2);
            const dx = p2[0] - p1[0];
            const dy = p2[1] - p1[1];
            const n = Math.hypot(dx, dy) || 1;
            const hx = p2[0] - (dx / n) * 8;
            const hy = p2[1] - (dy / n) * 8;
            return (
              <>
                <path d={`M ${p1[0]} ${p1[1]} L ${hx} ${hy}`} strokeDasharray="4 3" strokeOpacity={0.7} />
                <path d={`M ${p2[0]} ${p2[1]} L ${hx - (dy / n) * 4} ${hy + (dx / n) * 4} M ${p2[0]} ${p2[1]} L ${hx + (dy / n) * 4} ${hy - (dx / n) * 4}`} strokeOpacity={0.7} />
                <Pt at={p1} label={`(${spec.x1}, ${spec.y1})`} />
                <Pt at={p2} label={`(${spec.x2}, ${spec.y2})`} />
              </>
            );
          }}
        </Grid>
      );
    }

    case "similar-tris": {
      const k = spec.k;
      const sw = 66;
      const sh = 48;
      const lw = sw * k;
      const lh = sh * k;
      const gap = 26;
      const y0 = 16 + lh;
      return (
        <Svg w={sw + lw + gap + 60} h={lh + 56}>
          <path d={`M 10 ${y0} h ${sw} l ${-sw} ${-sh} Z`} fill="currentColor" fillOpacity={0.06} />
          <path d={`M ${10 + sw + gap} ${y0} h ${lw} l ${-lw} ${-lh} Z`} fill="currentColor" fillOpacity={0.06} />
          <Label x={10 + sw / 2} y={y0 + 18}>{spec.small[0]}</Label>
          {spec.small[1] && <Label x={4} y={y0 - sh / 2} anchor="start">{spec.small[1]}</Label>}
          <Label x={10 + sw + gap + lw / 2} y={y0 + 18}>{spec.large[0]}</Label>
          {spec.large[1] && <Label x={10 + sw + gap - 6} y={y0 - lh / 2} anchor="end">{spec.large[1]}</Label>}
        </Svg>
      );
    }

    case "similar-rects": {
      const k = Math.max(1.2, Math.min(3, spec.k));
      const sw = 54;
      const sh = 40;
      const y0 = 14 + sh * k;
      return (
        <Svg w={sw + sw * k + 100} h={sh * k + 50}>
          <rect x={10} y={y0 - sh} width={sw} height={sh} fill="currentColor" fillOpacity={0.06} />
          <rect x={sw + 40} y={y0 - sh * k} width={sw * k} height={sh * k} fill="currentColor" fillOpacity={0.06} />
          <Label x={10 + sw / 2} y={y0 + 16}>{spec.sideLabel}</Label>
          <Label x={sw + 40 + (sw * k) / 2} y={y0 + 16}>?</Label>
          <Label x={sw + 24} y={y0 - sh * k - 2} anchor="start">{`× ${spec.k}`}</Label>
        </Svg>
      );
    }

    case "net": {
      const s = 34; // unit face size
      const sq = (x: number, y: number, w = s, h = s, key?: string) => (
        <rect key={key} x={x} y={y} width={w} height={h} fill="currentColor" fillOpacity={0.06} />
      );
      const tri = (pts: [number, number][], key?: string) => (
        <path key={key} d={`M ${pts.map((p) => p.join(" ")).join(" L ")} Z`} fill="currentColor" fillOpacity={0.06} />
      );
      const label = spec.label ? (
        <Label x={14 + 1.5 * s} y={14 + 3 * s + 16}>{spec.label}</Label>
      ) : null;
      if (spec.solid === "cube" || spec.solid === "rectangular prism") {
        // The classic cross: four faces in a column, two wings. A prism
        // stretches the column faces.
        const w = spec.solid === "cube" ? s : Math.round(s * 1.5);
        const x0 = 14;
        return (
          <Svg w={x0 + w + 2 * s + 20} h={14 + 4 * s + (spec.label ? 26 : 8)}>
            {sq(x0 + s, 14, w, s, "a")}
            {sq(x0 + s, 14 + s, w, s, "b")}
            {sq(x0 + s, 14 + 2 * s, w, s, "c")}
            {sq(x0 + s, 14 + 3 * s, w, s, "d")}
            {sq(x0 + s - s, 14 + s, s, s, "e")}
            {sq(x0 + s + w, 14 + s, s, s, "f")}
            {label}
          </Svg>
        );
      }
      if (spec.solid === "square pyramid") {
        const x0 = 30;
        const y0 = 44;
        return (
          <Svg w={x0 + s + 76} h={y0 + s + 46}>
            {sq(x0, y0)}
            {tri([[x0, y0], [x0 + s, y0], [x0 + s / 2, y0 - 30]], "t")}
            {tri([[x0, y0 + s], [x0 + s, y0 + s], [x0 + s / 2, y0 + s + 30]], "b")}
            {tri([[x0, y0], [x0, y0 + s], [x0 - 30, y0 + s / 2]], "l")}
            {tri([[x0 + s, y0], [x0 + s, y0 + s], [x0 + s + 30, y0 + s / 2]], "r")}
          </Svg>
        );
      }
      if (spec.solid === "triangular prism") {
        const x0 = 14;
        const y0 = 44;
        const w = Math.round(s * 1.3);
        return (
          <Svg w={x0 + 3 * w + 20} h={y0 + s + 44}>
            {sq(x0, y0, w, s, "r1")}
            {sq(x0 + w, y0, w, s, "r2")}
            {sq(x0 + 2 * w, y0, w, s, "r3")}
            {tri([[x0 + w, y0], [x0 + 2 * w, y0], [x0 + 1.5 * w, y0 - 32]], "t")}
            {tri([[x0 + w, y0 + s], [x0 + 2 * w, y0 + s], [x0 + 1.5 * w, y0 + s + 32]], "b")}
          </Svg>
        );
      }
      if (spec.solid === "cylinder") {
        const x0 = 14;
        const r = 20;
        const y0 = 14 + 2 * r + 6;
        const w = Math.round(2 * Math.PI * r * 0.6);
        return (
          <Svg w={x0 + w + 20} h={y0 + s + 2 * r + 18}>
            <circle cx={x0 + w / 2} cy={14 + r} r={r} fill="currentColor" fillOpacity={0.06} />
            {sq(x0, y0, w, s, "body")}
            <circle cx={x0 + w / 2} cy={y0 + s + r + 6} r={r} fill="currentColor" fillOpacity={0.06} />
          </Svg>
        );
      }
      // Triangular pyramid: one central triangle, three folded outward.
      const cx = 90;
      const cy = 74;
      const R = 40;
      const v = [0, 1, 2].map((i): [number, number] => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / 3;
        return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
      });
      const mirror = (i: number, j: number): [number, number] => {
        const k = 3 - i - j;
        const mx = (v[i][0] + v[j][0]) / 2;
        const my = (v[i][1] + v[j][1]) / 2;
        return [2 * mx - v[k][0], 2 * my - v[k][1]];
      };
      return (
        <Svg w={180} h={150}>
          {tri(v, "mid")}
          {tri([v[0], v[1], mirror(0, 1)], "f1")}
          {tri([v[1], v[2], mirror(1, 2)], "f2")}
          {tri([v[0], v[2], mirror(0, 2)], "f3")}
        </Svg>
      );
    }

    case "net-box": {
      const sc = 26 / Math.max(spec.l, spec.w, spec.h) + 3;
      const L = spec.l * sc;
      const W = spec.w * sc;
      const H = spec.h * sc;
      const x0 = 16 + W;
      const y0 = 14 + W;
      // Cross: column of front(l×h), bottom(l×w), back(l×h), top(l×w); side wings (w×h).
      return (
        <Svg w={x0 + L + W + 70} h={y0 + H + W + H + 30}>
          <rect x={x0} y={y0 - W} width={L} height={W} fill="currentColor" fillOpacity={0.06} />
          <rect x={x0} y={y0} width={L} height={H} fill="currentColor" fillOpacity={0.06} />
          <rect x={x0} y={y0 + H} width={L} height={W} fill="currentColor" fillOpacity={0.06} />
          <rect x={x0} y={y0 + H + W} width={L} height={H} fill="currentColor" fillOpacity={0.06} />
          <rect x={x0 - W} y={y0} width={W} height={H} fill="currentColor" fillOpacity={0.06} />
          <rect x={x0 + L} y={y0} width={W} height={H} fill="currentColor" fillOpacity={0.06} />
          <Label x={x0 + L / 2} y={y0 + H + W + H + 16}>{`${spec.l} ${spec.unit}`}</Label>
          <Label x={x0 + L + W + 8} y={y0 + H / 2 + 4} anchor="start">{`${spec.h} ${spec.unit}`}</Label>
          <Label x={x0 + L + W + 8} y={y0 + H + W / 2 + 4} anchor="start">{`${spec.w} ${spec.unit}`}</Label>
        </Svg>
      );
    }

    case "congruent-tris": {
      // Two identical triangles, the second rotated — congruent, not just
      // similar, and visibly "moved" rather than copied in place.
      const t1: [number, number][] = [[14, 96], [86, 96], [32, 30]];
      const c = [150, 63];
      const t2 = t1.map(([x, y]): [number, number] => [2 * c[0] - x + 60, 2 * c[1] - y]);
      const names1 = ["A", "B", "C"];
      const names2 = ["D", "E", "F"];
      return (
        <Svg w={330} h={122}>
          <path d={`M ${t1.map((p) => p.join(" ")).join(" L ")} Z`} fill="currentColor" fillOpacity={0.06} />
          <path d={`M ${t2.map((p) => p.join(" ")).join(" L ")} Z`} fill="currentColor" fillOpacity={0.06} />
          {t1.map((p, i) => (
            <Label key={i} x={p[0] + (i === 1 ? 8 : -8)} y={p[1] + (i === 2 ? -6 : 12)} anchor={i === 1 ? "start" : "end"}>{names1[i]}</Label>
          ))}
          {t2.map((p, i) => (
            <Label key={i} x={p[0] + (i === 1 ? -8 : 8)} y={p[1] + (i === 2 ? 14 : -6)} anchor={i === 1 ? "end" : "start"}>{names2[i]}</Label>
          ))}
        </Svg>
      );
    }

    case "grid-shape":
    case "grid-shape2": {
      const all = spec.fig === "grid-shape2" ? [...spec.pts, ...spec.imgPts] : spec.pts;
      const extent = Math.max(...all.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y)))) + 1;
      const quad = spec.fig === "grid-shape2" || all.some(([x, y]) => x < 0 || y < 0);
      const names = spec.fig === "grid-shape" ? spec.names : ["A", "B", "C"];
      return (
        <Grid extent={extent} quad={quad}>
          {(toPx) => {
            const px = spec.pts.map(([x, y]) => toPx(x, y));
            const d = `M ${px.map((p) => p.join(" ")).join(" L ")} Z`;
            let img: React.ReactNode = null;
            if (spec.fig === "grid-shape2") {
              const ip = spec.imgPts.map(([x, y]) => toPx(x, y));
              img = (
                <>
                  <path d={`M ${ip.map((p) => p.join(" ")).join(" L ")} Z`} strokeDasharray="4 3" fill="currentColor" fillOpacity={0.04} />
                  {ip.map((p, i) => (
                    <Label key={`i${i}`} x={p[0] + 7} y={p[1] - 5} anchor="start">{`${names[i]}′`}</Label>
                  ))}
                </>
              );
            }
            return (
              <>
                <path d={d} fill="currentColor" fillOpacity={0.08} />
                {px.map((p, i) => (
                  <Label key={i} x={p[0] - 7} y={p[1] - 5} anchor="end">{names[i]}</Label>
                ))}
                {img}
              </>
            );
          }}
        </Grid>
      );
    }

    case "grid-point": {
      const max = spec.quad ? 5 : Math.max(5, Math.abs(spec.x) + 1, Math.abs(spec.y) + 1);
      const cell = spec.quad ? 16 : Math.min(20, 120 / max);
      const half = max * cell;
      const ox = spec.quad ? half + 14 : 24;
      const oy = spec.quad ? half + 12 : half + 12;
      const px = ox + spec.x * cell;
      const py = oy - spec.y * cell;
      const lines: React.ReactNode[] = [];
      for (let i = -(spec.quad ? max : 0); i <= max; i++) {
        const gx = ox + i * cell;
        const gy = oy - i * cell;
        lines.push(
          <path key={`v${i}`} d={`M ${gx} ${oy - half} V ${spec.quad ? oy + half : oy}`} strokeWidth={0.5} strokeOpacity={i === 0 ? 0.9 : 0.2} />,
          <path key={`h${i}`} d={`M ${spec.quad ? ox - half : ox} ${gy} H ${ox + half}`} strokeWidth={0.5} strokeOpacity={i === 0 ? 0.9 : 0.2} />
        );
      }
      return (
        <Svg w={ox + half + 30} h={(spec.quad ? oy + half : oy) + 22}>
          {lines}
          <circle cx={px} cy={py} r={3.4} fill="currentColor" stroke="none" />
          <Label x={px + 8} y={py - 6} anchor="start">{spec.label}</Label>
          <Label x={ox + half + 12} y={oy + 4} anchor="start">x</Label>
          <Label x={ox - 2} y={oy - half - 6} anchor="end">y</Label>
        </Svg>
      );
    }
  }
}
