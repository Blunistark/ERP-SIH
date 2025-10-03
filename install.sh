#!/bin/bash

# One-liner installation script for School ERP System
# Usage: wget -qO- https://raw.githubusercontent.com/Blunistark/ERP-SIH/main/install.sh | bash

set -e

echo "============================================"
echo "  School ERP System - Installer"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo "Please do not run this script as root"
   exit 1
fi

# Install Git if needed
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    sudo apt update
    sudo apt install git -y
fi

# Clone repository
REPO_URL="https://github.com/Blunistark/ERP-SIH.git"
REPO_DIR="$HOME/ERP-SIH"

if [ -d "$REPO_DIR" ]; then
    echo "Updating existing repository..."
    cd "$REPO_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    git clone "$REPO_URL" "$REPO_DIR"
    cd "$REPO_DIR"
fi

# Make scripts executable
chmod +x quick-start.sh deploy.sh setup-ssl.sh

echo ""
echo "✓ Repository downloaded to: $REPO_DIR"
echo ""
echo "Next steps:"
echo "  cd $REPO_DIR"
echo "  ./quick-start.sh"
echo ""
