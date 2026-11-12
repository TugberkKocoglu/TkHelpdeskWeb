import { useMemo, useState } from "react";
import axios from "axios";

import {
  Building2,
  CheckCircle2,
  CircleOff,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import CompanyFormModal from "../components/CompanyFormModal";

import { useCompanies, useUpdateCompanyStatus } from "../hooks/useCompanies";

import type { Company } from "../types/company.types";

type StatusFilter = "all" | "active" | "inactive";

export default function CompanyListPage() {
  const {
    data: companies = [],
    isPending,
    isError,
    refetch,
    isFetching,
  } = useCompanies();

  const statusMutation = useUpdateCompanyStatus();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [actionError, setActionError] = useState("");

  const stats = useMemo(() => {
    const active = companies.filter((company) => company.is_active).length;

    return {
      total: companies.length,
      active,
      inactive: companies.length - active,
    };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");

    return companies.filter((company) => {
      const matchesSearch =
        !query ||
        company.name.toLocaleLowerCase("tr-TR").includes(query) ||
        (company.contact_email ?? "")
          .toLocaleLowerCase("tr-TR")
          .includes(query) ||
        (company.contact_phone ?? "").includes(query);

      const matchesStatus =
        filter === "all" ||
        (filter === "active" && company.is_active) ||
        (filter === "inactive" && !company.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [companies, search, filter]);

  function openCreateModal() {
    setEditingCompany(null);
    setModalOpen(true);
  }

  function openEditModal(company: Company) {
    setEditingCompany(company);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCompany(null);
  }

  async function handleChangeStatus(company: Company) {
    const nextStatus = !company.is_active;

    const confirmed = window.confirm(
      `"${company.name}" şirketini ${
        nextStatus ? "aktif" : "pasif"
      } duruma geçirmek istediğinize emin misiniz?`,
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await statusMutation.mutateAsync({
        id: company.id,
        isActive: nextStatus,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setActionError(
          typeof message === "string"
            ? message
            : "Şirket durumu güncellenemedi.",
        );
      } else {
        setActionError("Beklenmeyen bir hata oluştu.");
      }
    }
  }

  return (
    <div className="companies-page">
      <div className="companies-page-header">
        <div>
          <div className="companies-eyebrow">
            <Building2 size={16} />
            YÖNETİM
          </div>

          <h1>Şirket Yönetimi</h1>
          <p>Sistemde kayıtlı şirketleri görüntüleyin ve yönetin.</p>
        </div>

        <button
          type="button"
          className="company-button primary"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Yeni Şirket
        </button>
      </div>

      <div className="companies-stats">
        <div className="company-stat-card">
          <div className="company-stat-icon blue">
            <Building2 size={21} />
          </div>
          <span>Toplam Şirket</span>
          <strong>{isPending ? "—" : stats.total}</strong>
        </div>

        <div className="company-stat-card">
          <div className="company-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <span>Aktif Şirket</span>
          <strong>{isPending ? "—" : stats.active}</strong>
        </div>

        <div className="company-stat-card">
          <div className="company-stat-icon gray">
            <CircleOff size={21} />
          </div>
          <span>Pasif Şirket</span>
          <strong>{isPending ? "—" : stats.inactive}</strong>
        </div>
      </div>

      <section className="companies-table-card">
        <div className="companies-table-heading">
          <div>
            <h2>Şirket Listesi</h2>
            <p>Şirket bilgileri ve mevcut durumları</p>
          </div>

          <button
            type="button"
            className="company-icon-button"
            onClick={() => void refetch()}
            disabled={isFetching}
            title="Listeyi yenile"
            aria-label="Listeyi yenile"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="companies-toolbar">
          <div className="companies-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Şirket adı, e-posta veya telefon ara..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="companies-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value as StatusFilter)}
            aria-label="Duruma göre filtrele"
          >
            <option value="all">Tüm Şirketler</option>
            <option value="active">Aktif Şirketler</option>
            <option value="inactive">Pasif Şirketler</option>
          </select>
        </div>

        {actionError && (
          <div className="companies-error" role="alert">
            {actionError}
          </div>
        )}

        {isPending ? (
          <div className="companies-message">Şirketler yükleniyor...</div>
        ) : isError ? (
          <div className="companies-message">
            <p>Şirketler yüklenemedi.</p>
            <button
              type="button"
              className="company-button secondary"
              onClick={() => void refetch()}
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <>
            <div className="companies-table-scroll">
              <table className="companies-table">
                <thead>
                  <tr>
                    <th>Şirket</th>
                    <th>İletişim</th>
                    <th>Durum</th>
                    <th className="company-actions-column">İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <div className="company-name-cell">
                          <div className="company-table-avatar">
                            <Building2 size={19} />
                          </div>

                          <div>
                            <strong>{company.name}</strong>
                            <span>#{company.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="company-contact-cell">
                          <span>
                            <Mail size={14} />
                            {company.contact_email || "E-posta yok"}
                          </span>
                          <small>
                            {company.contact_phone || "Telefon yok"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`company-status ${
                            company.is_active ? "active" : "inactive"
                          }`}
                        >
                          <span className="company-status-dot" />
                          {company.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </td>

                      <td>
                        <div className="company-row-actions">
                          <button
                            type="button"
                            className="company-table-button"
                            onClick={() => openEditModal(company)}
                          >
                            <Pencil size={15} />
                            Düzenle
                          </button>

                          <button
                            type="button"
                            className="company-table-button"
                            disabled={statusMutation.isPending}
                            onClick={() => void handleChangeStatus(company)}
                          >
                            {company.is_active ? "Pasife Al" : "Aktifleştir"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCompanies.length === 0 && (
                <div className="companies-message">
                  Aramanıza uygun şirket bulunamadı.
                </div>
              )}
            </div>

            <div className="companies-table-footer">
              <span>{filteredCompanies.length} şirket gösteriliyor</span>
              <span>Toplam {companies.length} kayıt</span>
            </div>
          </>
        )}
      </section>

      {modalOpen && (
        <CompanyFormModal company={editingCompany} onClose={closeModal} />
      )}
    </div>
  );
}
