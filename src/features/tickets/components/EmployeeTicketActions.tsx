import { useState, type FormEvent } from "react";
import axios from "axios";

import { CheckCircle2, Clock3, Play, ShieldCheck } from "lucide-react";

import { useAuth } from "../../auth/hooks/useAuth";

import { useCloseTicket, useStartTicket } from "../hooks/useTickets";

import type { Ticket } from "../types/ticket.types";

interface Props {
  ticket: Ticket;
}

function getErrorMessage(error: unknown): string {
  if (
    axios.isAxiosError(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }

  return "İşlem gerçekleştirilemedi. Tekrar deneyin.";
}

export default function EmployeeTicketActions({ ticket }: Props) {
  const { user } = useAuth();

  const startMutation = useStartTicket();
  const closeMutation = useCloseTicket();

  const [resolutionNote, setResolutionNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isOwner =
    user?.role === "Employee" && ticket.assigned_user_id === user.id;

  const canStart = isOwner && ticket.status === "Claimed";
  const canClose = isOwner && ticket.status === "InProgress";

  async function handleStart() {
    if (!canStart || startMutation.isPending) return;

    if (!window.confirm("Bu talebi işleme almak istiyor musunuz?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await startMutation.mutateAsync(ticket.id);
      setSuccess("Talep başarıyla işleme alındı.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleClose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canClose || closeMutation.isPending) return;

    const note = resolutionNote.trim();

    if (note.length < 5) {
      setError("Çözüm notu en az 5 karakter olmalıdır.");
      return;
    }

    if (
      !window.confirm(
        "Bu talebi kapatmak istediğinize emin misiniz? Kapatılan talepler tekrar işleme alınamaz.",
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await closeMutation.mutateAsync({
        id: ticket.id,
        resolutionNote: note,
      });

      setResolutionNote("");
      setSuccess("Talep çözüm notuyla başarıyla kapatıldı.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (user?.role !== "Employee") {
    return null;
  }

  return (
    <section className="ticket-detail-card employee-actions-card">
      <div className="ticket-card-heading">
        <ShieldCheck size={19} />
        <h2>Talep İşlemleri</h2>
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

      {ticket.status === "InPool" && (
        <div className="employee-action-message">
          <Clock3 size={20} />
          <p>
            Bu talep henüz üstlenilmemiş. İşlem yapmak için Departman Havuzu
            ekranından talebi üstlenmelisiniz.
          </p>
        </div>
      )}

      {!isOwner && ticket.status !== "InPool" && ticket.status !== "Closed" && (
        <div className="employee-action-message">
          <ShieldCheck size={20} />
          <p>
            Bu talep başka bir çalışan tarafından üstlenilmiş. İşleme alma veya
            kapatma yetkiniz bulunmuyor.
          </p>
        </div>
      )}

      {canStart && (
        <div className="employee-action-content">
          <p>
            Talebi üstlendiniz. Çözüm üzerinde çalışmaya başlamak için aşağıdaki
            butonu kullanın.
          </p>

          <button
            type="button"
            className="ticket-button primary"
            onClick={() => void handleStart()}
            disabled={startMutation.isPending}
          >
            <Play size={17} />
            {startMutation.isPending ? "İşleme alınıyor..." : "İşleme Al"}
          </button>
        </div>
      )}

      {canClose && (
        <form
          className="employee-close-form"
          onSubmit={(event) => void handleClose(event)}
        >
          <p>
            Talep üzerinde çalışıyorsunuz. İşlem tamamlandığında çözüm notunu
            girerek talebi kapatabilirsiniz.
          </p>

          <label htmlFor="ticket-resolution-note">Çözüm Notu *</label>

          <textarea
            id="ticket-resolution-note"
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            placeholder="Sorunun nasıl çözüldüğünü açıklayın..."
            rows={5}
            minLength={5}
            required
          />

          <button
            type="submit"
            className="ticket-button primary"
            disabled={closeMutation.isPending}
          >
            <CheckCircle2 size={17} />
            {closeMutation.isPending ? "Kapatılıyor..." : "Talebi Kapat"}
          </button>
        </form>
      )}

      {ticket.status === "Closed" && (
        <div className="employee-action-completed">
          <CheckCircle2 size={22} />
          <div>
            <strong>Talep Kapatıldı</strong>
            <p>
              Bu talebin işlemleri tamamlandı. Çözüm notunu ve işlem geçmişini
              yukarıdaki bölümlerden inceleyebilirsiniz.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
