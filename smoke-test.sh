#!/bin/bash
set -e  # Exit on first error

BASE_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:5173"
ADMIN_USER="admin"
ADMIN_PASS="${ADMIN_PASSWORD:-admin123}" # Use fallback for local testing if not set

echo "🔍 Starting MAD-ERP Production Smoke Tests..."

# 1. Health check
echo "✓ Checking health endpoint..."
HEALTH=$(curl -s "$BASE_URL/actuator/health")
if [[ ! "$HEALTH" =~ '"status":"UP"' ]]; then
  echo "❌ FAILED: Health check returned: $HEALTH"
  exit 1
fi
echo "$HEALTH" | head -c 50; echo "..."

# 2. Auth flow
echo "✓ Testing authentication..."
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}")
TOKEN=$(echo "$LOGIN_RESP" | jq -r '.token // .accessToken // empty')
if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "❌ FAILED: Login did not return valid token. Response: $LOGIN_RESP"
  exit 1
fi
echo "Got JWT Token."

# 3. Protected endpoint access
echo "✓ Testing protected endpoint..."
PROJECTS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/projects?page=0&size=1")
if [[ ! "$PROJECTS" =~ '"content"' ]]; then
  echo "❌ FAILED: Projects endpoint did not return paginated response"
  exit 1
fi
echo "Accessed protected route successfully."

# 4. Rate limiting check
echo "✓ Testing rate limiting (trigger 11 requests)..."
for i in {1..11}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USER\",\"password\":\"invalid_$i\"}")
  # Note: Since the bucket4j interceptor keys on IP, our local loop will hit the limit 
  # on the 11th request (assuming bucket is 10/min per IP)
  if [[ $i -eq 11 && "$CODE" != "429" ]]; then
    echo "❌ FAILED: Rate limiting did not trigger on 11th request (got $CODE)"
    exit 1
  elif [[ $i -eq 11 && "$CODE" == "429" ]]; then
    echo "Confirmed 429 Too Many Requests triggered."
  fi
done

# 5. Frontend asset load (mocked URL locally)
echo "✓ Testing frontend load..."
if ! curl -s -o /dev/null -f "$FRONTEND_URL"; then
  echo "❌ FAILED: Frontend URL not reachable"
  exit 1
fi
echo "Frontend is reachable."

echo "🎉 All smoke tests passed. Deployment is healthy."
exit 0
