import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ConversationBoxProps {
  conversation: {
    user: User;
    lastMessage: Message;
    unreadCount: number;
  };
  isSelected: boolean;
  onClick: () => void;
}

export default function ConversationBox({ conversation, isSelected, onClick }: ConversationBoxProps) {
  const { user, lastMessage, unreadCount } = conversation;
  
  return (
    <div
      className={cn(
        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer",
        isSelected
          ? "bg-primary/10 dark:bg-primary/20"
          : "hover:bg-muted"
      )}
      onClick={onClick}
    >
      <Avatar>
        <AvatarImage src={user.profileImageUrl || ""} alt={user.username || "User"} />
        <AvatarFallback>
          {user.firstName?.[0]}{user.lastName?.[0] || user.username?.[0] || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {user.firstName} {user.lastName || ""}
          {!user.firstName && !user.lastName && user.username}
        </p>
        <p className={cn(
          "text-sm truncate",
          unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
        )}>
          {lastMessage.content}
        </p>
      </div>
      
      <div className="flex flex-col items-end">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })}
        </span>
        
        {unreadCount > 0 && (
          <Badge 
            variant="default"
            className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center mt-1 p-0"
          >
            {unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
}
