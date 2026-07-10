"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // Clean existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.coupon.deleteMany();
    // Create Admin
    const adminPassword = await bcryptjs_1.default.hash('Admin@123', 10);
    const admin = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: 'admin@stockroom.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });
    console.log('Admin account created');
    // Create Customer
    const customerPassword = await bcryptjs_1.default.hash('Customer@123', 10);
    const customer = await prisma.user.create({
        data: {
            name: 'Demo Customer',
            email: 'customer@stockroom.com',
            passwordHash: customerPassword,
            role: 'CUSTOMER',
            cart: { create: {} },
            wishlist: { create: {} },
        },
    });
    console.log('Customer account created');
    // Create Categories
    const catElectronics = await prisma.category.create({ data: { name: 'Electronics', description: 'Gadgets and devices' } });
    const catClothing = await prisma.category.create({ data: { name: 'Clothing', description: 'Apparel and accessories' } });
    // Create Products
    await prisma.product.createMany({
        data: [
            {
                name: 'Wireless Noise-Canceling Headphones',
                description: 'Premium over-ear headphones with active noise cancellation.',
                price: 299.99,
                originalPrice: 349.99,
                stock: 50,
                categoryId: catElectronics.id,
            },
            {
                name: 'Smartphone Pro Max',
                description: 'Latest generation smartphone with pro camera system.',
                price: 999.00,
                stock: 20,
                categoryId: catElectronics.id,
            },
            {
                name: 'Classic Cotton T-Shirt',
                description: 'Comfortable everyday essential t-shirt in white.',
                price: 19.99,
                stock: 200,
                categoryId: catClothing.id,
            },
            {
                name: 'Denim Jacket',
                description: 'Vintage wash denim jacket for all seasons.',
                price: 89.50,
                originalPrice: 110.00,
                stock: 35,
                categoryId: catClothing.id,
            },
        ],
    });
    console.log('Products seeded');
    // Create a Coupon
    await prisma.coupon.create({
        data: {
            code: 'WELCOME10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 50,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            usageLimit: 100,
            isActive: true,
        }
    });
    console.log('Coupon seeded');
    console.log('Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
