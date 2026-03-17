#!/bin/bash

# WebSiteMonitoringMo! Setup Script
# This script sets up the project for development

set -e

echo "🚀 WebSiteMonitoringMo! Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "🗄️ Generating Prisma client..."
npm run db:generate

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "⚠️  Please update .env.local with your database credentials"
fi

# Check if PostgreSQL is running
echo ""
echo "🔍 Checking PostgreSQL..."
if docker ps | grep -q "postgres"; then
    echo "✅ PostgreSQL is running in Docker"
else
    echo "⚠️  PostgreSQL doesn't appear to be running"
    echo "   To start PostgreSQL with Docker, run: docker-compose up -d"
fi

# Run database migration
echo ""
echo "🗃️ Setting up database..."
echo "   This will prompt you - press Enter to continue or handle Ctrl+C"
npm run db:migrate || echo "⚠️  Database migration may have failed. Check your DATABASE_URL."

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
npm run db:seed || echo "⚠️  Database seeding may have failed."

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 To start developing:"
echo "   1. Make sure PostgreSQL is running: docker-compose up -d"
echo "   2. Start the dev server: npm run dev"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "� A default admin user will be created during seeding."
echo "   Set your own credentials in .env.local (ADMIN_EMAIL, ADMIN_PASSWORD)"
echo ""
