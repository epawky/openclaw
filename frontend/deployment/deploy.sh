#!/bin/bash
# AI COO Dashboard - Deployment Script
# Run from the frontend directory: ./deployment/deploy.sh

set -e

# Configuration
SERVER_USER="${DEPLOY_USER:-www-data}"
SERVER_HOST="${DEPLOY_HOST:-your-server.com}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/ai-coo}"

echo "========================================="
echo "AI COO Dashboard - Deployment Script"
echo "========================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "Error: .env.production not found"
    echo "Create .env.production from .env.example before deploying"
    exit 1
fi

echo ""
echo "Step 1: Installing dependencies..."
npm ci

echo ""
echo "Step 2: Building application..."
npm run build

echo ""
echo "Step 3: Preparing standalone build..."

# Create deployment package
DEPLOY_DIR=".deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy standalone build
cp -r .next/standalone/* $DEPLOY_DIR/

# Copy public folder
cp -r public $DEPLOY_DIR/

# Copy static files
mkdir -p $DEPLOY_DIR/.next
cp -r .next/static $DEPLOY_DIR/.next/

# Copy environment file
cp .env.production $DEPLOY_DIR/.env.production

echo ""
echo "Step 4: Creating deployment archive..."
tar -czf ai-coo-frontend.tar.gz -C $DEPLOY_DIR .

echo ""
echo "Build complete!"
echo ""
echo "To deploy to server, run:"
echo ""
echo "  scp ai-coo-frontend.tar.gz ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/"
echo ""
echo "Then on the server:"
echo ""
echo "  cd ${DEPLOY_PATH}/frontend"
echo "  tar -xzf ../ai-coo-frontend.tar.gz"
echo "  sudo systemctl restart ai-coo-frontend"
echo ""

# Cleanup
rm -rf $DEPLOY_DIR

echo "Done!"
