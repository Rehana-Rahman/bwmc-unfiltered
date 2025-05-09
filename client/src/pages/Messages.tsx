import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessagesList from "@/components/MessagesList";
import ConversationBox from "@/components/ConversationBox";
import { Message, User } from "@shared/schema";
import { Send } from "lucide-react";

interface MessagesProps {
  userId?: string;
}

export default function Messages({ userId }: MessagesProps) {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userId);
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["/api/messages/conversations"],
    enabled: !!currentUser,
  });

  // Fetch selected user
  const { data: selectedUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${selectedUserId}`],
    enabled: !!selectedUserId,
  });

  // Fetch messages with selected user
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${selectedUserId}`],
    enabled: !!currentUser && !!selectedUserId,
    onSuccess: (data) => {
      setLocalMessages(data);
      // Mark messages as read when loaded
      if (selectedUserId) {
        markAsRead(selectedUserId);
      }
    },
  });

  // WebSocket for real-time messaging
  const { sendMessage, markAsRead } = useWebSocket({
    onNewMessage: (message) => {
      if (message.senderId === selectedUserId || message.recipientId === selectedUserId) {
        setLocalMessages((prev) => [...prev, message]);
        
        // Mark as read if we're currently viewing this conversation
        if (message.senderId === selectedUserId) {
          markAsRead(selectedUserId);
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

  // Mark messages as read when user selects a conversation
  useEffect(() => {
    if (selectedUserId) {
      markAsRead(selectedUserId);
    }
  }, [selectedUserId, markAsRead]);

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    setLocation(`/messages/${userId}`);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUserId || !currentUser) return;
    
    // Send message via WebSocket
    const sent = sendMessage(selectedUserId, messageText);
    
    if (sent) {
      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: Date.now(), // Temporary ID
        senderId: currentUser.id,
        recipientId: selectedUserId,
        content: messageText,
        read: false,
        createdAt: new Date(),
      };
      
      setLocalMessages((prev) => [...prev, optimisticMessage]);
      setMessageText("");
    }
  };

  if (!currentUser) {
    setLocation("/api/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex h-[calc(100vh-10rem)] overflow-hidden bg-white dark:bg-secondary rounded-lg shadow">
        {/* Conversations sidebar */}
        <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-lg">Messages</h2>
          </div>
          
          <ScrollArea className="flex-1">
            {isLoadingConversations ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations && conversations.length > 0 ? (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <ConversationBox
                    key={conversation.user.id}
                    conversation={conversation}
                    isSelected={selectedUserId === conversation.user.id}
                    onClick={() => handleSelectConversation(conversation.user.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <p>No conversations yet.</p>
                <p className="text-sm mt-2">Start messaging to connect with others!</p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message area */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedUserId && selectedUser ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedUser.profileImageUrl || ""} alt={selectedUser.username || "User"} />
                  <AvatarFallback>
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0] || selectedUser.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  {selectedUser.username && (
                    <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  )}
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                {isLoadingMessages ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <Skeleton className={`h-12 w-2/3 rounded-lg ${i % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <MessagesList 
                    messages={localMessages || []} 
                    currentUserId={currentUser.id}
                    otherUser={selectedUser}
                  />
                )}
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
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
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a conversation from the sidebar or start a new one.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
