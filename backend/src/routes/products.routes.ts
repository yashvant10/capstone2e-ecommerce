import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { ApiError } from "../middlewares/errorHandler";

const router = express.Router();

// GET /api/v1/products
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      sort, 
      category, 
      minPrice, 
      maxPrice, 
      minRating 
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let whereClause: any = {};

    let AND_clauses: any[] = [];

    if (search) {
      AND_clauses.push({
        OR: [
          { name: { contains: String(search), mode: "insensitive" } },
          { description: { contains: String(search), mode: "insensitive" } },
          { brand: { contains: String(search), mode: "insensitive" } }
        ]
      });
    }

    if (category && category !== 'all') {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(category));
      if (isUUID) {
        AND_clauses.push({ categoryId: String(category) });
      } else {
        const catName = String(category).toLowerCase();
        let targetCategories = [String(category)];
        
        if (catName === 'electronics' || catName === 'tv') {
           targetCategories = ['Electronics', 'Mobiles', 'Laptops', 'Audio', 'Cameras', 'Watches'];
        } else if (catName === 'fashion' || catName === 'clothing') {
           targetCategories = ['Fashion', "Men's Clothing", "Women's Clothing", 'Shoes', 'Bags', 'Accessories'];
        } else if (catName === 'shoes' || catName === 'footwear') {
           targetCategories = ['Shoes', 'Fashion']; // Include fashion if we want more shoes, but maybe just Shoes is enough. Let's include Fashion since it might contain shoes.
        } else if (catName === 'smartphones' || catName === 'mobile phones' || catName === 'mobiles') {
           targetCategories = ['Mobiles', 'Smartphones'];
        } else if (catName === 'home & kitchen' || catName === 'kitchen' || catName === 'home') {
           targetCategories = ['Home & Kitchen', 'Furniture', 'Home'];
        } else if (catName === 'laptops' || catName === 'laptop') {
           targetCategories = ['Laptops'];
        } else if (catName === 'watches' || catName === 'watch') {
           targetCategories = ['Watches'];
        } else if (catName === 'beauty' || catName === 'makeup') {
           targetCategories = ['Beauty'];
        }

        const orCats = targetCategories.map(c => ({
          category: { name: { equals: c, mode: "insensitive" as const } }
        }));
        AND_clauses.push({ OR: orCats });
      }
    }

    if (AND_clauses.length > 0) {
      whereClause.AND = AND_clauses;
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = Number(minPrice);
      if (maxPrice) whereClause.price.lte = Number(maxPrice);
    }

    // Filter by min rating using Prisma's aggregate isn't direct in a single where clause without raw SQL or post-filtering
    // For simplicity, we will fetch all matching and post-filter if minRating is applied, or use a basic approach.
    // We will do a generic query first.

    let orderByClause: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderByClause = { price: 'asc' };
    if (sort === 'price_desc') orderByClause = { price: 'desc' };

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        reviews: { select: { rating: true } }
      },
      orderBy: orderByClause,
      skip, take: limitNumber
    });

    // Compute average ratings
    let processedProducts = products.map((p) => {
      const avgRating = p.reviews.length > 0 
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length 
        : 0;
      return { ...p, avgRating, reviewsCount: p.reviews.length };
    });

    if (minRating) {
      const minR = Number(minRating);
      processedProducts = processedProducts.filter(p => p.avgRating >= minR);
    }

    const total = processedProducts.length;
    const paginatedProducts = processedProducts.slice(skip, skip + limitNumber);

    res.json({
      data: paginatedProducts,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/products/categories
router.get("/categories", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } }
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/products/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: { category: true, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } } }
    });
    
    if (!product) throw new ApiError(404, "Product not found");

    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
      : 0;

    res.json({ ...product, avgRating, reviewsCount: product.reviews.length });
  } catch (error) {
    next(error);
  }
});

// ADMIN ROUTES
router.use(requireAuth, requireAdmin);

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
  categoryId: z.string()
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid input");
    }
    const product = await prisma.product.create({ data: parsed.data });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: req.body
    });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
});

// Admin Category Routes
router.post("/categories", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

export default router;
