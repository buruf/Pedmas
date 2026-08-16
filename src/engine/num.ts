/** Number/fraction utilities shared by generator families. */

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export interface Frac {
  n: number;
  d: number;
}

export function simplify(f: Frac): Frac {
  const g = gcd(f.n, f.d);
  const sign = f.d < 0 ? -1 : 1;
  return { n: (sign * f.n) / g, d: (sign * f.d) / g };
}

export function fracAdd(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}
export function fracSub(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
}
export function fracMul(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.n, d: a.d * b.d });
}
export function fracDiv(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.d, d: a.d * b.n });
}
export function fracEq(a: Frac, b: Frac): boolean {
  return a.n * b.d === b.n * a.d;
}
export function fracCmp(a: Frac, b: Frac): number {
  return a.n * b.d - b.n * a.d;
}
export function fracValue(f: Frac): number {
  return f.n / f.d;
}

/** MathText markup for a fraction, e.g. {3/4}. Whole numbers render plain. */
export function fmtFrac(f: Frac): string {
  if (f.d === 1) return String(f.n);
  return `{${f.n}/${f.d}}`;
}

/** Mixed-number markup: 2 {3/4}; falls back to plain fraction/integer. */
export function fmtMixed(f: Frac): string {
  const s = simplify(f);
  if (s.d === 1) return String(s.n);
  const whole = Math.trunc(s.n / s.d);
  const rem = Math.abs(s.n % s.d);
  if (whole === 0) return fmtFrac(s);
  return `${whole} {${rem}/${s.d}}`;
}

/** Plain-text canonical answer form: "3/4", "2 3/4", or integer. */
export function ansFrac(f: Frac): string {
  const s = simplify(f);
  if (s.d === 1) return String(s.n);
  return `${s.n}/${s.d}`;
}

export function ansMixed(f: Frac): string {
  const s = simplify(f);
  if (s.d === 1) return String(s.n);
  const whole = Math.trunc(s.n / s.d);
  const rem = Math.abs(s.n % s.d);
  if (whole === 0) return `${s.n}/${s.d}`;
  return `${whole} ${rem}/${s.d}`;
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

export function primeFactors(n: number): number[] {
  const out: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out.push(p);
      m /= p;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

export function factorsOf(n: number): number[] {
  const out: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
  return out;
}

/** Round avoiding float noise (e.g. 0.1+0.2). */
export function round(x: number, places = 0): number {
  const p = 10 ** places;
  return Math.round((x + Number.EPSILON) * p) / p;
}

export function fmtDec(x: number, places?: number): string {
  if (places !== undefined) return x.toFixed(places).replace(/\.?0+$/, (m) => (m.startsWith(".") ? "" : m));
  return String(round(x, 6));
}

export function fmtMoney(x: number): string {
  return `$${x.toFixed(2)}`;
}

/** Thousands separators for display of large numbers. */
export function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}

export function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

/** Numbers close enough given float arithmetic. */
export function approx(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps;
}
