import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <Badge className="bg-white/80 text-blue-700">{eyebrow}</Badge>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {description ? <p className="max-w-3xl text-sm text-slate-600">{description}</p> : null}
    </div>
  );
}
