import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupWebSocket } from "./websocket";
import { insertPostSchema, insertFollowSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSockets
  setupWebSocket(httpServer);
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/suggestions", (req, res) => {
    return res.json([]);
  });

  app.patch("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Users can only update their own profile
      if (userId !== req.params.id) {
        return res.status(403).json({ message: "Unauthorized to update this user" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Post routes
  app.post("/api/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate post data
      const postData = insertPostSchema.parse({
        ...req.body,
        userId
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(Number(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.get("/api/posts/feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getFeedPosts(userId, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  app.get("/api/posts/hot", (req, res) => {
    return res.json([]);
  });

  app.get("/api/posts/trending", async (req, res) => {
    try {
      const posts = await storage.getTrendingPosts();
      res.json(posts || []);
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      res.status(500).json({ message: "Failed to fetch trending posts" });
    }
  });

  app.get("/api/users/:id/posts", async (req, res) => {
    try {
      const posts = await storage.getUserPosts(req.params.id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.post("/api/posts/:id/upvote", isAuthenticated, async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const post = await storage.upvotePost(postId);
      res.json(post);
    } catch (error) {
      console.error("Error upvoting post:", error);
      res.status(500).json({ message: "Failed to upvote post" });
    }
  });

  // Follow routes
  app.post("/api/follows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Users can only create follows for themselves
      if (userId !== req.body.followerId) {
        return res.status(403).json({ message: "Unauthorized to follow as another user" });
      }
      
      // Validate follow data
      const followData = insertFollowSchema.parse(req.body);
      
      const follow = await storage.followUser(followData);
      res.status(201).json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid follow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/follows/:followerId/:followingId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Users can only delete their own follows
      if (userId !== req.params.followerId) {
        return res.status(403).json({ message: "Unauthorized to unfollow as another user" });
      }
      
      await storage.unfollowUser(req.params.followerId, req.params.followingId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/follows/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const followingId = req.query.followingId;
      
      if (!followingId) {
        return res.status(400).json({ message: "Missing followingId parameter" });
      }
      
      const isFollowing = await storage.isFollowing(userId, followingId);
      res.json(isFollowing);
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const followers = await storage.getFollowers(req.params.id);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const following = await storage.getFollowing(req.params.id);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  // Message routes
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Users can only send messages as themselves
      if (userId !== req.body.senderId) {
        return res.status(403).json({ message: "Unauthorized to send message as another user" });
      }
      
      // Validate message data
      const messageData = insertMessageSchema.parse(req.body);
      
      const message = await storage.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      
      const messages = await storage.getMessages(currentUserId, otherUserId);
      res.json(messages);
      
      // Mark messages as read
      await storage.markMessagesAsRead(currentUserId, otherUserId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Topic routes
  app.get("/api/topics/trending", async (req, res) => {
    try {
      const topics = await storage.getTrendingTopics();
      res.json(topics || []);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Game routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getActiveGames();
      res.json(games || []);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Add a catch-all route for API endpoints that aren't found
  app.use('/api/*', (req, res) => {
    // For GET requests, return empty arrays or objects
    if (req.method === 'GET') {
      if (req.path.includes('users') || 
          req.path.includes('posts') || 
          req.path.includes('topics') ||
          req.path.includes('games')) {
        return res.json([]);
      }
      return res.json({});
    }
    // For other methods, return appropriate error
    res.status(404).json({ message: "Endpoint not found" });
  });

  return httpServer;
}
