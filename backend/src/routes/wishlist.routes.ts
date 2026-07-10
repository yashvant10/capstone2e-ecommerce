import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { requireAuth } from "../middlewares/auth";
import { ApiError } from "../middlewares/errorHandler";

const router = express.Router();
router.use(requireAuth);

// GET /api/v1/wishlist
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user!.id },
        include: { items: { include: { product: true } } }
      });
    }

    res.json(wishlist);
  } catch (error) {
    next(error);
  }
});

const wishlistSchema = z.object({
  productId: z.string()
});

// POST /api/v1/wishlist/items
router.post("/items", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = wishlistSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid input");
    }

    const { productId } = parsed.data;

    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: req.user!.id } });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } }
    });

    if (existing) {
      res.json(existing);
      return;
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId
      }
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/wishlist/items/:productId
router.delete("/items/:productId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (!wishlist) throw new ApiError(404, "Wishlist not found");

    await prisma.wishlistItem.delete({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId: String(req.params.productId) } }
    }).catch(() => null); // ignore if not found

    res.json({ message: "Item removed from wishlist" });
  } catch (error) {
    next(error);
  }
});

export default router;
