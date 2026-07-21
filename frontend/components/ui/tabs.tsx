import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-4", className)}>{children}</div>
);

const TabsList = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-wrap gap-2 rounded-2xl bg-white/70 p-2 shadow-sm", className)}>{children}</div>
);

const TabsTrigger = ({
  active,
  children,
  className
}: React.HTMLAttributes<HTMLButtonElement> & { active?: boolean }) => (
  <button
    className={cn(
      "rounded-xl px-4 py-2 text-sm font-medium transition",
      active ? "bg-blue-600 text-white shadow-premium" : "text-slate-600 hover:bg-slate-100",
      className
    )}
  >
    {children}
  </button>
);

const TabsContent = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-4", className)}>{children}</div>
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
