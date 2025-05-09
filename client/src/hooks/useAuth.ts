import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const { toast } = useToast();
  
  const { 
    data: user, 
    isLoading,
    error,
    refetch 
  } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest("POST", "/api/auth/register", credentials);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Try Replit auth logout first
      try {
        await fetch("/api/logout");
      } catch (e) {
        console.error("Replit logout failed, trying traditional logout", e);
      }
      
      // Traditional auth logout
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries();
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    },
  });

  const login = (credentials: LoginCredentials) => loginMutation.mutate(credentials);
  const register = (credentials: RegisterCredentials) => registerMutation.mutate(credentials);
  const logout = () => logoutMutation.mutate();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
