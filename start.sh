#!/bin/bash

# Quick Start Script for Appointment System Backend
# This script helps you set up and test the backend

set -e

echo "🚀 Appointment System Backend - Quick Start"
echo "==========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and set your DATABASE_URL and JWT secrets"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npm run db:migrate

# Seed database
echo ""
echo "🌱 Seeding database with demo data..."
npm run db:seed

# Start server
echo ""
echo "✅ Setup complete!"
echo ""
echo "Demo credentials:"
echo "  Owner: owner@demo.com / password123"
echo "  Staff: staff@demo.com / password123"
echo ""
echo "🎉 Starting development server..."
npm run dev
