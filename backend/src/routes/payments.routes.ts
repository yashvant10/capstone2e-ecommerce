import express, { Request, Response, NextFunction } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../utils/prisma";
import { requireAuth } from "../middlewares/auth";
import { ApiError } from "../middlewares/errorHandler";
import logger from "../utils/logger";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

// POST /api/v1/payments/create-order
router.post("/create-order", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    
    if (!order || order.userId !== req.user!.id) {
      throw new ApiError(404, "Order not found");
    }

    if (order.paymentStatus === "PAID") {
      throw new ApiError(400, "Order is already paid");
    }

    const options = {
      amount: Math.round(order.total * 100), // amount in smallest currency unit (paise/cents)
      currency: "INR", // Changed to INR to prevent Razorpay international disabled error
      receipt: order.id,
      notes: {
        orderId: order.id,
        userId: req.user!.id
      }
    };

    const rzpOrder = await razorpay.orders.create(options);

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id }
    });

    res.json({
      id: rzpOrder.id,
      currency: rzpOrder.currency,
      amount: rzpOrder.amount
    });
  } catch (err) {
    logger.error("Razorpay Create Order Error:", err);
    next(new ApiError(500, "Failed to create payment order"));
  }
});

// POST /api/v1/payments/verify
router.post("/verify", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "secret_placeholder")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
            paymentMethod: "RAZORPAY",
            razorpayPaymentId: razorpay_payment_id
          },
          include: { items: true }
        });

        // Optional: clear user cart if not already cleared during order creation
        await tx.cartItem.deleteMany({
          where: { cart: { userId: order.userId } }
        });

        return order;
      });

      res.json({ success: true, message: "Payment verified successfully", order: updatedOrder });
    } else {
      throw new ApiError(400, "Invalid signature");
    }
  } catch (err) {
    logger.error("Razorpay Verify Error:", err);
    next(err);
  }
});

// POST /api/v1/payments/webhook
router.post("/webhook", async (req: any, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_placeholder";
  const signature = req.headers["x-razorpay-signature"] as string;

  try {
    // Requires raw body parsing which we set up in server.ts
    const isValid = Razorpay.validateWebhookSignature(req.rawBody.toString(), signature, secret);

    if (isValid) {
      const event = req.body.event;
      const payload = req.body.payload;

      if (event === "payment.captured" || event === "order.paid") {
        const rzpOrderId = payload.payment.entity.order_id;
        
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId: rzpOrderId }
        });

        if (order && order.paymentStatus !== "PAID") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: "PROCESSING",
              razorpayPaymentId: payload.payment.entity.id
            }
          });
          logger.info(`Order ${order.id} marked as PAID via webhook`);
        }
      }

      res.status(200).json({ status: "ok" });
    } else {
      logger.error("Webhook signature validation failed");
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (err) {
    logger.error("Webhook processing error", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
