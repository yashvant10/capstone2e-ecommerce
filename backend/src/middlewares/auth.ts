import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "./errorHandler";
import prisma from "../utils/prisma";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid authorization header"));
  }
  
  const token = header.split(" ")[1];
  
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_for_dev_only"
    ) as JwtPayload;
    
    // Explicitly check if user still exists in DB (fixes missing FK errors after DB reset)
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return next(new ApiError(401, "User no longer exists in database"));
    }

    req.user = payload;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  
  if (req.user.role !== "ADMIN") {
    return next(new ApiError(403, "Admin access required"));
  }
  
  next();
}
