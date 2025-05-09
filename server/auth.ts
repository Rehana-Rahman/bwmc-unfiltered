import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { loginUserSchema, registerUserSchema } from "@shared/schema";
import { z } from "zod";

// Password hashing functions
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Traditional authentication routes
export function setupTraditionalAuth(app: any) {
  // Register route
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request data
      const userData = registerUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        id: `local_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      });
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = newUser;
      
      // Set user in session
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error signing in" });
        }
        
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Validate request data
      const loginData = loginUserSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password
      const passwordValid = await comparePasswords(loginData.password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set user in session
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error signing in" });
        }
        
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid login data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Check if user is authenticated
  app.get("/api/auth/status", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}