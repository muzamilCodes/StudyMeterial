import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  accent = "blue"
}: {
  label: string;
  value: string;
  accent?: "blue" | "orange" | "indigo" | "emerald";
}) {
  const styles: Record<typeof accent, string> = {
    blue: "from-blue-50 to-blue-100 text-blue-700",
    orange: "from-orange-50 to-orange-100 text-orange-700",
    indigo: "from-indigo-50 to-indigo-100 text-indigo-700",
    emerald: "from-emerald-50 to-emerald-100 text-emerald-700"
  };

  return (
    <Card className="p-0">
      <CardContent className="p-5">
        <div className={cn("rounded-3xl bg-gradient-to-br p-5", styles[accent])}>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
