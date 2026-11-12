import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { AuthProvider } from "./features/auth/hooks/AuthContext";

import "./styles/global.scss";
import "./styles/dashboard.scss";
import "./styles/companies.scss";
import "./styles/users.scss";
import "./styles/tickets.scss";
import "./styles/ticket-detail.scss";
import "./styles/notifications.scss";
import "./styles/dashboard-overview.scss";
import "./styles/reports.scss";
import "./styles/profile.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
