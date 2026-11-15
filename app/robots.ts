import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

/** Les invitations (/i/) et les espaces privés ne sont jamais indexés (règle 6). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/i/", "/tableau-de-bord", "/admin", "/auth", "/paiement", "/creer", "/connexion", "/api/"],
    },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
