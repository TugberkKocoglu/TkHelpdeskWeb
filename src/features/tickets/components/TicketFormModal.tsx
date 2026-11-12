import { useState, type FormEvent } from "react";
import axios from "axios";

import { Plus, X } from "lucide-react";

import { useCompanies } from "../../companies/hooks/useCompanies";
import { useDepartments } from "../../users/hooks/useUsers";

import { useCreateTicket } from "../hooks/useTickets";

import type { TicketPriority } from "../types/ticket.types";

interface Props {
  onClose: () => void;
  onCreated: (ticketId: number) => void;
}

export default function TicketFormModal({ onClose, onCreated }: Props) {
  const { data: companies = [], isPending: companiesLoading } = useCompanies();

  const { data: departments = [], isPending: departmentsLoading } =
    useDepartments();

  const createMutation = useCreateTicket();

  const [companyId, setCompanyId] = useState(0);
  const [departmentId, setDepartmentId] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("Normal");
  const [error, setError] = useState("");

  const activeCompanies = companies.filter((company) => company.is_active);

  const availableDepartments = departments.filter(
    (department) =>
      department.is_active !== false &&
      ["Yazılım", "Yazılım Destek"].includes(department.name),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createMutation.isPending) return;

    setError("");

    if (!activeCompanies.some((company) => company.id === companyId)) {
      setError("Aktif bir şirket seçmelisiniz.");
      return;
    }

    if (
      !availableDepartments.some((department) => department.id === departmentId)
    ) {
      setError("Geçerli bir departman seçmelisiniz.");
      return;
    }

    if (title.trim().length < 3) {
      setError("Talep başlığı en az 3 karakter olmalıdır.");
      return;
    }

    if (description.trim().length < 5) {
      setError("Açıklama en az 5 karakter olmalıdır.");
      return;
    }

    try {
      const ticket = await createMutation.mutateAsync({
        companyId,
        departmentId,
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      onCreated(ticket.id);
    } catch (err) {
      setError(
        axios.isAxiosError(err) &&
          typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "Talep oluşturulurken bir hata oluştu.",
      );
    }
  }

  return (
    <div className="ticket-modal-backdrop">
      <div
        className="ticket-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
      >
        <div className="ticket-modal-header">
          <div>
            <h2 id="ticket-modal-title">Yeni Destek Talebi</h2>
            <p>Talebi ilgili departmanın havuzuna yönlendirin.</p>
          </div>

          <button
            type="button"
            className="ticket-icon-button"
            onClick={onClose}
            disabled={createMutation.isPending}
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ticket-modal-body">
            <div className="ticket-form-grid">
              <label className="ticket-field">
                <span>Şirket *</span>
                <select
                  value={companyId}
                  onChange={(event) => setCompanyId(Number(event.target.value))}
                  disabled={companiesLoading}
                  required
                >
                  <option value={0}>Şirket seçin</option>
                  {activeCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ticket-field">
                <span>Departman *</span>
                <select
                  value={departmentId}
                  onChange={(event) =>
                    setDepartmentId(Number(event.target.value))
                  }
                  disabled={departmentsLoading}
                  required
                >
                  <option value={0}>Departman seçin</option>
                  {availableDepartments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="ticket-field">
              <span>Talep Başlığı *</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Örn. Kullanıcı giriş problemi"
                minLength={3}
                maxLength={200}
                required
                autoFocus
              />
            </label>

            <label className="ticket-field">
              <span>Açıklama *</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Yaşanan problemi detaylı olarak açıklayın..."
                rows={5}
                minLength={5}
                required
              />
            </label>

            <label className="ticket-field">
              <span>Öncelik *</span>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TicketPriority)
                }
              >
                <option value="Low">Düşük</option>
                <option value="Normal">Normal</option>
                <option value="High">Yüksek</option>
                <option value="Critical">Kritik</option>
              </select>
            </label>

            {error && (
              <div className="ticket-form-error" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="ticket-modal-footer">
            <button
              className="ticket-button secondary"
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Vazgeç
            </button>

            <button
              className="ticket-button primary"
              type="submit"
              disabled={
                createMutation.isPending ||
                companiesLoading ||
                departmentsLoading
              }
            >
              <Plus size={17} />
              {createMutation.isPending ? "Oluşturuluyor..." : "Talep Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
