# AI COO Dashboard - VPS Deployment Guide

This guide covers deploying the AI COO dashboard on a VPS running Ubuntu with Nginx as a reverse proxy.

## Prerequisites

- Ubuntu 20.04+ VPS
- Node.js 18+ installed
- Nginx installed
- Domain/subdomain pointing to the server
- FastAPI backend running on the same server

## Directory Structure on Server

```
/var/www/ai-coo/
├── frontend/           # Next.js standalone build
│   ├── .next/
│   │   └── standalone/
│   ├── public/
│   └── .env.production
├── backend/            # FastAPI application
│   ├── app/
│   ├── requirements.txt
│   └── .env
└── logs/
    ├── frontend.log
    └── backend.log
```

## Environment Variables

### Frontend (.env.production)

```bash
# API is served by nginx at /api, no base URL needed
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_APP_NAME="AI COO"
NEXT_PUBLIC_DEFAULT_STORE_ID=your-store-id
```

### Backend (.env)

```bash
DATABASE_URL=sqlite:///./data/shopify_data.db
OPENAI_API_KEY=your-key-here
ENVIRONMENT=production
```

## Build Process

### 1. Build the Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build for production (standalone mode)
npm run build

# The standalone build will be in .next/standalone/
```

### 2. Deploy to Server

```bash
# Create directory structure
sudo mkdir -p /var/www/ai-coo/frontend
sudo mkdir -p /var/www/ai-coo/logs

# Copy standalone build
scp -r .next/standalone/* user@server:/var/www/ai-coo/frontend/

# Copy public and static files
scp -r public user@server:/var/www/ai-coo/frontend/
scp -r .next/static user@server:/var/www/ai-coo/frontend/.next/

# Copy environment file
scp .env.production user@server:/var/www/ai-coo/frontend/.env.production
```

## Systemd Service Files

### Frontend Service

See `ai-coo-frontend.service` in this directory.

Install:
```bash
sudo cp ai-coo-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ai-coo-frontend
sudo systemctl start ai-coo-frontend
```

### Backend Service

See `ai-coo-backend.service` in this directory.

Install:
```bash
sudo cp ai-coo-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ai-coo-backend
sudo systemctl start ai-coo-backend
```

## Nginx Configuration

See `nginx.conf` in this directory.

Install:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/ai-coo
sudo ln -s /etc/nginx/sites-available/ai-coo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Service Management

```bash
# Check status
sudo systemctl status ai-coo-frontend
sudo systemctl status ai-coo-backend

# View logs
sudo journalctl -u ai-coo-frontend -f
sudo journalctl -u ai-coo-backend -f

# Restart services
sudo systemctl restart ai-coo-frontend
sudo systemctl restart ai-coo-backend
```

## Updating the Application

```bash
# Frontend
cd /var/www/ai-coo/frontend
# Pull new code or upload new build
sudo systemctl restart ai-coo-frontend

# Backend
cd /var/www/ai-coo/backend
# Pull new code
pip install -r requirements.txt
sudo systemctl restart ai-coo-backend
```

## CORS Considerations

Since nginx acts as a reverse proxy:
- Frontend is served at `/`
- Backend API is served at `/api/`
- Both appear to be on the same origin, so CORS is not an issue
- The FastAPI backend should still allow the origin for direct testing

## Troubleshooting

### Frontend not starting
```bash
# Check if port 3000 is in use
sudo lsof -i :3000

# Check logs
sudo journalctl -u ai-coo-frontend -n 50
```

### Backend not responding
```bash
# Check if port 8000 is in use
sudo lsof -i :8000

# Check logs
sudo journalctl -u ai-coo-backend -n 50
```

### Nginx errors
```bash
# Test configuration
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log
```

## Health Checks

- Frontend: `curl http://localhost:3000/`
- Backend: `curl http://localhost:8000/health`
- Via nginx: `curl https://your-domain.com/api/health`
