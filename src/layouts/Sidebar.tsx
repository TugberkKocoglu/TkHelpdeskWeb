import { NavLink } from "react-router";
import {
  Bell,
  Building2,
  ChartNoAxesCombined,
  Headset,
  LayoutDashboard,
  LogOut,
  Ticket,
  Users,
  Inbox,
  ClipboardList,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../features/auth/hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const { user } = useAuth();
  const isHelpdesk = user?.role === "Helpdesk";

  const menuItems = isHelpdesk
    ? [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Talepler", path: "/tickets", icon: Ticket },
        { label: "Şirketler", path: "/companies", icon: Building2 },
        { label: "Kullanıcılar", path: "/users", icon: Users },
        { label: "Raporlar", path: "/reports", icon: ChartNoAxesCombined },
        { label: "Bildirimler", path: "/notifications", icon: Bell },
      ]
    : [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Departman Havuzu", path: "/tickets/pool", icon: Inbox },
        { label: "Taleplerim", path: "/tickets/mine", icon: ClipboardList },
        { label: "Bildirimler", path: "/notifications", icon: Bell },
        { label: "Profilim", path: "/profile", icon: UserRound },
      ];

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Headset size={23} strokeWidth={2.2} />
          </div>

          <div className="sidebar-brand-name">
            TK <strong>Helpdesk</strong>
            <small>DESTEK YÖNETİM SİSTEMİ</small>
          </div>

          <button
            className="sidebar-close"
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section-label">ANA MENÜ</div>

          <nav className="sidebar-nav" aria-label="Ana menü">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={19} strokeWidth={1.9} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {user?.firstName?.charAt(0).toUpperCase() ?? "U"}
              {user?.lastName?.charAt(0).toUpperCase() ?? ""}
            </div>

            <div className="sidebar-user-details">
              <strong>
                {user?.firstName} {user?.lastName}
              </strong>
              <span>
                {isHelpdesk ? "Helpdesk Yetkilisi" : "Departman Personeli"}
              </span>
            </div>
          </div>

          <button type="button" className="sidebar-logout" onClick={onLogout}>
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
