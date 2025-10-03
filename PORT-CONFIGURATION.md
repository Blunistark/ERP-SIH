# 🔌 Port Configuration

Due to port conflicts with n### Production Option (Recommended)
Configure your domain to point to the VM, then use HTTPS on port 8443:
```
https://erp.hacksters.tech:8443
```

**Note:** Standard HTTPS port 443 is used by n8n. You can either:
- Use port 8443 for ERP
- Or set up a reverse proxy to route both services on standard ports ERP system uses custom ports:

## 📊 Port Mapping

| Service | External Port | Internal Port | Purpose |
|---------|--------------|---------------|---------|
| **Nginx (HTTP)** | **8080** | 80 | Main web access |
| **Nginx (HTTPS)** | **8443** | 443 | SSL/TLS access |
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
https://YOUR_VM_IP:8443
# Or with domain (requires DNS + SSL):
https://erp.hacksters.tech:8443
```

## 🔧 Why Port 8080?

Port 80 is already in use by your n8n installation, so we use port 8080 for HTTP access.

**Options:**

### Option A: Keep Both Services (Current Setup)
- n8n: Port 80 and 443
- ERP: Port 8080 (HTTP) and 8443 (HTTPS)
- Access ERP at: `http://YOUR_VM_IP:8080` or `https://YOUR_VM_IP:8443`

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
# HTTP: http://YOUR_VM_IP:8080
# HTTPS: https://YOUR_VM_IP:8443 (after SSL)
```

## 🔐 SSL Setup Note

The setup-ssl.sh script will get SSL certificates. After setup:
- Access via HTTPS at: `https://YOUR_VM_IP:8443`

**Port 8443 doesn't conflict with n8n**, so no need to stop n8n for SSL setup.

## 💡 Best Practice

For production with both services running:

1. Run `./setup-ssl.sh` (no need to stop n8n)
2. Update nginx config for HTTPS
3. Restart services
4. Access ERP at: `https://YOUR_VM_IP:8443` or `https://erp.hacksters.tech:8443`
5. Access n8n at: `https://n8n.pipfactor.com` (your existing setup)

---

**Current Status:**
- ✅ PostgreSQL: Port 5433 (no conflict)
- ✅ HTTP: Port 8080 (no conflict)
- ✅ HTTPS: Port 8443 (no conflict)
- ✅ All services can run together without stopping n8n
