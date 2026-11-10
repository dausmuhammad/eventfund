import { Skeleton } from "@/components/ui/skeleton";
export default function EventsLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <p role="status" className="text-sm text-muted-foreground">
        Memuat ruang kerja…
      </p>
      <Skeleton className="h-9 w-52" />
      <div className="flex flex-wrap justify-between gap-4">
        <Skeleton className="h-12 w-80 max-w-full" />
        <Skeleton className="h-12 w-48" />
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-white p-5">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}
