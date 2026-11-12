import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import Sidebar from "./Sidebar";
import Header from "./Header";

import { useAuth } from "../features/auth/hooks/useAuth";

import SocketSync from "../shared/components/SocketSync";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tickets": "Talepler",
  "/tickets/pool": "Departman Havuzu",
  "/tickets/mine": "Taleplerim",
  "/companies": "Şirketler",
  "/users": "Kullanıcılar",
  "/reports": "Raporlar",
  "/notifications": "Bildirimler",
  "/profile": "Profilim",
};

export default function DashboardLayout() {
  const { logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = location.pathname.match(/^\/tickets\/\d+$/)
    ? "Talep Detayı"
    : (pageTitles[location.pathname] ?? "TK Helpdesk");

  async function handleLogout() {
    setSidebarOpen(false);

    try {
      await logout();
    } catch {
      window.alert(
        "Yerel oturum kapatıldı ancak sunucudaki oturum iptal edilemedi. API bağlantısını kontrol edin.",
      );
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="dashboard-layout">
      <SocketSync />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          void handleLogout();
        }}
      />

      <div className="dashboard-main">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
