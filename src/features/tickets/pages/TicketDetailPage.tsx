import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  MessageSquare,
  Send,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../auth/hooks/useAuth";
import { useCompanies } from "../../companies/hooks/useCompanies";
import { useDepartments } from "../../users/hooks/useUsers";

import TicketPriorityBadge from "../components/TicketPriorityBadge";
import TicketStatusBadge from "../components/TicketStatusBadge";
import EmployeeTicketActions from "../components/EmployeeTicketActions";

import {
  useAddTicketComment,
  useTicketComments,
  useTicketDetail,
  useUpdateTicketPriority,
} from "../hooks/useTickets";

import type { TicketPriority } from "../types/ticket.types";

const priorityOptions: {
  value: TicketPriority;
  label: string;
}[] = [
  { value: "Low", label: "Düşük" },
  { value: "Normal", label: "Normal" },
  { value: "High", label: "Yüksek" },
  { value: "Critical", label: "Kritik" },
];

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

export default function TicketDetailPage() {
  const { id } = useParams();

  const ticketId = Number(id);
  const validId = Number.isSafeInteger(ticketId) && ticketId > 0;

  const { user } = useAuth();
  const isHelpdesk = user?.role === "Helpdesk";

  const {
    data: ticket,
    isPending,
    isError,
    refetch,
  } = useTicketDetail(validId ? ticketId : 0);

  const {
    data: comments = [],
    isPending: commentsLoading,
    isError: commentsError,
  } = useTicketComments(validId ? ticketId : 0);

  const { data: companies = [] } = useCompanies();
  const { data: departments = [] } = useDepartments();

  const priorityMutation = useUpdateTicketPriority();
  const commentMutation = useAddTicketComment();

  const [comment, setComment] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const backPath = isHelpdesk ? "/tickets" : "/tickets/pool";

  if (!validId) {
    return (
      <div className="ticket-detail-message">
        Geçersiz talep numarası.
        <Link to={backPath}>Listeye dön</Link>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="ticket-detail-message">Talep detayları yükleniyor...</div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="ticket-detail-message">
        <p>Talep bulunamadı veya erişim yetkiniz yok.</p>

        <button
          type="button"
          className="ticket-button secondary"
          onClick={() => void refetch()}
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const companyName =
    companies.find((company) => company.id === ticket.company_id)?.name ??
    `Şirket #${ticket.company_id}`;

  const departmentName =
    departments.find((department) => department.id === ticket.department_id)
      ?.name ?? `Departman #${ticket.department_id}`;

  async function handlePriorityChange(priority: TicketPriority) {
    if (!ticket || ticket.priority === priority) return;

    setActionError("");
    setSuccessMessage("");

    try {
      await priorityMutation.mutateAsync({
        id: ticket.id,
        priority,
      });

      setSuccessMessage("Talep önceliği güncellendi.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ticket || commentMutation.isPending) return;

    const content = comment.trim();

    if (content.length < 2) {
      setActionError("Yorum en az 2 karakter olmalıdır.");
      return;
    }

    setActionError("");
    setSuccessMessage("");

    try {
      await commentMutation.mutateAsync({
        id: ticket.id,
        content,
      });

      setComment("");
      setSuccessMessage("Yorum eklendi.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  return (
    <div className="ticket-detail-page">
      <div className="ticket-detail-top">
        <Link to={backPath} className="ticket-back-link">
          <ArrowLeft size={18} />
          Talep Listesine Dön
        </Link>

        <div className="ticket-detail-heading">
          <div>
            <div className="tickets-eyebrow">
              <FileText size={16} />
              {ticket.ticket_number}
            </div>

            <h1>{ticket.title}</h1>

            <p>
              {companyName} · {departmentName}
            </p>
          </div>

          <div className="ticket-detail-badges">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      {actionError && (
        <div className="ticket-form-error" role="alert">
          {actionError}
        </div>
      )}

      {successMessage && (
        <div className="ticket-success-message" role="status">
          {successMessage}
        </div>
      )}

      <div className="ticket-detail-grid">
        <div className="ticket-detail-main">
          {/* Talep Açıklaması */}
          <section className="ticket-detail-card">
            <div className="ticket-card-heading">
              <FileText size={19} />
              <h2>Talep Açıklaması</h2>
            </div>

            <p className="ticket-description">{ticket.description}</p>
          </section>

          {/* Employee İşlemleri */}
          {!isHelpdesk && <EmployeeTicketActions ticket={ticket} />}

          {/* Çözüm Notu */}
          {ticket.resolution_note && (
            <section className="ticket-detail-card">
              <div className="ticket-card-heading">
                <CheckCircle2 size={19} />
                <h2>Çözüm Notu</h2>
              </div>

              <p className="ticket-description">{ticket.resolution_note}</p>
            </section>
          )}

          {/* İşlem Geçmişi */}
          <section className="ticket-detail-card">
            <div className="ticket-card-heading">
              <History size={19} />
              <h2>İşlem Geçmişi</h2>
            </div>

            {ticket.history.length === 0 ? (
              <p className="ticket-muted">Henüz işlem geçmişi bulunmuyor.</p>
            ) : (
              <div className="ticket-history-list">
                {ticket.history.map((history) => (
                  <div className="ticket-history-item" key={history.id}>
                    <div className="ticket-history-dot" />

                    <div>
                      <strong>{history.description ?? history.action}</strong>

                      <span>
                        {formatDate(history.created_at)}
                        {" · "}
                        İşlemi yapan:{" "}
                        {history.performedByName ?? "Bilinmeyen Kullanıcı"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Yorumlar */}
          <section className="ticket-detail-card">
            <div className="ticket-card-heading">
              <MessageSquare size={19} />
              <h2>Yorumlar ({comments.length})</h2>
            </div>

            {commentsLoading ? (
              <p className="ticket-muted">Yorumlar yükleniyor...</p>
            ) : commentsError ? (
              <p className="ticket-muted">Yorumlar yüklenemedi.</p>
            ) : comments.length === 0 ? (
              <p className="ticket-muted">Bu talebe henüz yorum eklenmemiş.</p>
            ) : (
              <div className="ticket-comment-list">
                {comments.map((item) => (
                  <div className="ticket-comment" key={item.id}>
                    <div className="ticket-comment-avatar">
                      <UserRound size={17} />
                    </div>

                    <div>
                      <div className="ticket-comment-meta">
                        <strong>
                          {item.userName ?? "Bilinmeyen Kullanıcı"}
                        </strong>

                        <span>{formatDate(item.created_at)}</span>
                      </div>

                      <p>{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ticket.status !== "Closed" && (
              <form
                className="ticket-comment-form"
                onSubmit={(event) => void handleAddComment(event)}
              >
                <label htmlFor="ticket-new-comment">Yeni Yorum</label>

                <textarea
                  id="ticket-new-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  minLength={2}
                  maxLength={5000}
                  rows={4}
                  required
                />

                <button
                  type="submit"
                  className="ticket-button primary"
                  disabled={commentMutation.isPending}
                >
                  <Send size={16} />

                  {commentMutation.isPending ? "Gönderiliyor..." : "Yorum Ekle"}
                </button>
              </form>
            )}
          </section>
        </div>

        {/* Sağ Bilgi Alanı */}
        <aside className="ticket-detail-aside">
          <section className="ticket-detail-card">
            <div className="ticket-card-heading">
              <Building2 size={19} />
              <h2>Talep Bilgileri</h2>
            </div>

            <div className="ticket-detail-info">
              <div>
                <span>Talep Numarası</span>
                <strong>{ticket.ticket_number}</strong>
              </div>

              <div>
                <span>Şirket</span>
                <strong>{companyName}</strong>
              </div>

              <div>
                <span>Departman</span>
                <strong>{departmentName}</strong>
              </div>

              <div>
                <span>Durum</span>
                <TicketStatusBadge status={ticket.status} />
              </div>

              <div>
                <span>Öncelik</span>
                <TicketPriorityBadge priority={ticket.priority} />
              </div>

              <div>
                <span>Üstlenen Personel</span>

                <strong>
                  {ticket.assigned_user_id === null
                    ? "Henüz üstlenilmedi"
                    : (ticket.assignedUserName ?? "Bilinmeyen Kullanıcı")}
                </strong>
              </div>
            </div>
          </section>

          {/* Öncelik Yönetimi */}
          {isHelpdesk && (
            <section className="ticket-detail-card">
              <div className="ticket-card-heading">
                <Clock3 size={19} />
                <h2>Öncelik Yönetimi</h2>
              </div>

              <label className="ticket-field">
                <span>Talep Önceliği</span>

                <select
                  value={ticket.priority}
                  disabled={
                    ticket.status === "Closed" || priorityMutation.isPending
                  }
                  onChange={(event) =>
                    void handlePriorityChange(
                      event.target.value as TicketPriority,
                    )
                  }
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {ticket.status === "Closed" && (
                <p className="ticket-muted">
                  Kapatılmış taleplerin önceliği değiştirilemez.
                </p>
              )}
            </section>
          )}

          {/* Tarih Bilgileri */}
          <section className="ticket-detail-card">
            <div className="ticket-card-heading">
              <CalendarClock size={19} />
              <h2>Tarih Bilgileri</h2>
            </div>

            <div className="ticket-detail-info">
              <div>
                <span>Oluşturulma</span>
                <strong>{formatDate(ticket.created_at)}</strong>
              </div>

              <div>
                <span>Üstlenilme</span>
                <strong>{formatDate(ticket.claimed_at)}</strong>
              </div>

              <div>
                <span>Kapatılma</span>
                <strong>{formatDate(ticket.closed_at)}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
