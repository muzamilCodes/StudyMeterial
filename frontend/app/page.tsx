import type { Metadata } from "next";
import HomeView from "@/components/pages/home-view";

export const metadata: Metadata = {
  title: "Study Material for Class 10-12: Notes, Papers & Quizzes",
  description:
    "Free PDF notes, previous year board papers, live classes and MCQ quizzes for Class 10, 11 and 12 (Science, Medical, Engineering). Register and start studying.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Study Material for Class 10-12: Notes, Papers & Quizzes",
    description:
      "Free PDF notes, previous year board papers, live classes and MCQ quizzes for Class 10-12. Register and start studying.",
    url: "/",
    type: "website",
  },
};

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      name: "StudyMaterial",
      url: "/",
      description:
        "Smart learning platform for Class 10-12 students with notes, previous year papers, live classes and quizzes.",
    },
    {
      "@type": "WebSite",
      name: "StudyMaterial",
      url: "/",
      publisher: { "@type": "EducationalOrganization", name: "StudyMaterial" },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />
      <HomeView />
    </>
  );
}
