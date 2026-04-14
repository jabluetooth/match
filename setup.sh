#!/bin/bash

# CareerOS Frontend Setup Script
# This script automates the setup process for the CareerOS dashboard

set -e  # Exit on error

echo "🚀 CareerOS Frontend Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Setup .env file
if [ ! -f ".env" ]; then
    echo "⚙️  Setting up environment variables..."
    cp .env.example .env
    echo "✅ .env file created from .env.example"
    echo "⚠️  IMPORTANT: Edit .env file with your actual values:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - N8N_BASE_URL (Your n8n instance URL)"
    echo ""
    read -p "Press enter to continue after editing .env..."
else
    echo "✅ .env file already exists"
fi
echo ""

# Step 3: Prisma setup
echo "🗄️  Setting up Prisma..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Ask if user wants to push schema to database
read -p "Do you want to push the schema to your database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Pushing schema to database..."
    npx prisma db push
    echo "✅ Database schema created"
else
    echo "⚠️  Skipping database setup. Run 'npm run db:push' manually later."
fi
echo ""

# Step 4: Check if n8n is accessible
echo "🔗 Checking n8n connection..."
N8N_URL=$(grep N8N_BASE_URL .env | cut -d '=' -f2 | tr -d '"')

if [ -z "$N8N_URL" ]; then
    echo "⚠️  N8N_BASE_URL not set in .env"
else
    echo "   Testing connection to: $N8N_URL"
    if curl -s --head --request GET "$N8N_URL" | grep "200\|301\|302" > /dev/null; then 
        echo "✅ n8n instance is reachable"
    else
        echo "⚠️  Could not reach n8n instance. Please verify N8N_BASE_URL"
    fi
fi
echo ""

# Step 5: All done!
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify your .env configuration"
echo "2. Make sure your PostgreSQL database is running"
echo "3. Import the n8n workflow JSON file into your n8n instance"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "Useful commands:"
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"
echo "  npm run db:studio  - Open Prisma Studio (database GUI)"
echo "  npm run db:push    - Push schema changes to database"
echo ""
echo "Happy coding! 🚀"
