'use client'

import {
  BillingProvider,
  CreditBalance,
  PricingTable,
  UsageDashboard,
  type Appearance,
  type PricingPlan,
} from '@nozle-js/react'
import { dark, light, minimal, neobrutal, shadcn, system } from '@nozle-js/react/themes'

const THEMES: Record<string, { appearance: Appearance; page: string; text: string }> = {
  light: { appearance: { theme: light }, page: '#f8fafc', text: '#111827' },
  dark: { appearance: { theme: dark }, page: '#030712', text: '#f3f4f6' },
  system: { appearance: { theme: system }, page: 'light-dark(#f8fafc, #030712)', text: 'light-dark(#111827, #f3f4f6)' },
  shadcn: { appearance: { theme: shadcn }, page: '#ffffff', text: '#0a0a0a' },
  minimal: { appearance: { theme: minimal }, page: '#ffffff', text: '#111827' },
  neobrutal: { appearance: { theme: neobrutal }, page: '#fef9c3', text: '#000000' },
}

// shadcn/ui (Tailwind v4) default "neutral" variables, as a shadcn app defines them.
const SHADCN_VARS = {
  '--background': 'oklch(1 0 0)',
  '--foreground': 'oklch(0.145 0 0)',
  '--card': 'oklch(1 0 0)',
  '--primary': 'oklch(0.205 0 0)',
  '--primary-foreground': 'oklch(0.985 0 0)',
  '--muted': 'oklch(0.97 0 0)',
  '--muted-foreground': 'oklch(0.556 0 0)',
  '--accent': 'oklch(0.97 0 0)',
  '--accent-foreground': 'oklch(0.205 0 0)',
  '--border': 'oklch(0.922 0 0)',
  '--destructive': 'oklch(0.577 0.245 27.325)',
  '--radius': '0.625rem',
} as React.CSSProperties

const metered = (code: string, name: string, usage_limit: number | null) => ({ feature_type: 'metered', code, name, usage_limit })

const PLANS: PricingPlan[] = [
  { code: 'free', name: 'Free', amount_cents: 0, amount_currency: 'USD', interval: 'monthly', description: 'For trying things out',
    entitlements: [metered('api_calls', 'API calls', 1000), metered('seats', 'Seats', 1)] },
  { code: 'pro', name: 'Pro', amount_cents: 2900, amount_currency: 'USD', interval: 'monthly', description: 'For growing teams',
    entitlements: [metered('api_calls', 'API calls', 50000), metered('seats', 'Seats', 10)],
    credit_grant_rules: [{ credit_system_code: 'ai_credits', amount: '500', interval: 'month' }] },
  { code: 'scale', name: 'Scale', amount_cents: 9900, amount_currency: 'USD', interval: 'monthly', description: 'For high volume',
    entitlements: [metered('api_calls', 'API calls', null), metered('seats', 'Seats', 50)],
    credit_grant_rules: [{ credit_system_code: 'ai_credits', amount: '2500', interval: 'month' }] },
]

export function ThemeGallery({ name }: { name: string }) {
  const chosen = THEMES[name] ?? THEMES.light
  return (
    <div
      data-theme-ready
      style={{
        background: chosen.page,
        color: chosen.text,
        colorScheme: name === 'system' ? 'light dark' : name === 'dark' ? 'dark' : 'light',
        padding: 32,
        ...(name === 'shadcn' ? SHADCN_VARS : {}),
      }}
    >
      {/* Hides the Next.js dev indicator in screenshots. */}
      <style>{'nextjs-portal{display:none}'}</style>
      <BillingProvider publishableKey="pk_demo_themes" appearance={chosen.appearance}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gap: 24 }}>
          <PricingTable plans={PLANS} currentPlanCode="free" highlightPlan="pro" showToggle={false} onSelect={() => {}} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <CreditBalance
              balance={{
                credit_system_name: 'AI credits',
                unit_name: 'credit',
                available: '1240',
                as_of: '2026-10-16T09:00:00Z',
                sources: [
                  { id: 'g1', type: 'subscription_grant', remaining: '500', expires_at: '2026-11-01T00:00:00Z' },
                  { id: 't1', type: 'top_up', remaining: '740', expires_at: null },
                ],
              }}
            />
            <UsageDashboard
              features={[
                { key: 'api_calls', label: 'API calls', used: 31200, limit: 50000 },
                { key: 'seats', label: 'Seats', used: 9, limit: 10 },
                { key: 'storage', label: 'Storage (GB)', used: 98, limit: 100 },
              ]}
            />
          </div>
        </div>
      </BillingProvider>
    </div>
  )
}
