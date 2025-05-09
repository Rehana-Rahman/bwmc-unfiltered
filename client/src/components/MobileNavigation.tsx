import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Home, Search, Bell, MessageSquare, User, TrendingUp, Gamepad2 } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-background border-t border-border z-40 mobile-nav">
      <div className="grid grid-cols-5">
        <Link href="/">
          <a
            className={`flex flex-col items-center py-2 px-1 ${
              location === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>

        <Link href="/trending">
          <a
            className={`flex flex-col items-center py-2 px-1 ${
              location === "/trending" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs mt-1">Trending</span>
          </a>
        </Link>

        <Link href="/games">
          <a
            className={`flex flex-col items-center py-2 px-1 ${
              location === "/games" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Gamepad2 className="h-5 w-5" />
            <span className="text-xs mt-1">Games</span>
          </a>
        </Link>

        <Link href="/messages">
          <a
            className={`flex flex-col items-center py-2 px-1 ${
              location.startsWith("/messages") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
          </a>
        </Link>

        {user ? (
          <Link href={`/profile/${user.id}`}>
            <a
              className={`flex flex-col items-center py-2 px-1 ${
                location.startsWith("/profile") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </a>
          </Link>
        ) : (
          <a
            href="/api/login"
            className="flex flex-col items-center py-2 px-1 text-muted-foreground"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Login</span>
          </a>
        )}
      </div>
    </nav>
  );
}
