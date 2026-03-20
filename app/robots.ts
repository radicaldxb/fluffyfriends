import type { MetadataRoute } from "next";

const BASE = "https://fluffyfriends.online";
const SITEMAP_URL = `${BASE}/sitemap.xml`;

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.NEXT_PUBLIC_ENV === "staging";

  if (isStaging) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: BASE,
    sitemap: SITEMAP_URL,
  };
}
