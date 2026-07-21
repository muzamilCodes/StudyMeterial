import Link from "next/link";
import { BookOpen, Database, Github, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin Panel" }
];

export function PublicFooter() {
  return (
    <footer className="mt-10 border-t border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="page-shell grid gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-premium">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-blue-700">STUDY MATERIAL</p>
              <p className="text-xs text-slate-500">Educational Platform</p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            A premium class-wise educational platform for 10th, 11th and 12th students with subject-wise notes,
            papers, quizzes, videos, results and admin management.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              India
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              <Phone className="h-4 w-4 text-blue-600" />
              Support Ready
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              <Mail className="h-4 w-4 text-blue-600" />
              help@studymaterial.app
            </span>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">Quick Links</p>
          <div className="grid gap-3">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-slate-600 transition hover:text-blue-600">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">Backend Stack</p>
          <div className="grid gap-3 text-sm text-slate-600">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
              <Database className="h-4 w-4 text-orange-500" />
              MongoDB Atlas
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
              <Github className="h-4 w-4 text-blue-600" />
              GitHub Ready
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/70">
        <div className="page-shell flex flex-col gap-2 px-4 py-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
          <p>© 2026 Study Material. Premium educational platform.</p>
          <p>Built with Next.js, Tailwind CSS, MongoDB, JWT, and Cloudinary-ready architecture.</p>
        </div>
      </div>
    </footer>
  );
}
