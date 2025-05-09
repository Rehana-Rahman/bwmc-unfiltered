import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import MiniGame from "@/components/MiniGame";
import Sidebar from "@/components/Sidebar";
import { Game } from "@shared/schema";

export default function Games() {
  const [activeTab, setActiveTab] = useState("popular");
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  
  // Fetch active games
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });
  
  const handleStartGame = (game: Game) => {
    setActiveGame(game);
  };
  
  const handleExitGame = () => {
    setActiveGame(null);
  };
  
  return (
    <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row">
      <div className="flex-1 order-2 md:order-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Games Lounge</h1>
          <p className="text-muted-foreground mb-6">
            Take a break from studying and connect with your campus community through interactive games!
          </p>
          
          {activeGame ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{activeGame.name}</h2>
                <Button variant="outline" onClick={handleExitGame}>
                  Exit Game
                </Button>
              </div>
              <Card className="mb-6">
                <CardContent className="p-0">
                  <MiniGame game={activeGame} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="popular" className="space-y-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-40 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-40 w-full rounded-md" />
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-10 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : games && games.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {games.map((game) => (
                      <Card key={game.id} className="overflow-hidden">
                        <CardHeader>
                          <CardTitle>{game.name}</CardTitle>
                          <CardDescription>{game.description}</CardDescription>
                        </CardHeader>
                        {game.imageUrl && (
                          <CardContent className="p-0">
                            <img 
                              src={game.imageUrl} 
                              alt={game.name} 
                              className="w-full h-48 object-cover"
                            />
                          </CardContent>
                        )}
                        <CardFooter className="pt-6">
                          <Button 
                            onClick={() => handleStartGame(game)} 
                            className="w-full bg-accent hover:bg-accent/90"
                          >
                            Play Now
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No games available at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="new" className="space-y-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">New games coming soon!</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tournaments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campus Gaming Tournament</CardTitle>
                    <CardDescription>
                      Join the mega gaming tournament this weekend! Meeting at the Student Union Building, 6PM.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><span className="font-semibold">Games:</span> League of Legends, Valorant, Smash Bros</p>
                      <p><span className="font-semibold">When:</span> This Friday, 6:00 PM</p>
                      <p><span className="font-semibold">Where:</span> Student Union Building</p>
                      <p><span className="font-semibold">Prize Pool:</span> $500</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Sign Up</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      
      {/* Sidebar */}
      <Sidebar />
    </main>
  );
}
