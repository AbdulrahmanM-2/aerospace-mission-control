#!/bin/bash
# Aerospace Mission Control - Installation Script

echo "========================================"
echo "Aerospace Mission Control Installation"
echo "========================================"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required"
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "========================================"
    echo "Next Steps:"
    echo "========================================"
    echo ""
    echo "1. Test locally:"
    echo "   npm run dev"
    echo "   Open http://localhost:3000"
    echo ""
    echo "2. Deploy to Vercel:"
    echo "   npx vercel --prod"
    echo ""
    echo "3. Or push to GitHub first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'feat: Initial deployment'"
    echo "   git push"
    echo ""
    echo "========================================"
else
    echo "❌ Installation failed"
    echo "Please check the error messages above"
    exit 1
fi
