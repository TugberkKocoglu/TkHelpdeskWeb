import { useNavigate } from "react-router";

import { Bell, ChevronRight, Menu, UserRound } from "lucide-react";

import { useAuth } from "../features/auth/hooks/useAuth";
import { useNotifications } from "../features/notifications/hooks/useNotifications";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tek kayıt yeterli; unreadCount backend'de tüm
  // okunmamış bildirimler üzerinden hesaplanıyor.
  const { data: notificationData } = useNotifications(1, 1);

  const unreadCount = notificationData?.unreadCount ?? 0;

  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Menüyü aç"
        >
          <Menu size={23} />
        </button>

        <div className="header-breadcrumb">
          <span>TK Helpdesk</span>
          <ChevronRight size={15} />
          <strong>{title}</strong>
        </div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="header-icon-button notification-header-button"
          aria-label={
            unreadCount > 0
              ? `Bildirimler, ${unreadCount} okunmamış`
              : "Bildirimler"
          }
          title="Bildirimler"
          onClick={() => navigate("/notifications")}
        >
          <Bell size={21} />

          {unreadCount > 0 && (
            <span className="notification-header-badge">{badgeText}</span>
          )}
        </button>

        <div className="header-divider" />

        <div className="header-profile">
          <div className="header-profile-info">
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>

            <span>
              {user?.role === "Helpdesk"
                ? "Helpdesk Yetkilisi"
                : "Departman Personeli"}
            </span>
          </div>

          <div className="header-avatar">
            <UserRound size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
