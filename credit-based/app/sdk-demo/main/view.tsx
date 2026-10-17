'use client'

import { useEffect, useState } from 'react'
import type React from 'react'
import {
  BillingPortal,
  BillingProvider,
  Checkout,
  CheckoutButton,
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
  UsageDashboard,
  UsageGate,
  UsageMeter,
  type CheckoutResult,
  type Plan,
  type PlanChangeActions,
  type PlanChangeState,
  type PricingPlan,
} from 'nozle-react-main'

// Same sample data as /sdk-demo/themes, in the main branch's prop shapes.
const PLANS: PricingPlan[] = [
  { code: 'free', name: 'Free', amount_cents: 0, amount_currency: 'USD', interval: 'monthly', description: 'For trying things out' },
  { code: 'pro', name: 'Pro', amount_cents: 2900, amount_currency: 'USD', interval: 'monthly', description: 'For growing teams' },
  { code: 'scale', name: 'Scale', amount_cents: 9900, amount_currency: 'USD', interval: 'monthly', description: 'For high volume' },
]
const FEATURES = [
  ['1,000 API calls', '1 Seat'],
  ['50,000 API calls', '10 Seats', '500 AI credits every month'],
  ['Unlimited API calls', '50 Seats', '2,500 AI credits every month'],
]
const CARD_PLANS: Plan[] = PLANS.map((plan, index) => ({
  id: plan.code,
  name: plan.name,
  description: plan.description,
  monthlyPrice: plan.amount_cents / 100,
  annualPrice: (plan.amount_cents / 100) * 10,
  features: FEATURES[index],
}))
const COMPARISON = [
  { key: 'api_calls', label: 'API calls', values: { free: '1,000', pro: '50,000', scale: 'Unlimited' } },
  { key: 'seats', label: 'Seats', values: { free: '1', pro: '10', scale: '50' } },
  { key: 'ai_credits', label: 'AI credits every month', values: { free: false, pro: '500', scale: '2,500' } },
]

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

// Main's components read the host app's shadcn variables with no fallback of their own. These are the
// integration build's light values under the shadcn names, so both pages use the same colours.
const SHADCN_VARS = {
  '--primary': '#4f46e5',
  '--primary-foreground': '#ffffff',
  '--background': '#ffffff',
  '--foreground': '#111827',
  '--muted': '#f3f4f6',
  '--muted-foreground': '#6b7280',
  '--accent': '#eef2ff',
  '--accent-foreground': '#3730a3',
  '--border': '#e5e7eb',
  '--destructive': '#dc2626',
  '--warning': '#d97706',
} as React.CSSProperties

function Missing({ names }: { names: string }) {
  return <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>Not on main: {names}.</p>
}

export function MainGallery() {
  // The portal mock lives on this app; its URL is known only in the browser.
  const [portalApiUrl, setPortalApiUrl] = useState('')
  useEffect(() => setPortalApiUrl(`${window.location.origin}/sdk-demo/themes/portal-mock`), [])
  const [hostVars, setHostVars] = useState<'shadcn' | 'none'>('none')

  return (
    <div style={{ background: '#f8fafc', color: '#111827', minHeight: '100vh', ...(hostVars === 'shadcn' ? SHADCN_VARS : {}) }}>
      <style>{'nextjs-portal{display:none}'}</style>
      <BillingProvider publishableKey="pk_demo_main" createCheckout={createCheckout}>
        <header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', gap: 16, alignItems: 'center', padding: '14px 32px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ fontSize: 16 }}>@nozle-js/react 0.10.2 (main)</strong>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
            Host app CSS
            <select
              value={hostVars}
              onChange={(event) => setHostVars(event.target.value as 'shadcn' | 'none')}
              style={{ font: 'inherit', fontWeight: 500, padding: '5px 8px', borderRadius: 8, border: '1px solid currentColor', background: 'transparent' }}
            >
              <option value="none">none (plain app)</option>
              <option value="shadcn">shadcn variables set</option>
            </select>
          </label>
          <a href="/sdk-demo/themes" style={{ fontSize: 13, color: 'inherit' }}>Compare: integration build →</a>
        </header>

        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 32px 64px', display: 'grid', gap: 48 }}>
          <Section title="Plans">
            <div style={{ display: 'grid', gap: 24 }}>
              <Labeled name="PricingTable (catalog plans: main shows no plan features)">
                <PricingTable plans={PLANS} currentPlanCode="free" highlightPlan="pro" showToggle={false} onSelect={() => {}} />
              </Labeled>
              <Labeled name="PricingTable features={...} (lines typed by hand in the app)">
                <PricingTable plans={PLANS} features={FEATURES} currentPlanCode="free" highlightPlan="pro" showToggle={false} onSelect={() => {}} />
              </Labeled>
              <Missing names="CurrentPlan" />
              <div style={grid2}>
                <Labeled name="PlanCard (data typed by hand in the app)">
                  <PlanCard {...CARD_PLANS[1]} isAnnual={false} isCurrent={false} onSelect={() => {}} />
                </Labeled>
                <Labeled name="PlanCard isCurrent">
                  <PlanCard {...CARD_PLANS[0]} isAnnual={false} isCurrent onSelect={() => {}} />
                </Labeled>
              </div>
              <Labeled name="PlanComparison (plans and rows typed by hand in the app)">
                <PlanComparison plans={CARD_PLANS} features={COMPARISON} />
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
            <Missing names="CreditBalance, CreditHistory" />
          </Section>

          <Section title="Usage">
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={grid2}>
                <Labeled name="UsageMeter">
                  <div style={{ display: 'grid', gap: 16 }}>
                    <UsageMeter used={4200} limit={10000} label="Normal" />
                    <UsageMeter used={8600} limit={10000} label="Warning (80%+)" />
                    <UsageMeter used={9800} limit={10000} label="Critical (95%+)" />
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
                <Labeled name="UsageDashboard">
                  <UsageDashboard
                    features={[
                      { key: 'api_calls', label: 'API calls', used: 31200, limit: 50000 },
                      { key: 'seats', label: 'Seats', used: 9, limit: 10 },
                      { key: 'storage', label: 'Storage (GB)', used: 98, limit: 100 },
                    ]}
                  />
                </Labeled>
                <Labeled name="UsageDashboard loading">
                  <UsageDashboard loading />
                </Labeled>
              </div>
              <Missing names="UsageBreakdown, UsageTrend, an unlimited UsageMeter" />
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
