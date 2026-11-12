import type { TicketStatus } from "../types/ticket.types";

const statusLabels: Record<TicketStatus, string> = {
  InPool: "Havuzda",
  Claimed: "Üstlenildi",
  InProgress: "İşlemde",
  Closed: "Kapatıldı",
};

export default function TicketStatusBadge({
  status,
}: {
  status: TicketStatus;
}) {
  return (
    <span className={`ticket-status-badge status-${status}`}>
      <span className="ticket-badge-dot" />
      {statusLabels[status]}
    </span>
  );
}
