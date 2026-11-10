import { cn } from "@/lib/utils";
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "min-h-11 min-w-0 w-full rounded-lg border border-slate-500 bg-white px-3 py-2.5 text-base transition-colors placeholder:text-slate-500 hover:border-slate-700 focus-visible:border-primary aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
