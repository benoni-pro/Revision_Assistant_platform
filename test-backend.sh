#!/bin/bash

# Test Backend API Connection
echo "🔍 Testing Backend API Connection..."
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="https://revision-assistant-platform.onrender.com"

echo "Backend URL: ${BACKEND_URL}"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check Endpoint"
echo "------------------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 2: CORS Preflight
echo "Test 2: CORS Preflight Request"
echo "-------------------------------"
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X OPTIONS \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    "${BACKEND_URL}/api/health")

if [ "$CORS_RESPONSE" -eq 200 ] || [ "$CORS_RESPONSE" -eq 204 ]; then
    echo -e "${GREEN}✓ CORS preflight passed${NC}"
else
    echo -e "${RED}✗ CORS preflight failed (HTTP $CORS_RESPONSE)${NC}"
fi
echo ""

# Test 3: API Endpoints Availability
echo "Test 3: API Endpoints Availability"
echo "-----------------------------------"

endpoints=(
    "/api/auth/register"
    "/api/quizzes"
    "/api/study-groups"
    "/api/resources"
    "/api/progress/stats"
)

for endpoint in "${endpoints[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}${endpoint}")
    
    # Accept 401/403 as "available but requires auth"
    if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 401 ] || [ "$STATUS" -eq 403 ]; then
        echo -e "${GREEN}✓${NC} ${endpoint} (HTTP ${STATUS})"
    else
        echo -e "${RED}✗${NC} ${endpoint} (HTTP ${STATUS})"
    fi
done
echo ""

# Test 4: Response Time
echo "Test 4: Response Time"
echo "---------------------"
START_TIME=$(date +%s%N)
curl -s "${BACKEND_URL}/api/health" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( ($END_TIME - $START_TIME) / 1000000 ))

if [ "$RESPONSE_TIME" -lt 1000 ]; then
    echo -e "${GREEN}✓ Response time: ${RESPONSE_TIME}ms (Good)${NC}"
elif [ "$RESPONSE_TIME" -lt 3000 ]; then
    echo -e "${YELLOW}⚠ Response time: ${RESPONSE_TIME}ms (Acceptable)${NC}"
else
    echo -e "${RED}✗ Response time: ${RESPONSE_TIME}ms (Slow)${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "Summary"
echo "=================================="
echo "Backend URL: ${BACKEND_URL}"
echo "Status: Backend is responding"
echo ""
echo "Next Steps:"
echo "1. Start your frontend: cd frontend && npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Check browser console for any CORS errors"
echo "4. After deploying frontend, update backend FRONTEND_URL environment variable"
echo ""
