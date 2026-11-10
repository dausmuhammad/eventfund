import { cn } from "@/lib/utils";
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full resize-y rounded-lg border border-input-border bg-slate-50/60 px-3.5 py-3 text-base transition-colors placeholder:text-slate-500 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
