import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WhoToFollowProps {
  users: User[];
}

export default function WhoToFollow({ users }: WhoToFollowProps) {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUser) throw new Error("Not authenticated");
      return apiRequest("/api/follows", "POST", {
        followerId: currentUser.id,
        followingId: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/suggestions"] });
      toast({
        title: "User followed",
        description: "You are now following this user",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFollow = (userId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      setLocation("/api/login");
      return;
    }
    followMutation.mutate(userId);
  };

  const navigateToProfile = (userId: string) => {
    setLocation(`/profile/${userId}`);
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-muted-foreground text-sm">No suggestions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex justify-between items-center">
          <div 
            className="flex space-x-3 items-center cursor-pointer"
            onClick={() => navigateToProfile(user.id)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImageUrl || ""} alt={user.username || "User"} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0] || user.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm hover:underline">
                {user.firstName} {user.lastName}
                {!user.firstName && !user.lastName && user.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.major || "Student"}
              </p>
            </div>
          </div>
          <Button 
            size="sm"
            variant="default"
            className="px-3 py-1 h-8 bg-accent hover:bg-accent/90 text-xs rounded-full"
            onClick={() => handleFollow(user.id)}
            disabled={followMutation.isPending}
          >
            Follow
          </Button>
        </div>
      ))}
      
      <Button 
        variant="link" 
        className="w-full text-accent text-sm font-medium mt-4 hover:underline"
        onClick={() => setLocation("/trending")}
      >
        See More
      </Button>
    </div>
  );
}
