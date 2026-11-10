import { cn } from "@/lib/utils";

export function Brand({ className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-xl font-bold tracking-tight",
        className,
      )}
    >
      <svg
        viewBox="0 0 40 40"
        className="size-9 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="11" fill="#2563eb" />
        <rect
          x="9"
          y="11"
          width="22"
          height="22"
          rx="4"
          stroke="white"
          strokeWidth="2"
        />
        <path
          d="M14 8v6m12-6v6M10 18h20m-14 5h9m-9 0v7m0-3h6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      EventFund
    </span>
  );
}
