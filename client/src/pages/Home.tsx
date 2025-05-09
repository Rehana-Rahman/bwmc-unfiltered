import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import CreatePost from "@/components/CreatePost";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@shared/schema";

interface HomeProps {
  redirectToLogin?: boolean;
}

export default function Home({ redirectToLogin = false }: HomeProps) {
  const [activeTab, setActiveTab] = useState("hot");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to login if specified
  useEffect(() => {
    if (redirectToLogin && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this feature",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [redirectToLogin, isAuthenticated, setLocation, toast]);

  // Fetch posts based on active tab
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: [
      isAuthenticated 
        ? `/api/posts/feed` 
        : (activeTab === 'hot' || activeTab === 'trending' 
            ? `/api/posts/${activeTab}` 
            : `/api/posts/hot`),
      activeTab
    ],
    enabled: !redirectToLogin,
  });

  // Handle user navigating to tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row">
      <div className="flex-1 order-2 md:order-1">
        {/* Tabs for filtering posts */}
        <Tabs defaultValue="hot" value={activeTab} onValueChange={handleTabChange} className="mb-4">
          <TabsList className="overflow-x-auto w-full justify-start pb-2">
            <TabsTrigger value="hot">Hot</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="top">Top</TabsTrigger>
            <TabsTrigger value="campus">Campus Events</TabsTrigger>
            <TabsTrigger value="gaming">Gaming</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hot" className="space-y-6">
            {isAuthenticated ? (
              <CreatePost />
            ) : (
              <div className="bg-white dark:bg-secondary rounded-lg shadow p-6 text-center space-y-4 mb-6">
                <h3 className="text-xl font-semibold">Join BWMC Unfiltered</h3>
                <p className="text-muted-foreground">
                  Connect with your campus community. Share posts, follow friends, and join discussions.
                </p>
                <Button onClick={() => setLocation("/auth")} className="bg-primary hover:bg-primary/90">
                  Log In / Sign Up
                </Button>
              </div>
            )}
            
            {isLoading ? (
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
                <p className="text-muted-foreground">No posts found. Be the first to post something!</p>
              </div>
            )}
          </TabsContent>
          
          {/* Other tab contents would be similar with different query parameters */}
          <TabsContent value="new" className="space-y-6">
            {/* Similar structure to "hot" tab */}
            <p className="text-center text-muted-foreground">Loading newest posts...</p>
          </TabsContent>
          
          <TabsContent value="top" className="space-y-6">
            <p className="text-center text-muted-foreground">Loading top posts...</p>
          </TabsContent>
          
          <TabsContent value="campus" className="space-y-6">
            <p className="text-center text-muted-foreground">Loading campus events...</p>
          </TabsContent>
          
          <TabsContent value="gaming" className="space-y-6">
            <p className="text-center text-muted-foreground">Loading gaming posts...</p>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Sidebar */}
      <Sidebar />
    </main>
  );
}
