#!/bin/bash

# Development reset script for Character Management App

echo "🔄 Resetting Character Management App..."

# Stop containers and remove volumes
echo "🛑 Stopping containers and removing volumes..."
docker-compose down -v

# Remove unused Docker resources
echo "🧹 Cleaning up Docker resources..."
docker system prune -f

# Rebuild and start
echo "🔨 Rebuilding and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Application has been reset and restarted!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "🗄️  MySQL: localhost:3306"