# create-nozle-app

Create a production-ready Next.js SaaS app with Nozle billing integration.

Choose from 4 templates. Get a working billing UI in 2 minutes.

## Quick Start

```bash
npx create-nozle-app my-app
cd my-app
npm run dev
```

The interactive CLI will prompt you for your API key and template choice. Visit http://localhost:3000 to see your app.

## Templates

### Flat Subscription
Fixed monthly pricing with feature-based tiers. Best for SaaS products like Notion, Linear, Slack.

### SaaS + Usage
Base subscription fee plus metered usage overage. Best for API platforms like Stripe, Twilio, SendGrid.

### Compute
Graduated tiered pricing for infrastructure. Best for cloud platforms like Vercel, Railway, AWS.

### Credit-Based
Prepaid credit packs spent per action. Best for creative tools like Midjourney, Canva, Replicate.

Each template includes:
- Complete dashboard with billing UI
- Pricing page with checkout
- API routes for usage tracking
- Feature gating
- Demo mode (no API keys needed to try)
- TypeScript + Tailwind CSS + shadcn/ui

## CLI Options

```bash
npx create-nozle-app [project-name] [options]
```

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --pkg-manager <manager>` | Package manager: npm, pnpm, yarn, bun | Auto-detect |
| `--no-install` | Skip dependency installation | `false` |
| `-h, --help` | Show help | |
| `-V, --version` | Show version | |

```bash
# Specify package manager
npx create-nozle-app my-app --pkg-manager pnpm

# Skip dependency installation
npx create-nozle-app my-app --no-install
```

## Generated App Structure

```
my-app/
├── app/
│   ├── layout.tsx              # BillingProvider wrapper
│   ├── page.tsx                # Homepage
│   ├── dashboard/page.tsx      # Usage dashboard
│   ├── pricing/page.tsx        # Pricing page
│   └── api/
│       ├── track/route.ts      # Usage tracking
│       ├── checkout/route.ts   # Checkout
│       └── can/route.ts        # Feature gate checks
├── lib/
│   ├── nozle-client.ts         # Server-side SDK
│   └── utils.ts                # Helpers
├── components/                 # UI components
├── .env.example                # Environment template
└── package.json
```

## Configuration

### Demo Mode (default)

Templates work out of the box — no API keys or database needed:

```bash
npm run dev
```

### Production Mode

1. Get your API key from [Nozle Dashboard](https://app.nozle.dev)
2. Create `.env.local`:

```bash
NOZLE_API_KEY=sk_live_your_secret_key
DEMO_MODE=false
```

`NOZLE_API_KEY` is server-only. If you enable the browser `BillingProvider`, set a separate publishable key: `NEXT_PUBLIC_NOZLE_PUBLISHABLE_KEY=pk_live_your_publishable_key`. It is never derived from the secret key.

3. Restart the dev server

## Development

This repository contains both the CLI tool and the 4 template apps.

### Repository Structure

```
create-nozle-app/
├── src/                        # CLI source code
├── flat-subscription/          # Template app
├── saas-usage/                 # Template app
├── compute/                    # Template app
├── credit-based/               # Template app
├── shared/                     # Shared code (dev only)
├── scripts/                    # Dev scripts
├── package.json                # CLI package (published to npm)
├── tsup.config.ts              # CLI build config
└── pnpm-workspace.yaml         # Workspace config
```

### Running Templates Locally

```bash
pnpm install

# Run a specific template
pnpm dev:flat          # flat-subscription on port 3000
pnpm dev:saas          # saas-usage on port 3001
pnpm dev:compute       # compute on port 3002
pnpm dev:credits       # credit-based on port 3003
```

### Building the CLI

```bash
pnpm build:cli
```

### Running with Docker

```bash
docker-compose up
```

### Modifying Shared Code

1. Edit files in `shared/`
2. Run `./scripts/sync-shared.sh` to copy changes to all templates

## Links

- **Nozle SDK:** [github.com/nozle-dev/nozle-js](https://github.com/nozle-dev/nozle-js)
- **React SDK:** [@nozle-js/react](https://www.npmjs.com/package/@nozle-js/react)
- **Node SDK:** [@nozle-js/node](https://www.npmjs.com/package/@nozle-js/node)
- **Documentation:** [docs.nozle.dev](https://docs.nozle.dev)
- **Dashboard:** [app.nozle.dev](https://app.nozle.dev)

## License

MIT
