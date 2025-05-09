import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { Message, User } from "@shared/schema";
import { Send, X } from "lucide-react";
import MessagesList from "@/components/MessagesList";

interface MessageDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageDialog({ userId, isOpen, onClose }: MessageDialogProps) {
  const { user: currentUser } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Fetch selected user
  const { data: selectedUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: isOpen,
  });
  
  // Fetch messages with selected user
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${userId}`],
    enabled: isOpen && !!currentUser,
    onSuccess: (data) => {
      setLocalMessages(data);
      // Mark messages as read when loaded
      markAsRead(userId);
    },
  });
  
  // WebSocket for real-time messaging
  const { sendMessage, markAsRead } = useWebSocket({
    onNewMessage: (message) => {
      if (message.senderId === userId || message.recipientId === userId) {
        setLocalMessages((prev) => [...prev, message]);
        
        // Mark as read if we're currently viewing this conversation
        if (message.senderId === userId) {
          markAsRead(userId);
        }
      }
    },
  });
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [localMessages]);
  
  // Mark messages as read when dialog opens
  useEffect(() => {
    if (isOpen && userId) {
      markAsRead(userId);
    }
  }, [isOpen, userId, markAsRead]);
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !userId || !currentUser) return;
    
    // Send message via WebSocket
    const sent = sendMessage(userId, messageText);
    
    if (sent) {
      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: Date.now(), // Temporary ID
        senderId: currentUser.id,
        recipientId: userId,
        content: messageText,
        read: false,
        createdAt: new Date(),
      };
      
      setLocalMessages((prev) => [...prev, optimisticMessage]);
      setMessageText("");
    }
  };
  
  if (!selectedUser) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={selectedUser.profileImageUrl || ""} />
                <AvatarFallback>
                  {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0] || selectedUser.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <DialogTitle className="text-lg">
                {selectedUser.firstName} {selectedUser.lastName}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading messages...</p>
            </div>
          ) : (
            <MessagesList 
              messages={localMessages || []} 
              currentUserId={currentUser?.id || ""} 
              otherUser={selectedUser}
            />
          )}
        </ScrollArea>
        
        <DialogFooter className="px-4 py-2 border-t">
          <div className="flex w-full space-x-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
