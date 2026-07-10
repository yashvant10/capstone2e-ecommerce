import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../utils/prisma";
import { ApiError } from "../middlewares/errorHandler";
import { supabase } from "../lib/supabase";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_for_dev_only";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "super_refresh_secret";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signAccessToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function signRefreshToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/v1/auth/register
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      throw new ApiError(400, "An account with this email already exists");
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash: hashed,
        role: "CUSTOMER",
        cart: { create: {} },
        wishlist: { create: {} },
      }
    });

    const accessToken = signAccessToken(newUser);
    const refreshToken = signRefreshToken(newUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      accessToken,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid email or password");
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new ApiError(401, "Invalid email or password");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new ApiError(401, "Invalid email or password");

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/refresh
router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1];
    
    if (!token) throw new ApiError(401, "No refresh token provided");

    const payload = jwt.verify(token, REFRESH_SECRET) as any;
    
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new ApiError(401, "User not found");

    const accessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (err) {
    next(new ApiError(401, "Invalid or expired refresh token"));
  }
});

// POST /api/v1/auth/supabase-login
router.post("/supabase-login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, name } = req.body;
    if (!accessToken) throw new ApiError(400, "Missing Supabase access token");

    // Verify token with Supabase Auth
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !supabaseUser || !supabaseUser.email) {
      throw new ApiError(401, "Invalid Supabase authentication token");
    }

    const email = supabaseUser.email;

    // Check if user exists in our DB
    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    if (!user) {
      // Create user if not exists
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashed = await bcrypt.hash(randomPassword, 10);
      
      const displayName = name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || email.split("@")[0];

      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: displayName,
          passwordHash: hashed,
          role: "CUSTOMER",
          cart: { create: {} },
          wishlist: { create: {} },
        }
      });
    }

    const newAccessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken: newAccessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error("Supabase Login Error:", err);
    next(new ApiError(401, "Invalid Supabase authentication"));
  }
});

// POST /api/v1/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

export default router;
