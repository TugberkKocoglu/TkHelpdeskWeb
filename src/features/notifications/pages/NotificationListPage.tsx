import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

import {
  Bell,
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
} from "lucide-react";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";

import type { Notification } from "../types/notification.types";

const PAGE_SIZE = 20;

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

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

function getNotificationTitle(notification: Notification): string {
  if (notification.title) {
    return notification.title;
  }

  const titles: Record<string, string> = {
    TicketCreated: "Yeni Talep Oluşturuldu",
    TicketClaimed: "Talep Üstlenildi",
    TicketInProgress: "Talep İşleme Alındı",
    TicketClosed: "Talep Kapatıldı",
    TicketPriorityChanged: "Talep Önceliği Değişti",
  };

  return titles[notification.type ?? ""] ?? "Destek Talebi Bildirimi";
}

export default function NotificationListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data, isPending, isError, isFetching, refetch } = useNotifications(
    page,
    PAGE_SIZE,
  );

  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 0, 1);

  async function handleOpenNotification(notification: Notification) {
    if (processingId !== null) return;

    setError("");
    setSuccess("");

    if (!notification.is_read) {
      setProcessingId(notification.id);

      try {
        await markReadMutation.mutateAsync(notification.id);
      } catch (err) {
        setError(getErrorMessage(err));
        setProcessingId(null);
        return;
      }

      setProcessingId(null);
    }

    if (
      typeof notification.ticket_id === "number" &&
      notification.ticket_id > 0
    ) {
      navigate(`/tickets/${notification.ticket_id}`);
    } else {
      setSuccess("Bildirim okundu olarak işaretlendi.");
    }
  }

  async function handleMarkAllRead() {
    if (markAllMutation.isPending || unreadCount === 0) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const count = await markAllMutation.mutateAsync();

      setSuccess(`${count} bildirim okundu olarak işaretlendi.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page-header">
        <div>
          <div className="notifications-eyebrow">
            <Bell size={16} />
            BİLDİRİMLER
          </div>

          <h1>Bildirimler</h1>

          <p>
            Destek talepleriyle ilgili güncellemeleri buradan takip
            edebilirsiniz.
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

      <div className="notifications-summary">
        <div className="notification-summary-card">
          <div className="notification-summary-icon blue">
            <Bell size={22} />
          </div>

          <div>
            <span>Toplam Bildirim</span>
            <strong>{isPending ? "—" : total}</strong>
          </div>
        </div>

        <div className="notification-summary-card">
          <div className="notification-summary-icon orange">
            <Clock3 size={22} />
          </div>

          <div>
            <span>Okunmamış Bildirim</span>
            <strong>{isPending ? "—" : unreadCount}</strong>
          </div>
        </div>
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

      <section className="notifications-list-card">
        <div className="notifications-list-header">
          <div>
            <h2>Bildirim Listesi</h2>
            <p>En yeni bildirimler üstte gösterilir.</p>
          </div>

          <button
            type="button"
            className="notification-mark-all"
            onClick={() => void handleMarkAllRead()}
            disabled={
              isPending || unreadCount === 0 || markAllMutation.isPending
            }
          >
            <CheckCheck size={17} />
            {markAllMutation.isPending
              ? "İşleniyor..."
              : "Tümünü Okundu İşaretle"}
          </button>
        </div>

        {isPending || isFetching ? (
          <div className="notifications-empty">Bildirimler yükleniyor...</div>
        ) : isError ? (
          <div className="notifications-empty">
            <p>Bildirimler yüklenemedi.</p>

            <button
              type="button"
              className="ticket-button secondary"
              onClick={() => void refetch()}
            >
              Tekrar Dene
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <BellOff size={36} />
            <strong>Henüz bildirim bulunmuyor</strong>
            <p>Talep işlemleriyle ilgili bildirimler burada görüntülenecek.</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((notification) => {
                const isProcessing = processingId === notification.id;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`notification-item ${
                      notification.is_read ? "read" : "unread"
                    }`}
                    onClick={() => void handleOpenNotification(notification)}
                    disabled={processingId !== null}
                  >
                    <div className="notification-item-icon">
                      <Bell size={19} />
                    </div>

                    <div className="notification-item-content">
                      <div className="notification-item-top">
                        <strong>{getNotificationTitle(notification)}</strong>

                        {!notification.is_read && (
                          <span className="notification-unread-dot" />
                        )}
                      </div>

                      {notification.message && <p>{notification.message}</p>}

                      <div className="notification-item-meta">
                        <Clock3 size={13} />
                        <span>{formatDate(notification.created_at)}</span>

                        {notification.ticket_id != null && (
                          <span>· Talep #{notification.ticket_id}</span>
                        )}

                        <span>
                          ·{" "}
                          {isProcessing
                            ? "İşleniyor..."
                            : notification.is_read
                              ? "Okundu"
                              : "Okunmadı"}
                        </span>
                      </div>
                    </div>

                    {notification.ticket_id != null && (
                      <ChevronRight
                        className="notification-item-arrow"
                        size={19}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="notifications-pagination">
              <span>Toplam {total} bildirim</span>

              <div>
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((value) => value - 1)}
                  aria-label="Önceki sayfa"
                >
                  <ChevronLeft size={17} />
                </button>

                <span>
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((value) => value + 1)}
                  aria-label="Sonraki sayfa"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
