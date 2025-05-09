import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TrendingTopics from "@/components/TrendingTopics";
import WhoToFollow from "@/components/WhoToFollow";
import MiniGame from "@/components/MiniGame";
import { Topic, User, Game } from "@shared/schema";

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  // Fetch trending topics
  const { data: trendingTopics, isLoading: isLoadingTopics } = useQuery<Topic[]>({
    queryKey: ["/api/topics/trending"],
  });

  // Fetch suggested users to follow
  const { data: suggestedUsers, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users/suggestions"],
  });

  // Fetch a mini game
  const { data: games, isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    select: (data) => data.slice(0, 1),
  });

  return (
    <div className="md:w-80 md:ml-6 order-1 md:order-2 mb-6 md:mb-0">
      <div className="sidebar-container space-y-6">
        {/* Community highlights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Community Highlights</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-4">
            <div className="flex space-x-3 items-center">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
                alt="Campus event"
                className="w-12 h-12 rounded-md object-cover"
              />
              <div>
                <p className="font-medium text-sm">BWMC Spring Festival</p>
                <p className="text-xs text-muted-foreground">This Saturday @ 2PM</p>
              </div>
            </div>

            <div className="flex space-x-3 items-center">
              <img
                src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
                alt="Study group"
                className="w-12 h-12 rounded-md object-cover"
              />
              <div>
                <p className="font-medium text-sm">Exam Prep Study Groups</p>
                <p className="text-xs text-muted-foreground">Join now - 128 students</p>
              </div>
            </div>

            <div className="flex space-x-3 items-center">
              <img
                src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
                alt="Gaming club"
                className="w-12 h-12 rounded-md object-cover"
              />
              <div>
                <p className="font-medium text-sm">E-Sports Championship</p>
                <p className="text-xs text-muted-foreground">Signups open - $500 prize</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trending topics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Trending Topics</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoadingTopics ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <TrendingTopics topics={trendingTopics || []} compact />
            )}
          </CardContent>
        </Card>

        {/* Mini-game section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Game Break</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-3">
              Take a break from studying with our daily game challenge!
            </p>
            {isLoadingGames ? (
              <div className="space-y-3">
                <Skeleton className="h-36 w-full rounded-md" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : games && games.length > 0 ? (
              <>
                <div className="h-36 overflow-hidden rounded-md mb-3 bg-muted relative">
                  {games[0].imageUrl ? (
                    <img
                      src={games[0].imageUrl}
                      alt={games[0].name}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <MiniGame game={games[0]} preview />
                  )}
                </div>
                <Button
                  className="w-full bg-accent hover:bg-accent/90"
                  onClick={() => setLocation("/games")}
                >
                  Play Now
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Games loading...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Who to follow */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Who to Follow</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoadingUsers ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex space-x-3 items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <WhoToFollow users={suggestedUsers || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
