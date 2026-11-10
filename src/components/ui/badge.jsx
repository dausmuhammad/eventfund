import { cn } from "@/lib/utils";
const variants = {
  default: "border-blue-200 bg-blue-50 text-primary",
  secondary: "border-slate-200 bg-slate-100 text-slate-700",
  success: "border-green-200 bg-green-50 text-green-800",
  destructive: "border-red-200 bg-red-50 text-danger",
};
export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
