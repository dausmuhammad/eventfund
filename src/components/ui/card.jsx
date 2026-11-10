import { cn } from "@/lib/utils";
export function Card({ className, ...props }) {
  return (
    <section
      data-slot="card"
      className={cn("rounded-xl border border-border bg-white", className)}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }) {
  return <div className={cn("px-5 pb-0 pt-5", className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}
export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn(
        "mt-1.5 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
export function CardContent({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}
