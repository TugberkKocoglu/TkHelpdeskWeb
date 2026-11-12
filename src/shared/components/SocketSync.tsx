import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../features/auth/hooks/useAuth";

import { getAccessToken, TOKEN_UPDATED_EVENT } from "../api/axios";

import { createSocket } from "../lib/socket";

export default function SocketSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id;
  const role = user?.role;

  useEffect(() => {
    if (!userId || !role) return;

    const token = getAccessToken();

    if (!token) return;

    const socket = createSocket(token);

    function onConnect() {
      console.info("Socket.IO bağlantısı kuruldu.");

      // Yeniden bağlantıda arada kaçırılmış
      // olabilecek verileri güncelle.
      void queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });

      if (role === "Helpdesk") {
        void queryClient.invalidateQueries({
          queryKey: ["reports"],
        });
      }
    }

    function onTicketChanged() {
      void queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });

      if (role === "Helpdesk") {
        void queryClient.invalidateQueries({
          queryKey: ["reports"],
        });
      }
    }

    function onNotificationRefresh() {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    }

    function onConnectError(error: Error) {
      console.warn("Socket.IO bağlantı hatası:", error.message);
    }

    function onTokenUpdated() {
      const newToken = getAccessToken();

      if (!newToken) {
        socket.disconnect();
        return;
      }

      socket.auth = {
        token: newToken,
      };

      // Yeni JWT ile backend kimlik
      // doğrulamasını tekrar gerçekleştir.
      socket.disconnect();
      socket.connect();
    }

    socket.on("connect", onConnect);
    socket.on("ticket:changed", onTicketChanged);
    socket.on("notification:refresh", onNotificationRefresh);
    socket.on("connect_error", onConnectError);

    window.addEventListener(TOKEN_UPDATED_EVENT, onTokenUpdated);

    socket.connect();

    return () => {
      window.removeEventListener(TOKEN_UPDATED_EVENT, onTokenUpdated);

      socket.off("connect", onConnect);
      socket.off("ticket:changed", onTicketChanged);
      socket.off("notification:refresh", onNotificationRefresh);
      socket.off("connect_error", onConnectError);

      socket.disconnect();
    };
  }, [userId, role, queryClient]);

  return null;
}
