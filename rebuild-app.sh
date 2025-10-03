#!/bin/bash

# Rebuild the app container with migrations
# This ensures all prisma files including migrations are copied

set -e

echo "🔄 Rebuilding app container with latest changes..."
echo ""

echo "📦 Building app container..."
docker compose build --no-cache app

echo ""
echo "🔄 Restarting app container..."
docker compose up -d app

echo ""
echo "⏳ Waiting for app to be healthy..."
sleep 10

echo ""
echo "✅ App container rebuilt successfully!"
echo ""
echo "Now run: ./init-database.sh"
echo ""
