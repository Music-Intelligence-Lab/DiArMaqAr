#!/bin/bash

# Test script for API documentation locally
# This allows testing without deploying to Netlify

echo "🧪 Testing API Documentation Locally"
echo "===================================="
echo ""

# Check if dev server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Next.js dev server is already running on port 3000"
else
    echo "⚠️  Next.js dev server is not running"
    echo "   Start it with: npm run dev"
    echo "   Then run this script again"
    exit 1
fi

echo ""
echo "Testing endpoints..."
echo ""

# Test 1: Check if openapi.json exists
echo "1️⃣  Testing /docs/openapi.json endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/docs/openapi.json)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ /docs/openapi.json returns 200 OK"
    SIZE=$(curl -s http://localhost:3000/docs/openapi.json | wc -c)
    echo "   📦 File size: $SIZE bytes"
else
    echo "   ❌ /docs/openapi.json returns $STATUS"
fi

echo ""

# Test 2: Check if API route works
echo "2️⃣  Testing /api/openapi.json endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/openapi.json)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ /api/openapi.json returns 200 OK"
    SIZE=$(curl -s http://localhost:3000/api/openapi.json | wc -c)
    echo "   📦 File size: $SIZE bytes"
else
    echo "   ❌ /api/openapi.json returns $STATUS"
fi

echo ""

# Test 3: Check if docs page loads
echo "3️⃣  Testing /docs/api/ page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/docs/api/)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ /docs/api/ returns 200 OK"
else
    echo "   ❌ /docs/api/ returns $STATUS"
fi

echo ""
echo "===================================="
echo "📝 Next steps:"
echo "   1. Open http://localhost:3000/docs/api/ in your browser"
echo "   2. Check the browser console for any errors"
echo "   3. Verify the OpenAPI spec loads correctly"
echo ""
echo "💡 Tip: Keep 'npm run dev' running in another terminal"
echo "   and this script will test the current state"

