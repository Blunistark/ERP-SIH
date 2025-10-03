#!/bin/bash

# Initialize Database - Run migrations and seed data
# Run this after first deployment or when database is reset

set -e

echo "🗄️  Initializing Database..."
echo ""

# Copy migrations to container
echo "📁 Copying migrations to container..."
docker cp ./prisma/migrations app:/app/prisma/

# Check if migrations exist in container
echo "🔍 Checking for migrations in container..."
docker compose exec -T app ls -la prisma/migrations/ || echo "⚠️  Migrations folder not found in container!"

# Run migrations
echo "📊 Running database migrations..."
docker compose exec -T app npx prisma migrate deploy

echo ""
echo "✅ Migrations completed!"
echo ""

# Check if tables exist
echo "📋 Checking database tables..."
docker compose exec postgres psql -U school_admin -d school_erp -c "\dt" || true

echo ""
echo "🌱 Seeding database with initial data..."

# Create a simple seed script that runs directly
docker compose exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('Creating admin user...');
  
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    },
    include: {
      profile: true
    }
  });
  
  console.log('✅ Admin user created:', admin.email);
  console.log('   Name:', admin.profile.firstName, admin.profile.lastName);
  console.log('   Password: Admin@123');
  
  await prisma.\$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
"

echo ""
echo "✅ Database initialized successfully!"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Email: admin@school.com"
echo "   Password: Admin@123"
echo ""
echo "⚠️  Please change the default password after first login!"
echo ""
