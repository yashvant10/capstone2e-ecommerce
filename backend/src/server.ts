import "dotenv/config";
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

import logger from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import orderRoutes from "./routes/orders.routes";
import adminRoutes from "./routes/admin.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import paymentRoutes from "./routes/payments.routes";
import profileRoutes from "./routes/profile.routes";
import couponsRoutes from "./routes/coupons.routes";
import reviewsRoutes from "./routes/reviews.routes";

const app = express();

app.use(helmet());
app.use(cors({ 
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true 
}));

// Use express.json but store raw body for Razorpay webhook verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Request Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Swagger
try {
  const swaggerDocument = YAML.load(path.join(__dirname, "../../swagger.yaml"));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  logger.error("Could not load swagger.yaml");
}

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Stockroom API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/coupons", couponsRoutes);
app.use("/api/v1/reviews", reviewsRoutes);

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use((_req: Request, res: Response, next: express.NextFunction) => {
  if (_req.url.startsWith("/api")) {
    res.status(404).json({ error: { message: "Route not found" } });
  } else {
    next();
  }
});

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => logger.info(`API listening on port ${PORT}`));
}

export default app;
