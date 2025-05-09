import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Bell, MessageSquare, Home, TrendingUp, Gamepad2, Menu, User } from "lucide-react";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-secondary border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="flex items-center space-x-2 cursor-pointer">
                <span className="text-3xl">🎓</span>
                <h1 className="font-bold text-xl md:text-2xl text-primary dark:text-white hidden sm:block">
                  BWMC Unfiltered
                </h1>
              </a>
            </Link>
          </div>

          {/* Search (desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search BWMC Unfiltered"
                className="w-full pl-10 pr-4 rounded-full"
              />
            </div>
          </div>

          {/* Navigation for desktop */}
          <nav className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/notifications">
                    <a className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                    </a>
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" asChild>
                  <Link href="/messages">
                    <a>
                      <MessageSquare className="h-5 w-5" />
                    </a>
                  </Link>
                </Button>

                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ""} alt={user?.username || "User avatar"} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0] || user?.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user?.id}`}>
                        <a className="flex cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <a className="flex cursor-pointer">
                          <span>Settings</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to log out?')) {
                            const isReplit = !!document.querySelector('meta[name="replit-auth"]');
                            window.location.href = isReplit ? "/api/logout" : "/api/auth/logout";
                          }
                        }} 
                        className="cursor-pointer"
                      >
                        Log out
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => setLocation("/auth")} className="bg-primary">
                Log In
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            {isSearchOpen ? (
              <div className="absolute inset-0 bg-background z-50 px-4 flex items-center h-16">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 rounded-full"
                    autoFocus
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>

                <ThemeToggle />

                {isAuthenticated ? (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <div className="flex flex-col h-full py-6">
                        <div className="flex items-center mb-6">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={user?.profileImageUrl || ""} />
                            <AvatarFallback>
                              {user?.firstName?.[0]}{user?.lastName?.[0] || user?.username?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {user?.firstName} {user?.lastName}
                            </h3>
                            {user?.username && (
                              <p className="text-sm text-muted-foreground">
                                @{user.username}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 flex-1">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link href="/">
                              <a className="flex items-center">
                                <Home className="mr-3 h-5 w-5" />
                                Home
                              </a>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link href="/trending">
                              <a className="flex items-center">
                                <TrendingUp className="mr-3 h-5 w-5" />
                                Trending
                              </a>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link href={`/profile/${user?.id}`}>
                              <a className="flex items-center">
                                <User className="mr-3 h-5 w-5" />
                                Profile
                              </a>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link href="/messages">
                              <a className="flex items-center">
                                <MessageSquare className="mr-3 h-5 w-5" />
                                Messages
                              </a>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link href="/games">
                              <a className="flex items-center">
                                <Gamepad2 className="mr-3 h-5 w-5" />
                                Games
                              </a>
                            </Link>
                          </Button>
                        </div>

                        <div className="pt-6 border-t border-border">
                          <Button
                            variant="outline"
                            className="w-full"
                            asChild
                          >
                            <a 
                              onClick={() => {
                                if (window.confirm('Are you sure you want to log out?')) {
                                  const isReplit = !!document.querySelector('meta[name="replit-auth"]');
                                  window.location.href = isReplit ? "/api/logout" : "/api/auth/logout";
                                }
                              }} 
                              className="cursor-pointer"
                            >
                              Log out
                            </a>
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Button
                    onClick={() => setLocation("/auth")}
                    size="sm"
                    className="bg-primary"
                  >
                    Log In
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
