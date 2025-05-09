import {
  users,
  posts,
  follows,
  messages,
  topics,
  games,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Follow,
  type InsertFollow,
  type Message,
  type InsertMessage,
  type Topic,
  type Game,
} from "@shared/schema";
import { db } from "./db";
import { eq, ne, and, desc, or, like, sql, isNull, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  searchUsers(query: string, limit?: number): Promise<User[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getUserPosts(userId: string): Promise<Post[]>;
  getFeedPosts(userId: string, limit?: number): Promise<Post[]>;
  getTrendingPosts(limit?: number): Promise<Post[]>;
  upvotePost(id: number): Promise<Post>;
  
  // Follow operations
  followUser(data: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getSuggestedUsers(userId: string, limit?: number): Promise<User[]>;
  
  // Message operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversations(userId: string): Promise<{ user: User, lastMessage: Message, unreadCount: number }[]>;
  getMessages(userId: string, otherUserId: string): Promise<Message[]>;
  markMessagesAsRead(recipientId: string, senderId: string): Promise<void>;
  
  // Topic operations
  getTrendingTopics(limit?: number): Promise<Topic[]>;
  
  // Game operations
  getActiveGames(): Promise<Game[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          like(users.username, `%${query}%`),
          like(users.firstName, `%${query}%`),
          like(users.lastName, `%${query}%`)
        )
      )
      .limit(limit);
  }
  
  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    if (isNaN(id)) {
      return undefined;
    }
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));
    return post;
  }
  
  async getUserPosts(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }
  
  async getFeedPosts(userId: string, limit: number = 20): Promise<Post[]> {
    const userFollowing = await this.getFollowing(userId);
    const followingIds = userFollowing.map(user => user.id);
    
    // Include posts from users the current user follows and their own posts
    return await db
      .select()
      .from(posts)
      .where(
        or(
          eq(posts.userId, userId),
          followingIds.length > 0 ? sql`${posts.userId} IN (${followingIds.join(',')})` : sql`FALSE`
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }
  
  async getTrendingPosts(limit: number = 10): Promise<Post[]> {
    try {
      const result = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.upvotes), desc(posts.comments), desc(posts.createdAt))
        .limit(limit);
      return result || [];
    } catch (error) {
      console.error("Error in getTrendingPosts:", error);
      return [];
    }
  }
  
  async upvotePost(id: number): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set({
        upvotes: sql`${posts.upvotes} + 1`
      })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }
  
  // Follow operations
  async followUser(data: InsertFollow): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values(data)
      .returning();
    return follow;
  }
  
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }
  
  async getFollowers(userId: string): Promise<User[]> {
    const result = await db
      .select({
        user: users
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    
    return result.map(r => r.user);
  }
  
  async getFollowing(userId: string): Promise<User[]> {
    const result = await db
      .select({
        user: users
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    
    return result.map(r => r.user);
  }
  
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    return !!follow;
  }
  
  async getSuggestedUsers(userId: string, limit: number = 3): Promise<User[]> {
    try {
      // Simpler approach: just get a few random users who aren't the current user
      const result = await db
        .select()
        .from(users)
        .where(
          sql`${users.id} != ${userId}`
        )
        .limit(limit);
      return result || [];
    } catch (error) {
      console.error("Error in getSuggestedUsers:", error);
      return [];
    }
  }
  
  // Message operations
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }
  
  async getConversations(userId: string): Promise<{ user: User, lastMessage: Message, unreadCount: number }[]> {
    // Get the last message for each conversation
    const conversationsQuery = await db.query.messages.findMany({
      where: or(
        eq(messages.senderId, userId),
        eq(messages.recipientId, userId)
      ),
      orderBy: desc(messages.createdAt),
      with: {
        sender: true,
        recipient: true,
      }
    });
    
    // Create a map to store the latest message for each conversation
    const conversationMap = new Map<string, { user: User, lastMessage: Message, unreadCount: number }>();
    
    for (const message of conversationsQuery) {
      const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
      const otherUser = message.senderId === userId ? message.recipient : message.sender;
      
      if (!conversationMap.has(otherUserId)) {
        // Count unread messages
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(
            and(
              eq(messages.recipientId, userId),
              eq(messages.senderId, otherUserId),
              eq(messages.read, false)
            )
          )
          .then(result => result[0]?.count || 0);
        
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount
        });
      }
    }
    
    return Array.from(conversationMap.values())
      .sort((a, b) => {
        const dateA = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const dateB = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }
  
  async getMessages(userId: string, otherUserId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId),
            eq(messages.recipientId, otherUserId)
          ),
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.recipientId, userId)
          )
        )
      )
      .orderBy(asc(messages.createdAt));
  }
  
  async markMessagesAsRead(recipientId: string, senderId: string): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.recipientId, recipientId),
          eq(messages.senderId, senderId),
          eq(messages.read, false)
        )
      );
  }
  
  // Topic operations
  async getTrendingTopics(limit: number = 5): Promise<Topic[]> {
    try {
      const result = await db
        .select()
        .from(topics)
        .where(eq(topics.trending, true))
        .orderBy(desc(topics.postCount))
        .limit(limit);
      return result || [];
    } catch (error) {
      console.error("Error in getTrendingTopics:", error);
      return [];
    }
  }
  
  // Game operations
  async getActiveGames(): Promise<Game[]> {
    try {
      const result = await db
        .select()
        .from(games)
        .where(eq(games.active, true));
      return result || [];
    } catch (error) {
      console.error("Error in getActiveGames:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
