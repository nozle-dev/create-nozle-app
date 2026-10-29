# Nozle Template: Credit-Based Billing

A complete creative platform demonstrating credit-based billing with atomic deduction. Perfect for AI image generation, rendering services, or any product where users purchase credits upfront and spend them on individual actions.

## Features

- Landing page for creative platform
- Credit package pricing page
- Full dashboard with:
  - Credit balance display with top-up
  - Action marketplace (Generate, Analyze, etc.)
  - Gallery of generated outputs
  - Credit usage history and analytics
  - Billing management
- Credit purchase flow with bonus packs
- Pay-per-action consumption
- Atomic credit deduction (prevents race conditions)
- Credit balance tracking

## Quick Start (Demo Mode)

This template runs in demo mode by default with mock data. No API keys required.

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Demo vs Production

### Demo Mode (Current)
- Uses mock data for credits and billing
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
   - `app/dashboard/credits/page.tsx` - Use `<CreditBalance />` component
   - `app/dashboard/billing/page.tsx` - Use `<BillingPortal />` component
   - `app/api/deduct/route.ts` - Use `nozle.checkAndDeduct()` for atomic credit deduction
   - Studio actions - Deduct credits when users generate outputs

## Project Structure

```
app/
├── (landing)/
│   ├── page.tsx          # Landing page
│   ├── pricing/          # Credit packages
│   └── login/            # Authentication
├── dashboard/
│   ├── page.tsx          # Dashboard with credit overview
│   ├── studio/           # Action marketplace
│   ├── gallery/          # Generated outputs
│   ├── credits/          # Credit management & top-up
│   └── billing/          # Billing management
└── api/
    ├── deduct/           # Atomic credit deduction
    ├── actions/          # Execute actions after deduction
    ├── credits/          # Credit purchase
    └── balance/          # Credit balance checks
```

## SDK Components Used

This template demonstrates:

- `<CreditBalance />` - Display current credit balance
- `<BillingPortal />` - Manage payment methods
- `useCredits()` - React hook for credit state
- `nozle.checkAndDeduct()` - Atomic credit deduction (prevents race conditions)
- `nozle.track()` - Track credit consumption

## Business Model

**Credit-Based Billing** - Buy credits, spend on actions
- Starter Pack: $10 for 100 credits
- Pro Pack: $40 for 500 credits (25% bonus)
- Ultra Pack: $100 for 1,500 credits (50% bonus)

Actions consume credits:
- Generate Image: 10 credits
- Analyze Image: 5 credits
- HD Render: 20 credits
- 4K Render: 50 credits

Users purchase credit packages upfront and spend them on individual actions. Credits never expire and can be topped up anytime. Larger packs include bonus credits.

## Credit Management

This template shows how to:
1. Display real-time credit balance
2. Enable credit top-ups with package bonuses
3. Deduct credits atomically with `checkAndDeduct()` to prevent race conditions
4. Track credit usage history
5. Prevent actions when balance is insufficient
6. Issue promotional/bonus credits

## Atomic Deduction Pattern

```typescript
// Prevents race conditions when deducting credits
const result = await nozle.checkAndDeduct(customerId, 'credits_used', {
  credits: 10,
  action: 'generate_image'
})

if (!result.success) {
  throw new Error('Insufficient credits')
}

// Proceed with action only after credits are deducted
```

## Learn More

- [Nozle Documentation](https://docs.nozle.dev)
- [Nozle SDK Reference](https://github.com/nozle/nozle-js)
- [Credit-Based Billing Guide](https://docs.nozle.dev/guides/credit-billing)
