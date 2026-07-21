import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700",
      className
    )}
    {...props}
  />
);

export { Badge };
