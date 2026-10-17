import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";
  const lastModified = new Date();

  const publicPages = [
    "",
    "/roadmap",
    "/privacy-policy",
    "/terms",
    "/student",
    "/student/login",
    "/student/register",
  ];

  return publicPages.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
