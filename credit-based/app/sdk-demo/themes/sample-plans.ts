import type { PricingPlan } from '@nozle-js/react'

// Sample plans for the themes page and its catalog mock. Nothing here is a real account.
const metered = (code: string, name: string, usage_limit: number | null) => ({ feature_type: 'metered', code, name, usage_limit })

export const PLANS: PricingPlan[] = [
  { code: 'free', name: 'Free', amount_cents: 0, amount_currency: 'USD', interval: 'monthly', description: 'For trying things out',
    entitlements: [metered('api_calls', 'API calls', 1000), metered('seats', 'Seats', 1)] },
  { code: 'pro', name: 'Pro', amount_cents: 2900, amount_currency: 'USD', interval: 'monthly', description: 'For growing teams',
    entitlements: [metered('api_calls', 'API calls', 50000), metered('seats', 'Seats', 10)],
    credit_grant_rules: [{ credit_system_code: 'ai_credits', amount: '500', interval: 'month' }] },
  { code: 'scale', name: 'Scale', amount_cents: 9900, amount_currency: 'USD', interval: 'monthly', description: 'For high volume',
    entitlements: [metered('api_calls', 'API calls', null), metered('seats', 'Seats', 50)],
    credit_grant_rules: [{ credit_system_code: 'ai_credits', amount: '2500', interval: 'month' }] },
]

/** Yearly versions and a plan sold on request, for the Monthly/Annual toggle and "Contact Sales". */
export const MORE_PLANS: PricingPlan[] = [
  ...PLANS.slice(1).map((plan) => ({ ...plan, code: `${plan.code}_yearly`, amount_cents: plan.amount_cents * 10, interval: 'yearly' })),
  { code: 'enterprise', name: 'Enterprise', amount_cents: 0, amount_currency: 'USD', interval: 'monthly', description: 'For large organisations',
    entitlements: [metered('api_calls', 'API calls', null), { feature_type: 'boolean', code: 'sso', name: 'Single sign-on' }] },
]
