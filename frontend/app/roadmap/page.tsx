import type { Metadata } from "next";
import RoadmapView from "@/components/pages/roadmap-view";

export const metadata: Metadata = {
  title: "Study Roadmap for Class 10-12",
  description:
    "Subject-wise study roadmap and planning guide for Class 10, 11 and 12 students across Science, Medical and Engineering streams.",
  alternates: { canonical: "/roadmap" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "/" },
    { "@type": "ListItem", position: 2, name: "Study Roadmap", item: "/roadmap" },
  ],
};

export default function RoadmapPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <RoadmapView />
    </>
  );
}
