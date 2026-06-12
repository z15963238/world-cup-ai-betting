import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const tones = {
  default: "bg-slate-900 text-white",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
  muted: "bg-slate-100 text-slate-700"
};

export function Badge({
  tone = "default",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return <span className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-medium", tones[tone], className)} {...props} />;
}
