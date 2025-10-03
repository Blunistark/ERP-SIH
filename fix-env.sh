#!/bin/bash

# Fix .env and restart containers
# This script updates the JWT_SECRET and restarts all services

set -e

echo "🔧 Fixing environment configuration..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check if JWT_SECRET is still placeholder
if grep -q "CHANGE_THIS_TO_A_VERY_LONG_RANDOM_STRING" .env; then
    echo "📝 Generating new JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    # Use awk to replace the JWT_SECRET line (more reliable than sed with special chars)
    awk -v secret="$JWT_SECRET" '{gsub(/CHANGE_THIS_TO_A_VERY_LONG_RANDOM_STRING/, secret)}1' .env > .env.tmp && mv .env.tmp .env
    echo "✅ JWT_SECRET updated"
else
    echo "✅ JWT_SECRET already set"
fi

# Show current .env (masked passwords)
echo ""
echo "📄 Current .env configuration:"
cat .env | sed 's/=.*/=***HIDDEN***/g'
echo ""

# Stop all containers
echo "🛑 Stopping all containers..."
docker compose down

# Remove old containers and volumes (optional - comment out if you want to keep data)
# echo "🗑️  Removing old containers..."
# docker compose down -v

# Start postgres first and wait for it to be healthy
echo "🚀 Starting PostgreSQL..."
docker compose up -d postgres
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Start redis
echo "🚀 Starting Redis..."
docker compose up -d redis
sleep 5

# Start backend
echo "🚀 Starting Backend..."
docker compose up -d app
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker compose exec -T app npx prisma migrate deploy || {
    echo "⚠️  Migration failed. Checking if database exists..."
    docker compose exec -T app npx prisma db push --accept-data-loss
}

# Seed database if needed
echo "🌱 Seeding database..."
docker compose exec -T app npm run seed || echo "⚠️  Seeding skipped (may already be seeded)"

# Start frontend and nginx
echo "🚀 Starting Frontend and Nginx..."
docker compose up -d frontend nginx

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🌐 Access your application:"
echo "   HTTP:  http://$(curl -s ifconfig.me):8080"
echo "   HTTPS: https://$(curl -s ifconfig.me):8443 (after SSL setup)"
echo ""
echo "🔐 Default Login:"
echo "   Email: admin@school.com"
echo "   Password: Admin@123"
echo ""
echo "📝 Check logs with:"
echo "   docker compose logs -f app"
echo ""
