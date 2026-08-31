import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/billing/stripe";
import { strandsForGrade } from "@/lib/worksheets";

/**
 * The sitemap exists mostly for the worksheet library: ~70 long-tail landing
 * pages that crawlers would otherwise have to discover by walking the
 * lattice links. Worksheet pages are marked daily because their default
 * sheet regenerates with the daily seed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const now = new Date();

  const fixed: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/sample-lesson`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/curriculum`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/worksheets`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const worksheets: MetadataRoute.Sitemap = [];
  for (let grade = 1; grade <= 12; grade++) {
    for (const strand of strandsForGrade(grade)) {
      worksheets.push({
        url: `${base}/worksheets/grade-${grade}/${strand.id}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  return [...fixed, ...worksheets];
}
