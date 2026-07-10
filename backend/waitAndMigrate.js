const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.join(__dirname, '.env');

console.log("Waiting for DATABASE_URL password to be updated in .env...");

function checkAndRun() {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('[YOUR-PASSWORD]')) {
    setTimeout(checkAndRun, 3000); // Check every 3 seconds
    return;
  }

  console.log("\n✅ Password detected! Running Prisma migrations and Amazon Sync...\n");
  
  try {
    console.log("Running: npx prisma migrate dev --name init");
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit', cwd: __dirname });
    
    console.log("Running: npx prisma generate");
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
    
    console.log("Running: npx prisma db seed");
    execSync('npx prisma db seed', { stdio: 'inherit', cwd: __dirname });

    console.log("Running: npm run sync:amazon");
    execSync('npm run sync:amazon', { stdio: 'inherit', cwd: __dirname });

    console.log("\n🎉 All database migrations and syncs completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error running commands:", err.message);
    process.exit(1);
  }
}

checkAndRun();
