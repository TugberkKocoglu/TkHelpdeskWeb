import { useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";

import { useReportSummary } from "../hooks/useReportsSummary";

import type { ReportGroup, ReportSummary } from "../types/report.types";

import type {
  TicketPriority,
  TicketStatus,
} from "../../tickets/types/ticket.types";

const currentYear = new Date().getFullYear();

const months = [
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
];

const statusConfig: {
  key: TicketStatus;
  label: string;
}[] = [
  { key: "InPool", label: "Havuzda" },
  { key: "Claimed", label: "Üstlenildi" },
  { key: "InProgress", label: "İşlemde" },
  { key: "Closed", label: "Kapatıldı" },
];

const priorityConfig: {
  key: TicketPriority;
  label: string;
}[] = [
  { key: "Low", label: "Düşük" },
  { key: "Normal", label: "Normal" },
  { key: "High", label: "Yüksek" },
  { key: "Critical", label: "Kritik" },
];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function formatPercentage(value: number): string {
  return `%${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })}`;
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} dk`;
  }

  if (remainingMinutes === 0) {
    return `${hours} sa`;
  }

  return `${hours} sa ${remainingMinutes} dk`;
}

function ReportStatCard({
  label,
  value,
  icon,
  color = "blue",
  description,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: "blue" | "purple" | "orange" | "green";
  description?: string;
}) {
  return (
    <div className="report-stat-card">
      <div className={`report-stat-icon ${color}`}>{icon}</div>

      <span>{label}</span>

      <strong>{typeof value === "number" ? formatNumber(value) : value}</strong>

      {description && <small>{description}</small>}
    </div>
  );
}

function DistributionCard({
  title,
  subtitle,
  items,
  total,
  variant,
}: {
  title: string;
  subtitle: string;
  items: { key: string; label: string; value: number }[];
  total: number;
  variant: "status" | "priority";
}) {
  return (
    <section className="report-card">
      <div className="report-card-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <BarChart3 size={21} />
      </div>

      <div className="report-distribution-list">
        {items.map((item) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;

          return (
            <div className="report-distribution-row" key={item.key}>
              <div className="report-distribution-label">
                <span>{item.label}</span>

                <strong>
                  {formatNumber(item.value)}
                  <small>{formatPercentage(percentage)}</small>
                </strong>
              </div>

              <div className="report-progress-track">
                <div
                  className={`report-progress-fill ${variant}-${item.key}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {total === 0 && (
        <p className="report-empty-note">Seçilen dönemde talep bulunmuyor.</p>
      )}
    </section>
  );
}

function PerformanceTable({
  title,
  subtitle,
  groups,
  kind,
}: {
  title: string;
  subtitle: string;
  groups: ReportGroup[];
  kind: "company" | "department";
}) {
  const Icon = kind === "company" ? Building2 : Users;

  return (
    <section className="report-card report-table-card">
      <div className="report-card-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <Icon size={21} />
      </div>

      {groups.length === 0 ? (
        <div className="report-table-empty">
          Bu döneme ait kayıt bulunamadı.
        </div>
      ) : (
        <div className="report-table-scroll">
          <table className="report-table">
            <thead>
              <tr>
                <th>{kind === "company" ? "Şirket" : "Departman"}</th>
                <th>Toplam</th>
                <th>Açık</th>
                <th>Kapalı</th>
                <th>Kapanma Oranı</th>
              </tr>
            </thead>

            <tbody>
              {groups.map((group) => {
                const closureRate =
                  group.total > 0 ? (group.closed / group.total) * 100 : 0;

                return (
                  <tr key={group.id}>
                    <td>
                      <div className="report-group-name">
                        <span className="report-group-icon">
                          <Icon size={17} />
                        </span>

                        <strong>{group.name}</strong>
                      </div>
                    </td>

                    <td>{formatNumber(group.total)}</td>
                    <td>{formatNumber(group.open)}</td>
                    <td>{formatNumber(group.closed)}</td>

                    <td>
                      <div className="report-rate-cell">
                        <strong>{formatPercentage(closureRate)}</strong>

                        <div className="report-rate-track">
                          <div
                            style={{
                              width: `${closureRate}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ReportContent({ report }: { report: ReportSummary }) {
  const { overview } = report;

  const statusItems = statusConfig.map((item) => ({
    ...item,
    value: report.statusDistribution[item.key],
  }));

  const priorityItems = priorityConfig.map((item) => ({
    ...item,
    value: report.priorityDistribution[item.key],
  }));

  return (
    <>
      <div className="report-stats-grid">
        <ReportStatCard
          label="Toplam Talep"
          value={overview.totalTickets}
          icon={<Ticket size={22} />}
          description="Seçilen dönemde oluşturulan"
        />

        <ReportStatCard
          label="Açık Talep"
          value={overview.openTickets}
          icon={<Clock3 size={22} />}
          color="orange"
          description="Henüz kapatılmamış"
        />

        <ReportStatCard
          label="Kapatılan Talep"
          value={overview.closedTickets}
          icon={<CheckCircle2 size={22} />}
          color="green"
          description="Çözümü tamamlanan"
        />

        <ReportStatCard
          label="Kapanma Oranı"
          value={formatPercentage(overview.closureRate)}
          icon={<Activity size={22} />}
          color="purple"
          description="Kapalı / toplam talep"
        />
      </div>

      <section className="report-duration-card">
        <div className="report-duration-icon">
          <Clock3 size={23} />
        </div>

        <div>
          <span>Ortalama Çözüm Süresi</span>
          <strong>{formatDuration(overview.averageResolutionMinutes)}</strong>
          <p>
            Kapatılan taleplerin oluşturulmasından kapanmasına kadar geçen
            ortalama süre.
          </p>
        </div>
      </section>

      <div className="report-charts-grid">
        <DistributionCard
          title="Durum Dağılımı"
          subtitle="Taleplerin mevcut durumları"
          items={statusItems}
          total={overview.totalTickets}
          variant="status"
        />

        <DistributionCard
          title="Öncelik Dağılımı"
          subtitle="Öncelik seviyelerine göre talepler"
          items={priorityItems}
          total={overview.totalTickets}
          variant="priority"
        />
      </div>

      <PerformanceTable
        title="Şirket Performansı"
        subtitle="Şirketlere göre talep sayıları ve kapanma oranları"
        groups={report.byCompany}
        kind="company"
      />

      <PerformanceTable
        title="Departman Performansı"
        subtitle="Departmanlara göre talep sayıları ve kapanma oranları"
        groups={report.byDepartment}
        kind="department"
      />
    </>
  );
}

export default function ReportPage() {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(0);

  const {
    data: report,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useReportSummary({
    year,
    ...(month > 0 ? { month } : {}),
  });

  const selectedPeriod =
    month === 0 ? `${year} Yılı` : `${months[month - 1]} ${year}`;

  return (
    <div className="reports-page">
      <div className="reports-page-header">
        <div>
          <div className="reports-eyebrow">
            <BarChart3 size={16} />
            ANALİZ VE RAPORLAMA
          </div>

          <h1>Raporlar</h1>

          <p>
            Destek süreçlerinin performansını şirket, departman ve talep
            durumlarına göre inceleyin.
          </p>
        </div>

        <div className="reports-filters">
          <div className="reports-filter-field">
            <label htmlFor="report-year">Yıl</label>

            <select
              id="report-year"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {Array.from({ length: 6 }, (_, index) => currentYear - index).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="reports-filter-field">
            <label htmlFor="report-month">Ay</label>

            <select
              id="report-month"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              <option value={0}>Tüm Yıl</option>

              {months.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="reports-refresh-button"
            onClick={() => void refetch()}
            disabled={isFetching}
            title="Raporu yenile"
            aria-label="Raporu yenile"
          >
            <RefreshCw size={19} />
          </button>
        </div>
      </div>

      <div className="reports-period-info">
        <CalendarDays size={17} />

        <span>
          Rapor Dönemi:
          <strong> {selectedPeriod}</strong>
        </span>

        {isFetching && (
          <span className="reports-updating">Güncelleniyor...</span>
        )}
      </div>

      <p className="reports-scope-note">
        Bu rapor, seçilen UTC döneminde oluşturulan taleplerin güncel
        durumlarını gösterir. Önceki dönemlerde oluşturulan talepler dahil
        değildir.
      </p>

      {isPending || (isFetching && !report) ? (
        <div className="reports-state">
          <RefreshCw size={25} />
          <p>Rapor verileri yükleniyor...</p>
        </div>
      ) : isError ? (
        <div className="reports-state">
          <Activity size={26} />

          <h2>Rapor yüklenemedi</h2>
          <p>API bağlantısını veya rapor filtrelerini kontrol edin.</p>

          <button
            type="button"
            className="ticket-button primary"
            onClick={() => void refetch()}
          >
            Tekrar Dene
          </button>
        </div>
      ) : report ? (
        <ReportContent report={report} />
      ) : (
        <div className="reports-state">Rapor verisi bulunamadı.</div>
      )}
    </div>
  );
}
