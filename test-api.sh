#!/bin/bash

# API Test Script for Appointment System Backend
# Tests all major endpoints with demo credentials

set -e

BASE_URL="http://localhost:3001"
OWNER_EMAIL="owner@demo.com"
OWNER_PASSWORD="password123"

echo "🧪 Testing Appointment System API"
echo "================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health check..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/healthz")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✅ Health check passed"
    echo "   Response: $body"
else
    echo "❌ Health check failed (HTTP $http_code)"
    exit 1
fi

echo ""

# Test 2: Login
echo "2️⃣  Testing login..."
login_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -c cookies.txt \
    -d "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASSWORD\"}")

http_code=$(echo "$login_response" | tail -n1)
body=$(echo "$login_response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✅ Login successful"
    ACCESS_TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "   Access token obtained (${ACCESS_TOKEN:0:20}...)"
else
    echo "❌ Login failed (HTTP $http_code)"
    echo "   Response: $body"
    exit 1
fi

echo ""

# Test 3: Get current user
echo "3️⃣  Testing /me endpoint..."
me_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

http_code=$(echo "$me_response" | tail -n1)
body=$(echo "$me_response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✅ /me endpoint successful"
    echo "   User: $(echo "$body" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
    
    # Extract company ID from response
    COMPANY_ID=$(echo "$body" | grep -o '"companyId":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Company ID: $COMPANY_ID"
else
    echo "❌ /me endpoint failed (HTTP $http_code)"
    echo "   Response: $body"
    exit 1
fi

echo ""

# Test 4: Get company (with company scope)
if [ -n "$COMPANY_ID" ]; then
    echo "4️⃣  Testing /companies/current endpoint..."
    company_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/companies/current" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "X-Company-ID: $COMPANY_ID")

    http_code=$(echo "$company_response" | tail -n1)
    body=$(echo "$company_response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        echo "✅ /companies/current endpoint successful"
        echo "   Company: $(echo "$body" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
    else
        echo "❌ /companies/current endpoint failed (HTTP $http_code)"
        echo "   Response: $body"
        exit 1
    fi
else
    echo "⚠️  Skipping company test - no company ID found"
fi

echo ""

# Test 5: Test company scope validation (should fail without company ID)
echo "5️⃣  Testing company scope validation..."
no_scope_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/companies/current" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

http_code=$(echo "$no_scope_response" | tail -n1)

if [ "$http_code" = "400" ]; then
    echo "✅ Company scope validation working (correctly rejected request without company ID)"
else
    echo "⚠️  Unexpected response for missing company ID (HTTP $http_code)"
fi

echo ""

# Test 6: Refresh token
echo "6️⃣  Testing token refresh..."
refresh_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/refresh" \
    -b cookies.txt)

http_code=$(echo "$refresh_response" | tail -n1)
body=$(echo "$refresh_response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "✅ Token refresh successful"
    NEW_TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "   New access token obtained (${NEW_TOKEN:0:20}...)"
else
    echo "❌ Token refresh failed (HTTP $http_code)"
    echo "   Response: $body"
fi

echo ""

# Test 7: Logout
echo "7️⃣  Testing logout..."
logout_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/logout" \
    -b cookies.txt)

http_code=$(echo "$logout_response" | tail -n1)

if [ "$http_code" = "200" ]; then
    echo "✅ Logout successful"
else
    echo "❌ Logout failed (HTTP $http_code)"
fi

# Cleanup
rm -f cookies.txt

echo ""
echo "================================="
echo "🎉 All tests completed!"
echo ""
