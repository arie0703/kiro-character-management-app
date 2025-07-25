#!/bin/bash

# Development stop script for Character Management App

echo "🛑 Stopping Character Management App..."

# Stop and remove containers
docker-compose down

echo "✅ Application stopped successfully!"
echo ""
echo "💡 To remove all data (including database), run:"
echo "  docker-compose down -v"