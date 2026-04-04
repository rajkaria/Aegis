#!/bin/bash
set -e

# Error handler
trap 'echo ""; echo "Setup failed at step above. Check the error and try again."; exit 1' ERR

echo "==================================================="
echo "  AEGIS — Agent Commerce Protocol for OWS"
echo "  One-click setup"
echo "==================================================="
echo ""

# Check prerequisites
if ! command -v curl &>/dev/null; then
  echo "Error: curl is required but not installed."
  exit 1
fi

if ! command -v npm &>/dev/null; then
  echo "Error: npm is required. Install Node.js first: https://nodejs.org"
  exit 1
fi

# 1. Check for OWS
if ! command -v ows &>/dev/null; then
  echo "Installing OWS..."
  curl -fsSL https://openwallet.sh/install.sh | bash
  source ~/.zshrc 2>/dev/null || source ~/.bashrc 2>/dev/null
fi

# Verify OWS installed
if ! command -v ows &>/dev/null; then
  echo "Warning: OWS install may have failed. Continuing without wallet operations..."
  echo "Install manually: curl -fsSL https://openwallet.sh/install.sh | bash"
else
  echo "OWS: $(ows --version 2>/dev/null || echo 'installed')"
fi

# 2. Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# 3. Build all packages
echo ""
echo "Building packages..."
cd packages/shared && npx tsc && cd ..
cd policies && npx tsc && cd ..
cd gate && npx tsc && cd ..
cd cli && npx tsc && cd ../..

# 4. Create OWS wallets (skip if exist)
echo ""
echo "Setting up OWS wallets..."
for name in data-miner analyst research-buyer; do
  if ows wallet list 2>/dev/null | grep -q "$name"; then
    echo "  $name: exists"
  else
    ows wallet create --name "$name" 2>/dev/null && echo "  $name: created"
  fi
done

# 5. Register policies (skip if exist)
echo ""
echo "Registering policies..."
POLICY_DIR="$(pwd)/packages/policies/dist"
for policy in budget guard deadswitch; do
  if ows policy list 2>/dev/null | grep -q "aegis-$policy"; then
    echo "  aegis-$policy: exists"
  else
    cat > /tmp/aegis-${policy}-policy.json << EOF
{
  "id": "aegis-${policy}",
  "name": "Aegis ${policy}",
  "version": 1,
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "rules": [],
  "executable": "${POLICY_DIR}/${policy}/index.js",
  "config": null,
  "action": "deny"
}
EOF
    ows policy create --file /tmp/aegis-${policy}-policy.json 2>/dev/null && echo "  aegis-$policy: registered"
  fi
done

# 6. Seed demo data
echo ""
echo "Seeding demo economy..."
cd demo && npx tsx seed.ts && cd ..

# 7. Done
echo ""
echo "==================================================="
echo "  Setup complete!"
echo ""
echo "  Start the dashboard:"
echo "    cd dashboard && npm run dev"
echo ""
echo "  Run the 3-agent economy:"
echo "    cd demo && npx tsx run-economy.ts"
echo ""
echo "  Open: http://localhost:3000"
echo "==================================================="
