# Deploying Aegis Agents to Railway

## Prerequisites
- Railway account (railway.app)
- 6 wallet keypairs (3 agents x 2 chains)
- $50 funded across wallets
- Anthropic API key (for analyst agent)

## Key Generation

### Solana Keypairs
```bash
# Install Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools
solana-keygen new --outfile data-miner-sol.json --no-bip39-passphrase
solana-keygen new --outfile analyst-sol.json --no-bip39-passphrase
solana-keygen new --outfile buyer-sol.json --no-bip39-passphrase

# Extract base58 private key for Railway env vars
node -e "const k=require('./data-miner-sol.json');const bs58=require('bs58');console.log(bs58.encode(Buffer.from(k)))"
```

### EVM (Base) Keypairs
```bash
node -e "const{generatePrivateKey,privateKeyToAccount}=require('viem/accounts');const pk=generatePrivateKey();console.log('KEY:',pk);console.log('ADDR:',privateKeyToAccount(pk).address)"
```

## Railway Setup

Create 3 services in the same Railway project. Each uses a Dockerfile from `demo/agents/`.

### 1. aegis-data-miner
- **Dockerfile:** `demo/agents/data-miner.Dockerfile`
- **Build context:** Repository root

**Environment variables:**
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BASE_RPC_URL=https://mainnet.base.org
DATA_MINER_SOL_KEY=<base58 private key>
DATA_MINER_BASE_KEY=<0x hex private key>
PORT=4001
```

### 2. aegis-analyst
- **Dockerfile:** `demo/agents/analyst.Dockerfile`
- **Build context:** Repository root

**Environment variables:**
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BASE_RPC_URL=https://mainnet.base.org
ANTHROPIC_API_KEY=<your Anthropic key>
ANALYST_SOL_KEY=<base58 private key>
ANALYST_BASE_KEY=<0x hex private key>
DATA_MINER_URL=https://<data-miner-service>.up.railway.app
PORT=4002
```

### 3. aegis-buyer (one-shot)
- **Dockerfile:** `demo/agents/buyer.Dockerfile`
- **Build context:** Repository root

**Environment variables:**
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BASE_RPC_URL=https://mainnet.base.org
BUYER_SOL_KEY=<base58 private key>
BUYER_BASE_KEY=<0x hex private key>
ANALYST_URL=https://<analyst-service>.up.railway.app
PORT=4003
MAX_CYCLES=20
```

## Wallet Funding

| Wallet | Chain | Amount | Purpose |
|--------|-------|--------|---------|
| buyer-sol | Solana | $22.50 SOL | Pay analyst (Solana path) |
| buyer-base | Base | $22.50 USDC | Pay analyst (Base path) |
| analyst-sol | Solana | $1.25 SOL | Float + gas |
| analyst-base | Base | $1.25 USDC | Float + gas |
| miner-sol | Solana | $1.25 SOL | Float + gas |
| miner-base | Base | $1.25 USDC | Float + gas |

**Total: $50**

Fund Solana wallets via Phantom or Solflare. Fund Base wallets via Bridge or Coinbase.

## Post-Deployment

1. Verify health: `curl https://<data-miner>.up.railway.app/health`
2. Verify metrics: `curl https://<analyst>.up.railway.app/metrics`
3. Set `METRICS_URL=https://<analyst>.up.railway.app` in Vercel dashboard env vars
4. After buyer completes, fetch report: `curl https://<buyer>.up.railway.app/run-report`
5. Fill in tx hashes in `dashboard/src/app/(landing)/docs/live-run/page.tsx`
6. Redeploy dashboard to Vercel
