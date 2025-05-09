import { ReactNode } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

type ProtectedRouteProps = {
  path: string;
  children: ReactNode | (({ params }: { params: { [param: string]: string | undefined } }) => ReactNode);
};

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex h-full items-center justify-center p-8">
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
      </Route>
    );
  }

  return (
    <Route path={path}>
      {(params) => {
        if (!isAuthenticated) {
          // Redirect to auth page with return URL
          navigate(`/auth?returnTo=${encodeURIComponent(path)}`);
          return null;
        }

        // Pass params to children if it's a function
        if (typeof children === 'function') {
          return children({ params });
        }
        
        return children;
      }}
    </Route>
  );
}