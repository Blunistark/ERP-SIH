#!/bin/bash

# ERP System Deployment Script for VM
# This script deploys the containerized ERP system

set -e  # Exit on error

echo "============================================"
echo "  School ERP System - Deployment Script"
echo "============================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f .env.production.example ]; then
        cp .env.production.example .env
        echo "📝 Please edit the .env file and set secure passwords!"
        echo "   nano .env"
        exit 1
    else
        echo "❌ .env.production.example not found!"
        exit 1
    fi
fi

echo "✅ .env file found"
echo ""

# Pull latest code (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest code from Git..."
    git pull origin main
    echo "✅ Code updated"
    echo ""
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional)
read -p "Do you want to remove old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing old images..."
    docker-compose down --rmi all
fi

# Build and start containers
echo "🔨 Building containers..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

# Run database migrations
echo ""
echo "🔄 Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your application should be accessible at:"
echo "   http://erp.hacksters.tech"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Check status:     docker-compose ps"
echo ""
