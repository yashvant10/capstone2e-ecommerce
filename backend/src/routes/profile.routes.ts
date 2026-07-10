import express, { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { requireAuth } from "../middlewares/auth";
import { ApiError } from "../middlewares/errorHandler";

const router = express.Router();
router.use(requireAuth);

// GET /api/v1/profile
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, addresses: true }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/profile/addresses
router.post("/addresses", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, city, state, country, zipCode, isDefault } = req.body;
    
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: req.user!.id,
        address, city, state, country, zipCode, isDefault: isDefault || false
      }
    });

    res.status(201).json(newAddress);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/profile/addresses/:id
router.delete("/addresses/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addr = await prisma.userAddress.findUnique({ where: { id: String(req.params.id) } });
    if (!addr || addr.userId !== req.user!.id) {
      throw new ApiError(404, "Address not found");
    }

    await prisma.userAddress.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Address deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
