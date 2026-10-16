'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type React from 'react'
import {
  BillingPortal,
  BillingProvider,
  Checkout,
  CheckoutButton,
  CreditBalance,
  CreditHistory,
  FeatureGate,
  LockedOverlay,
  PaymentMethodDisplay,
  PlanBadge,
  PlanCard,
  PlanComparison,
  PlanGate,
  PricingTable,
  UpgradeButton,
  UpgradePrompt,
  UsageAlert,
  UsageBreakdown,
  UsageDashboard,
  UsageGate,
  UsageMeter,
  UsageTrend,
  type Appearance,
  type CheckoutResult,
  type CreditBalanceData,
  type CustomerUsageData,
  type PlanChangeActions,
  type PlanChangeState,
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

// ── Sample data ─────────────────────────────────────────────────────────────

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

const BALANCE: CreditBalanceData = {
  credit_system_name: 'AI credits',
  unit_name: 'credit',
  available: '1240',
  as_of: '2026-10-16T09:00:00Z',
  sources: [
    { id: 'g1', type: 'subscription_grant', remaining: '500', expires_at: '2026-11-01T00:00:00Z' },
    { id: 't1', type: 'top_up', remaining: '740', expires_at: null },
  ],
}

const OPERATIONS = [
  { id: 'o1', type: 'consume', status: 'succeeded', credit_amount: '-12', feature_code: 'ai_chat', occurred_at: '2026-10-16T08:40:00Z' },
  { id: 'o2', type: 'consume', status: 'succeeded', credit_amount: '-30', feature_code: 'ai_image', occurred_at: '2026-10-15T17:05:00Z' },
  { id: 'o3', type: 'grant', status: 'succeeded', credit_amount: '500', feature_code: null, occurred_at: '2026-10-01T00:00:00Z' },
  { id: 'o4', type: 'consume', status: 'denied', credit_amount: '-900', feature_code: 'ai_video', occurred_at: '2026-09-28T11:12:00Z' },
] as const

const usagePeriod = (from: string, to: string, api: number, seats: number): CustomerUsageData => ({
    from_datetime: from,
    to_datetime: to,
    currency: 'USD',
    amount_cents: api * 0.04 + seats * 60,
    charges_usage: [
      { units: String(api), amount_cents: api * 0.04, amount_currency: 'USD', charge: { nozle_id: `api-${from}`, charge_model: 'standard', invoice_display_name: null }, feature: { nozle_id: 'f-api', code: 'api_calls', name: 'API calls' } },
      { units: String(seats), amount_cents: seats * 60, amount_currency: 'USD', charge: { nozle_id: `seat-${from}`, charge_model: 'standard', invoice_display_name: null }, feature: { nozle_id: 'f-seats', code: 'seats', name: 'Seats' } },
    ],
  })

const CURRENT_USAGE = usagePeriod('2026-10-01T00:00:00Z', '2026-10-31T23:59:59Z', 31200, 9)
const PAST_USAGE = [
  usagePeriod('2026-05-01T00:00:00Z', '2026-05-31T23:59:59Z', 12000, 4),
  usagePeriod('2026-06-01T00:00:00Z', '2026-06-30T23:59:59Z', 18500, 5),
  usagePeriod('2026-07-01T00:00:00Z', '2026-07-31T23:59:59Z', 22100, 7),
  usagePeriod('2026-08-01T00:00:00Z', '2026-08-31T23:59:59Z', 26400, 8),
  usagePeriod('2026-09-01T00:00:00Z', '2026-09-30T23:59:59Z', 29800, 9),
]

// ── Fake merchant callbacks (nothing is charged) ─────────────────────────────

const completed: CheckoutResult = { type: 'completed', status: 'succeeded', payment_source: 'none' } as CheckoutResult
const createCheckout = async () => completed

const portalPlan = (code: string, name: string, cents: number) => ({ code, name, amountCents: cents, currency: 'USD', interval: 'monthly' })
const planChangeState = (): PlanChangeState => ({
  subscriptionId: 'sub-demo-1',
  status: 'active',
  currentPlan: portalPlan('pro', 'Pro', 2900),
  endingAt: null,
  pendingChange: null,
  eligiblePlans: [
    { ...portalPlan('scale', 'Scale', 9900), operation: 'upgrade' },
    { ...portalPlan('free', 'Free', 0), operation: 'downgrade' },
  ],
  blockedReason: null,
  checkout: null,
  checkoutStatus: 'none',
})
const planChangeActions: PlanChangeActions = {
  load: async () => planChangeState(),
  status: async () => planChangeState(),
  preview: async ({ targetPlanCode }) => ({
    operation: targetPlanCode === 'free' ? 'downgrade' : 'upgrade',
    timing: targetPlanCode === 'free' ? 'end_of_period' : 'immediate',
    currency: 'USD',
    creditAmountCents: 1450,
    debitAmountCents: 4950,
    netAmountCents: 3500,
    amountDueNowCents: targetPlanCode === 'free' ? 0 : 3500,
    amountDueAtEffectiveCents: 0,
    effectiveAt: '2026-10-16T10:00:00Z',
    renewalAt: '2026-11-01T00:00:00Z',
    quoteToken: 'demo-quote',
  }),
  apply: async () => completed,
  withdraw: async () => ({}),
}
const cancellationActions = {
  preview: async ({ operation }: { operation: 'cancel' | 'uncancel' }) => ({
    operation,
    effectiveAt: '2026-11-01T00:00:00Z',
    renewalAt: '2026-11-01T00:00:00Z',
  }),
  apply: async () => ({}),
}

// ── Page ────────────────────────────────────────────────────────────────────

const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.6, margin: '0 0 12px' }
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

function Labeled({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <code style={{ fontSize: 12, opacity: 0.6 }}>{`<${name}>`}</code>
      {children}
    </div>
  )
}

function ThemeSelect({ name }: { name: string }) {
  const router = useRouter()
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
      Theme
      <select
        value={name}
        onChange={(event) => router.replace(`?theme=${event.target.value}`, { scroll: false })}
        style={{ font: 'inherit', fontWeight: 500, padding: '6px 10px', borderRadius: 8, border: '1px solid currentColor', background: 'transparent', color: 'inherit' }}
      >
        {Object.keys(THEMES).map((theme) => (
          <option key={theme} value={theme} style={{ color: '#111827' }}>
            {theme}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ThemeGallery({ name }: { name: string }) {
  const key = THEMES[name] ? name : 'light'
  const chosen = THEMES[key]
  // The portal mock lives on this app; its URL is known only in the browser.
  const [portalApiUrl, setPortalApiUrl] = useState('')
  useEffect(() => setPortalApiUrl(`${window.location.origin}/sdk-demo/themes/portal-mock`), [])

  return (
    <div
      style={{
        background: chosen.page,
        color: chosen.text,
        colorScheme: key === 'system' ? 'light dark' : key === 'dark' ? 'dark' : 'light',
        minHeight: '100vh',
        ...(key === 'shadcn' ? SHADCN_VARS : {}),
      }}
    >
      {/* Hides the Next.js dev indicator in screenshots. */}
      <style>{'nextjs-portal{display:none}'}</style>
      <BillingProvider publishableKey="pk_demo_themes" appearance={chosen.appearance} createCheckout={createCheckout}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            padding: '14px 32px',
            background: chosen.page,
            borderBottom: '1px solid color-mix(in srgb, currentColor 15%, transparent)',
          }}
        >
          <strong style={{ fontSize: 16 }}>@nozle-js/react themes</strong>
          <ThemeSelect name={key} />
        </header>

        {/* The docs screenshots capture this block only. */}
        <div data-theme-ready style={{ padding: 32 }}>
          <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gap: 24 }}>
            <PricingTable plans={PLANS} currentPlanCode="free" highlightPlan="pro" showToggle={false} onSelect={() => {}} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              <CreditBalance balance={BALANCE} />
              <UsageDashboard
                features={[
                  { key: 'api_calls', label: 'API calls', used: 31200, limit: 50000 },
                  { key: 'seats', label: 'Seats', used: 9, limit: 10 },
                  { key: 'storage', label: 'Storage (GB)', used: 98, limit: 100 },
                ]}
              />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '8px 32px 64px', display: 'grid', gap: 48 }}>
          <Section title="Plans">
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={grid2}>
                <Labeled name="PlanCard">
                  <PlanCard plan={PLANS[1]} isCurrent={false} onSelect={() => {}} />
                </Labeled>
                <Labeled name="PlanCard isCurrent">
                  <PlanCard plan={PLANS[0]} isCurrent onSelect={() => {}} />
                </Labeled>
              </div>
              <Labeled name="PlanComparison">
                <PlanComparison plans={PLANS} />
              </Labeled>
              <Labeled name="PlanBadge">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <PlanBadge plan="Free" tier="free" />
                  <PlanBadge plan="Starter" tier="starter" />
                  <PlanBadge plan="Pro" tier="pro" />
                  <PlanBadge plan="Enterprise" tier="enterprise" />
                </div>
              </Labeled>
            </div>
          </Section>

          <Section title="Credits">
            <div style={grid2}>
              <Labeled name="CreditBalance">
                <CreditBalance balance={BALANCE} />
              </Labeled>
              <Labeled name="CreditHistory">
                <CreditHistory operations={[...OPERATIONS]} hasMore onLoadMore={() => {}} />
              </Labeled>
            </div>
          </Section>

          <Section title="Usage">
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={grid2}>
                <Labeled name="UsageMeter">
                  <div style={{ display: 'grid', gap: 16 }}>
                    <UsageMeter used={4200} limit={10000} label="Normal" />
                    <UsageMeter used={8600} limit={10000} label="Warning (80%+)" />
                    <UsageMeter used={9800} limit={10000} label="Critical (95%+)" />
                    <UsageMeter used={1234} limit={null} label="Unlimited" />
                  </div>
                </Labeled>
                <Labeled name="UsageAlert">
                  <UsageAlert
                    features={[
                      { key: 'seats', label: 'Seats', percentage: 90 },
                      { key: 'storage', label: 'Storage', percentage: 98 },
                    ]}
                    upgradeHref="#"
                  />
                </Labeled>
              </div>
              <div style={grid2}>
                <Labeled name="UsageBreakdown">
                  <UsageBreakdown usage={CURRENT_USAGE} />
                </Labeled>
                <Labeled name="UsageTrend">
                  <UsageTrend periods={PAST_USAGE} />
                </Labeled>
              </div>
              <div style={grid2}>
                <Labeled name="UsageDashboard loading">
                  <UsageDashboard loading />
                </Labeled>
                <Labeled name="UsageDashboard empty">
                  <UsageDashboard features={[]} />
                </Labeled>
              </div>
            </div>
          </Section>

          <Section title="Checkout and upgrades">
            <div style={grid2}>
              <Labeled name="CheckoutButton">
                <div>
                  <CheckoutButton planCode="pro" label="Get Pro" />
                </div>
              </Labeled>
              <Labeled name="UpgradeButton (opens UpgradeModal)">
                <div>
                  <UpgradeButton
                    planCode="scale"
                    label="Upgrade to Scale"
                    preview={{ credit: 14.5, debit: 49.5, net: 35, currency: 'USD', nextBillingDate: '2026-11-01T00:00:00Z' }}
                  />
                </div>
              </Labeled>
              <Labeled name="Checkout">
                <Checkout checkout={completed} submitLabel="Pay $29.00" />
              </Labeled>
              <Labeled name="PaymentMethodDisplay">
                <PaymentMethodDisplay
                  paymentMethod={{ brand: 'visa', last4: '4242', expMonth: 8, expYear: 2029 }}
                  onUpdatePaymentMethod={() => {}}
                />
              </Labeled>
            </div>
          </Section>

          <Section title="Gates">
            <div style={grid2}>
              <Labeled name="UpgradePrompt">
                <UpgradePrompt planName="Pro" onUpgrade={() => {}} />
              </Labeled>
              <Labeled name="LockedOverlay">
                <LockedOverlay locked upgradePlanName="Scale" onUpgrade={() => {}}>
                  <div style={{ padding: 24, width: 420, maxWidth: '100%', border: '1px dashed currentColor', borderRadius: 12 }}>
                    <strong>Advanced analytics</strong>
                    <p style={{ margin: '8px 0 0' }}>Revenue by cohort, retention curves and exports.</p>
                  </div>
                </LockedOverlay>
              </Labeled>
              <Labeled name="FeatureGate, PlanGate, UsageGate (fallback shown)">
                <div style={{ display: 'grid', gap: 12 }}>
                  <FeatureGate allowed={false} fallback={<UpgradePrompt text="SSO needs the Scale plan" onUpgrade={() => {}} />}>
                    SSO settings
                  </FeatureGate>
                  <PlanGate currentPlan="free" allowedPlans={['pro', 'scale']} fallback={<UpgradePrompt planName="Pro" onUpgrade={() => {}} />}>
                    Team settings
                  </PlanGate>
                  <UsageGate usage={1000} limit={1000} fallback={<UpgradePrompt text="You used all 1,000 API calls" onUpgrade={() => {}} />}>
                    API console
                  </UsageGate>
                </div>
              </Labeled>
            </div>
          </Section>

          <Section title="Billing portal">
            <Labeled name="BillingPortal (with CancellationControl and PlanChangeControl)">
              {portalApiUrl && (
                <BillingPortal
                  createSession={async () => ({ token: 'demo-portal-token', apiUrl: portalApiUrl })}
                  cancellationActions={cancellationActions}
                  planChangeActions={planChangeActions}
                />
              )}
            </Labeled>
          </Section>
        </div>
      </BillingProvider>
    </div>
  )
}
