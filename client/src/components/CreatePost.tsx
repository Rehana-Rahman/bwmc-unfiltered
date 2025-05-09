import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { insertPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { Image, Link, BarChart2 } from "lucide-react";

// Extend schema for form validation
const postFormSchema = insertPostSchema.extend({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }),
  content: z.string().min(1, {
    message: "Content cannot be empty.",
  }).max(2000, {
    message: "Content must not exceed 2000 characters."
  }),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      userId: user?.id || "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (values: PostFormValues) => {
      const data = {
        ...values,
        userId: user?.id || "", // Ensure user ID is set
      };
      return apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been published successfully!",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PostFormValues) => {
    createPostMutation.mutate(values);
  };

  if (!user) return null;

  return (
    <>
      <Card className="bg-white dark:bg-secondary shadow mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.profileImageUrl || ""} alt={user.username || "User"} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0] || user.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <Input
              placeholder="Share something with the BWMC community..."
              className="flex-1 rounded-full bg-muted"
              onClick={() => setIsDialogOpen(true)}
              readOnly
            />
          </div>
          <div className="flex justify-end mt-3 space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
              <Image className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
              <Link className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What's on your mind?" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <input
                type="hidden"
                {...form.register("userId")}
                value={user.id}
              />
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
