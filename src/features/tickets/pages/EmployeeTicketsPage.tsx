import { useMemo, useState } from "react";
import { Link } from "react-router";
import axios from "axios";

import { ArrowRight, Inbox, ListChecks, RefreshCw, Search } from "lucide-react";

import { useAuth } from "../../auth/hooks/useAuth";
import { useClaimTicket, useEmployeeTickets } from "../hooks/useTickets";

import TicketStatusBadge from "../components/TicketStatusBadge";
import TicketPriorityBadge from "../components/TicketPriorityBadge";

import type { Ticket } from "../types/ticket.types";

interface Props {
  mode: "pool" | "mine";
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getErrorMessage(error: unknown): string {
  if (
    axios.isAxiosError(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }

  return "İşlem gerçekleştirilemedi.";
}

export default function EmployeeTicketsPage({ mode }: Props) {
  const { user } = useAuth();

  const {
    data: tickets = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useEmployeeTickets();

  const claimMutation = useClaimTicket();

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPool = mode === "pool";

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");

    return tickets.filter((ticket) => {
      const matchesMode = isPool
        ? ticket.status === "InPool" && ticket.assigned_user_id === null
        : ticket.assigned_user_id === user?.id;

      const matchesSearch =
        !query ||
        ticket.title.toLocaleLowerCase("tr-TR").includes(query) ||
        ticket.ticket_number.toLocaleLowerCase("tr-TR").includes(query);

      return matchesMode && matchesSearch;
    });
  }, [tickets, user?.id, search, isPool]);

  async function handleClaim(ticket: Ticket) {
    const confirmed = window.confirm(
      `"${ticket.title}" talebini üstlenmek istiyor musunuz?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await claimMutation.mutateAsync(ticket.id);
      setSuccess(
        "Talep başarıyla üstlenildi. Taleplerim ekranından devam edebilirsiniz.",
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="tickets-page">
      <div className="tickets-page-header">
        <div>
          <div className="tickets-eyebrow">
            {isPool ? <Inbox size={16} /> : <ListChecks size={16} />}
            PERSONEL İŞLEMLERİ
          </div>

          <h1>{isPool ? "Departman Havuzu" : "Taleplerim"}</h1>

          <p>
            {isPool
              ? "Departmanınıza gelen ve henüz üstlenilmemiş talepleri görüntüleyin."
              : "Üstlendiğiniz talepleri ve durumlarını takip edin."}
          </p>
        </div>

        <button
          type="button"
          className="ticket-button secondary"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw size={17} />
          Yenile
        </button>
      </div>

      {error && (
        <div className="ticket-form-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="ticket-success-message" role="status">
          {success}
        </div>
      )}

      <section className="tickets-table-card">
        <div className="tickets-table-heading">
          <div>
            <h2>{isPool ? "Bekleyen Talepler" : "Üstlendiğim Talepler"}</h2>
            <p>
              {isPool
                ? "Üstlenmeye uygun talepler"
                : "Size atanmış taleplerin mevcut durumları"}
            </p>
          </div>

          <strong className="employee-ticket-count">
            {isPending ? "—" : filteredTickets.length} talep
          </strong>
        </div>

        <div className="tickets-toolbar">
          <div className="tickets-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Talep numarası veya başlık ara..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {isPending || isFetching ? (
          <div className="tickets-message">Talepler yükleniyor...</div>
        ) : isError ? (
          <div className="tickets-message">
            <p>Talepler yüklenemedi.</p>
            <button
              type="button"
              className="ticket-button secondary"
              onClick={() => void refetch()}
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <div className="tickets-table-scroll">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Talep</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th>İşlem</th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="ticket-name-cell ticket-detail-link"
                      >
                        <strong>{ticket.title}</strong>
                        <span>{ticket.ticket_number}</span>
                      </Link>
                    </td>

                    <td>
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>

                    <td>
                      <TicketStatusBadge status={ticket.status} />
                    </td>

                    <td>{formatDate(ticket.created_at)}</td>

                    <td>
                      {isPool ? (
                        <button
                          type="button"
                          className="ticket-button primary"
                          disabled={claimMutation.isPending}
                          onClick={() => void handleClaim(ticket)}
                        >
                          Üstlen
                        </button>
                      ) : (
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="employee-ticket-detail-link"
                        >
                          Detay
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTickets.length === 0 && (
              <div className="tickets-message">
                {isPool
                  ? "Departman havuzunda bekleyen talep bulunmuyor."
                  : "Üstlendiğiniz talep bulunmuyor."}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
