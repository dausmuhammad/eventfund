import { cn } from "@/lib/utils";
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "min-h-12 min-w-0 w-full rounded-lg border border-input-border bg-slate-50/60 px-3.5 py-3 text-base transition-colors placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
