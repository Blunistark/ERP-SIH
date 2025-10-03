# 🚀 Quick Deployment Guide - School ERP System

## 📍 Domain: erp.hacksters.tech

---

## ⚡ One-Command Install (Recommended)

```bash
wget -qO- https://raw.githubusercontent.com/Blunistark/ERP-SIH/main/install.sh | bash
cd ~/ERP-SIH
./quick-start.sh
```

---

## 📋 Step-by-Step Installation

### 1️⃣ Clone Repository

```bash
# Option A: Using Git
git clone https://github.com/Blunistark/ERP-SIH.git
cd ERP-SIH

# Option B: Download and extract
wget https://github.com/Blunistark/ERP-SIH/archive/refs/heads/main.zip
unzip main.zip
cd ERP-SIH-main
```

### 2️⃣ Run Quick Start

```bash
chmod +x quick-start.sh
./quick-start.sh
```

This will:
- ✅ Install Docker & Docker Compose
- ✅ Generate secure secrets
- ✅ Create environment files
- ✅ Build containers
- ✅ Start all services
- ✅ Run database migrations

### 3️⃣ Configure DNS

Add this A record to your domain registrar:

```
Type: A
Name: erp
Value: YOUR_VM_IP
TTL: 3600
```

**Check your VM IP:**
```bash
curl ifconfig.me
```

**Verify DNS propagation:**
```bash
nslookup erp.hacksters.tech
# Should return your VM IP
```

### 4️⃣ Access Application

```bash
# Wait 5-60 minutes for DNS to propagate
# Then access: http://erp.hacksters.tech
```

**Default Login:**
- Email: `admin@school.com`
- Password: `Admin@123`

⚠️ **Change password immediately!**

### 5️⃣ Set Up SSL (After DNS works)

```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

Then update the nginx config to enable HTTPS.

---

## 🔧 Manual Installation (Alternative)

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and back in for group changes

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Clone & Configure

```bash
# Clone repository
git clone https://github.com/Blunistark/ERP-SIH.git
cd ERP-SIH

# Create environment file
cp .env.production.example .env

# Edit environment variables
nano .env

# Generate secure secrets
openssl rand -base64 32  # For DB password
openssl rand -base64 64  # For JWT secret
```

### Deploy

```bash
# Build containers
docker compose build --no-cache

# Start services
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy

# Check status
docker compose ps
```

---

## 🌐 DNS Configuration

### Cloudflare Setup

1. Log in to Cloudflare
2. Select your domain `hacksters.tech`
3. Go to **DNS** > **Records**
4. Add record:
   - Type: `A`
   - Name: `erp`
   - IPv4 address: `YOUR_VM_IP`
   - Proxy status: DNS only (gray cloud) initially
   - TTL: Auto

### Other DNS Providers

**GoDaddy:**
1. DNS Management
2. Add Record
3. Type: A, Name: erp, Value: YOUR_VM_IP

**Namecheap:**
1. Advanced DNS
2. Add New Record
3. Type: A Record, Host: erp, Value: YOUR_VM_IP

---

## 🔐 SSL Setup (HTTPS)

### Prerequisites
- DNS must be working (erp.hacksters.tech resolves to your VM)
- Port 80 and 443 must be open

### Quick SSL Setup

```bash
./setup-ssl.sh
```

### Manual SSL Setup

```bash
# Install Certbot
sudo apt install certbot -y

# Stop nginx temporarily
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone \
  -d erp.hacksters.tech \
  --email your-email@hacksters.tech \
  --agree-tos

# Copy certificates
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/erp.hacksters.tech/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/erp.hacksters.tech/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem

# Update nginx config
nano nginx/conf.d/erp.conf
# Uncomment HTTPS server block
# Uncomment redirect line

# Update frontend env
nano frontend/ERP/.env.production
# Change to: VITE_API_BASE_URL=https://erp.hacksters.tech/api

# Rebuild and restart
docker compose build frontend
docker compose up -d
docker compose restart nginx
```

### Auto-Renewal

```bash
# Add to crontab
sudo crontab -e

# Add this line:
0 0 * * * certbot renew --quiet --deploy-hook "cd ~/ERP-SIH && docker compose restart nginx"
```

---

## 📊 Common Commands

### Service Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a service
docker compose restart app
docker compose restart nginx

# Rebuild a service
docker compose build app --no-cache
docker compose up -d app

# View status
docker compose ps

# View logs
docker compose logs -f
docker compose logs -f app
docker compose logs -f frontend
```

### Database

```bash
# Create backup
docker compose exec postgres pg_dump -U school_admin school_erp > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T postgres psql -U school_admin school_erp < backup.sql

# Access database
docker compose exec postgres psql -U school_admin -d school_erp

# Run migrations
docker compose exec app npx prisma migrate deploy

# Seed database
docker compose exec app npm run seed
```

### Monitoring

```bash
# Check health
curl http://erp.hacksters.tech/health
curl http://erp.hacksters.tech/api/health

# Resource usage
docker stats

# Disk usage
docker system df

# Check ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Updates

```bash
# Pull latest code
git pull origin main

# Redeploy
./deploy.sh

# Or manually:
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose exec app npx prisma migrate deploy
```

---

## 🐛 Troubleshooting

### Application Not Accessible

```bash
# Check containers
docker compose ps

# Check logs
docker compose logs nginx
docker compose logs app

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Restart nginx
docker compose restart nginx
```

### Database Connection Error

```bash
# Check database
docker compose exec postgres pg_isready -U school_admin

# View logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Frontend Not Loading

```bash
# Rebuild frontend
docker compose build frontend --no-cache
docker compose up -d frontend

# Check logs
docker compose logs frontend
```

### SSL Issues

```bash
# Check certificate
sudo certbot certificates

# Test nginx config
docker compose exec nginx nginx -t

# Renew certificate
sudo certbot renew

# Check SSL files
ls -la nginx/ssl/
```

### Out of Memory

```bash
# Check memory
free -h

# Add swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📁 Important Files

```
ERP-SIH/
├── quick-start.sh          # First-time setup
├── deploy.sh               # Update deployment
├── setup-ssl.sh            # SSL setup
├── docker-compose.yml      # Service orchestration
├── .env                    # Environment variables (create from example)
├── nginx/
│   ├── nginx.conf          # Main nginx config
│   └── conf.d/erp.conf     # Domain config
└── frontend/ERP/
    └── .env.production     # Frontend config
```

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible at http://erp.hacksters.tech
- [ ] Can login with default credentials
- [ ] Changed default admin password
- [ ] SSL certificate installed (HTTPS working)
- [ ] DNS configured correctly
- [ ] All containers running and healthy
- [ ] Database backups scheduled
- [ ] Firewall configured
- [ ] Monitoring set up

---

## 🔗 Useful Links

- **Repository:** https://github.com/Blunistark/ERP-SIH
- **Application:** http://erp.hacksters.tech (or https after SSL)
- **API:** http://erp.hacksters.tech/api

---

## 📞 Need Help?

1. Check **DEPLOYMENT.md** for detailed instructions
2. Check **DOCKER.md** for Docker-specific help
3. Review logs: `docker compose logs -f`
4. Check service status: `docker compose ps`

---

**Last Updated:** October 3, 2025  
**Version:** 1.0.0
