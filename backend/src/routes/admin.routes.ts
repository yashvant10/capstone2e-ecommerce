import express, { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/v1/admin/dashboard
router.get("/dashboard", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();

    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { total: true }
    });
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

    // Sales over time (last 7 days simple aggregation)
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { total: true, createdAt: true }
    });

    const salesByDay = recentOrders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + order.total;
      return acc;
    }, {});

    const chartData = Object.keys(salesByDay).map(date => ({
      date,
      sales: salesByDay[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      metrics: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue
      },
      chartData
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/orders
router.get("/orders", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } }
    });
    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/admin/orders/:id/status
router.put("/orders/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
