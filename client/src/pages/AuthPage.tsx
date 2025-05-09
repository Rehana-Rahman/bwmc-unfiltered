import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, LoginCredentials, RegisterCredentials } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export default function AuthPage() {
  const { user, isLoading, login, register, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLoginSubmit = (data: LoginCredentials) => {
    login(data);
  };

  const onRegisterSubmit = (data: RegisterCredentials) => {
    register(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex min-h-screen">
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto items-center">
        {/* Left Column: Auth Forms */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2">BWMC Unfiltered</h1>
          <p className="text-muted-foreground mb-8">
            Connect with your college community, share thoughts, and make friends.
          </p>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-muted-foreground text-center">
                    Or continue with
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Login with Replit
                  </Button>
                  <div className="text-sm text-center">
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setActiveTab("register")} 
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Enter your information to create a new account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Must be at least 8 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-muted-foreground text-center">
                    Or continue with
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Sign up with Replit
                  </Button>
                  <div className="text-sm text-center">
                    Already have an account?{" "}
                    <button 
                      onClick={() => setActiveTab("login")} 
                      className="text-primary hover:underline"
                    >
                      Log in
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Hero Image/Info */}
        <div className="hidden md:flex flex-col p-8 bg-muted rounded-lg">
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Join the Campus Conversation</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1">1</div>
                <div>
                  <h3 className="font-medium">Connect with your peers</h3>
                  <p className="text-muted-foreground">Find and follow classmates, friends, and interesting people on campus.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1">2</div>
                <div>
                  <h3 className="font-medium">Share your thoughts</h3>
                  <p className="text-muted-foreground">Post updates, photos, and ideas to your profile or the community feed.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1">3</div>
                <div>
                  <h3 className="font-medium">Stay in the loop</h3>
                  <p className="text-muted-foreground">Get updates on campus events, trending topics, and community discussions.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1">4</div>
                <div>
                  <h3 className="font-medium">Message friends</h3>
                  <p className="text-muted-foreground">Send direct messages to connect with friends and make plans.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}