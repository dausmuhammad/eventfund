import { Skeleton } from "@/components/ui/skeleton";
export default function EventsLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <p role="status" className="text-sm text-muted-foreground">
        Memuat ruang kerja…
      </p>
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
