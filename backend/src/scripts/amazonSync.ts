import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'real-time-amazon-data.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  console.error("❌ RAPIDAPI_KEY is not set in .env. Exiting.");
  process.exit(1);
}

// Queries to fetch products for different categories
const searchQueries = [
  { query: 'smartphones', categoryName: 'Mobiles' },
  { query: 'laptops', categoryName: 'Laptops' },
  { query: 'mens fashion', categoryName: 'Fashion' },
  { query: 'headphones', categoryName: 'Audio' },
  { query: 'smartwatches', categoryName: 'Watches' }
];

async function syncAmazonData() {
  console.log("🚀 Starting Amazon Real-Time Data Sync...");
  
  try {
    for (const { query, categoryName } of searchQueries) {
      console.log(`\n🔍 Fetching Amazon data for: ${query} (Category: ${categoryName})`);
      
      // 1. Ensure category exists
      let category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            description: `All things ${categoryName}`
          }
        });
        console.log(`Created new category: ${categoryName}`);
      }

      // 2. Fetch from RapidAPI
      const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}/search`,
        params: {
          query: query,
          page: '1',
          country: 'US',
          sort_by: 'RELEVANCE',
          product_condition: 'ALL'
        },
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST
        }
      };

      const response = await axios.request(options);
      
      if (!response.data || !response.data.data || !response.data.data.products) {
        console.warn(`⚠️ No products found for query: ${query}`);
        continue;
      }

      const products = response.data.data.products;
      console.log(`Found ${products.length} products. Syncing to PostgreSQL...`);

      // 3. Upsert into database
      let successCount = 0;
      for (const item of products) {
        try {
          // Parse price from string like "$999.00"
          let price = 99.99;
          if (item.product_price) {
            const numStr = item.product_price.replace(/[^0-9.]/g, '');
            if (numStr) price = parseFloat(numStr);
          }

          let originalPrice = price;
          if (item.product_original_price) {
            const numStr = item.product_original_price.replace(/[^0-9.]/g, '');
            if (numStr) originalPrice = parseFloat(numStr);
          }

          // Calculate discount percentage
          let discount = 0;
          if (originalPrice > price) {
            discount = Math.round(((originalPrice - price) / originalPrice) * 100);
          }

          // Determine brand naively from title if not explicitly provided
          const words = item.product_title.split(' ');
          const brand = words[0]; 

          // Amazon uses ASIN as unique identifier, we will use it as the id
          const asin = item.asin;

          await prisma.product.upsert({
            where: { id: asin }, // Use ASIN as the UUID/ID so it doesn't duplicate
            update: {
              name: item.product_title,
              price: price,
              discount: discount,
              imageUrl: item.product_photo,
              categoryId: category.id,
              // don't overwrite stock on update if we don't want to reset it, 
              // but for demo we will keep it simple
            },
            create: {
              id: asin,
              name: item.product_title,
              description: `Real Amazon Product: ${item.product_title}. Rated ${item.product_star_rating} stars by ${item.product_num_ratings} users.`,
              price: price,
              discount: discount,
              stock: Math.floor(Math.random() * 100) + 10, // Default random stock
              brand: brand,
              imageUrl: item.product_photo,
              categoryId: category.id
            }
          });
          successCount++;
        } catch (err: any) {
          console.error(`Failed to upsert product ${item.asin}: ${err.message}`);
        }
      }
      console.log(`✅ Successfully synced ${successCount} products for ${categoryName}`);
    }

    console.log("\n🎉 Amazon Data Sync Complete!");

  } catch (error: any) {
    console.error("❌ Sync Error:");
    console.error(error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

syncAmazonData();
