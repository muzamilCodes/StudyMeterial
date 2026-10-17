import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/downloads",
          "/edit-profile",
          "/notes",
          "/notices",
          "/previous-papers",
          "/progress",
          "/quizzes",
          "/results",
          "/settings",
          "/subjects",
          "/videos",
          "/admin",
          "/teacher",
          "/super-admin",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
