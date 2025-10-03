# 🚀 Containerized Deployment Setup - Complete

## ✅ What's Been Created

A complete containerized deployment setup for your School ERP system with domain `hacksters.tech`.

### 📦 Docker Configuration Files

1. **Dockerfile** (Backend)
   - Node.js 18 Alpine base
   - Prisma ORM support
   - Health checks
   - Production optimized

2. **frontend/ERP/Dockerfile** (Frontend)
   - Multi-stage build
   - Nginx serving React app
   - Optimized bundle size

3. **docker-compose.yml**
   - PostgreSQL database
   - Backend API service
   - Frontend service
   - Nginx reverse proxy
   - Redis (optional caching)
   - Health checks for all services

### 🌐 Nginx Configuration

1. **nginx/nginx.conf** - Main configuration
2. **nginx/conf.d/erp.conf** - Domain-specific config for `erp.hacksters.tech`
   - HTTP server (for initial testing)
   - HTTPS server (ready to uncomment after SSL)
   - Reverse proxy to frontend and backend
   - Security headers
   - Gzip compression

3. **frontend/ERP/nginx.conf** - Frontend-specific nginx config

### ⚙️ Environment Templates

1. **.env.production.example** - Backend environment template
   - Database credentials
   - JWT secret configuration
   - Application settings

2. **frontend/ERP/.env.production** - Frontend environment
   - API base URL configuration

### 🛠️ Deployment Scripts

1. **quick-start.sh** - One-command first-time setup
   - Installs Docker & Docker Compose
   - Generates secure secrets
   - Configures firewall
   - Deploys all services

2. **deploy.sh** - Standard deployment script
   - Pulls latest code
   - Rebuilds containers
   - Runs migrations
   - Zero-downtime deployment

3. **setup-ssl.sh** - SSL certificate setup
   - Obtains Let's Encrypt certificate
   - Configures HTTPS
   - Sets up auto-renewal

### 📚 Documentation

1. **DEPLOYMENT.md** - Complete deployment guide (150+ lines)
   - Prerequisites checklist
   - Step-by-step DNS setup
   - VM preparation guide
   - Environment configuration
   - SSL/HTTPS setup
   - Monitoring & maintenance
   - Troubleshooting guide

2. **DOCKER.md** - Docker-specific documentation
   - Quick start guide
   - Service descriptions
   - Command reference
   - Security checklist
   - Production recommendations

### 🔒 Security Files Updated

- **.gitignore** - Excludes sensitive files:
  - Environment files (.env)
  - SSL certificates
  - Nginx logs

---

## 🎯 How to Deploy on Your VM

### Option 1: Quick Start (Recommended for First Time)

```bash
# 1. SSH to your VM
ssh your-user@your-vm-ip

# 2. Clone repository
git clone https://github.com/Blunistark/ERP-SIH.git
cd ERP-SIH

# 3. Run quick start
chmod +x quick-start.sh
./quick-start.sh

# 4. Configure DNS
# Add A record: erp.hacksters.tech -> YOUR_VM_IP

# 5. Wait for DNS propagation (5-60 minutes)

# 6. Access your app
# http://erp.hacksters.tech

# 7. Set up SSL
chmod +x setup-ssl.sh
./setup-ssl.sh
```

### Option 2: Manual Deployment

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Install Docker Compose
sudo apt install docker-compose-plugin -y

# 3. Clone repo
git clone https://github.com/Blunistark/ERP-SIH.git
cd ERP-SIH

# 4. Create environment file
cp .env.production.example .env
nano .env  # Edit with your values

# 5. Deploy
docker compose build
docker compose up -d

# 6. Run migrations
docker compose exec app npx prisma migrate deploy
```

---

## 🌐 DNS Configuration

### Step 1: Add A Record

Go to your domain registrar dashboard and add:

```
Type: A
Name: erp
Value: YOUR_VM_IP_ADDRESS
TTL: 3600
```

### Step 2: Verify DNS

```bash
# Check DNS resolution
nslookup erp.hacksters.tech

# Should return your VM IP
```

---

## 🔐 SSL/HTTPS Setup

### After DNS is Working

```bash
# 1. Stop nginx temporarily
docker compose stop nginx

# 2. Get SSL certificate
sudo certbot certonly --standalone \
  -d erp.hacksters.tech \
  --email your-email@hacksters.tech \
  --agree-tos

# 3. Copy certificates
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/erp.hacksters.tech/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/erp.hacksters.tech/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl

# 4. Update nginx config
nano nginx/conf.d/erp.conf
# Uncomment HTTPS server block
# Comment out temporary HTTP location
# Uncomment HTTP to HTTPS redirect

# 5. Update frontend environment
nano frontend/ERP/.env.production
# Change to: VITE_API_BASE_URL=https://erp.hacksters.tech/api

# 6. Rebuild and restart
docker compose build frontend
docker compose up -d
docker compose restart nginx
```

### Set Up Auto-Renewal

```bash
sudo crontab -e

# Add this line:
0 0 * * * certbot renew --quiet --deploy-hook "cd /opt/ERP-SIH && docker compose restart nginx"
```

---

## 📊 Service Architecture

```
                          Internet
                              │
                              ▼
                    ┌──────────────────┐
                    │   Nginx Proxy    │ :80, :443
                    │ (erp.hacksters)  │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌──────────────┐          ┌──────────────┐
        │   Frontend   │ :80      │   Backend    │ :3000
        │  (React+Nginx)│          │ (Express.js) │
        └──────────────┘          └──────────────┘
                                          │
                                          ▼
                                  ┌──────────────┐
                                  │  PostgreSQL  │ :5432
                                  │   Database   │
                                  └──────────────┘
```

---

## 🔍 Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f nginx
```

### Check Health

```bash
# Container status
docker compose ps

# Application health
curl http://erp.hacksters.tech/health

# API health
curl http://erp.hacksters.tech/api/health
```

### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U school_admin school_erp > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U school_admin school_erp < backup.sql
```

### Update Application

```bash
git pull origin main
./deploy.sh
```

---

## 🚨 Troubleshooting

### Can't access application?

```bash
# Check containers
docker compose ps

# Check nginx logs
docker compose logs nginx

# Open firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Database connection error?

```bash
# Check database health
docker compose exec postgres pg_isready -U school_admin

# View database logs
docker compose logs postgres
```

### SSL not working?

```bash
# Check certificate
sudo certbot certificates

# Test nginx config
docker compose exec nginx nginx -t

# Check SSL files exist
ls -la nginx/ssl/
```

---

## ✨ Default Credentials

**Admin Login:**
```
Email: admin@school.com
Password: Admin@123
```

⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## 📝 Useful Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart service
docker compose restart app

# Rebuild service
docker compose build app --no-cache
docker compose up -d app

# Execute command
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run seed

# View logs
docker compose logs -f app

# Check status
docker compose ps

# Resource usage
docker stats
```

---

## 🎓 What You Get

- ✅ **Fully containerized** deployment
- ✅ **Nginx reverse proxy** with SSL support
- ✅ **PostgreSQL** database with persistence
- ✅ **React frontend** with optimized build
- ✅ **Express.js backend** with health checks
- ✅ **Domain configuration** for erp.hacksters.tech
- ✅ **Automated scripts** for easy deployment
- ✅ **Comprehensive documentation**
- ✅ **Security best practices**
- ✅ **Health monitoring**

---

## 🎯 Next Steps

1. **Deploy on VM** using quick-start.sh
2. **Configure DNS** (erp.hacksters.tech -> VM IP)
3. **Wait for DNS** to propagate
4. **Test HTTP** access
5. **Set up SSL** with setup-ssl.sh
6. **Enable HTTPS** and force redirect
7. **Change default passwords**
8. **Set up backups**
9. **Configure monitoring**

---

## 📚 Documentation Files

- **DEPLOYMENT.md** - Complete deployment guide with troubleshooting
- **DOCKER.md** - Docker-specific documentation and commands
- **README.md** - General project documentation

---

**Created:** October 2, 2025  
**Domain:** erp.hacksters.tech  
**Repository:** https://github.com/Blunistark/ERP-SIH  
**Deployment Type:** Containerized (Docker + Docker Compose)
