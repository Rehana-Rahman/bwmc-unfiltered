import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import TrendingTopics from "@/components/TrendingTopics";
import { Skeleton } from "@/components/ui/skeleton";
import { Post, Topic } from "@shared/schema";

export default function Trending() {
  // Fetch trending posts
  const { data: trendingPosts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/trending"],
  });

  // Fetch trending topics
  const { data: trendingTopics, isLoading: isLoadingTopics } = useQuery<Topic[]>({
    queryKey: ["/api/topics/trending"],
  });

  return (
    <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row">
      <div className="flex-1 order-2 md:order-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Trending Now</h1>
          
          {/* Trending topics horizontal scrollable list */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Hot Topics</h2>
            {isLoadingTopics ? (
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-40 flex-shrink-0 rounded-lg" />
                ))}
              </div>
            ) : (
              <TrendingTopics topics={trendingTopics || []} />
            )}
          </div>
          
          <h2 className="text-lg font-semibold mb-3">Popular Posts</h2>
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
          ) : trendingPosts && trendingPosts.length > 0 ? (
            <div className="space-y-6">
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary rounded-lg shadow p-6 text-center">
              <p className="text-muted-foreground">No trending posts found.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar */}
      <Sidebar />
    </main>
  );
}
