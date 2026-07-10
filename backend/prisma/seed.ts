import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear the database
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  console.log('Database cleared');

  // Create Users
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@stockroom.com',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('Admin account created');

  const customerUser = await prisma.user.create({
    data: {
      name: 'Demo Customer',
      email: 'customer@stockroom.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });
  console.log('Customer account created');

  // Create Categories
  const categoryNames = [
    'Electronics', 'Fashion', "Men's Clothing", "Women's Clothing", 
    'Shoes', 'Watches', 'Beauty', 'Home & Kitchen', 'Furniture', 
    'Grocery', 'Sports', 'Books', 'Toys', 'Gaming', 'Accessories', 
    'Bags', 'Mobiles', 'Laptops', 'Audio', 'Cameras'
  ];

  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.create({ data: { name, description: `${name} category` } });
    categories[name] = cat.id;
  }
  console.log('Categories created');

  // Define Products
  const productsToCreate = [
    // Electronics
    { name: '4K Ultra HD Smart TV', description: '55-inch 4K Smart TV with HDR.', price: 499.99, discount: 50, stock: 15, brand: 'Vision', imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80', categoryId: categories['Electronics'] },
    { name: 'Smart Home Hub', description: 'Control all your smart devices.', price: 129.99, stock: 40, brand: 'HomeConnect', imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80', categoryId: categories['Electronics'] },
    
    // Mobiles
    { name: 'Smartphone Pro Max', description: 'Latest generation smartphone with pro camera.', price: 1099.0, discount: 100, stock: 20, brand: 'TechGear', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', categoryId: categories['Mobiles'] },
    { name: 'Budget Android Phone', description: 'Reliable everyday smartphone.', price: 299.0, stock: 100, brand: 'AndroTech', imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?w=800&q=80', categoryId: categories['Mobiles'] },
    
    // Laptops
    { name: 'Ultrabook Pro 14"', description: 'Thin, light, and powerful laptop for professionals.', price: 1299.0, stock: 25, brand: 'CompCore', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', categoryId: categories['Laptops'] },
    { name: 'Gaming Laptop RTX 4080', description: 'High-end gaming laptop with RGB keyboard.', price: 1999.0, discount: 200, stock: 10, brand: 'GameRig', imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80', categoryId: categories['Laptops'] },

    // Audio
    { name: 'Wireless Noise-Canceling Headphones', description: 'Premium over-ear headphones.', price: 299.99, discount: 30, stock: 50, brand: 'SoundWave', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', categoryId: categories['Audio'] },
    { name: 'True Wireless Earbuds', description: 'Compact earbuds with charging case.', price: 149.99, stock: 80, brand: 'Aura', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', categoryId: categories['Audio'] },

    // Cameras
    { name: 'Mirrorless Digital Camera', description: '24MP mirrorless camera with 4K video.', price: 899.0, stock: 12, brand: 'OpticX', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', categoryId: categories['Cameras'] },
    
    // Men's Clothing
    { name: 'Classic Cotton T-Shirt', description: 'Comfortable everyday essential t-shirt.', price: 19.99, stock: 200, brand: 'Essential', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', categoryId: categories["Men's Clothing"] },
    { name: 'Slim Fit Denim Jeans', description: 'Classic blue denim with a modern slim fit.', price: 49.99, stock: 120, brand: 'DenimCo', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', categoryId: categories["Men's Clothing"] },
    
    // Women's Clothing
    { name: 'Floral Summer Dress', description: 'Lightweight and breathable summer dress.', price: 59.99, discount: 10, stock: 60, brand: 'Bloom', imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', categoryId: categories["Women's Clothing"] },
    { name: 'Cozy Knit Sweater', description: 'Warm and comfortable oversized sweater.', price: 79.99, stock: 45, brand: 'WinterVibe', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', categoryId: categories["Women's Clothing"] },

    // Shoes
    { name: 'Running Sneakers', description: 'Lightweight athletic shoes for everyday running.', price: 120.0, stock: 85, brand: 'Stride', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', categoryId: categories['Shoes'] },
    { name: 'Leather Oxford Shoes', description: 'Classic formal leather shoes.', price: 150.0, stock: 30, brand: 'ClassicCraft', imageUrl: 'https://images.unsplash.com/photo-1614252209825-f0001bc20163?w=800&q=80', categoryId: categories['Shoes'] },

    // Watches
    { name: 'Minimalist Analog Watch', description: 'Elegant watch with leather strap.', price: 95.0, stock: 40, brand: 'TimePiece', imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', categoryId: categories['Watches'] },
    { name: 'Smart Fitness Watch', description: 'Track your health and workouts.', price: 199.99, discount: 20, stock: 60, brand: 'FitTech', imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80', categoryId: categories['Watches'] },

    // Beauty
    { name: 'Hydrating Face Cream', description: 'Daily moisturizer with hyaluronic acid.', price: 35.0, stock: 150, brand: 'GlowNaturals', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', categoryId: categories['Beauty'] },
    { name: 'Matte Liquid Lipstick', description: 'Long-lasting matte finish lipstick.', price: 22.0, stock: 200, brand: 'ColorPop', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80', categoryId: categories['Beauty'] },

    // Home & Kitchen
    { name: 'Ceramic Coffee Mug', description: 'Handcrafted ceramic mug for your daily brew.', price: 15.0, stock: 100, brand: 'Artisan', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80', categoryId: categories['Home & Kitchen'] },
    { name: 'Non-Stick Cookware Set', description: '10-piece premium cookware set.', price: 149.99, stock: 25, brand: 'ChefMaster', imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80', categoryId: categories['Home & Kitchen'] },

    // Furniture
    { name: 'Modern Velvet Sofa', description: 'Comfortable 3-seater sofa in emerald green.', price: 899.0, discount: 100, stock: 8, brand: 'LuxeLiving', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', categoryId: categories['Furniture'] },
    { name: 'Ergonomic Office Chair', description: 'Adjustable mesh chair for long work hours.', price: 249.99, stock: 35, brand: 'WorkSpace', imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80', categoryId: categories['Furniture'] },

    // Sports
    { name: 'Yoga Mat', description: 'Eco-friendly non-slip yoga mat.', price: 30.0, stock: 120, brand: 'Zen', imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80', categoryId: categories['Sports'] },
    { name: 'Adjustable Dumbbells', description: 'Space-saving adjustable weight set.', price: 199.0, stock: 15, brand: 'PowerLift', imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', categoryId: categories['Sports'] },

    // Books
    { name: 'The Art of Design', description: 'Hardcover book on modern design principles.', price: 45.0, stock: 50, brand: 'PubCo', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80', categoryId: categories['Books'] },
    
    // Toys
    { name: 'Educational Building Blocks', description: '100-piece wooden block set.', price: 35.0, stock: 75, brand: 'KidsPlay', imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80', categoryId: categories['Toys'] },

    // Gaming
    { name: 'Next-Gen Game Console', description: 'Powerful gaming console with 4K graphics.', price: 499.0, stock: 20, brand: 'PlayGear', imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&q=80', categoryId: categories['Gaming'] },

    // Bags
    { name: 'Leather Weekend Duffel', description: 'Premium genuine leather travel bag.', price: 180.0, stock: 30, brand: 'Traveler', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', categoryId: categories['Bags'] },
    { name: 'Everyday Canvas Backpack', description: 'Durable backpack with laptop sleeve.', price: 65.0, stock: 90, brand: 'UrbanCarry', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', categoryId: categories['Bags'] }
  ];

  await prisma.product.createMany({
    data: productsToCreate
  });
  console.log('Products seeded');

  // Fetch created products to add reviews
  const allProducts = await prisma.product.findMany();
  
  for (const product of allProducts) {
    // 50% chance to have a review
    if (Math.random() > 0.5) {
      await prisma.review.create({
        data: {
          userId: customerUser.id,
          productId: product.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 star
          comment: 'Great product, highly recommended! The quality is amazing for the price.'
        }
      });
    }
  }

  // Create a Coupon
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 50,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      maxUses: 100,
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
