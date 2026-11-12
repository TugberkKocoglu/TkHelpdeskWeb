import { useState } from "react";
import { Link } from "react-router";

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Inbox,
  RefreshCw,
  Ticket as TicketIcon,
  Users,
} from "lucide-react";

import { useAuth } from "../../auth/hooks/useAuth";

import { useEmployeeTickets, useTickets } from "../../tickets/hooks/useTickets";

import TicketStatusBadge from "../../tickets/components/TicketStatusBadge";

import { useReportSummary } from "../../reports/hooks/useReportsSummary";

import type { Ticket, TicketStatus } from "../../tickets/types/ticket.types";

const statusLabels: Record<TicketStatus, string> = {
  InPool: "Havuzda",
  Claimed: "Üstlenildi",
  InProgress: "İşlemde",
  Closed: "Kapatıldı",
};

const statusOrder: TicketStatus[] = [
  "InPool",
  "Claimed",
  "InProgress",
  "Closed",
];

const currentYear = new Date().getUTCFullYear();

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function StatCard({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "blue" | "purple" | "orange" | "green";
}) {
  return (
    <div className="overview-stat-card">
      <div className={`overview-stat-icon ${color}`}>{icon}</div>

      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusDistribution({
  counts,
}: {
  counts: Record<TicketStatus, number>;
}) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <section className="overview-card">
      <div className="overview-card-heading">
        <div>
          <h2>Talep Durum Dağılımı</h2>
          <p>Taleplerin mevcut durumları</p>
        </div>

        <BarChart3 size={20} />
      </div>

      <div className="overview-status-list">
        {statusOrder.map((status) => {
          const count = counts[status];
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div className="overview-status-item" key={status}>
              <div className="overview-status-label">
                <span>{statusLabels[status]}</span>
                <strong>
                  {count} · %{percentage.toFixed(1)}
                </strong>
              </div>

              <div className="overview-progress-track">
                <div
                  className={`overview-progress-fill ${status}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentTickets({
  tickets,
  emptyMessage = "Henüz talep bulunmuyor.",
}: {
  tickets: Ticket[];
  emptyMessage?: string;
}) {
  return (
    <section className="overview-card">
      <div className="overview-card-heading">
        <div>
          <h2>Son Talepler</h2>
          <p>En son oluşturulan destek kayıtları</p>
        </div>

        <TicketIcon size={20} />
      </div>

      {tickets.length === 0 ? (
        <p className="overview-empty">{emptyMessage}</p>
      ) : (
        <div className="overview-recent-list">
          {tickets.slice(0, 5).map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="overview-recent-item"
            >
              <div className="overview-recent-info">
                <strong>{ticket.title}</strong>

                <span>
                  {ticket.ticket_number} · {formatDate(ticket.created_at)}
                </span>
              </div>

              <TicketStatusBadge status={ticket.status} />
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function HelpdeskDashboard() {
  const { user } = useAuth();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(0);

  const reportFilter = {
    year,
    ...(month > 0 ? { month } : {}),
  };

  const {
    data: report,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useReportSummary(reportFilter);

  const { data: recentData, isPending: recentLoading } = useTickets({
    page: 1,
    pageSize: 5,
  });

  const overview = report?.overview;
  const statuses = report?.statusDistribution;

  return (
    <div className="overview-page">
      <div className="overview-page-header">
        <div>
          <div className="dashboard-eyebrow">
            <BarChart3 size={16} />
            GENEL BAKIŞ
          </div>

          <h1>Hoş geldiniz, {user?.firstName}!</h1>
          <p>Destek süreçlerinin güncel performansını takip edin.</p>
        </div>

        <div className="overview-filters">
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            aria-label="Rapor yılı"
          >
            {Array.from({ length: 6 }, (_, index) => currentYear - index).map(
              (value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ),
            )}
          </select>

          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            aria-label="Rapor ayı"
          >
            <option value={0}>Tüm Yıl</option>
            {[
              "Ocak",
              "Şubat",
              "Mart",
              "Nisan",
              "Mayıs",
              "Haziran",
              "Temmuz",
              "Ağustos",
              "Eylül",
              "Ekim",
              "Kasım",
              "Aralık",
            ].map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="İstatistikleri yenile"
            title="İstatistikleri yenile"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {isError && (
        <div className="ticket-form-error" role="alert">
          Rapor verileri alınamadı. Backend bağlantısını ve seçilen dönemi
          kontrol edin.
        </div>
      )}

      <div className="overview-stats-grid">
        <StatCard
          label="Toplam Talep"
          value={isPending ? "—" : (overview?.totalTickets ?? 0)}
          icon={<TicketIcon size={22} />}
        />

        <StatCard
          label="Havuzda Bekleyen"
          value={isPending ? "—" : (statuses?.InPool ?? 0)}
          icon={<Inbox size={22} />}
          color="purple"
        />

        <StatCard
          label="Açık Talepler"
          value={isPending ? "—" : (overview?.openTickets ?? 0)}
          icon={<Clock3 size={22} />}
          color="orange"
        />

        <StatCard
          label="Kapatılan Talepler"
          value={isPending ? "—" : (overview?.closedTickets ?? 0)}
          icon={<CheckCircle2 size={22} />}
          color="green"
        />
      </div>

      <p className="overview-period-note">
        İstatistikler seçilen dönemde oluşturulan talepleri kapsar. Son talepler
        listesi ise tüm dönemlerden en yeni kayıtları gösterir.
      </p>

      <div className="overview-two-column">
        {statuses && <StatusDistribution counts={statuses} />}

        <section className="overview-card">
          <div className="overview-card-heading">
            <div>
              <h2>Performans Özeti</h2>
              <p>Seçilen rapor döneminin sonuçları</p>
            </div>

            <CheckCircle2 size={20} />
          </div>

          <div className="overview-performance">
            <div>
              <span>Kapanma Oranı</span>
              <strong>
                {isPending ? "—" : `%${overview?.closureRate ?? 0}`}
              </strong>
            </div>

            <div>
              <span>Ortalama Çözüm Süresi</span>
              <strong>
                {overview?.averageResolutionMinutes == null
                  ? "—"
                  : `${Math.round(
                      overview.averageResolutionMinutes / 60,
                    )} saat`}
              </strong>
            </div>

            <div>
              <span>Departman Sayısı</span>
              <strong>{report?.byDepartment.length ?? "—"}</strong>
            </div>
          </div>

          <Link to="/reports" className="overview-action-link">
            Raporları Görüntüle
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      <div className="overview-two-column">
        <section className="overview-card">
          <div className="overview-card-heading">
            <div>
              <h2>Departman Performansı</h2>
              <p>Departmanlara göre talep dağılımı</p>
            </div>

            <Users size={20} />
          </div>

          {!report?.byDepartment.length ? (
            <p className="overview-empty">
              Bu dönem için departman verisi bulunmuyor.
            </p>
          ) : (
            <div className="overview-department-list">
              {report.byDepartment.map((department) => (
                <div key={department.id}>
                  <strong>{department.name}</strong>
                  <span>
                    {department.total} talep · {department.closed} kapatılan ·{" "}
                    {department.open} açık
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {recentLoading ? (
          <div className="overview-card">Talepler yükleniyor...</div>
        ) : (
          <RecentTickets tickets={recentData?.items ?? []} />
        )}
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();

  const {
    data: tickets = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useEmployeeTickets();

  const total = tickets.length;
  const inPool = tickets.filter((ticket) => ticket.status === "InPool").length;
  const open = tickets.filter((ticket) => ticket.status !== "Closed").length;
  const closed = tickets.filter((ticket) => ticket.status === "Closed").length;

  const myTickets = tickets.filter(
    (ticket) => ticket.assigned_user_id === user?.id,
  );

  const statusCounts: Record<TicketStatus, number> = {
    InPool: inPool,
    Claimed: tickets.filter((ticket) => ticket.status === "Claimed").length,
    InProgress: tickets.filter((ticket) => ticket.status === "InProgress")
      .length,
    Closed: closed,
  };

  return (
    <div className="overview-page">
      <div className="overview-page-header">
        <div>
          <div className="dashboard-eyebrow">
            <BarChart3 size={16} />
            PERSONEL PANELİ
          </div>

          <h1>Hoş geldiniz, {user?.firstName}!</h1>

          <p>Departmanınızdaki talepleri ve işlerinizi takip edin.</p>
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

      {isError && (
        <div className="ticket-form-error" role="alert">
          Departman talepleri alınamadı.
        </div>
      )}

      <div className="overview-stats-grid">
        <StatCard
          label="Departmandaki Toplam Talep"
          value={isPending ? "—" : total}
          icon={<TicketIcon size={22} />}
        />

        <StatCard
          label="Havuzda Bekleyen"
          value={isPending ? "—" : inPool}
          icon={<Inbox size={22} />}
          color="purple"
        />

        <StatCard
          label="Açık Talepler"
          value={isPending ? "—" : open}
          icon={<Clock3 size={22} />}
          color="orange"
        />

        <StatCard
          label="Üstlendiğim Talepler"
          value={isPending ? "—" : myTickets.length}
          icon={<CheckCircle2 size={22} />}
          color="green"
        />
      </div>

      <div className="overview-two-column">
        <StatusDistribution counts={statusCounts} />

        <section className="overview-card">
          <div className="overview-card-heading">
            <div>
              <h2>Hızlı İşlemler</h2>
              <p>Destek taleplerine kolay erişim</p>
            </div>

            <ArrowRight size={20} />
          </div>

          <div className="overview-quick-actions">
            <Link to="/tickets/pool">
              <Inbox size={20} />
              <span>Departman Havuzuna Git</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/tickets/mine">
              <CheckCircle2 size={20} />
              <span>Taleplerimi Görüntüle</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>

      <RecentTickets
        tickets={tickets.slice(0, 5)}
        emptyMessage={
          isPending
            ? "Talepler yükleniyor..."
            : "Departmanınızda henüz talep bulunmuyor."
        }
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return user?.role === "Helpdesk" ? (
    <HelpdeskDashboard />
  ) : (
    <EmployeeDashboard />
  );
}
