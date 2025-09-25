import { io } from "socket.io-client";
import { getAccessToken } from "../utils/TokenStorage";

let sharedSocket = null;
let connectionCount = 0;

export const getSharedSocket = () => {
  if (!sharedSocket) {
    const token = getAccessToken();
    if (!token) {
      console.error("❌ No authentication token found for socket connection");
      return null;
    }

    // Use VITE_SOCKET_URL if available, otherwise use the base API URL directly
    let socketURL = import.meta.env.VITE_SOCKET_URL;

    if (!socketURL) {
      // Since VITE_API_BASE_URL is http://localhost:5000, use it directly for socket
      socketURL = import.meta.env.VITE_API_BASE_URL;
    }

    console.log("🌐 Creating shared socket connection to:", socketURL);
    console.log("🔑 Token present:", !!token);
    console.log(
      "🔑 Token preview:",
      token ? `${token.substring(0, 20)}...` : "none"
    );
    console.log("🌐 Environment check:", {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
      finalSocketURL: socketURL,
    });

    sharedSocket = io(socketURL, {
      auth: { token },
      transports: ["websocket", "polling"],
      forceNew: true,
      timeout: 15000, // Increased timeout
      reconnection: true,
      reconnectionAttempts: 10, // More attempts
      reconnectionDelay: 2000, // Longer delay
      reconnectionDelayMax: 5000,
      autoConnect: true,
      withCredentials: true,
    });

    sharedSocket.on("connect", () => {
      console.log("✅ Shared socket connected to:", socketURL);
      console.log("✅ Socket ID:", sharedSocket.id);
    });

    sharedSocket.on("disconnect", (reason) => {
      console.log("❌ Shared socket disconnected:", reason);
      if (reason === "io server disconnect") {
        console.log("🔄 Server disconnected, attempting to reconnect...");
      }
    });

    sharedSocket.on("connect_error", (error) => {
      console.error("❌ Shared socket connection error:", error);
      console.error("🔍 Error details:", {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type,
      });
      console.error("🌐 Socket URL was:", socketURL);
      console.error("🔑 Token present:", !!token);
      console.error("🔑 Token length:", token ? token.length : 0);
    });

    sharedSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });

    sharedSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Socket reconnection attempt", attemptNumber);
    });

    sharedSocket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnection error:", error);
    });

    sharedSocket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed after all attempts");
    });
  }
  connectionCount++;
  console.log(`🔗 Shared socket reference count: ${connectionCount}`);
  return sharedSocket;
};

export const releaseSharedSocket = () => {
  connectionCount--;
  console.log(`🔗 Shared socket reference count: ${connectionCount}`);
  if (connectionCount <= 0 && sharedSocket) {
    console.log("🧹 Cleaning up shared socket");
    sharedSocket.disconnect();
    sharedSocket = null;
    connectionCount = 0;
  }
};
