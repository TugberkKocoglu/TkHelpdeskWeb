import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Building2, Mail, Phone, X } from "lucide-react";

import type { Company, CompanyFormValues } from "../types/company.types";

import { useCreateCompany, useUpdateCompany } from "../hooks/useCompanies";

interface CompanyFormModalProps {
  company: Company | null;
  onClose: () => void;
}

function getInitialValues(company: Company | null): CompanyFormValues {
  return {
    name: company?.name ?? "",
    contactEmail: company?.contact_email ?? "",
    contactPhone: company?.contact_phone ?? "",
  };
}

export default function CompanyFormModal({
  company,
  onClose,
}: CompanyFormModalProps) {
  const [form, setForm] = useState<CompanyFormValues>(() =>
    getInitialValues(company),
  );
  const [error, setError] = useState("");

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const isEditing = company !== null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, isSaving]);

  function updateField(field: keyof CompanyFormValues, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setError("");

    if (!form.name.trim()) {
      setError("Şirket adı zorunludur.");
      return;
    }

    try {
      if (company) {
        await updateMutation.mutateAsync({
          id: company.id,
          input: form,
        });
      } else {
        await createMutation.mutateAsync(form);
      }

      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;

        setError(
          typeof message === "string"
            ? message
            : "Şirket kaydedilirken bir hata oluştu.",
        );
      } else {
        setError("Beklenmeyen bir hata oluştu.");
      }
    }
  }

  return (
    <div
      className="company-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div
        className="company-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-modal-title"
      >
        <div className="company-modal-header">
          <div className="company-modal-heading">
            <div className="company-modal-icon">
              <Building2 size={21} />
            </div>

            <div>
              <h2 id="company-modal-title">
                {isEditing ? "Şirket Düzenle" : "Yeni Şirket"}
              </h2>
              <p>
                {isEditing
                  ? "Şirket bilgilerini güncelleyin."
                  : "Sisteme yeni bir şirket ekleyin."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="company-icon-button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="company-modal-body">
            <div className="company-field">
              <label htmlFor="company-name">
                Şirket Adı <span>*</span>
              </label>

              <div className="company-input">
                <Building2 size={18} />
                <input
                  id="company-name"
                  type="text"
                  value={form.name}
                  placeholder="Şirket adını girin"
                  maxLength={200}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="company-field">
              <label htmlFor="company-email">İletişim E-postası</label>

              <div className="company-input">
                <Mail size={18} />
                <input
                  id="company-email"
                  type="email"
                  value={form.contactEmail}
                  placeholder="iletisim@sirket.com"
                  onChange={(event) =>
                    updateField("contactEmail", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="company-field">
              <label htmlFor="company-phone">Telefon Numarası</label>

              <div className="company-input">
                <Phone size={18} />
                <input
                  id="company-phone"
                  type="tel"
                  value={form.contactPhone}
                  placeholder="05XX XXX XX XX"
                  onChange={(event) =>
                    updateField("contactPhone", event.target.value)
                  }
                />
              </div>
            </div>

            {error && (
              <div className="company-form-error" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="company-modal-footer">
            <button
              type="button"
              className="company-button secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="company-button primary"
              disabled={isSaving}
            >
              {isSaving
                ? "Kaydediliyor..."
                : isEditing
                  ? "Değişiklikleri Kaydet"
                  : "Şirket Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
