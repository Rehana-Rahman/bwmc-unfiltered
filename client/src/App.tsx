import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Trending from "@/pages/Trending";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Games from "@/pages/Games";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { useAuth } from "./hooks/useAuth";
import { Skeleton } from "./components/ui/skeleton";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/trending" component={Trending} />
      <Route path="/profile/:id">
        {params => <Profile userId={params.id} />}
      </Route>
      <Route path="/messages">
        {() => isAuthenticated ? <Messages /> : <Home redirectToLogin />}
      </Route>
      <Route path="/messages/:id">
        {params => isAuthenticated ? <Messages userId={params.id} /> : <Home redirectToLogin />}
      </Route>
      <Route path="/games" component={Games} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <div className="flex-1">
          <Router />
        </div>
        <MobileNavigation />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
