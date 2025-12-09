#!/bin/bash

# Knowledge Base Server - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 Knowledge Base Server Setup"
echo "================================"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"
echo ""

# Check npm
echo "📦 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build
echo "✅ Project built successfully"
echo ""

# Run tests
echo "🧪 Running tests..."
if npm test; then
    echo "✅ All tests passed"
else
    echo "⚠️  Some tests failed, but setup is complete"
fi
echo ""

# Success message
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run the server:         npm start"
echo "  2. Read the docs:          cat README.md"
echo "  3. Quick start guide:      cat QUICKSTART.md"
echo "  4. View examples:          cat EXAMPLES.md"
echo ""
echo "For Claude Desktop integration:"
echo "  See CONFIGURATION.md for setup instructions"
echo ""
echo "Happy coding! 🎉"
