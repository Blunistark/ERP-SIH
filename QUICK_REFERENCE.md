# 🚀 Quick Deployment Reference Card

## One-Command Deployment on VM

```bash
wget https://raw.githubusercontent.com/Blunistark/ERP-SIH/main/quick-start.sh && chmod +x quick-start.sh && ./quick-start.sh
```

## DNS Configuration

**Add this A record to hacksters.tech:**
```
Type: A
Name: erp
Value: YOUR_VM_IP
TTL: 3600
```

## Your URLs

- **Application:** http://erp.hacksters.tech (HTTP) → https://erp.hacksters.tech (after SSL)
- **API:** http://erp.hacksters.tech/api
- **Health Check:** http://erp.hacksters.tech/health

## Default Admin Login

```
Email: admin@school.com
Password: Admin@123
```
⚠️ **Change immediately after first login!**

## Essential Commands

```bash
# Deploy
./deploy.sh

# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Status
docker compose ps

# Setup SSL
./setup-ssl.sh
```

## Support Files

- 📖 **DEPLOYMENT.md** - Complete step-by-step guide
- 🐳 **DOCKER.md** - Docker commands and tips
- 📝 **DEPLOYMENT_SUMMARY.md** - Overview and architecture

## Architecture

```
Internet → Nginx (:80,:443) → Frontend (:80) + Backend (:3000) → PostgreSQL (:5432)
```

## Deployment Checklist

- [ ] VM prepared (Ubuntu 20.04+, 2GB+ RAM)
- [ ] Docker installed
- [ ] Repository cloned
- [ ] .env file configured
- [ ] DNS A record added
- [ ] Services deployed (./deploy.sh)
- [ ] Application accessible
- [ ] SSL certificate obtained
- [ ] HTTPS enabled
- [ ] Default password changed
- [ ] Backups scheduled

---

**Your Application:** https://erp.hacksters.tech  
**Repository:** https://github.com/Blunistark/ERP-SIH  
**Tech Stack:** React + Express + PostgreSQL + Docker + Nginx
