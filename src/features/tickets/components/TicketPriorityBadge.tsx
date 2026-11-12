import type { TicketPriority } from "../types/ticket.types";

const priorityLabels: Record<TicketPriority, string> = {
  Low: "Düşük",
  Normal: "Normal",
  High: "Yüksek",
  Critical: "Kritik",
};

export default function TicketPriorityBadge({
  priority,
}: {
  priority: TicketPriority;
}) {
  return (
    <span className={`ticket-priority-badge priority-${priority}`}>
      {priorityLabels[priority]}
    </span>
  );
}
