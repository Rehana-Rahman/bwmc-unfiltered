import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { type Message } from "@shared/schema";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

interface UseWebSocketProps {
  onNewMessage?: (message: Message) => void;
  onMessagesRead?: (byUserId: string) => void;
}

export function useWebSocket({ onNewMessage, onMessagesRead }: UseWebSocketProps = {}) {
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!user || socketRef.current?.readyState === WebSocket.OPEN) return;

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Create WebSocket connection
    setStatus("connecting");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("open");
      // Authenticate the WebSocket connection
      socket.send(JSON.stringify({ userId: user.id }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "new_message" && data.message && onNewMessage) {
          onNewMessage(data.message);
        } else if (data.type === "messages_read" && data.by && onMessagesRead) {
          onMessagesRead(data.by);
        } else if (data.error) {
          console.error("WebSocket error:", data.error);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("error");
    };

    socket.onclose = () => {
      setStatus("closed");
      // Try to reconnect after a delay
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [user, onNewMessage, onMessagesRead]);

  const sendMessage = useCallback((recipientId: string, content: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "message",
        recipientId,
        content
      }));
      return true;
    }
    return false;
  }, []);

  const markAsRead = useCallback((senderId: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "read",
        senderId
      }));
      return true;
    }
    return false;
  }, []);

  // Connect when component mounts or user changes
  useEffect(() => {
    if (user) {
      connect();
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [user, connect]);

  return {
    status,
    sendMessage,
    markAsRead,
    reconnect: connect
  };
}
