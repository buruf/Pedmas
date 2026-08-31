import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/billing/stripe";

/**
 * Public marketing surfaces are crawlable; everything behind a session —
 * the app, parent views, admin, APIs — is not a search result.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/app/", "/parent/", "/admin", "/account", "/billing", "/print/", "/placement/"],
      },
    ],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
