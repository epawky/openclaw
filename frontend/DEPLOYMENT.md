# AI COO for Shopify Stores - Complete VPS Deployment Guide

## Table of Contents

1. [Deployment Architecture Overview](#1-deployment-architecture-overview)
2. [Server Directory Structure](#2-server-directory-structure)
3. [Installation and Setup Steps](#3-installation-and-setup-steps)
4. [Environment Variable Files](#4-environment-variable-files)
5. [systemd Service Files](#5-systemd-service-files)
6. [Nginx Configuration](#6-nginx-configuration)
7. [SSL Setup with Certbot](#7-ssl-setup-with-certbot)
8. [Deployment and Update Workflow](#8-deployment-and-update-workflow)
9. [Health Check Workflow](#9-health-check-workflow)
10. [Security Checklist](#10-security-checklist)
11. [Quick Reference Commands](#11-quick-reference-commands)

---

## 1. Deployment Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼ :443 (HTTPS)
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX                                   │
│                   (Reverse Proxy + SSL)                         │
│                                                                 │
│   /              → localhost:3000 (Next.js)                     │
│   /api/*         → localhost:8000 (FastAPI)                     │
│   /_next/static  → localhost:3000 (cached)                      │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │    NEXT.JS        │       │    FASTAPI        │
        │  (systemd)        │       │  (systemd)        │
        │  127.0.0.1:3000   │       │  127.0.0.1:8000   │
        └───────────────────┘       └───────────────────┘
                                              │
                                              ▼
                                    ┌───────────────────┐
                                    │     SQLite        │
                                    │   /var/www/ai-coo │
                                    │   /data/app.db    │
                                    └───────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Uvicorn directly** (not Gunicorn) | For a demo VPS with modest load, uvicorn alone is sufficient and simpler. Gunicorn with uvicorn workers adds complexity only justified at higher scale. |
| **systemd over pm2** | Native to Ubuntu, no additional runtime, better integration with system logging and service management. |
| **No Docker** | Reduces complexity, easier debugging, appropriate for single-server demo. |
| **SQLite in dedicated data directory** | Separated from code for easier backups and proper permissions. |

---

## 2. Server Directory Structure

```
/var/www/ai-coo/
├── frontend/                    # Next.js application
│   ├── .next/                   # Build output
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── .env.local              # Frontend environment (production)
│   └── ...
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry
│   │   ├── routers/
│   │   ├── models/
│   │   └── ...
│   ├── venv/                   # Python virtual environment
│   ├── requirements.txt
│   ├── .env                    # Backend environment
│   └── ...
│
├── data/                        # Persistent data (SQLite, uploads)
│   ├── app.db                  # SQLite database
│   └── backups/                # Database backups
│
├── logs/                        # Application logs (optional, systemd handles most)
│   ├── frontend/
│   └── backend/
│
├── scripts/                     # Deployment and maintenance scripts
│   ├── deploy-frontend.sh
│   ├── deploy-backend.sh
│   ├── backup-db.sh
│   └── health-check.sh
│
└── shared/                      # Shared assets if needed
    └── .gitkeep
```

---

## 3. Installation and Setup Steps

### 3.1 Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    ufw \
    fail2ban \
    htop \
    unzip
```

### 3.2 Create Application User

```bash
# Create dedicated user for running the application
sudo useradd -r -m -d /var/www/ai-coo -s /bin/bash aicoo

# Create directory structure
sudo mkdir -p /var/www/ai-coo/{frontend,backend,data,logs,scripts,shared}
sudo mkdir -p /var/www/ai-coo/data/backups
sudo mkdir -p /var/www/ai-coo/logs/{frontend,backend}

# Set ownership
sudo chown -R aicoo:aicoo /var/www/ai-coo
```

### 3.3 Install Node.js (LTS)

```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

### 3.4 Install Python 3.11+

```bash
# Install Python and pip
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Verify installation
python3 --version  # Should show 3.10+ (Ubuntu 22.04) or 3.11+ (Ubuntu 24.04)
```

### 3.5 Install Nginx

```bash
sudo apt install -y nginx

# Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Verify
sudo systemctl status nginx
```

### 3.6 Install Certbot for SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3.7 Setup Python Virtual Environment

```bash
# Switch to app user
sudo -u aicoo bash

# Navigate to backend directory
cd /var/www/ai-coo/backend

# Create virtual environment
python3 -m venv venv

# Activate and upgrade pip
source venv/bin/activate
pip install --upgrade pip wheel setuptools

# Exit back to regular user
exit
```

---

## 4. Environment Variable Files

### 4.1 Frontend Environment File

**Location:** `/var/www/ai-coo/frontend/.env.local`

```bash
# =============================================================================
# AI COO Frontend - Production Environment
# =============================================================================

# API Configuration
# Empty because nginx proxies /api to backend on same origin
NEXT_PUBLIC_API_URL=

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false

# Application Settings
NEXT_PUBLIC_APP_NAME="AI COO"
NEXT_PUBLIC_DEFAULT_STORE_ID=production

# Build Settings (used at build time)
NODE_ENV=production
```

### 4.2 Backend Environment File

**Location:** `/var/www/ai-coo/backend/.env`

```bash
# =============================================================================
# AI COO Backend - Production Environment
# =============================================================================

# Application
APP_ENV=production
APP_NAME=ai-coo-backend
DEBUG=false

# Server
HOST=127.0.0.1
PORT=8000

# Database
DATABASE_PATH=/var/www/ai-coo/data/app.db

# Security
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALLOWED_ORIGINS=https://yourdomain.com

# API Keys (add as needed)
OPENAI_API_KEY=sk-your-openai-key-here

# Optional integrations
SLACK_WEBHOOK_URL=

# Logging
LOG_LEVEL=INFO
```

### 4.3 Backend Environment File for systemd

**Location:** `/var/www/ai-coo/backend/.env.systemd`

This is a systemd-compatible format (no quotes, no export):

```bash
APP_ENV=production
HOST=127.0.0.1
PORT=8000
DATABASE_PATH=/var/www/ai-coo/data/app.db
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALLOWED_ORIGINS=https://yourdomain.com
OPENAI_API_KEY=sk-your-openai-key-here
LOG_LEVEL=INFO
```

---

## 5. systemd Service Files

### 5.1 Frontend Service

**Location:** `/etc/systemd/system/ai-coo-frontend.service`

```ini
[Unit]
Description=AI COO Dashboard Frontend (Next.js)
Documentation=https://github.com/your-org/ai-coo
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=aicoo
Group=aicoo
WorkingDirectory=/var/www/ai-coo/frontend

# Environment
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1

# Start command
ExecStart=/usr/bin/node /var/www/ai-coo/frontend/.next/standalone/server.js

# Restart policy
Restart=on-failure
RestartSec=10
StartLimitIntervalSec=60
StartLimitBurst=3

# Logging (goes to journald)
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ai-coo-frontend

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/ai-coo/logs
PrivateTmp=true

# Resource limits
MemoryMax=512M
CPUQuota=80%

[Install]
WantedBy=multi-user.target
```

### 5.2 Backend Service

**Location:** `/etc/systemd/system/ai-coo-backend.service`

```ini
[Unit]
Description=AI COO Dashboard Backend (FastAPI)
Documentation=https://github.com/your-org/ai-coo
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=aicoo
Group=aicoo
WorkingDirectory=/var/www/ai-coo/backend

# Load environment from file
EnvironmentFile=/var/www/ai-coo/backend/.env.systemd

# Start command - uvicorn directly (appropriate for demo VPS)
ExecStart=/var/www/ai-coo/backend/venv/bin/uvicorn \
    app.main:app \
    --host 127.0.0.1 \
    --port 8000 \
    --workers 2 \
    --loop uvloop \
    --http httptools \
    --log-level info \
    --access-log

# Restart policy
Restart=on-failure
RestartSec=10
StartLimitIntervalSec=60
StartLimitBurst=3

# Logging (goes to journald)
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ai-coo-backend

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/ai-coo/data
ReadWritePaths=/var/www/ai-coo/logs
PrivateTmp=true

# Resource limits
MemoryMax=1G
CPUQuota=80%

[Install]
WantedBy=multi-user.target
```

### 5.3 Enable Services

```bash
# Reload systemd to recognize new services
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable ai-coo-frontend
sudo systemctl enable ai-coo-backend

# Start services
sudo systemctl start ai-coo-backend
sudo systemctl start ai-coo-frontend

# Check status
sudo systemctl status ai-coo-frontend
sudo systemctl status ai-coo-backend
```

---

## 6. Nginx Configuration

### 6.1 Main Site Configuration

**Location:** `/etc/nginx/sites-available/ai-coo`

```nginx
# =============================================================================
# AI COO Dashboard - Nginx Configuration
# =============================================================================

# Upstream definitions
upstream frontend_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream backend_upstream {
    server 127.0.0.1:8000;
    keepalive 64;
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;

    # Allow Let's Encrypt challenges
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL protocols
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/ai-coo.access.log;
    error_log /var/log/nginx/ai-coo.error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rss+xml
        application/vnd.geo+json
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/bmp
        image/svg+xml
        image/x-icon
        text/cache-manifest
        text/css
        text/plain
        text/vcard
        text/vnd.rim.location.xloc
        text/vtt
        text/x-component
        text/x-cross-domain-policy;

    # Client body size (for file uploads if needed)
    client_max_body_size 10M;

    # ==========================================================================
    # API Routes -> FastAPI Backend
    # ==========================================================================
    location /api/ {
        # Rate limiting for API
        limit_req zone=api_limit burst=20 nodelay;

        # Remove /api prefix when proxying
        rewrite ^/api/(.*) /$1 break;

        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # Connection settings
        proxy_set_header Connection "";
        proxy_cache_bypass $http_upgrade;

        # Timeouts (longer for AI operations)
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Health check endpoint (direct to backend, no /api prefix strip)
    location = /health {
        proxy_pass http://backend_upstream/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # No caching for health checks
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # ==========================================================================
    # Next.js Static Assets (with aggressive caching)
    # ==========================================================================
    location /_next/static/ {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Cache for 1 year (these are content-hashed)
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ==========================================================================
    # Public Static Files
    # ==========================================================================
    location /favicon.ico {
        root /var/www/ai-coo/frontend/public;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    location /robots.txt {
        root /var/www/ai-coo/frontend/public;
        expires 7d;
        add_header Cache-Control "public";
        access_log off;
    }

    # ==========================================================================
    # All Other Routes -> Next.js Frontend
    # ==========================================================================
    location / {
        # Rate limiting
        limit_req zone=general_limit burst=50 nodelay;

        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;

        # WebSocket support (for HMR in dev, future real-time features)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        # No caching for HTML pages
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 6.2 Enable Nginx Configuration

```bash
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/ai-coo /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

---

## 7. SSL Setup with Certbot

### 7.1 Initial Certificate Acquisition

```bash
# Ensure DNS is pointing to your server first, then:
sudo certbot --nginx -d yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

### 7.2 Verify Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Check certbot timer
sudo systemctl status certbot.timer
```

### 7.3 Manual Renewal (if needed)

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 8. Deployment and Update Workflow

### 8.1 Frontend Deployment Script

**Location:** `/var/www/ai-coo/scripts/deploy-frontend.sh`

```bash
#!/bin/bash
# =============================================================================
# AI COO Frontend Deployment Script
# =============================================================================

set -e

DEPLOY_DIR="/var/www/ai-coo/frontend"
BACKUP_DIR="/var/www/ai-coo/backups/frontend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================="
echo "AI COO Frontend Deployment"
echo "Started: $(date)"
echo "========================================="

# Navigate to frontend directory
cd "$DEPLOY_DIR"

# Create backup of current build
if [ -d ".next" ]; then
    echo "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/frontend_$TIMESTAMP.tar.gz" .next/

    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
fi

# Pull latest code (if using git)
echo "Pulling latest code..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Build application
echo "Building application..."
npm run build

# Copy static files to standalone build
echo "Preparing standalone build..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# Restart service
echo "Restarting frontend service..."
sudo systemctl restart ai-coo-frontend

# Wait for service to start
sleep 3

# Verify service is running
if sudo systemctl is-active --quiet ai-coo-frontend; then
    echo "Frontend service started successfully"
else
    echo "ERROR: Frontend service failed to start"
    sudo journalctl -u ai-coo-frontend -n 20 --no-pager
    exit 1
fi

echo "========================================="
echo "Deployment completed: $(date)"
echo "========================================="
```

### 8.2 Backend Deployment Script

**Location:** `/var/www/ai-coo/scripts/deploy-backend.sh`

```bash
#!/bin/bash
# =============================================================================
# AI COO Backend Deployment Script
# =============================================================================

set -e

DEPLOY_DIR="/var/www/ai-coo/backend"
BACKUP_DIR="/var/www/ai-coo/backups/backend"
DATA_DIR="/var/www/ai-coo/data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================="
echo "AI COO Backend Deployment"
echo "Started: $(date)"
echo "========================================="

# Navigate to backend directory
cd "$DEPLOY_DIR"

# Backup database before deployment
if [ -f "$DATA_DIR/app.db" ]; then
    echo "Backing up database..."
    mkdir -p "$BACKUP_DIR"
    cp "$DATA_DIR/app.db" "$BACKUP_DIR/app_$TIMESTAMP.db"

    # Keep only last 10 database backups
    ls -t "$BACKUP_DIR"/*.db 2>/dev/null | tail -n +11 | xargs -r rm
fi

# Pull latest code (if using git)
echo "Pulling latest code..."
git pull origin main

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --upgrade

# Run database migrations (if using alembic)
# echo "Running migrations..."
# alembic upgrade head

# Restart service
echo "Restarting backend service..."
sudo systemctl restart ai-coo-backend

# Wait for service to start
sleep 3

# Verify service is running
if sudo systemctl is-active --quiet ai-coo-backend; then
    echo "Backend service started successfully"
else
    echo "ERROR: Backend service failed to start"
    sudo journalctl -u ai-coo-backend -n 20 --no-pager
    exit 1
fi

# Health check
echo "Running health check..."
sleep 2
if curl -sf http://127.0.0.1:8000/health > /dev/null; then
    echo "Health check passed"
else
    echo "WARNING: Health check failed"
fi

echo "========================================="
echo "Deployment completed: $(date)"
echo "========================================="
```

### 8.3 Database Backup Script

**Location:** `/var/www/ai-coo/scripts/backup-db.sh`

```bash
#!/bin/bash
# =============================================================================
# AI COO Database Backup Script
# =============================================================================

DATA_DIR="/var/www/ai-coo/data"
BACKUP_DIR="/var/www/ai-coo/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

if [ -f "$DATA_DIR/app.db" ]; then
    # Create backup using SQLite online backup
    sqlite3 "$DATA_DIR/app.db" ".backup '$BACKUP_DIR/app_$TIMESTAMP.db'"

    # Compress the backup
    gzip "$BACKUP_DIR/app_$TIMESTAMP.db"

    echo "Backup created: $BACKUP_DIR/app_$TIMESTAMP.db.gz"

    # Remove backups older than retention period
    find "$BACKUP_DIR" -name "*.db.gz" -mtime +$RETENTION_DAYS -delete

    echo "Old backups cleaned up"
else
    echo "No database file found at $DATA_DIR/app.db"
    exit 1
fi
```

### 8.4 Health Check Script

**Location:** `/var/www/ai-coo/scripts/health-check.sh`

```bash
#!/bin/bash
# =============================================================================
# AI COO Health Check Script
# =============================================================================

echo "========================================="
echo "AI COO Health Check"
echo "Time: $(date)"
echo "========================================="

# Check systemd services
echo ""
echo "Service Status:"
echo "---------------"

check_service() {
    local service=$1
    if sudo systemctl is-active --quiet "$service"; then
        echo "✓ $service: running"
    else
        echo "✗ $service: NOT running"
        return 1
    fi
}

check_service "ai-coo-frontend"
FRONTEND_STATUS=$?

check_service "ai-coo-backend"
BACKEND_STATUS=$?

check_service "nginx"
NGINX_STATUS=$?

# Check HTTP endpoints
echo ""
echo "HTTP Endpoints:"
echo "---------------"

check_endpoint() {
    local name=$1
    local url=$2
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url")
    if [ "$response" = "200" ]; then
        echo "✓ $name: HTTP $response"
    else
        echo "✗ $name: HTTP $response"
        return 1
    fi
}

check_endpoint "Frontend (local)" "http://127.0.0.1:3000/"
check_endpoint "Backend health (local)" "http://127.0.0.1:8000/health"
check_endpoint "Frontend (nginx)" "http://localhost/"
check_endpoint "API health (nginx)" "http://localhost/api/health"

# Check disk space
echo ""
echo "Disk Usage:"
echo "-----------"
df -h /var/www/ai-coo | tail -1 | awk '{print "Used: " $3 " / " $2 " (" $5 " full)"}'

# Check memory
echo ""
echo "Memory Usage:"
echo "-------------"
free -h | grep Mem | awk '{print "Used: " $3 " / " $2}'

# Check database
echo ""
echo "Database:"
echo "---------"
if [ -f "/var/www/ai-coo/data/app.db" ]; then
    DB_SIZE=$(du -h /var/www/ai-coo/data/app.db | cut -f1)
    echo "✓ Database exists: $DB_SIZE"
else
    echo "✗ Database not found"
fi

echo ""
echo "========================================="

# Exit with error if any service is down
if [ $FRONTEND_STATUS -ne 0 ] || [ $BACKEND_STATUS -ne 0 ] || [ $NGINX_STATUS -ne 0 ]; then
    exit 1
fi
```

### 8.5 Make Scripts Executable

```bash
sudo chmod +x /var/www/ai-coo/scripts/*.sh
sudo chown aicoo:aicoo /var/www/ai-coo/scripts/*.sh
```

### 8.6 Allow Passwordless Sudo for Service Restart

Create a sudoers file for the deploy user:

```bash
# Create sudoers file
sudo visudo -f /etc/sudoers.d/aicoo
```

Add the following content:

```
# Allow aicoo user to restart specific services without password
aicoo ALL=(ALL) NOPASSWD: /bin/systemctl restart ai-coo-frontend
aicoo ALL=(ALL) NOPASSWD: /bin/systemctl restart ai-coo-backend
aicoo ALL=(ALL) NOPASSWD: /bin/systemctl status ai-coo-frontend
aicoo ALL=(ALL) NOPASSWD: /bin/systemctl status ai-coo-backend
aicoo ALL=(ALL) NOPASSWD: /bin/systemctl is-active ai-coo-frontend
aicoo ALL=(ALL) NOPASSWD: /bin/systemctl is-active ai-coo-backend
```

### 8.7 Deployment Checklist

#### Initial Deployment

- [ ] Server provisioned with Ubuntu 20.04+
- [ ] DNS pointing to server IP
- [ ] SSH access configured
- [ ] Application user `aicoo` created
- [ ] Directory structure created
- [ ] Node.js installed
- [ ] Python + venv installed
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained
- [ ] Environment files created
- [ ] systemd services installed and enabled
- [ ] Scripts deployed and executable
- [ ] Firewall configured
- [ ] Health check passing

#### Code Update Deployment

- [ ] SSH to server
- [ ] Run `deploy-backend.sh` (if backend changed)
- [ ] Run `deploy-frontend.sh` (if frontend changed)
- [ ] Verify health check passing
- [ ] Check logs for errors
- [ ] Test application manually

---

## 9. Health Check Workflow

### 9.1 Backend Health Endpoint

Ensure your FastAPI app has a health endpoint:

```python
# app/main.py or app/routers/health.py

from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("APP_ENV", "unknown"),
        "version": "1.0.0"
    }

@router.get("/health/ready")
async def readiness_check():
    """Readiness check - verifies dependencies."""
    # Add database check, external service checks, etc.
    db_path = os.getenv("DATABASE_PATH", "")
    db_exists = os.path.exists(db_path) if db_path else False

    return {
        "ready": db_exists,
        "checks": {
            "database": "ok" if db_exists else "missing"
        }
    }
```

### 9.2 Monitoring Commands

```bash
# Quick service status
sudo systemctl status ai-coo-frontend ai-coo-backend nginx

# View recent logs
sudo journalctl -u ai-coo-frontend -n 50
sudo journalctl -u ai-coo-backend -n 50

# Follow logs in real-time
sudo journalctl -u ai-coo-backend -f

# Check nginx logs
sudo tail -f /var/log/nginx/ai-coo.access.log
sudo tail -f /var/log/nginx/ai-coo.error.log

# Run health check script
/var/www/ai-coo/scripts/health-check.sh
```

### 9.3 Setup Cron for Automated Health Checks

```bash
# Edit crontab for aicoo user
sudo -u aicoo crontab -e

# Add these lines:
# Health check every 5 minutes
*/5 * * * * /var/www/ai-coo/scripts/health-check.sh >> /var/www/ai-coo/logs/health-check.log 2>&1

# Database backup daily at 3 AM
0 3 * * * /var/www/ai-coo/scripts/backup-db.sh >> /var/www/ai-coo/logs/backup.log 2>&1
```

---

## 10. Security Checklist

### 10.1 Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### 10.2 Fail2Ban Configuration

```bash
# Fail2ban is already installed, verify it's running
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo systemctl status fail2ban
```

### 10.3 File Permissions Summary

```bash
# Application directories - owned by aicoo
sudo chown -R aicoo:aicoo /var/www/ai-coo

# Restrict permissions
sudo chmod 750 /var/www/ai-coo
sudo chmod 750 /var/www/ai-coo/frontend
sudo chmod 750 /var/www/ai-coo/backend
sudo chmod 700 /var/www/ai-coo/data
sudo chmod 700 /var/www/ai-coo/scripts

# Environment files - readable only by owner
sudo chmod 600 /var/www/ai-coo/backend/.env
sudo chmod 600 /var/www/ai-coo/backend/.env.systemd
sudo chmod 600 /var/www/ai-coo/frontend/.env.local

# Database file
sudo chmod 600 /var/www/ai-coo/data/app.db 2>/dev/null || true
```

### 10.4 Security Checklist

| Item | Status |
|------|--------|
| SSH: Key-based authentication only (disable password auth) | [ ] |
| Firewall: Only ports 22, 80, 443 open | [ ] |
| Services bind to localhost: Backend on 127.0.0.1:8000, Frontend on 127.0.0.1:3000 | [ ] |
| Nginx as reverse proxy: Public traffic only through nginx | [ ] |
| SSL/TLS: HTTPS enforced with valid certificates | [ ] |
| Environment files: Readable only by application user | [ ] |
| Database: In protected directory, not in web root | [ ] |
| No secrets in code: All secrets in environment files | [ ] |
| Regular updates: System packages kept up to date | [ ] |
| Fail2ban: Enabled for SSH protection | [ ] |
| Non-root services: Application runs as `aicoo` user | [ ] |

### 10.5 SQLite Considerations

| Consideration | Details |
|---------------|---------|
| **Single-writer limitation** | SQLite allows only one write at a time. For a demo, this is fine. For production scale, migrate to PostgreSQL. |
| **File location** | Keep database outside of web-accessible directories (`/var/www/ai-coo/data/`, not `/var/www/ai-coo/frontend/public/`) |
| **Backups** | Regular automated backups are critical since SQLite is a single file |
| **Write-ahead logging** | Enable WAL mode for better concurrency (see below) |
| **File permissions** | Database file should be readable/writable only by the application user |

**Enable WAL mode in your database initialization:**

```python
import sqlite3
conn = sqlite3.connect(database_path)
conn.execute("PRAGMA journal_mode=WAL")
```

---

## 11. Quick Reference Commands

### Service Management

```bash
# Start services
sudo systemctl start ai-coo-frontend ai-coo-backend

# Stop services
sudo systemctl stop ai-coo-frontend ai-coo-backend

# Restart services
sudo systemctl restart ai-coo-frontend ai-coo-backend

# Check status
sudo systemctl status ai-coo-frontend ai-coo-backend

# View logs
sudo journalctl -u ai-coo-backend -f
sudo journalctl -u ai-coo-frontend -f
```

### Deployment

```bash
# Deploy frontend
sudo -u aicoo /var/www/ai-coo/scripts/deploy-frontend.sh

# Deploy backend
sudo -u aicoo /var/www/ai-coo/scripts/deploy-backend.sh

# Health check
/var/www/ai-coo/scripts/health-check.sh
```

### Nginx

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/ai-coo.access.log
```

### SSL

```bash
# Renew certificates
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

### Database

```bash
# Manual backup
/var/www/ai-coo/scripts/backup-db.sh

# Access SQLite database
sqlite3 /var/www/ai-coo/data/app.db

# Check database size
du -h /var/www/ai-coo/data/app.db
```

### Troubleshooting

```bash
# Check what's listening on ports
sudo ss -tlnp | grep -E ':(80|443|3000|8000)'

# Check disk space
df -h

# Check memory
free -h

# Check CPU/processes
htop

# Check recent system logs
sudo journalctl -xe
```

---

## Appendix: File Locations Summary

| File | Location |
|------|----------|
| Frontend code | `/var/www/ai-coo/frontend/` |
| Backend code | `/var/www/ai-coo/backend/` |
| SQLite database | `/var/www/ai-coo/data/app.db` |
| Database backups | `/var/www/ai-coo/data/backups/` |
| Frontend env | `/var/www/ai-coo/frontend/.env.local` |
| Backend env | `/var/www/ai-coo/backend/.env` |
| Backend env (systemd) | `/var/www/ai-coo/backend/.env.systemd` |
| Frontend service | `/etc/systemd/system/ai-coo-frontend.service` |
| Backend service | `/etc/systemd/system/ai-coo-backend.service` |
| Nginx config | `/etc/nginx/sites-available/ai-coo` |
| Nginx logs | `/var/log/nginx/ai-coo.*.log` |
| SSL certificates | `/etc/letsencrypt/live/yourdomain.com/` |
| Deployment scripts | `/var/www/ai-coo/scripts/` |
| Application logs | `/var/www/ai-coo/logs/` |
