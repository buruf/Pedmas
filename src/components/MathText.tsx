import React from "react";

/**
 * Renders lightweight math markup without external libraries.
 * Supported tokens inside a string:
 *   {a/b}   -> stacked fraction (a and b may be any short text, e.g. {3/4}, {x+1/2})
 *   ^{...}  -> superscript, ^2 shorthand for single char
 *   _{...}  -> subscript, _2 shorthand for single char
 *   sqrt(x) -> root sign with overline
 *   *       -> multiplication sign x
 * Everything else renders as-is.
 */
export function MathText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <span className={className}>{renderMath(text)}</span>;
}

function renderMath(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let buf = "";
  let key = 0;
  const flush = () => {
    if (buf) {
      out.push(<React.Fragment key={key++}>{buf}</React.Fragment>);
      buf = "";
    }
  };
  while (i < text.length) {
    const ch = text[i];
    // Calculus prompts write limits and definite integrals in a fixed prose
    // form ("lim as x → −1 of …", "∫ from 0 to 3 of … dx") because the CAS
    // audit parses those exact strings. Typeset them properly here instead
    // of changing the strings: "lim" gets its approach underneath, and the
    // integral sign carries its bounds.
    if (text.startsWith("lim as ", i)) {
      const m = /^lim as (\S+) → (\S+) of /.exec(text.slice(i));
      if (m) {
        flush();
        out.push(
          <span className="lim" key={key++}>
            <span>lim</span>
            <span className="lim-sub">
              {m[1]} → {m[2]}
            </span>
          </span>
        );
        i += m[0].length;
        continue;
      }
    }
    if (text.startsWith("∫ from ", i)) {
      const m = /^∫ from (\S+) to (\S+) of /.exec(text.slice(i));
      if (m) {
        flush();
        out.push(
          <span key={key++}>
            <span className="int-sign">∫</span>
            <span className="intb">
              <span>{m[2]}</span>
              <span>{m[1]}</span>
            </span>
          </span>
        );
        i += m[0].length;
        continue;
      }
    }
    if (ch === "{") {
      const close = findClose(text, i, "{", "}");
      const inner = text.slice(i + 1, close);
      const slash = topLevelSlash(inner);
      if (close > i && slash >= 0) {
        flush();
        out.push(
          <span className="frac" key={key++}>
            <span className="num">{renderMath(inner.slice(0, slash))}</span>
            <span className="den">{renderMath(inner.slice(slash + 1))}</span>
          </span>
        );
        i = close + 1;
        continue;
      }
    }
    if (ch === "^" || ch === "_") {
      let content = "";
      let next = i + 1;
      if (text[next] === "{") {
        const close = findClose(text, next, "{", "}");
        content = text.slice(next + 1, close);
        next = close + 1;
      } else if (next < text.length) {
        content = text[next];
        next += 1;
      }
      if (content) {
        flush();
        out.push(
          ch === "^" ? (
            <sup key={key++}>{renderMath(content)}</sup>
          ) : (
            <sub key={key++}>{renderMath(content)}</sub>
          )
        );
        i = next;
        continue;
      }
    }
    if (text.startsWith("sqrt(", i)) {
      const close = findClose(text, i + 4, "(", ")");
      if (close > i) {
        flush();
        out.push(
          <span key={key++} className="whitespace-nowrap">
            {"√"}
            <span style={{ borderTop: "1.5px solid currentColor" }}>
              {renderMath(text.slice(i + 5, close))}
            </span>
          </span>
        );
        i = close + 1;
        continue;
      }
    }
    if (ch === "*") {
      buf += "×";
      i += 1;
      continue;
    }
    buf += ch;
    i += 1;
  }
  flush();
  return out;
}

function findClose(text: string, open: number, oc: string, cc: string): number {
  let depth = 0;
  for (let j = open; j < text.length; j++) {
    if (text[j] === oc) depth++;
    else if (text[j] === cc) {
      depth--;
      if (depth === 0) return j;
    }
  }
  return -1;
}

function topLevelSlash(inner: string): number {
  let depth = 0;
  for (let j = 0; j < inner.length; j++) {
    if (inner[j] === "{" || inner[j] === "(") depth++;
    else if (inner[j] === "}" || inner[j] === ")") depth--;
    else if (inner[j] === "/" && depth === 0) return j;
  }
  return -1;
}
