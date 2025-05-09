import { Fragment } from "react";
import { Message, User } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  otherUser: User;
}

export default function MessagesList({ messages, currentUserId, otherUser }: MessagesListProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-4">
        <p className="text-muted-foreground mb-2">No messages yet.</p>
        <p className="text-sm text-muted-foreground">Send a message to start the conversation!</p>
      </div>
    );
  }
  
  // Group messages by date for better organization
  const groupedMessages: { [key: string]: Message[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.createdAt).toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <Fragment key={date}>
          <div className="relative text-center mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative">
              <span className="bg-background dark:bg-card px-2 text-xs text-muted-foreground">
                {date === new Date().toDateString() ? "Today" : format(new Date(date), "MMMM d, yyyy")}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            {dateMessages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isCurrentUser ? "justify-end" : "justify-start",
                    "gap-2"
                  )}
                >
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={otherUser.profileImageUrl || ""} />
                      <AvatarFallback>
                        {otherUser.firstName?.[0]}{otherUser.lastName?.[0] || otherUser.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-4 py-2 break-words",
                      isCurrentUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none"
                    )}
                  >
                    <p>{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1 text-right",
                      isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {format(new Date(message.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
