import type { Rng } from "./types";

/** Deterministic seeded RNG (mulberry32) so tests are reproducible. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng: Rng = {
    next,
    int(lo, hi) {
      if (hi < lo) [lo, hi] = [hi, lo];
      return lo + Math.floor(next() * (hi - lo + 1));
    },
    pick(arr) {
      return arr[Math.floor(next() * arr.length)];
    },
    shuffle(arr) {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    sample(arr, n) {
      return rng.shuffle(arr).slice(0, Math.min(n, arr.length));
    },
    chance(p) {
      return next() < p;
    },
  };
  return rng;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
