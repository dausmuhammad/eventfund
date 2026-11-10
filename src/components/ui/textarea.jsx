import { cn } from "@/lib/utils";
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full resize-y rounded-lg border border-slate-500 bg-white px-3 py-2.5 text-base transition-colors placeholder:text-slate-500 focus-visible:border-primary aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
