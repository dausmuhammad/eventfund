import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const variants = cva(
  "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:ring-4 focus-visible:ring-primary/15",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-hover active:bg-blue-950",
        outline:
          "border border-input-border bg-white text-foreground hover:bg-slate-100 active:bg-slate-200",
        ghost: "text-slate-700 hover:bg-slate-100 active:bg-slate-200",
        destructive: "bg-danger text-white hover:bg-red-800 active:bg-red-950",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export function Button({ asChild = false, variant, className, ...props }) {
  const Component = asChild ? Slot : "button";
  return (
    <Component className={cn(variants({ variant }), className)} {...props} />
  );
}
