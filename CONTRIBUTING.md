# Contributing to Aegis

## Setup

```bash
git clone https://github.com/rajkaria/aegis
cd aegis
./setup.sh
```

## Development

```bash
# Build all packages
npm run build

# Run tests
npx vitest run --config vitest.config.ts

# Start dashboard
cd dashboard && npm run dev

# Run demo economy
cd demo && npx tsx run-economy.ts
```

## Project Structure

See [README.md](README.md) for architecture details.
