import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/dashboard/", "/embed/", "/api/"],
    },
    sitemap: "https://codeunicorn.anjany.me/sitemap.xml",
  };
}
