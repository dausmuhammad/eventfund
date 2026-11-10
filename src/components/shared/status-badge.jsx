import { Badge } from "@/components/ui/badge";
const statusLabels = {
  DRAFT: "Draft",
  PLANNED: "Direncanakan",
  ACTIVE: "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};
export function StatusBadge({ status, archived = false }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant={
          status === "CANCELLED"
            ? "destructive"
            : status === "COMPLETED"
              ? "success"
              : status === "DRAFT"
                ? "secondary"
                : "default"
        }
      >
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
        {statusLabels[status] || status}
      </Badge>
      {archived && <Badge variant="secondary">Diarsipkan</Badge>}
    </div>
  );
}
