import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { User, Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/PostCard";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { MessageSquare, UserPlus, UserMinus } from "lucide-react";

interface ProfileProps {
  userId: string;
}

export default function Profile({ userId }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const isOwnProfile = currentUser?.id === userId;

  // Fetch profile user
  const { data: profileUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  // Fetch profile posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: activeTab === "posts",
  });

  // Fetch follow status
  const { data: isFollowing, isLoading: isLoadingFollowStatus } = useQuery<boolean>({
    queryKey: [`/api/follows/status`, userId],
    enabled: !!currentUser && !isOwnProfile,
  });

  // Follow/unfollow mutations
  const followMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/follows", {
        followerId: currentUser?.id,
        followingId: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/follows/status`, userId] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/follows/${currentUser?.id}/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/follows/status`, userId] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    },
  });

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleMessageUser = () => {
    setLocation(`/messages/${userId}`);
  };

  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="mb-4 text-muted-foreground">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileUser.profileImageUrl || ""} alt={profileUser.username || "User"} />
              <AvatarFallback>
                {profileUser.firstName?.[0]}{profileUser.lastName?.[0] || profileUser.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">
                {profileUser.firstName} {profileUser.lastName}
                {profileUser.username && <span className="text-muted-foreground ml-2 text-lg">@{profileUser.username}</span>}
              </h1>
              
              {profileUser.major && (
                <p className="text-muted-foreground mb-2">{profileUser.major}</p>
              )}
              
              {profileUser.bio && (
                <p className="mb-4">{profileUser.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                {!isOwnProfile && currentUser && (
                  <>
                    <Button 
                      onClick={handleFollowToggle} 
                      variant={isFollowing ? "outline" : "default"}
                      disabled={isLoadingFollowStatus || followMutation.isPending || unfollowMutation.isPending}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                    
                    <Button onClick={handleMessageUser} variant="secondary">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </>
                )}
                
                {isOwnProfile && (
                  <Button variant="outline" onClick={() => setLocation("/edit-profile")}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-6">
          {isLoadingPosts ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-secondary rounded-lg shadow p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-24 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary rounded-lg shadow p-6 text-center">
              <p className="text-muted-foreground">No posts found.</p>
              {isOwnProfile && (
                <Button onClick={() => setLocation("/")} className="mt-4">
                  Create Your First Post
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="following" className="space-y-6">
          {/* This would be populated with users that this profile is following */}
          <div className="bg-white dark:bg-secondary rounded-lg shadow p-6 text-center">
            <p className="text-muted-foreground">Coming soon!</p>
          </div>
        </TabsContent>
        
        <TabsContent value="followers" className="space-y-6">
          {/* This would be populated with users that follow this profile */}
          <div className="bg-white dark:bg-secondary rounded-lg shadow p-6 text-center">
            <p className="text-muted-foreground">Coming soon!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
