import express, { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { requireAuth } from "../middlewares/auth";
import { ApiError } from "../middlewares/errorHandler";

const router = express.Router();
router.use(requireAuth);

// GET /api/v1/cart
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: { items: { include: { product: true } } }
      });
    }

    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/cart/items
router.post("/items", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json(updatedCart);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/cart/items/:id
router.put("/items/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    const item = await prisma.cartItem.findUnique({ where: { id: String(req.params.id) }, include: { cart: true } });
    
    if (!item || item.cart.userId !== req.user!.id) {
      throw new ApiError(404, "Cart item not found");
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: String(req.params.id) } });
    } else {
      await prisma.cartItem.update({
        where: { id: String(req.params.id) },
        data: { quantity }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: item.cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json(updatedCart);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/cart/items/:id
router.delete("/items/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.cartItem.findUnique({ where: { id: String(req.params.id) }, include: { cart: true } });
    if (!item || item.cart.userId !== req.user!.id) throw new ApiError(404, "Cart item not found");
    
    await prisma.cartItem.delete({ where: { id: String(req.params.id) } });
    
    const updatedCart = await prisma.cart.findUnique({
      where: { id: item.cart.id },
      include: { items: { include: { product: true } } }
    });
    res.json(updatedCart);
  } catch (err) {
    next(err);
  }
});

export default router;
