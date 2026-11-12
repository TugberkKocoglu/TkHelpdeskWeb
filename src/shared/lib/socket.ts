import { io, type Socket } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5218/api";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export interface TicketChangedEvent {
  ticketId: number;
  status: "InPool" | "Claimed" | "InProgress" | "Closed";
}

export function createSocket(token: string): Socket {
  return io(SOCKET_URL, {
    autoConnect: false,
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });
}
