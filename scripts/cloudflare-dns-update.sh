#!/bin/bash
# Cloudflare DNS Auto-Update Script
# Updates A record for chai-homelab.com with current public IP

set -e

CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
RECORD_NAME="chai-homelab.com"
CURRENT_IP=$(curl -s https://api.ipify.org)

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN not set"
  exit 1
fi

if [ -z "$ZONE_ID" ]; then
  echo "❌ CLOUDFLARE_ZONE_ID not set"
  exit 1
fi

echo "🔍 Checking IP for $RECORD_NAME..."

# Get current DNS record IP
CURRENT_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | \
  jq -r ".results[] | select(.name==\"$RECORD_NAME\") | .content")

if [ "$CURRENT_IP" == "$CURRENT_RECORD" ]; then
  echo "✅ IP unchanged ($CURRENT_IP)"
  exit 0
fi

echo "🔄 Updating DNS record: $CURRENT_RECORD → $CURRENT_IP"

# Update DNS record
curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | \
  jq -r ".results[] | select(.name==\"$RECORD_NAME\") | .id") \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"A\",\"name\":\"$RECORD_NAME\",\"content\":\"$CURRENT_IP\",\"proxied\":true,\"ttl\":120}" \
  | jq -r ".success, .errors[]"

echo "✅ DNS record updated to $CURRENT_IP"
