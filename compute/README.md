# Nozle Template: Compute/Infrastructure Billing

A complete infrastructure-as-a-service application demonstrating compute resource billing with graduated usage tiers. Perfect for cloud platforms, hosting services, or any product that charges based on running instances and resource consumption.

## Features

- Landing page for cloud platform
- Compute-based pricing with graduated tiers
- Full dashboard with:
  - Instance management (create, stop, start, delete)
  - Deployment tracking
  - Resource usage monitoring (CPU, RAM, disk)
  - Detailed usage analytics by instance
  - Billing management
- Hourly instance billing with volume discounts
- Resource-based pricing (CPU, RAM, storage)
- Multi-instance management

## Quick Start (Demo Mode)

This template runs in demo mode by default with mock data. No API keys required.

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Demo vs Production

### Demo Mode (Current)
- Uses mock data for all instances and billing
- No Nozle API connection required
- Shows UI/UX exactly as it will appear with real data
- Perfect for prototyping and design review

### Production Mode
To connect real Nozle billing:

1. **Get your Nozle API keys** from [nozle.dev](https://nozle.dev)

2. **Update environment variables** in `.env.local`:
```env
NOZLE_API_KEY=sk_live_your_key
NEXT_PUBLIC_NOZLE_PUBLISHABLE_KEY=pk_live_your_key
NOZLE_CUSTOMER_ID=your_customer_id
```

3. **Uncomment NozleProvider** in `components/providers.tsx`:
```tsx
import { NozleProvider } from '@nozle-js/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NozleProvider publicKey={process.env.NEXT_PUBLIC_NOZLE_PUBLISHABLE_KEY!}>
      {children}
    </NozleProvider>
  )
}
```

4. **Replace demo UI with SDK components** following the commented examples in:
   - `app/dashboard/usage/page.tsx` - Use `<UsageChart />` for resource monitoring
   - `app/dashboard/billing/page.tsx` - Use `<BillingPortal />` component
   - `app/api/track/route.ts` - Track compute hours and resource usage
   - Instance management - Connect usage tracking to your real infrastructure

## Project Structure

```
app/
├── (landing)/
│   ├── page.tsx          # Landing page
│   ├── pricing/          # Compute pricing calculator
│   └── login/            # Authentication
├── dashboard/
│   ├── page.tsx          # Dashboard with instance overview
│   ├── instances/        # Instance management
│   ├── deployments/      # Deployment history
│   ├── usage/            # Resource usage analytics
│   └── billing/          # Billing management
└── api/
    ├── instances/        # Instance CRUD operations
    ├── track/            # Usage tracking endpoint
    └── can/              # Resource limit checks
```

## SDK Components Used

This template demonstrates:

- `<UsageChart />` - Visualize compute resource consumption
- `<BillingPortal />` - Manage payment and invoices
- `useUsage()` - React hook for usage data
- `nozle.track()` - Track compute hours with metadata
- Graduated tier pricing implementation
- Time-based billing calculation

## Business Model

**Compute/Infrastructure Billing with Graduated Tiers**
- 0-100 hours: $0.50/hour
- 101-1,000 hours: $0.35/hour (30% discount)
- 1,001+ hours: $0.20/hour (60% discount)

Pricing tiers by instance type:
- Small Instance: 1 CPU, 2GB RAM
- Medium Instance: 2 CPU, 4GB RAM
- Large Instance: 4 CPU, 8GB RAM

Customers are billed hourly for running instances. Volume discounts automatically apply as usage increases. Charges accumulate while instances run and stop when instances are stopped.

## Resource Tracking

This template shows how to:
1. Track compute hours per instance with `duration_hours` field
2. Monitor CPU, RAM, and disk usage
3. Calculate costs based on instance size and runtime
4. Display real-time resource consumption
5. Generate infrastructure usage reports
6. Apply graduated tier discounts

## Learn More

- [Nozle Documentation](https://docs.nozle.dev)
- [Nozle SDK Reference](https://github.com/nozle/nozle-js)
- [Compute Billing Guide](https://docs.nozle.dev/guides/compute-billing)
