#!/bin/bash

# SSL Setup Script using Certbot (Let's Encrypt)
# Run this script on your VM to set up HTTPS

set -e

echo "============================================"
echo "  SSL Certificate Setup with Let's Encrypt"
echo "============================================"
echo ""

# Check if domain is provided
DOMAIN="erp.hacksters.tech"
EMAIL="your-email@hacksters.tech"  # Change this!

echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot
    else
        echo "❌ Please install certbot manually"
        exit 1
    fi
fi

# Create SSL directory
mkdir -p nginx/ssl

# Stop nginx temporarily
echo "Stopping nginx container..."
docker-compose stop nginx

# Get certificate
echo "Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Copy certificates to nginx directory
echo "Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/

# Update permissions
sudo chown -R $USER:$USER nginx/ssl
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem

echo ""
echo "✅ SSL certificates obtained successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit nginx/conf.d/erp.conf"
echo "2. Uncomment the HTTPS server block"
echo "3. Comment out the temporary HTTP location block"
echo "4. Uncomment the HTTP to HTTPS redirect"
echo "5. Restart nginx: docker-compose restart nginx"
echo ""
echo "💡 Certificate renewal:"
echo "   Certificates expire in 90 days"
echo "   Set up auto-renewal with: sudo certbot renew --dry-run"
echo ""
