# Nozle Template: Flat Subscription

A complete SaaS workspace application demonstrating flat-rate subscription billing with tiered plans. Perfect for project management tools, team collaboration software, or any SaaS product with predictable monthly pricing.

## Features

- Landing page with feature showcase
- Tiered pricing page (Starter/Pro/Enterprise)
- Full dashboard with:
  - Project management
  - Team member management
  - Analytics and insights (Pro feature)
  - User settings
  - Billing management
- Subscription upgrade/downgrade flows
- Feature gating by plan tier
- Payment method management

## Quick Start (Demo Mode)

This template runs in demo mode by default with mock data. No API keys required.

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Demo vs Production

### Demo Mode (Current)
- Uses mock data for all billing information
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
   - `app/pricing/page.tsx` - Use `<PricingTable />` component
   - `app/dashboard/billing/page.tsx` - Use `<BillingPortal />` component
   - `app/dashboard/analytics/page.tsx` - Use `<FeatureGate feature="pro_features">` for gating
   - API routes in `app/api/` - Connect to real Nozle API endpoints

## Project Structure

```
app/
├── (landing)/
│   ├── page.tsx          # Landing page
│   ├── pricing/          # Pricing plans
│   └── login/            # Authentication
├── dashboard/
│   ├── page.tsx          # Dashboard home
│   ├── projects/         # Project management
│   ├── team/             # Team member management
│   ├── analytics/        # Usage analytics (Pro feature)
│   ├── settings/         # User settings
│   └── billing/          # Subscription & billing
└── api/
    ├── checkout/         # Checkout session (redirect to the hosted url)
    ├── can/              # Permission checks
    └── track/            # Usage tracking
```

## SDK Components Used

This template demonstrates:

- `<PricingTable />` - Display subscription plans with Nozle-powered checkout
- `<BillingPortal />` - Complete billing management interface
- `<FeatureGate />` - Gate features by plan tier
- `<PlanGate />` - Limit resources by plan
- `useSubscription()` - React hook for subscription state
- `usePlan()` - Get current plan info
- `useCan()` - Check feature access

## Business Model

**Flat Subscription** - Fixed monthly price per tier
- Free: $0/month (1 project, 3 team members)
- Pro: $29/month (10 projects, analytics)
- Team: $99/month (unlimited projects, advanced features)

Users pay a predictable monthly fee based on their chosen tier. Upgrades/downgrades are prorated automatically.

## Learn More

- [Nozle Documentation](https://docs.nozle.dev)
- [Nozle SDK Reference](https://github.com/nozle/nozle-js)
- [Subscription Billing Guide](https://docs.nozle.dev/guides/subscriptions)
