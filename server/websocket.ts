import { WebSocketServer, WebSocket } from "ws";
import { type Server } from "http";
import { storage } from "./storage";
import { type InsertMessage } from "@shared/schema";

interface MessageData {
  type: 'message';
  recipientId: string;
  content: string;
}

interface ReadMessageData {
  type: 'read';
  senderId: string;
}

type WebSocketMessage = MessageData | ReadMessageData;

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  // Store active connections
  const connections = new Map<string, ExtendedWebSocket>();
  
  // Setup ping interval to check for dead connections
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) return ws.terminate();
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(pingInterval);
  });
  
  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;
    
    // Handle ping/pong to keep connection alive
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    // Handle authentication
    ws.on('message', async (data) => {
      let message: WebSocketMessage;
      
      try {
        message = JSON.parse(data.toString());
      } catch (error) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
        return;
      }
      
      // Handle authentication message
      if ('userId' in message) {
        ws.userId = message.userId;
        connections.set(message.userId, ws);
        return;
      }
      
      // Ensure the client is authenticated
      if (!ws.userId) {
        ws.send(JSON.stringify({ error: 'Not authenticated' }));
        return;
      }
      
      if (message.type === 'message') {
        try {
          const senderId = ws.userId;
          const { recipientId, content } = message;
          
          // Store message in database
          const messageData: InsertMessage = {
            senderId,
            recipientId,
            content
          };
          
          const newMessage = await storage.sendMessage(messageData);
          
          // Send message to recipient if they're connected
          const recipientWs = connections.get(recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'new_message',
              message: newMessage
            }));
          }
          
          // Send confirmation back to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: newMessage
          }));
        } catch (error) {
          console.error('Error sending message:', error);
          ws.send(JSON.stringify({ error: 'Failed to send message' }));
        }
      } else if (message.type === 'read') {
        try {
          const recipientId = ws.userId;
          const { senderId } = message;
          
          // Mark messages as read
          await storage.markMessagesAsRead(recipientId, senderId);
          
          // Notify sender if they're connected
          const senderWs = connections.get(senderId);
          if (senderWs && senderWs.readyState === WebSocket.OPEN) {
            senderWs.send(JSON.stringify({
              type: 'messages_read',
              by: recipientId
            }));
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
          ws.send(JSON.stringify({ error: 'Failed to mark messages as read' }));
        }
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      if (ws.userId) {
        connections.delete(ws.userId);
      }
    });
  });
  
  return wss;
}
