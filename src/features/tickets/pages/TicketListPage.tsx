import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Inbox,
  Plus,
  RefreshCw,
  Search,
  Ticket as TicketIcon,
} from "lucide-react";

import { useCompanies } from "../../companies/hooks/useCompanies";
import { useDepartments } from "../../users/hooks/useUsers";

import TicketFormModal from "../components/TicketFormModal";
import TicketStatusBadge from "../components/TicketStatusBadge";
import TicketPriorityBadge from "../components/TicketPriorityBadge";

import { useTickets } from "../hooks/useTickets";

import type { TicketStatus } from "../types/ticket.types";

import { Link } from "react-router";

const PAGE_SIZE = 20;

const statusOptions: {
  value: TicketStatus | "";
  label: string;
}[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "InPool", label: "Havuzda" },
  { value: "Claimed", label: "Üstlenildi" },
  { value: "InProgress", label: "İşlemde" },
  { value: "Closed", label: "Kapatıldı" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TicketListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [companyId, setCompanyId] = useState(0);
  const [departmentId, setDepartmentId] = useState(0);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const filters = {
    page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(companyId ? { companyId } : {}),
    ...(departmentId ? { departmentId } : {}),
  };

  const { data, isPending, isError, isFetching, refetch } = useTickets(filters);

  const { data: companies = [] } = useCompanies();
  const { data: departments = [] } = useDepartments();

  const tickets = data?.items ?? [];

  const filteredTickets = tickets.filter((ticket) => {
    const query = search.trim().toLocaleLowerCase("tr-TR");

    return (
      !query ||
      ticket.title.toLocaleLowerCase("tr-TR").includes(query) ||
      ticket.ticket_number.toLocaleLowerCase("tr-TR").includes(query)
    );
  });

  function getCompanyName(id: number): string {
    return (
      companies.find((company) => company.id === id)?.name ?? `Şirket #${id}`
    );
  }

  function getDepartmentName(id: number): string {
    return (
      departments.find((department) => department.id === id)?.name ??
      `Departman #${id}`
    );
  }

  function changeStatus(value: string) {
    setStatus(value as TicketStatus | "");
    setPage(1);
  }

  function changeCompany(value: number) {
    setCompanyId(value);
    setPage(1);
  }

  function changeDepartment(value: number) {
    setDepartmentId(value);
    setPage(1);
  }

  const pageTickets = tickets.length;

  const pageStats = {
    inPool: tickets.filter((t) => t.status === "InPool").length,
    inProgress: tickets.filter((t) => t.status === "InProgress").length,
    closed: tickets.filter((t) => t.status === "Closed").length,
  };

  return (
    <div className="tickets-page">
      <div className="tickets-page-header">
        <div>
          <div className="tickets-eyebrow">
            <TicketIcon size={16} />
            DESTEK YÖNETİMİ
          </div>

          <h1>Talep Yönetimi</h1>
          <p>Destek taleplerini görüntüleyin ve departmanlara yönlendirin.</p>
        </div>

        <button
          type="button"
          className="ticket-button primary"
          onClick={() => {
            setSuccessMessage("");
            setModalOpen(true);
          }}
        >
          <Plus size={18} />
          Yeni Talep
        </button>
      </div>

      <div className="tickets-stats">
        <div className="ticket-stat-card">
          <div className="ticket-stat-icon blue">
            <TicketIcon size={21} />
          </div>
          <span>Filtrelenen Toplam Talep</span>
          <strong>{isPending ? "—" : (data?.total ?? 0)}</strong>
        </div>

        <div className="ticket-stat-card">
          <div className="ticket-stat-icon purple">
            <Inbox size={21} />
          </div>
          <span>Bu Sayfada Havuzda</span>
          <strong>{isPending ? "—" : pageStats.inPool}</strong>
        </div>

        <div className="ticket-stat-card">
          <div className="ticket-stat-icon orange">
            <Clock3 size={21} />
          </div>
          <span>Bu Sayfada İşlemde</span>
          <strong>{isPending ? "—" : pageStats.inProgress}</strong>
        </div>

        <div className="ticket-stat-card">
          <div className="ticket-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <span>Bu Sayfada Kapatılan</span>
          <strong>{isPending ? "—" : pageStats.closed}</strong>
        </div>
      </div>

      {successMessage && (
        <div className="ticket-success-message" role="status">
          {successMessage}
        </div>
      )}

      <section className="tickets-table-card">
        <div className="tickets-table-heading">
          <div>
            <h2>Talep Listesi</h2>
            <p>Talep kayıtları ve mevcut durumları</p>
          </div>

          <button
            type="button"
            className="ticket-icon-button"
            onClick={() => void refetch()}
            disabled={isFetching}
            title="Listeyi yenile"
            aria-label="Listeyi yenile"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="tickets-toolbar">
          <div className="tickets-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Bu sayfada talep ara..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            aria-label="Talep durumu"
            value={status}
            onChange={(event) => changeStatus(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Şirkete göre filtrele"
            value={companyId}
            onChange={(event) => changeCompany(Number(event.target.value))}
          >
            <option value={0}>Tüm Şirketler</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Departmana göre filtrele"
            value={departmentId}
            onChange={(event) => changeDepartment(Number(event.target.value))}
          >
            <option value={0}>Tüm Departmanlar</option>
            {departments
              .filter((department) =>
                ["Yazılım", "Yazılım Destek"].includes(department.name),
              )
              .map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
          </select>
        </div>

        {isPending ? (
          <div className="tickets-message">Talepler yükleniyor...</div>
        ) : isError && !data ? (
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
          <>
            <div className="tickets-table-scroll">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>Talep</th>
                    <th>Şirket</th>
                    <th>Departman</th>
                    <th>Öncelik</th>
                    <th>Durum</th>
                    <th>Oluşturulma</th>
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

                      <td>{getCompanyName(ticket.company_id)}</td>
                      <td>{getDepartmentName(ticket.department_id)}</td>

                      <td>
                        <TicketPriorityBadge priority={ticket.priority} />
                      </td>

                      <td>
                        <TicketStatusBadge status={ticket.status} />
                      </td>

                      <td className="ticket-date-cell">
                        {formatDate(ticket.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTickets.length === 0 && (
                <div className="tickets-message">
                  Görüntülenecek talep bulunamadı.
                </div>
              )}
            </div>

            <div className="tickets-table-footer">
              <span>
                {filteredTickets.length} kayıt gösteriliyor
                {search ? ` (${pageTickets} sayfa kaydından)` : ""}
              </span>

              <div className="tickets-pagination">
                <span>
                  Sayfa {data?.page ?? 1} / {Math.max(data?.totalPages ?? 0, 1)}
                </span>

                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Önceki
                </button>

                <button
                  type="button"
                  disabled={page >= (data?.totalPages ?? 1)}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Sonraki
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {modalOpen && (
        <TicketFormModal
          onClose={() => setModalOpen(false)}
          onCreated={(ticketId) => {
            setModalOpen(false);
            setPage(1);
            setStatus("");
            setCompanyId(0);
            setDepartmentId(0);
            setSearch("");
            setSuccessMessage(
              `#${ticketId} numaralı kayıt oluşturuldu. Talep ilgili departmanın havuzuna gönderildi.`,
            );
            void refetch();
          }}
        />
      )}
    </div>
  );
}
