import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          +
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mx-auto max-w-xl text-sm text-slate-600">{description}</p>
        </div>
        {action ? <Button>{action}</Button> : null}
      </CardContent>
    </Card>
  );
}
