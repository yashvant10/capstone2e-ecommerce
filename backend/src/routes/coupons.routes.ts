import express, { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { ApiError } from "../middlewares/errorHandler";

const router = express.Router();

// GET /api/v1/coupons/validate/:code
router.get("/validate/:code", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: String(req.params.code) } });
    if (!coupon) throw new ApiError(404, "Coupon not found");
    
    if (!coupon.isActive || coupon.expiryDate < new Date()) {
      throw new ApiError(400, "Coupon is expired or inactive");
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new ApiError(400, "Coupon usage limit reached");
    }

    res.json(coupon);
  } catch (error) {
    next(error);
  }
});

// Admin Routes
router.use(requireAuth, requireAdmin);

// GET /api/v1/coupons
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ data: coupons });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/coupons
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/coupons/:id
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await prisma.coupon.update({
      where: { id: String(req.params.id) },
      data: req.body
    });
    res.json(coupon);
  } catch (error) {
    next(error);
  }
});

export default router;
