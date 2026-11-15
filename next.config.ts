import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet d'ouvrir le site de développement depuis un téléphone sur le même Wi-Fi
  // (adresse du type http://192.168.x.x:3000). Sans cela, Next.js bloque les mises à jour.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
