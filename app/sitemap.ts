import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/aide", "/confidentialite", "/conditions"].map((path) => ({
    url: `${publicEnv.siteUrl}${path}`,
    changeFrequency: path ? "monthly" : "weekly",
    priority: path ? 0.4 : 1,
  }));
}
