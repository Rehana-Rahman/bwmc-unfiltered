import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Post, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, ArrowUp, Share2, Bookmark } from "lucide-react";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);

  // Fetch post author
  const { data: author } = useQuery<User>({
    queryKey: [`/api/users/${post.userId}`],
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/posts/${post.id}/upvote`, {});
    },
    onSuccess: () => {
      setLiked(true);
      queryClient.invalidateQueries({ queryKey: [`/api/posts`] });
      toast({
        title: "Post upvoted",
        description: "Your vote has been recorded",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upvote the post",
        variant: "destructive",
      });
    },
  });

  const handleUpvote = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upvote posts",
        variant: "destructive",
      });
      return;
    }
    upvoteMutation.mutate();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    });
  };

  const navigateToProfile = () => {
    if (author) {
      setLocation(`/profile/${author.id}`);
    }
  };

  return (
    <Card className="post-card">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="cursor-pointer" onClick={navigateToProfile}>
            <AvatarImage src={author?.profileImageUrl || ""} alt={author?.username || "User"} />
            <AvatarFallback>
              {author?.firstName?.[0]}{author?.lastName?.[0] || author?.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm cursor-pointer hover:underline" onClick={navigateToProfile}>
              {author?.username || "Unknown User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {post.createdAt
                ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                : "Recently"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-foreground mb-4">{post.content}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post attachment"
            className="w-full h-auto rounded-lg mb-4 object-cover"
          />
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full text-muted-foreground text-sm">
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 hover:text-accent ${liked ? "text-accent" : ""}`}
              onClick={handleUpvote}
            >
              <ArrowUp className={`h-4 w-4 ${liked ? "animate-heart" : ""}`} />
              <span>{post.upvotes || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 hover:text-accent"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments || 0}</span>
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="hover:text-accent" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-accent">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
