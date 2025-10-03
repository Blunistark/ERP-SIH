#!/bin/bash

# Update Frontend API URL
# Run this script to update the frontend's API endpoint

set -e

echo "🔧 Updating Frontend API Configuration..."

# Get VM IP
VM_IP=$(curl -s ifconfig.me)

# Update .env.production
cat > frontend/ERP/.env.production << EOF
# API Base URL - Point to your backend
# Using VM IP with port 8080
VITE_API_BASE_URL=http://${VM_IP}:8080/api

# After SSL setup with domain on port 8443:
# VITE_API_BASE_URL=https://erp.hacksters.tech:8443/api
EOF

echo "✅ Updated VITE_API_BASE_URL to: http://${VM_IP}:8080/api"
echo ""

# Rebuild frontend
echo "🔨 Rebuilding frontend container..."
docker compose build frontend --no-cache

echo ""
echo "🚀 Restarting frontend..."
docker compose up -d frontend

echo ""
echo "⏳ Waiting for frontend to start..."
sleep 10

echo ""
echo "✅ Frontend updated!"
echo ""
echo "🌐 Access your application:"
echo "   http://${VM_IP}:8080"
echo ""
echo "📝 Check logs with:"
echo "   docker compose logs -f frontend"
echo ""
