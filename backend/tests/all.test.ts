import request from "supertest";
import app from "../src/server";
import prisma from "../src/utils/prisma";
import crypto from "crypto";

jest.mock("../src/utils/prisma", () => ({
  user: { findUnique: jest.fn(), create: jest.fn(), count: jest.fn(), update: jest.fn() },
  product: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  category: { findMany: jest.fn(), create: jest.fn() },
  order: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
  cart: { findUnique: jest.fn(), create: jest.fn() },
  cartItem: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  wishlist: { findUnique: jest.fn(), create: jest.fn() },
  wishlistItem: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
  review: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  coupon: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  address: { create: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  userAddress: { create: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  couponUsage: { findFirst: jest.fn(), create: jest.fn() },
  $transaction: jest.fn(async (cb: any) => {
    const mockTx = {
      order: { create: jest.fn().mockResolvedValue({ id: "o1" }), update: jest.fn().mockResolvedValue({ id: "o1", userId: "1", items: [] }) },
      product: { update: jest.fn() },
      couponUsage: { create: jest.fn() },
      coupon: { update: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
    };
    return cb(mockTx);
  })
}));

jest.mock("../src/middlewares/auth", () => ({
  requireAuth: (req: any, res: any, next: any) => { req.user = { id: "1", role: "ADMIN", email: "admin@test.com" }; next(); },
  requireAdmin: (req: any, res: any, next: any) => next()
}));

describe("All Routes Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== HEALTH =====
  it("Health check returns 200", async () => {
    await request(app).get("/health").expect(200);
  });

  it("Unknown route returns 404", async () => {
    await request(app).get("/api/v1/does-not-exist").expect(404);
  });

  // ===== AUTH =====
  it("Auth: register success", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: "1", email: "test@test.com", name: "Test", role: "CUSTOMER" });
    const res = await request(app).post("/api/v1/auth/register").send({ name: "Test", email: "test@test.com", password: "Password123" });
    expect(res.status).toBe(201);
  });

  it("Auth: register duplicate email", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1", email: "test@test.com" });
    const res = await request(app).post("/api/v1/auth/register").send({ name: "Test", email: "test@test.com", password: "Password123" });
    expect(res.status).toBe(400);
  });

  it("Auth: register invalid input", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({ name: "", email: "bad", password: "1" });
    expect(res.status).toBe(400);
  });

  it("Auth: login success", async () => {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("Password123", 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1", email: "test@test.com", passwordHash: hash, role: "CUSTOMER" });
    const res = await request(app).post("/api/v1/auth/login").send({ email: "test@test.com", password: "Password123" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("Auth: login invalid email", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).post("/api/v1/auth/login").send({ email: "noone@test.com", password: "Password123" });
    expect(res.status).toBe(401);
  });

  it("Auth: login wrong password", async () => {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("CorrectPassword", 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1", email: "t@t.com", passwordHash: hash, role: "CUSTOMER" });
    const res = await request(app).post("/api/v1/auth/login").send({ email: "t@t.com", password: "WrongPassword" });
    expect(res.status).toBe(401);
  });

  it("Auth: login invalid input", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ email: "not-an-email", password: "" });
    expect(res.status).toBe(400);
  });

  it("Auth: refresh without cookie", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");
    expect(res.status).toBe(401);
  });

  it("Auth: logout", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });

  // ===== PRODUCTS =====
  it("Products: list with filters", async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: "p1", name: "Widget", price: 50, reviews: [{ rating: 5 }, { rating: 3 }] },
      { id: "p2", name: "Gadget", price: 100, reviews: [] }
    ]);
    const res = await request(app).get("/api/v1/products?search=Widget&sort=price_asc&minPrice=10&maxPrice=200&minRating=3&category=cat1");
    expect(res.status).toBe(200);
  });

  it("Products: list with price_desc sort", async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get("/api/v1/products?sort=price_desc");
    expect(res.status).toBe(200);
  });

  it("Products: categories", async () => {
    (prisma.category.findMany as jest.Mock).mockResolvedValue([{ id: "c1", name: "Electronics" }]);
    const res = await request(app).get("/api/v1/products/categories");
    expect(res.status).toBe(200);
  });

  it("Products: get single with reviews", async () => {
    (prisma.product.findUnique as jest.Mock).mockResolvedValue({
      id: "p1", name: "Widget", reviews: [{ rating: 5 }, { rating: 3 }]
    });
    const res = await request(app).get("/api/v1/products/p1");
    expect(res.status).toBe(200);
    expect(res.body.avgRating).toBe(4);
  });

  it("Products: get single not found", async () => {
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get("/api/v1/products/notexist");
    expect(res.status).toBe(404);
  });

  it("Products: create (admin)", async () => {
    (prisma.product.create as jest.Mock).mockResolvedValue({ id: "p2" });
    const res = await request(app).post("/api/v1/products").send({ name: "New", description: "Desc", price: 10, stock: 5, categoryId: "c1" });
    expect(res.status).toBe(201);
  });

  it("Products: create invalid data", async () => {
    const res = await request(app).post("/api/v1/products").send({});
    expect(res.status).toBe(400);
  });

  it("Products: update", async () => {
    (prisma.product.update as jest.Mock).mockResolvedValue({ id: "p1" });
    const res = await request(app).put("/api/v1/products/p1").send({ name: "Updated" });
    expect(res.status).toBe(200);
  });

  it("Products: delete", async () => {
    (prisma.product.delete as jest.Mock).mockResolvedValue({});
    const res = await request(app).delete("/api/v1/products/p1");
    expect(res.status).toBe(200);
  });

  it("Products: create category (admin)", async () => {
    (prisma.category.create as jest.Mock).mockResolvedValue({ id: "c1", name: "Tech" });
    const res = await request(app).post("/api/v1/products/categories").send({ name: "Tech", slug: "tech" });
    expect(res.status).toBe(201);
  });

  // ===== CART =====
  it("Cart: get (creates if none)", async () => {
    (prisma.cart.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // first call returns null
      .mockResolvedValueOnce({ id: "c1", items: [] }); // after create
    (prisma.cart.create as jest.Mock).mockResolvedValue({ id: "c1", items: [] });
    const res = await request(app).get("/api/v1/cart");
    expect(res.status).toBe(200);
  });

  it("Cart: add item (existing item increments)", async () => {
    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ id: "c1", userId: "1", items: [] });
    (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({ id: "i1", quantity: 2 });
    (prisma.cartItem.update as jest.Mock).mockResolvedValue({ id: "i1", quantity: 3 });
    const res = await request(app).post("/api/v1/cart/items").send({ productId: "p1", quantity: 1 });
    expect(res.status).toBe(200);
  });

  it("Cart: add item (new item)", async () => {
    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ id: "c1", userId: "1", items: [] });
    (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.cartItem.create as jest.Mock).mockResolvedValue({ id: "i1" });
    const res = await request(app).post("/api/v1/cart/items").send({ productId: "p1", quantity: 2 });
    expect(res.status).toBe(200);
  });

  it("Cart: update item quantity > 0", async () => {
    (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({ id: "i1", cart: { id: "c1", userId: "1" } });
    (prisma.cartItem.update as jest.Mock).mockResolvedValue({ id: "i1", quantity: 5 });
    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ id: "c1", items: [] });
    const res = await request(app).put("/api/v1/cart/items/i1").send({ quantity: 5 });
    expect(res.status).toBe(200);
  });

  it("Cart: update item quantity <= 0 (deletes)", async () => {
    (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({ id: "i1", cart: { id: "c1", userId: "1" } });
    (prisma.cartItem.delete as jest.Mock).mockResolvedValue({});
    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ id: "c1", items: [] });
    const res = await request(app).put("/api/v1/cart/items/i1").send({ quantity: 0 });
    expect(res.status).toBe(200);
  });

  it("Cart: update item not found", async () => {
    (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).put("/api/v1/cart/items/notexist").send({ quantity: 2 });
    expect(res.status).toBe(404);
  });

  it("Cart: delete item", async () => {
    (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({ id: "i1", cart: { id: "c1", userId: "1" } });
    (prisma.cartItem.delete as jest.Mock).mockResolvedValue({});
    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ id: "c1", items: [] });
    const res = await request(app).delete("/api/v1/cart/items/i1");
    expect(res.status).toBe(200);
  });

  it("Cart: delete item not found", async () => {
    (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).delete("/api/v1/cart/items/notexist");
    expect(res.status).toBe(404);
  });

  // ===== ORDERS =====
  it("Orders: list", async () => {
    (prisma.order.findMany as jest.Mock).mockResolvedValue([{ id: "o1" }]);
    const res = await request(app).get("/api/v1/orders");
    expect(res.status).toBe(200);
  });

  it("Orders: get single", async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({ id: "o1", userId: "1" });
    const res = await request(app).get("/api/v1/orders/o1");
    expect(res.status).toBe(200);
  });

  it("Orders: get single not found", async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get("/api/v1/orders/notexist");
    expect(res.status).toBe(404);
  });

  it("Orders: create", async () => {
    (prisma.product.findUnique as jest.Mock).mockResolvedValue({ id: "p1", price: 100, stock: 10, name: "Widget" });
    const res = await request(app).post("/api/v1/orders").send({ items: [{ productId: "p1", quantity: 1 }], deliveryAddress: "123 Main Street" });
    expect(res.status).toBe(201);
  });

  // ===== PROFILE =====
  it("Profile: get", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1", name: "Admin", email: "admin@test.com" });
    const res = await request(app).get("/api/v1/profile");
    expect(res.status).toBe(200);
  });

  // Profile has no PUT / route, so skip that test

  it("Profile: add address", async () => {
    (prisma.userAddress.create as jest.Mock).mockResolvedValue({ id: "a1" });
    const res = await request(app).post("/api/v1/profile/addresses").send({ address: "1", city: "c", state: "s", country: "co", zipCode: "123" });
    expect(res.status).toBe(201);
  });

  // Profile has no PUT /addresses/:id/default route, so skip that test

  it("Profile: delete address", async () => {
    (prisma.userAddress.findUnique as jest.Mock).mockResolvedValue({ id: "a1", userId: "1" });
    (prisma.userAddress.delete as jest.Mock).mockResolvedValue({});
    const res = await request(app).delete("/api/v1/profile/addresses/a1");
    expect(res.status).toBe(200);
  });

  // ===== ADMIN =====
  it("Admin: dashboard", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(10);
    (prisma.order.count as jest.Mock).mockResolvedValue(20);
    (prisma.product.count as jest.Mock).mockResolvedValue(5);
    (prisma.order.findMany as jest.Mock).mockResolvedValue([{ total: 100, createdAt: new Date() }]);
    const res = await request(app).get("/api/v1/admin/dashboard");
    expect(res.status).toBe(200);
  });

  it("Admin: get orders", async () => {
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get("/api/v1/admin/orders");
    expect(res.status).toBe(200);
  });

  it("Admin: update order status", async () => {
    (prisma.order.update as jest.Mock).mockResolvedValue({ id: "o1", status: "DELIVERED" });
    const res = await request(app).put("/api/v1/admin/orders/o1/status").send({ status: "DELIVERED" });
    expect(res.status).toBe(200);
  });

  // ===== COUPONS =====
  it("Coupons: list", async () => {
    (prisma.coupon.findMany as jest.Mock).mockResolvedValue([{ id: "c1", code: "SAVE10" }]);
    const res = await request(app).get("/api/v1/coupons");
    expect(res.status).toBe(200);
  });

  it("Coupons: create", async () => {
    (prisma.coupon.create as jest.Mock).mockResolvedValue({ id: "c1" });
    const res = await request(app).post("/api/v1/coupons").send({ code: "SAVE10", discountType: "PERCENTAGE", discountValue: 10, minOrderValue: 50, expiryDate: "2030-01-01" });
    expect(res.status).toBe(201);
  });

  it("Coupons: update", async () => {
    (prisma.coupon.update as jest.Mock).mockResolvedValue({ id: "c1" });
    const res = await request(app).put("/api/v1/coupons/c1").send({ isActive: false });
    expect(res.status).toBe(200);
  });

  it("Coupons: validate valid coupon", async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({ id: "c1", code: "SAVE10", isActive: true, expiryDate: new Date("2030-01-01"), maxUses: 100, usedCount: 5 });
    const res = await request(app).get("/api/v1/coupons/validate/SAVE10");
    expect(res.status).toBe(200);
  });

  it("Coupons: validate not found", async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get("/api/v1/coupons/validate/BOGUS");
    expect(res.status).toBe(404);
  });

  it("Coupons: validate expired", async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({ id: "c1", code: "OLD", isActive: true, expiryDate: new Date("2020-01-01"), maxUses: 100, usedCount: 0 });
    const res = await request(app).get("/api/v1/coupons/validate/OLD");
    expect(res.status).toBe(400);
  });

  it("Coupons: validate usage limit reached", async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({ id: "c1", code: "USED", isActive: true, expiryDate: new Date("2030-01-01"), maxUses: 5, usedCount: 5 });
    const res = await request(app).get("/api/v1/coupons/validate/USED");
    expect(res.status).toBe(400);
  });

  // ===== REVIEWS =====
  it("Reviews: get product reviews", async () => {
    (prisma.review.findMany as jest.Mock).mockResolvedValue([{ id: "r1" }]);
    const res = await request(app).get("/api/v1/reviews/product/p1");
    expect(res.status).toBe(200);
  });

  it("Reviews: create", async () => {
    (prisma.order.findFirst as jest.Mock).mockResolvedValue({ id: "o1" });
    (prisma.review.create as jest.Mock).mockResolvedValue({ id: "r1" });
    const res = await request(app).post("/api/v1/reviews").send({ productId: "p1", rating: 5, comment: "great" });
    expect(res.status).toBe(201);
  });

  // Reviews has no PUT route, so skip update test

  it("Reviews: delete", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: "r1", userId: "1" });
    (prisma.review.delete as jest.Mock).mockResolvedValue({});
    const res = await request(app).delete("/api/v1/reviews/r1");
    expect(res.status).toBe(200);
  });

  // ===== WISHLIST =====
  it("Wishlist: get", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({ id: "w1", items: [] });
    const res = await request(app).get("/api/v1/wishlist");
    expect(res.status).toBe(200);
  });

  it("Wishlist: add item", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({ id: "w1" });
    (prisma.wishlistItem.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({ id: "wi1" });
    const res = await request(app).post("/api/v1/wishlist/items").send({ productId: "p1" });
    expect(res.status).toBe(201);
  });

  it("Wishlist: remove item", async () => {
    (prisma.wishlistItem.delete as jest.Mock).mockResolvedValue({});
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({ id: "w1", items: [] });
    const res = await request(app).delete("/api/v1/wishlist/items/p1");
    expect(res.status).toBe(200);
  });

  // ===== PAYMENTS =====
  it("Payments: create-order (hits Razorpay SDK, expect 500 in test)", async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({ id: "o1", total: 100, userId: "1", paymentStatus: "PENDING" });
    const res = await request(app).post("/api/v1/payments/create-order").send({ orderId: "o1" });
    // Razorpay SDK call will fail in test environment, so this returns 500
    expect(res.status).toBe(500);
  });

  it("Payments: verify with wrong signature", async () => {
    const res = await request(app).post("/api/v1/payments/verify").send({
      razorpay_order_id: "order_1", razorpay_payment_id: "pay_1",
      razorpay_signature: "wrong_sig", orderId: "o1"
    });
    // Signature mismatch => 400
    expect(res.status).toBe(400);
  });

  it("Payments: verify with correct signature", async () => {
    const orderId = "order_test";
    const paymentId = "pay_test";
    const secret = process.env.RAZORPAY_KEY_SECRET || "secret_placeholder";
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      const mockTx = {
        order: { update: jest.fn().mockResolvedValue({ id: "o1", userId: "1", items: [] }) },
        cartItem: { deleteMany: jest.fn() },
      };
      return cb(mockTx);
    });

    const res = await request(app).post("/api/v1/payments/verify").send({
      razorpay_order_id: orderId, razorpay_payment_id: paymentId,
      razorpay_signature: expectedSignature, orderId: "o1"
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("Payments: webhook without signature (error path)", async () => {
    const res = await request(app).post("/api/v1/payments/webhook").send({ event: "payment.captured", payload: {} });
    expect(res.status).toBe(500);
  });
});
