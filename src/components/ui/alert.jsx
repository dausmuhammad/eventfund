import { cn } from "@/lib/utils";
export function Alert({ className, variant = "default", ...props }) {
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(
        "rounded-lg border p-4 text-sm leading-relaxed",
        variant === "destructive"
          ? "border-red-200 bg-red-50 text-danger"
          : "border-blue-200 bg-blue-50 text-blue-900",
        className,
      )}
      {...props}
    />
  );
}
