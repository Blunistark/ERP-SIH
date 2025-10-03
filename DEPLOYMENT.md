# 🚀 School ERP System - Deployment Guide

Complete guide for deploying the containerized ERP system on your VM with domain `hacksters.tech`.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Domain Setup](#domain-setup)
3. [VM Preparation](#vm-preparation)
4. [Environment Configuration](#environment-configuration)
5. [Deployment](#deployment)
6. [SSL Setup (HTTPS)](#ssl-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **VM**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+ available
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Git**: For code deployment

### Domain Requirements
- Domain: `hacksters.tech`
- Subdomain: `erp.hacksters.tech` (configured in DNS)

---

## 🌐 Domain Setup

### 1. Add DNS A Record

Log in to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare) and add:

```
Type: A
Name: erp
Value: YOUR_VM_IP_ADDRESS
TTL: 3600 (or Auto)
```

### 2. Verify DNS Propagation

```bash
# Check DNS resolution
nslookup erp.hacksters.tech

# Or use
dig erp.hacksters.tech
```

Wait 5-60 minutes for DNS to propagate globally.

---

## 🖥️ VM Preparation

### 1. Connect to Your VM

```bash
ssh your-user@your-vm-ip
```

### 2. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
exit
# SSH back in
```

### 4. Install Docker Compose

```bash
# Docker Compose v2 (plugin)
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 5. Install Git

```bash
sudo apt install git -y
```

### 6. Clone Repository

```bash
# Navigate to desired directory
cd /opt

# Clone your repository
sudo git clone https://github.com/Blunistark/ERP-SIH.git
cd ERP-SIH

# Set ownership
sudo chown -R $USER:$USER /opt/ERP-SIH
```

---

## ⚙️ Environment Configuration

### 1. Create Environment File

```bash
cd /opt/ERP-SIH
cp .env.production.example .env
```

### 2. Edit Environment Variables

```bash
nano .env
```

**Important: Change these values!**

```env
# Database Configuration
DB_USER=school_admin
DB_PASSWORD=your_super_secure_password_here_min_32_chars
DB_NAME=school_erp

# JWT Configuration (generate with: openssl rand -base64 64)
JWT_SECRET=your_jwt_secret_at_least_64_characters_long_random_string
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3000
```

### 3. Generate Secure Secrets

```bash
# Generate secure password for database
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

### 4. Update Frontend Environment

```bash
nano frontend/ERP/.env.production
```

```env
# For HTTP (initial testing)
VITE_API_BASE_URL=http://erp.hacksters.tech/api

# After SSL setup, change to:
# VITE_API_BASE_URL=https://erp.hacksters.tech/api
```

---

## 🚀 Deployment

### Option 1: Using Deployment Script (Recommended)

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Build and start containers
docker compose build --no-cache
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Run database migrations
docker compose exec app npx prisma migrate deploy

# Seed initial data (if needed)
docker compose exec app npx prisma db seed
```

### 3. Verify Deployment

```bash
# Check all containers are running
docker compose ps

# Should show:
# - erp-postgres (healthy)
# - school-erp-backend (healthy)
# - erp-frontend (healthy)
# - erp-nginx (healthy)
```

### 4. Access Application

Open browser: `http://erp.hacksters.tech`

**Default Admin Login:**
```
Email: admin@school.com
Password: Admin@123
```

⚠️ **Change the default password immediately!**

---

## 🔒 SSL Setup (HTTPS)

### 1. Install Certbot

```bash
sudo apt install certbot -y
```

### 2. Stop Nginx Temporarily

```bash
docker compose stop nginx
```

### 3. Obtain SSL Certificate

```bash
# Run SSL setup script
chmod +x setup-ssl.sh
./setup-ssl.sh

# OR manually:
sudo certbot certonly --standalone \
  --preferred-challenges http \
  --email your-email@hacksters.tech \
  --agree-tos \
  -d erp.hacksters.tech
```

### 4. Copy Certificates

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/erp.hacksters.tech/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/erp.hacksters.tech/privkey.pem nginx/ssl/

# Set permissions
sudo chown -R $USER:$USER nginx/ssl
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

### 5. Update Nginx Configuration

```bash
nano nginx/conf.d/erp.conf
```

1. **Uncomment** the HTTPS server block (lines starting with `# server {`)
2. **Comment out** the temporary HTTP location block
3. **Uncomment** the HTTP to HTTPS redirect

### 6. Update Frontend Environment

```bash
nano frontend/ERP/.env.production
```

Change to HTTPS:
```env
VITE_API_BASE_URL=https://erp.hacksters.tech/api
```

### 7. Rebuild Frontend

```bash
docker compose build frontend
docker compose up -d
```

### 8. Restart Nginx

```bash
docker compose restart nginx
```

### 9. Set Up Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e

# Add this line (runs twice daily):
0 0,12 * * * certbot renew --quiet --deploy-hook "cd /opt/ERP-SIH && docker compose restart nginx"
```

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f postgres
```

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U school_admin school_erp > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T postgres psql -U school_admin school_erp < backup_20241002.sql
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Redeploy
./deploy.sh
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart app
docker compose restart nginx
```

### Clean Up

```bash
# Remove stopped containers
docker compose down

# Remove unused images
docker image prune -a

# Remove unused volumes (⚠️ careful with data)
docker volume prune
```

---

## 🐛 Troubleshooting

### Application Not Accessible

```bash
# Check if containers are running
docker compose ps

# Check nginx logs
docker compose logs nginx

# Check if port 80/443 is open
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Database Connection Issues

```bash
# Check database logs
docker compose logs postgres

# Check database health
docker compose exec postgres pg_isready -U school_admin

# Access database
docker compose exec postgres psql -U school_admin -d school_erp
```

### Frontend Not Loading

```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose build frontend --no-cache
docker compose up -d frontend
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Manually renew
sudo certbot renew

# Check nginx SSL config
docker compose exec nginx nginx -t
```

### Out of Memory

```bash
# Check memory usage
free -h

# Add swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📞 Support

### Useful Commands Reference

```bash
# View all running containers
docker compose ps

# Stop all services
docker compose down

# Start services
docker compose up -d

# Rebuild specific service
docker compose build app
docker compose up -d app

# Execute command in container
docker compose exec app npm run <command>

# View environment variables
docker compose config

# Scale services
docker compose up -d --scale app=3
```

### Health Checks

```bash
# Check application health
curl http://erp.hacksters.tech/health

# Check API health
curl http://erp.hacksters.tech/api/health
```

---

## 🎉 Post-Deployment Checklist

- [ ] Application accessible at `http://erp.hacksters.tech`
- [ ] SSL certificate installed and HTTPS working
- [ ] Default admin password changed
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Firewall configured
- [ ] SSL auto-renewal configured
- [ ] Domain DNS configured correctly
- [ ] All services healthy and running

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Deployed by:** Your Team  
**Last Updated:** October 2, 2025  
**Version:** 1.0.0
