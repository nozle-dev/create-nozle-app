# Nozle Template: SaaS Usage-Based Billing

A complete API-driven SaaS application demonstrating usage-based billing with metered overages. Perfect for API platforms, data processing services, or any product where customers pay based on actual consumption beyond included limits.

## Features

- Landing page with API focus
- Usage-based pricing page with overage tiers
- Full dashboard with:
  - Real-time usage metrics and charts
  - API key management (create, rotate, revoke)
  - Request logs and history
  - Detailed usage breakdown by endpoint
  - Billing management
- Transparent usage tracking
- Overage billing beyond base plan
- Usage alerts and limits

## Quick Start (Demo Mode)

This template runs in demo mode by default with mock data. No API keys required.

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Demo vs Production

### Demo Mode (Current)
- Uses mock data for all billing and usage information
- No Nozle API connection required
- Shows UI/UX exactly as it will appear with real data
- Perfect for prototyping and design review

### Production Mode
To connect real Nozle billing:

1. **Get your Nozle API keys** from [nozle.dev](https://nozle.dev)

2. **Update environment variables** in `.env.local`:
```env
NOZLE_API_KEY=sk_live_your_key
NEXT_PUBLIC_NOZLE_PUBLIC_KEY=pk_live_your_key
NOZLE_CUSTOMER_ID=your_customer_id
```

3. **Uncomment NozleProvider** in `components/providers.tsx`:
```tsx
import { NozleProvider } from '@nozle-js/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NozleProvider publicKey={process.env.NEXT_PUBLIC_NOZLE_PUBLIC_KEY!}>
      {children}
    </NozleProvider>
  )
}
```

4. **Replace demo UI with SDK components** following the commented examples in:
   - `app/dashboard/usage/page.tsx` - Use `<UsageMeter />` and `<UsageChart />` components
   - `app/dashboard/billing/page.tsx` - Use `<BillingPortal />` component
   - `app/api/track/route.ts` - Connect to real Nozle usage tracking API
   - API routes - Implement real usage tracking on your API endpoints

## Project Structure

```
app/
├── (landing)/
│   ├── page.tsx          # Landing page
│   ├── pricing/          # Usage-based pricing
│   └── login/            # Authentication
├── dashboard/
│   ├── page.tsx          # Dashboard with usage overview
│   ├── usage/            # Detailed usage analytics
│   ├── api-keys/         # API key management
│   ├── logs/             # Request logs
│   └── billing/          # Billing & payment methods
└── api/
    ├── track/            # Usage tracking endpoint
    ├── can/              # Usage limit checks
    ├── usage/            # Usage stats (margin API)
    └── keys/             # API key management
```

## SDK Components Used

This template demonstrates:

- `<UsageMeter />` - Display current usage with limits
- `<UsageChart />` - Visualize consumption over time
- `<BillingPortal />` - Payment methods and invoices
- `useUsage()` - React hook for usage data
- `nozle.track()` - Server-side usage tracking
- `nozle.margin.summary()` - Fetch usage stats
- Feature gating by `api_access` entitlement

## Business Model

**Usage-Based Billing with Overages**
- Free: $0/month (1,000 API calls included)
- Starter: $29/month (10,000 API calls included)
- Pro: $99/month (100,000 API calls included)
- Overage: $0.002 per API call over included limit

Base subscription includes a set number of API calls. Usage beyond the included limit is charged at the overage rate. Customers only pay for what they use.

## Usage Tracking

This template shows how to:
1. Track API usage in real-time with `nozle.track()`
2. Associate usage with specific customers
3. Display transparent usage metrics
4. Set and enforce usage limits
5. Generate usage-based invoices
6. Alert users approaching limits

## Learn More

- [Nozle Documentation](https://docs.nozle.dev)
- [Nozle SDK Reference](https://github.com/nozle/nozle-js)
- [Usage-Based Billing Guide](https://docs.nozle.dev/guides/usage-billing)
