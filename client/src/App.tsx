import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Trending from "@/pages/Trending";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Games from "@/pages/Games";
import AuthPage from "@/pages/AuthPage";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { useAuth } from "./hooks/useAuth";
import { Skeleton } from "./components/ui/skeleton";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Router() {
  const { isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading state for all pages during auth check
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

  // Don't show header and mobile navigation on auth page
  const showLayout = !location.startsWith("/auth");

  return (
    <>
      {showLayout && <Header />}
      <div className={`flex-1 ${!showLayout ? 'pt-0' : ''}`}>
        <Switch>
          <Route path="/">
            {() => <Home />}
          </Route>
          <Route path="/trending">
            {() => <Trending />}
          </Route>
          <Route path="/auth">
            {() => <AuthPage />}
          </Route>
          <Route path="/profile/:id">
            {params => <Profile userId={params.id} />}
          </Route>
          <ProtectedRoute path="/messages">
            <Messages />
          </ProtectedRoute>
          <ProtectedRoute path="/messages/:id">
            {({ params }) => <Messages userId={params.id} />}
          </ProtectedRoute>
          <Route path="/games">
            {() => <Games />}
          </Route>
          <Route>
            {() => <NotFound />}
          </Route>
        </Switch>
      </div>
      {showLayout && <MobileNavigation />}
    </>
  );
}

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Router />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
