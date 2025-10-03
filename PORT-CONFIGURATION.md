# 🔌 Port Configuration

Due to port conflicts with n8n, the ERP system uses custom ports:

## 📊 Port Mapping

| Service | External Port | Internal Port | Purpose |
|---------|--------------|---------------|---------|
| **Nginx (HTTP)** | **8080** | 80 | Main web access |
| **Nginx (HTTPS)** | **443** | 443 | SSL/TLS access |
| PostgreSQL | 5433 | 5432 | Database |
| Backend API | (internal) | 3000 | API server |
| Frontend | (internal) | 80 | React app |
| Redis | 6379 | 6379 | Cache |

## 🌐 Access URLs

### Before SSL Setup (HTTP only)
```
http://YOUR_VM_IP:8080
```

### After SSL Setup (HTTPS)
```
https://erp.hacksters.tech
```

## 🔧 Why Port 8080?

Port 80 is already in use by your n8n installation, so we use port 8080 for HTTP access.

**Options:**

### Option A: Keep Both Services (Current Setup)
- n8n: Port 80
- ERP: Port 8080 (HTTP) and 443 (HTTPS)
- Access ERP at: `http://YOUR_VM_IP:8080`

### Option B: Use Nginx Proxy for Both
Set up a main Nginx reverse proxy to route:
- `n8n.hacksters.tech` → n8n (port 80)
- `erp.hacksters.tech` → ERP (port 8080)

## 📝 DNS Configuration

Since you're using port 8080, you have two options:

### Simple Option (Current)
Just use IP with port for testing:
```
http://YOUR_VM_IP:8080
```

### Production Option (Recommended)
Configure your domain to point to the VM, then use HTTPS on port 443:
```
https://erp.hacksters.tech
```

Port 443 (HTTPS) doesn't conflict, so once SSL is set up, you can access via the clean domain name.

## 🚀 Quick Access

```bash
# Check if services are running
docker compose ps

# Access application
# Before SSL: http://YOUR_VM_IP:8080
# After SSL: https://erp.hacksters.tech
```

## 🔐 SSL Setup Note

The setup-ssl.sh script will:
1. Stop nginx temporarily
2. Use certbot on port 80 (will temporarily conflict)
3. Get certificate
4. Configure HTTPS on port 443

**Before running SSL setup:**
- Stop n8n temporarily: `sudo systemctl stop n8n` (or docker stop if n8n is containerized)
- Run SSL setup
- Restart n8n
- After SSL, access ERP on port 443 (HTTPS) which doesn't conflict

## 💡 Best Practice

For production, use HTTPS (port 443) which doesn't conflict with n8n:

1. Stop n8n temporarily
2. Run `./setup-ssl.sh`
3. Update nginx config for HTTPS
4. Restart services
5. Restart n8n
6. Access ERP at: `https://erp.hacksters.tech`
7. Access n8n at: `http://YOUR_VM_IP` or configure n8n subdomain

---

**Current Status:**
- ✅ PostgreSQL: Port 5433 (no conflict)
- ✅ HTTP: Port 8080 (no conflict)
- ✅ HTTPS: Port 443 (no conflict)
- ⚠️ SSL setup requires temporary stop of n8n
