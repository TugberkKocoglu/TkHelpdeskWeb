import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "../../features/auth/components/ProtectedRoute";
import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import DashboardLayout from "../../layouts/DashboardLayout";
import CompanyListPage from "../../features/companies/pages/CompanyListPage";
import UserListPage from "../../features/users/pages/UserListPage";
import TicketListPage from "../../features/tickets/pages/TicketListPage";
import TicketDetailPage from "../../features/tickets/pages/TicketDetailPage";
import EmployeeTicketsPage from "../../features/tickets/pages/EmployeeTicketsPage";
import NotificationListPage from "../../features/notifications/pages/NotificationListPage";
import ReportPage from "../../features/reports/pages/ReportPage";
import ProfilePage from "../../features/profile/pages/ProfilePage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Herkese açık Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Giriş yapmış bütün kullanıcılar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/notifications" element={<NotificationListPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />

            {/* Helpdesk sayfaları */}
            <Route element={<ProtectedRoute allowedRoles={["Helpdesk"]} />}>
              <Route path="/tickets" element={<TicketListPage />} />

              <Route path="/companies" element={<CompanyListPage />} />

              <Route path="/users" element={<UserListPage />} />

              <Route path="/reports" element={<ReportPage />} />
            </Route>

            {/* Employee sayfaları */}
            <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
              <Route
                path="/tickets/pool"
                element={<EmployeeTicketsPage mode="pool" />}
              />

              <Route
                path="/tickets/mine"
                element={<EmployeeTicketsPage mode="mine" />}
              />

              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
