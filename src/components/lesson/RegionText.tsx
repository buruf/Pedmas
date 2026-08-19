"use client";

import { useEffect, useRef } from "react";
import { localise, type Region } from "@/lib/region";

/**
 * Rewrites lesson wording for the reader's region.
 *
 * Lesson copy is plain JSX spread across 132 files, so there is no single
 * string to translate. Instead this walks the rendered text nodes and applies
 * the same dictionary the questions use.
 *
 * That is only safe because `localise` is idempotent — it matches
 * Commonwealth forms and produces American ones, which never match again. So
 * running it after every render, including React's double render in
 * development, changes nothing the second time.
 */
export function RegionText({
  region,
  children,
}: {
  region: Region;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (region !== "US" || !ref.current) return;
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT);
    const edits: [Text, string][] = [];
    let node = walker.nextNode() as Text | null;
    while (node) {
      const next = localise(node.nodeValue ?? "", region);
      if (next !== node.nodeValue) edits.push([node, next]);
      node = walker.nextNode() as Text | null;
    }
    // Apply after walking, so the tree is not mutated mid-traversal.
    for (const [textNode, value] of edits) textNode.nodeValue = value;
  });

  return <div ref={ref}>{children}</div>;
}
