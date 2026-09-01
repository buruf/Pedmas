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
