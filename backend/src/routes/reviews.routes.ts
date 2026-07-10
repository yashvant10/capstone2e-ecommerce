import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { requireAuth } from "../middlewares/auth";
import { ApiError } from "../middlewares/errorHandler";

const router = express.Router();

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

// GET /api/v1/reviews/product/:productId
router.get("/product/:productId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: String(req.params.productId) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: reviews });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/reviews
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid input");
    }

    const { productId, rating, comment } = parsed.data;

    // Check if user already reviewed
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.user!.id, productId } }
    });

    if (existing) {
      throw new ApiError(400, "You have already reviewed this product");
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        productId,
        rating,
        comment
      },
      include: { user: { select: { name: true } } }
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/reviews/:id
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: String(req.params.id) } });
    if (!review) throw new ApiError(404, "Review not found");
    
    if (review.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw new ApiError(403, "Not authorized");
    }

    await prisma.review.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
