#!/bin/bash
# Test that Aegis Gate endpoints work with OWS's built-in x402 pay command

echo "Starting data-miner agent on port 4001..."
cd "$(dirname "$0")"
npx tsx agents/data-miner.ts &
MINER_PID=$!
sleep 2

echo ""
echo "=== Testing ows pay with Aegis Gate ==="
echo ""

# First, show what happens without payment (402)
echo "1. Unpaid request (should get 402):"
curl -s http://localhost:4001/scrape | head -1
echo ""
echo ""

# Then use ows pay to make a paid request
echo "2. Paid request via ows pay:"
ows pay request --wallet data-miner --no-passphrase http://localhost:4001/scrape
echo ""

# Cleanup
kill $MINER_PID 2>/dev/null
echo ""
echo "=== Test complete ==="
