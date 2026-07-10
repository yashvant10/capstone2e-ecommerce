import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { requireAuth } from "../middlewares/auth";
import { ApiError } from "../middlewares/errorHandler";
import logger from "../utils/logger";

const router = express.Router();
router.use(requireAuth);

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  deliveryAddress: z.string().min(5),
  couponCode: z.string().optional()
});

// POST /api/v1/orders
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }

    const { items, deliveryAddress, couponCode } = parsed.data;

    let total = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new ApiError(400, `Product not found: ${item.productId}`);
      if (product.stock < item.quantity) throw new ApiError(400, `Insufficient stock for ${product.name}`);
      
      total += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon) throw new ApiError(400, "Invalid coupon code");
      if (!coupon.isActive || coupon.expiryDate < new Date()) throw new ApiError(400, "Coupon is expired or inactive");
      if (coupon.minOrderValue > total) throw new ApiError(400, `Minimum order value for this coupon is $${coupon.minOrderValue}`);
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new ApiError(400, "Coupon limit reached");
      
      const hasUsed = await prisma.couponUsage.findFirst({
        where: { couponId: coupon.id, userId: req.user!.id }
      });
      if (hasUsed) throw new ApiError(400, "You have already used this coupon");

      if (coupon.discountType === "PERCENTAGE") {
        discount = total * (coupon.discountValue / 100);
      } else {
        discount = coupon.discountValue;
      }
      appliedCoupon = coupon;
    }

    const finalTotal = Math.max(0, total - discount);

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: req.user!.id,
          total: finalTotal,
          discount,
          deliveryAddress,
          status: "PENDING",
          paymentStatus: "PENDING",
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      if (appliedCoupon) {
        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            userId: req.user!.id,
            orderId: order.id
          }
        });
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      // We do not clear the cart yet! We clear it after payment verification!

      return order;
    });

    res.status(201).json(newOrder);
  } catch (err) {
    logger.error("Order Creation Error:", err);
    next(err);
  }
});

// GET /api/v1/orders
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: { items: { include: { product: true } } }
    });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw new ApiError(403, "Not authorized to view this order");
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
