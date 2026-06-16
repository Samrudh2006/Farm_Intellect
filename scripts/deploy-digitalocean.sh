#!/bin/bash
set -e

echo "==============================================="
echo "  Farm Intellect Backend - Deployment Script   "
echo "==============================================="

# 1. Install Docker if it's not installed
if ! command -v docker &> /dev/null
then
    echo "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "Docker installed successfully."
fi

# 2. Install Docker Compose if it's not installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null
then
    echo "Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully."
fi

# 3. Check for .env file
if [ ! -f "backend/.env" ]; then
    echo "ERROR: backend/.env file not found!"
    echo "Please create backend/.env with your Supabase DATABASE_URL and other secrets before deploying."
    exit 1
fi

echo "Pulling latest code..."
git pull origin main

echo "Building and starting the Docker containers..."
# Use 'docker compose' if available, otherwise fallback to 'docker-compose'
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

echo "==============================================="
echo "Deployment successful! The backend is running."
echo "View logs with: docker logs farm-intellect-backend -f"
echo "==============================================="
