#!/bin/bash

# Quick Start Script - Run this on your VM for first-time setup

set -e

echo "============================================"
echo "  School ERP System - Quick Start Setup"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo -e "${RED}Please do not run this script as root${NC}"
   exit 1
fi

echo -e "${YELLOW}This script will:${NC}"
echo "1. Install Docker and Docker Compose"
echo "2. Clone the repository"
echo "3. Configure the application"
echo "4. Deploy all services"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# Check if we're in the repository directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}Repository not found. Cloning from GitHub...${NC}"
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}Installing Git...${NC}"
        sudo apt update
        sudo apt install git -y
        echo -e "${GREEN}✓ Git installed${NC}"
    fi
    
    # Clone repository
    REPO_URL="https://github.com/Blunistark/ERP-SIH.git"
    REPO_DIR="ERP-SIH"
    
    if [ -d "$REPO_DIR" ]; then
        echo -e "${YELLOW}Directory $REPO_DIR already exists. Using it...${NC}"
        cd "$REPO_DIR"
        git pull origin main
    else
        echo -e "${YELLOW}Cloning repository...${NC}"
        git clone "$REPO_URL"
        cd "$REPO_DIR"
    fi
    
    echo -e "${GREEN}✓ Repository cloned${NC}"
    echo ""
fi

# Install Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    sudo apt install docker-compose-plugin -y
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Create .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.production.example .env
    
    # Generate secrets
    DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    # Update .env file
    sed -i "s/CHANGE_THIS_SECURE_PASSWORD/$DB_PASS/" .env
    sed -i "s/CHANGE_THIS_TO_A_VERY_LONG_RANDOM_STRING/$JWT_SECRET/" .env
    
    echo -e "${GREEN}✓ Environment file created with secure secrets${NC}"
    echo -e "${YELLOW}⚠️  Secrets saved in .env - keep this file secure!${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Create nginx directories
mkdir -p nginx/ssl nginx/logs

# Open firewall ports
echo -e "${YELLOW}Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    echo -e "${GREEN}✓ Firewall ports opened${NC}"
fi

# Build and start services
echo -e "${YELLOW}Building containers (this may take a few minutes)...${NC}"
docker compose build

echo -e "${YELLOW}Starting services...${NC}"
docker compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 15

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker compose exec -T app npx prisma migrate deploy

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✓ Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Configure DNS:"
echo "   Add A record: erp -> $(curl -s ifconfig.me)"
echo ""
echo "2. Wait for DNS propagation (5-60 minutes)"
echo ""
echo "3. Access your application:"
echo "   http://erp.hacksters.tech"
echo ""
echo "4. Default admin login:"
echo "   Email: admin@school.com"
echo "   Password: Admin@123"
echo "   ${RED}⚠️  Change this password immediately!${NC}"
echo ""
echo "5. Set up SSL (after DNS works):"
echo "   ./setup-ssl.sh"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:    docker compose logs -f"
echo "  Stop:         docker compose down"
echo "  Restart:      docker compose restart"
echo "  Status:       docker compose ps"
echo ""
