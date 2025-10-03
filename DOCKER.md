# 🐳 Docker Deployment

This directory contains all files needed for containerized deployment of the School ERP system.

## Quick Start

```bash
# 1. Run the quick start script
chmod +x quick-start.sh
./quick-start.sh

# 2. Configure your DNS
# Add A record: erp.hacksters.tech -> YOUR_VM_IP

# 3. Wait for DNS propagation, then access
# http://erp.hacksters.tech

# 4. Set up SSL
chmod +x setup-ssl.sh
./setup-ssl.sh
```

## Directory Structure

```
.
├── Dockerfile                  # Backend container
├── docker-compose.yml          # Orchestration
├── deploy.sh                   # Deployment script
├── quick-start.sh              # First-time setup
├── setup-ssl.sh                # SSL certificate setup
├── .env.production.example     # Environment template
├── nginx/
│   ├── nginx.conf              # Main nginx config
│   ├── conf.d/
│   │   └── erp.conf            # Domain configuration
│   ├── ssl/                    # SSL certificates (generated)
│   └── logs/                   # Nginx logs
└── frontend/ERP/
    ├── Dockerfile              # Frontend container
    ├── nginx.conf              # Frontend nginx config
    └── .env.production         # Frontend environment
```

## Services

The deployment includes these containerized services:

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| PostgreSQL | erp-postgres | 5432 | Database |
| Backend API | school-erp-backend | 3000 | Express.js API |
| Frontend | erp-frontend | 80 | React SPA |
| Nginx | erp-nginx | 80, 443 | Reverse proxy |
| Redis | school-erp-redis | 6379 | Caching (optional) |

## Environment Variables

### Backend (.env)
```env
DB_USER=school_admin
DB_PASSWORD=your_secure_password
DB_NAME=school_erp
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://erp.hacksters.tech/api
```

## Commands

### Deployment
```bash
# Deploy/update application
./deploy.sh

# Quick first-time setup
./quick-start.sh

# Set up SSL
./setup-ssl.sh
```

### Docker Compose
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild specific service
docker compose build app
docker compose up -d app

# Check status
docker compose ps

# Execute command in container
docker compose exec app npm run <command>
```

### Maintenance
```bash
# Database backup
docker compose exec postgres pg_dump -U school_admin school_erp > backup.sql

# Database restore
docker compose exec -T postgres psql -U school_admin school_erp < backup.sql

# View logs
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f nginx

# Restart service
docker compose restart app

# Clean up
docker compose down
docker image prune -a
docker volume prune
```

## Domain Configuration

### DNS Setup
Add this A record to your DNS:

```
Type: A
Name: erp
Value: YOUR_VM_IP
TTL: 3600
```

### Subdomain Options
You can use any subdomain:
- `erp.hacksters.tech` (recommended)
- `school.hacksters.tech`
- `admin.hacksters.tech`

Just update the `server_name` in `nginx/conf.d/erp.conf`.

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

```bash
# Run SSL setup script
./setup-ssl.sh

# Or manually:
sudo certbot certonly --standalone \
  -d erp.hacksters.tech \
  --email your-email@hacksters.tech \
  --agree-tos
```

### Certificate Renewal

Certificates expire in 90 days. Set up auto-renewal:

```bash
# Add to crontab
sudo crontab -e

# Add this line
0 0 * * * certbot renew --quiet --deploy-hook "docker compose -f /opt/ERP-SIH/docker-compose.yml restart nginx"
```

## Monitoring

### Health Checks

```bash
# Application
curl http://erp.hacksters.tech/health

# API
curl http://erp.hacksters.tech/api/health

# Container health
docker compose ps
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

## Troubleshooting

### Application not accessible
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
```

### Database issues
```bash
# Check database
docker compose exec postgres pg_isready -U school_admin

# Access database
docker compose exec postgres psql -U school_admin -d school_erp

# View logs
docker compose logs postgres
```

### Out of memory
```bash
# Add swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong database password
- [ ] Use secure JWT secret (64+ characters)
- [ ] Enable HTTPS with SSL
- [ ] Configure firewall (ufw)
- [ ] Regular database backups
- [ ] Keep Docker images updated
- [ ] Monitor logs regularly

## Production Recommendations

1. **Use SSL/HTTPS** - Always use HTTPS in production
2. **Regular Backups** - Automated daily database backups
3. **Monitoring** - Set up monitoring (e.g., Uptime Kuma, Prometheus)
4. **Logs** - Centralized logging (e.g., ELK stack)
5. **Scaling** - Use Docker Swarm or Kubernetes for multi-node
6. **CDN** - Use CDN for static assets (e.g., Cloudflare)

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## License

Proprietary - School ERP System
