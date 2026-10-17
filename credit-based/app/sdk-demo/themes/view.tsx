'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import type React from 'react'
import {
  BillingPortal,
  BillingProvider,
  CancellationControl,
  Checkout,
  CheckoutButton,
  CreditBalance,
  CreditHistory,
  CurrentPlan,
  FeatureGate,
  LockedOverlay,
  PaymentMethodDisplay,
  PlanBadge,
  PlanCard,
  PlanComparison,
  PlanChangeControl,
  PlanGate,
  PoweredByNozle,
  PricingTable,
  UpgradeButton,
  UpgradePrompt,
  UsageAlert,
  UsageBreakdown,
  UsageDashboard,
  UsageGate,
  UsageMeter,
  UsageTrend,
  useAppearance,
  type Appearance,
  type CheckoutResult,
  type CreditBalanceData,
  type CustomerUsageData,
  type PlanChangeActions,
  type PlanChangeState,
} from '@nozle-js/react'
import { dark, light, minimal, neobrutal, nozle, nozleDark } from '@nozle-js/react/themes'
import { MORE_PLANS, PLANS } from './sample-plans'

const THEMES: Record<string, { appearance: Appearance; page: string; text: string }> = {
  light: { appearance: { theme: light }, page: '#f8fafc', text: '#111827' },
  dark: { appearance: { theme: dark }, page: '#030712', text: '#f3f4f6' },
  minimal: { appearance: { theme: minimal }, page: '#ffffff', text: '#111827' },
  neobrutal: { appearance: { theme: neobrutal }, page: '#fef9c3', text: '#000000' },
  nozle: { appearance: { theme: nozle }, page: 'hsl(138 30% 94%)', text: 'hsl(138 53% 8%)' },
  nozleDark: { appearance: { theme: nozleDark }, page: 'hsl(138 40% 6%)', text: 'hsl(138 20% 94%)' },
}

// ── Sample data ─────────────────────────────────────────────────────────────

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
// The same subscription with a downgrade to Free scheduled for renewal.
const scheduledState = (): PlanChangeState => ({
  ...planChangeState(),
  pendingChange: { id: 'pending-demo-1', plan: portalPlan('free', 'Free', 0), effectiveAt: '2026-11-01T00:00:00Z' },
})
const scheduledActions: PlanChangeActions = { ...planChangeActions, load: async () => scheduledState(), status: async () => scheduledState() }
const cancellationSubscription = { id: 'sub-1', externalId: 'sub-demo-1', name: 'Pro subscription', status: 'active', endingAt: null }
const refreshSubscription = async () => cancellationSubscription

// The catalog mock on this app answers `GET /api/v1/plans` with the sample plans.
const CATALOG = '/sdk-demo/themes/catalog-mock'

// ── Page ────────────────────────────────────────────────────────────────────

const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.6, margin: '0 0 12px' }
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'start' }

/** Loading, empty and error states of one component side by side. */
function States({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div style={{ ...grid3, maxWidth: 760 }}>
      {items.map(([state, node]) => (
        <div key={state} style={{ display: 'grid', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>{state}</span>
          {node}
        </div>
      ))}
    </div>
  )
}

const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

// `id` names the block for the docs screenshots (data-component); the label is hidden in them.
// `fit` shrinks the block to its content, for buttons and other small components.
function Labeled({ id, name = id, fit = false, children }: { id: string; name?: string; fit?: boolean; children: React.ReactNode }) {
  return (
    <div data-component={id} style={{ display: 'grid', gap: 8, justifySelf: fit ? 'start' : undefined }}>
      <code style={{ fontSize: 12, opacity: 0.6 }}>{`<${name}>`}</code>
      {children}
    </div>
  )
}

/** PoweredByNozle on its own, inside an element with the theme's CSS variables so it takes the theme's colours. */
function ThemedBadge() {
  const { vars } = useAppearance()
  return (
    <div style={vars}>
      <PoweredByNozle />
    </div>
  )
}

const COLOR_CONTROLS = [
  ['colorPrimary', 'Primary'],
  ['colorHighlight', 'Highlight'],
  ['colorHighlightForeground', 'Highlight text'],
  ['colorCard', 'Card'],
  ['colorForeground', 'Text'],
  ['colorBorder', 'Border'],
] as const
type ColorControl = (typeof COLOR_CONTROLS)[number][0]

const control: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }
const field: React.CSSProperties = { font: 'inherit', fontWeight: 500, padding: '5px 8px', borderRadius: 8, border: '1px solid currentColor', background: 'transparent', color: 'inherit' }

function Controls({
  name,
  highlight,
  colors,
  onColor,
  onReset,
}: {
  name: string
  highlight: 'outline' | 'filled'
  colors: Partial<Record<ColorControl, string>>
  onColor: (key: ColorControl, value: string) => void
  onReset: () => void
}) {
  const router = useRouter()
  const go = (theme: string, style: string) => router.replace(`?theme=${theme}&highlight=${style}`, { scroll: false })
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
      <label style={control}>
        Theme
        <select value={name} onChange={(event) => go(event.target.value, highlight)} style={field}>
          {Object.keys(THEMES).map((theme) => (
            <option key={theme} value={theme} style={{ color: '#111827' }}>
              {theme}
            </option>
          ))}
        </select>
      </label>
      <label style={control}>
        Highlighted plan
        <select value={highlight} onChange={(event) => go(name, event.target.value)} style={field}>
          <option value="outline" style={{ color: '#111827' }}>outline</option>
          <option value="filled" style={{ color: '#111827' }}>filled</option>
        </select>
      </label>
      {COLOR_CONTROLS.map(([key, label]) => (
        <label key={key} style={control} title={key}>
          <input
            type="color"
            value={colors[key] ?? '#4f46e5'}
            onChange={(event) => onColor(key, event.target.value)}
            style={{ width: 26, height: 26, padding: 0, border: colors[key] ? '2px solid currentColor' : '1px dashed currentColor', borderRadius: 6, background: 'transparent' }}
          />
          {label}
        </label>
      ))}
      <button type="button" onClick={onReset} style={{ ...field, cursor: 'pointer' }}>
        Reset colours
      </button>
    </div>
  )
}

export function ThemeGallery({ name, highlight }: { name: string; highlight: 'outline' | 'filled' }) {
  const key = THEMES[name] ? name : 'light'
  const chosen = THEMES[key]
  // Colours picked on the page go on top of the theme as appearance variables.
  const [colors, setColors] = useState<Partial<Record<ColorControl, string>>>({})
  const appearance: Appearance = { ...chosen.appearance, variables: colors }
  // The portal mock lives on this app; its URL is known only in the browser.
  const [portalApiUrl, setPortalApiUrl] = useState('')
  useEffect(() => setPortalApiUrl(`${window.location.origin}/sdk-demo/themes/portal-mock`), [])
  // Stable across renders, so the portal does not start a new session on every render.
  const createPortalSession = useCallback(async () => ({ token: 'demo-portal-token', apiUrl: portalApiUrl }), [portalApiUrl])

  return (
    <div
      style={{
        background: chosen.page,
        color: chosen.text,
        colorScheme: key === 'dark' || key === 'nozleDark' ? 'dark' : 'light',
        minHeight: '100vh',
      }}
    >
      {/* Hides the Next.js dev indicator in screenshots. */}
      <style>{'nextjs-portal{display:none}'}</style>
      {/* The nozle themes use Nunito; the app loads it, as the docs say. */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;800&display=swap" />
      <BillingProvider publishableKey="pk_demo_themes" baseUrl={CATALOG} appearance={appearance} createCheckout={createCheckout}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            padding: '14px 32px',
            background: chosen.page,
            borderBottom: '1px solid color-mix(in srgb, currentColor 15%, transparent)',
          }}
        >
          <strong style={{ fontSize: 16 }}>@nozle-js/react themes</strong>
          <Controls
            name={key}
            highlight={highlight}
            colors={colors}
            onColor={(control, value) => setColors((previous) => ({ ...previous, [control]: value }))}
            onReset={() => setColors({})}
          />
        </header>

        {/* The docs screenshots capture this block only. */}
        <div data-theme-ready style={{ padding: 32 }}>
          <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gap: 24 }}>
            <PricingTable plans={PLANS} currentPlanCode="free" highlightPlan="pro" highlightStyle={highlight} showToggle={false} onSelect={() => {}} />
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
          <Section title="Pricing">
            {/* Room for the badge above the highlighted card. */}
            <div style={{ display: 'grid', gap: 48 }}>
              <Labeled id="PricingTable">
                <PricingTable
                  plans={[...PLANS, ...MORE_PLANS]}
                  currentPlanCode="free"
                  highlightPlan="pro"
                  contactSalesPlans={['enterprise']}
                  onSelect={() => {}}
                />
              </Labeled>
              <Labeled id="PricingTableFilled" name='PricingTable highlightStyle="filled"'>
                <PricingTable plans={PLANS} currentPlanCode="free" highlightPlan="pro" highlightStyle="filled" onSelect={() => {}} />
              </Labeled>
              <Labeled id="PricingTableError" fit name="PricingTable (catalog could not be loaded)">
                <BillingProvider publishableKey="pk_demo_themes" baseUrl={`${CATALOG}/unavailable`} appearance={appearance}>
                  <PricingTable />
                </BillingProvider>
              </Labeled>
              <div style={grid2}>
                <Labeled id="PlanCard">
                  <PlanCard plan={PLANS[1]} isCurrent={false} onSelect={() => {}} />
                </Labeled>
                <Labeled id="PlanCardCurrent" name="PlanCard isCurrent">
                  <PlanCard plan={PLANS[0]} isCurrent onSelect={() => {}} />
                </Labeled>
              </div>
              <Labeled id="PlanComparison">
                <PlanComparison plans={PLANS} />
              </Labeled>
            </div>
          </Section>

          <Section title="Checkout">
            <div style={grid2}>
              <Labeled id="CheckoutButton" fit>
                <div>
                  <CheckoutButton planCode="pro" label="Get Pro" />
                </div>
              </Labeled>
              <Labeled id="Checkout" fit name="Checkout (checkout result)">
                <Checkout checkout={completed} submitLabel="Pay $29.00" />
              </Labeled>
            </div>
          </Section>

          <Section title="Plan change">
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={grid2}>
                <Labeled id="UpgradeButton" fit name="UpgradeButton (opens UpgradeModal)">
                  <div>
                    <UpgradeButton
                      planCode="scale"
                      label="Upgrade to Scale"
                      preview={{ credit: 14.5, debit: 49.5, net: 35, currency: 'USD', nextBillingDate: '2026-11-01T00:00:00Z' }}
                    />
                  </div>
                </Labeled>
                <Labeled id="CancellationControl" fit>
                  <CancellationControl subscription={cancellationSubscription} actions={cancellationActions} refresh={refreshSubscription} />
                </Labeled>
                <Labeled id="PlanChangeControl" fit>
                  <PlanChangeControl subscriptionId="sub-demo-1" actions={planChangeActions} />
                </Labeled>
                <Labeled id="PlanChangeControlScheduled" fit name="PlanChangeControl (downgrade scheduled)">
                  <PlanChangeControl subscriptionId="sub-demo-1" actions={scheduledActions} />
                </Labeled>
              </div>
            </div>
          </Section>

          <Section title="Billing display">
            <div style={{ display: 'grid', gap: 24 }}>
              <Labeled id="CurrentPlan">
                <CurrentPlan
                  subscription={{
                    subscription: {
                      external_id: 'sub-demo-1',
                      plan_code: 'pro',
                      status: 'active',
                      ending_at: null,
                      plan: { code: 'pro', name: 'Pro', amount_cents: 2900, currency: 'USD', interval: 'monthly' },
                    },
                    pending_change: { plan_code: 'scale', name: 'Scale', effective_at: '2026-11-01T00:00:00Z' },
                  }}
                  usage={[
                    { key: 'api_calls', label: 'API calls', used: 41200, limit: 50000 },
                    { key: 'seats', label: 'Seats', used: 6, limit: 10 },
                  ]}
                  details={[
                    { label: 'Renews', value: 'Nov 1, 2026' },
                    { label: 'AI credits included', value: '500 / month' },
                  ]}
                  actions={<a href="#" style={{ fontSize: 13, fontWeight: 600, color: 'inherit' }}>Manage billing</a>}
                />
              </Labeled>
              <Labeled id="CurrentPlanPastDue" name="CurrentPlan (past due, ending)">
                <CurrentPlan
                  subscription={{
                    subscription: {
                      external_id: 'sub-demo-1',
                      plan_code: 'pro',
                      status: 'active',
                      ending_at: '2026-11-01T00:00:00Z',
                      plan: { code: 'pro', name: 'Pro', amount_cents: 2900, currency: 'USD', interval: 'monthly' },
                    },
                    pending_change: null,
                    past_due: true,
                  }}
                  usage={[{ key: 'api_calls', label: 'API calls', used: 12000, limit: 50000 }]}
                />
              </Labeled>
              <Labeled id="CurrentPlanStates" name="CurrentPlan states">
                <States
                  items={[
                    ['isLoading', <CurrentPlan key="l" subscription={null} isLoading />],
                    ['subscription={null}', <CurrentPlan key="e" subscription={null} />],
                    ['error', <CurrentPlan key="x" subscription={null} error="Billing could not be loaded." />],
                  ]}
                />
              </Labeled>
              <Labeled id="PlanBadge" fit>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <PlanBadge plan="Free" tier="free" />
                  <PlanBadge plan="Starter" tier="starter" />
                  <PlanBadge plan="Pro" tier="pro" />
                  <PlanBadge plan="Enterprise" tier="enterprise" />
                </div>
              </Labeled>
              <div style={grid2}>
                <Labeled id="PaymentMethodDisplay">
                  <PaymentMethodDisplay
                    paymentMethod={{ brand: 'visa', last4: '4242', expMonth: 8, expYear: 2029 }}
                    onUpdatePaymentMethod={() => {}}
                  />
                </Labeled>
                <Labeled id="PaymentMethodDisplayEmpty" name="PaymentMethodDisplay (no payment method)">
                  <PaymentMethodDisplay onUpdatePaymentMethod={() => {}} />
                </Labeled>
              </div>
              <Labeled id="PoweredByNozle" fit>
                <ThemedBadge />
              </Labeled>
              <Labeled id="BillingPortal" name="BillingPortal (with CancellationControl and PlanChangeControl)">
                {portalApiUrl && (
                  <BillingPortal
                    createSession={createPortalSession}
                    cancellationActions={cancellationActions}
                    planChangeActions={planChangeActions}
                  />
                )}
              </Labeled>
            </div>
          </Section>

          <Section title="Usage">
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={grid2}>
                <Labeled id="UsageMeter">
                  <div style={{ display: 'grid', gap: 16 }}>
                    <UsageMeter used={4200} limit={10000} label="Normal" />
                    <UsageMeter used={8600} limit={10000} label="Warning (80%+)" />
                    <UsageMeter used={9800} limit={10000} label="Critical (95%+)" />
                    <UsageMeter used={1234} limit={null} label="Unlimited" />
                  </div>
                </Labeled>
                <Labeled id="UsageAlert">
                  <UsageAlert
                    features={[
                      { key: 'seats', label: 'Seats', percentage: 90 },
                      { key: 'storage', label: 'Storage', percentage: 98 },
                    ]}
                    upgradeHref="#"
                  />
                </Labeled>
                <Labeled id="UsageDashboard">
                  <UsageDashboard
                    features={[
                      { key: 'api_calls', label: 'API calls', used: 31200, limit: 50000 },
                      { key: 'seats', label: 'Seats', used: 9, limit: 10 },
                      { key: 'storage', label: 'Storage (GB)', used: 98, limit: 100 },
                    ]}
                  />
                </Labeled>
                <Labeled id="UsageBreakdown">
                  <UsageBreakdown usage={CURRENT_USAGE} />
                </Labeled>
              </div>
              <Labeled id="UsageDashboardStates" name="UsageDashboard states">
                <States
                  items={[
                    ['loading', <UsageDashboard key="l" loading />],
                    ['features={[]}', <UsageDashboard key="e" features={[]} />],
                    ['error', <UsageDashboard key="x" error="Usage could not be loaded." />],
                  ]}
                />
              </Labeled>
              <Labeled id="UsageBreakdownStates" name="UsageBreakdown states">
                <States
                  items={[
                    ['isLoading', <UsageBreakdown key="l" isLoading />],
                    ['usage={null}', <UsageBreakdown key="e" usage={null} />],
                    ['error', <UsageBreakdown key="x" error="Usage could not be loaded." />],
                  ]}
                />
              </Labeled>
              <div style={grid2}>
                <Labeled id="UsageTrend">
                  <UsageTrend periods={PAST_USAGE} />
                </Labeled>
                <Labeled id="UsageTrendFeature" name='UsageTrend featureCode="api_calls"'>
                  <UsageTrend periods={PAST_USAGE} featureCode="api_calls" />
                </Labeled>
              </div>
              <Labeled id="UsageTrendStates" name="UsageTrend states">
                <States
                  items={[
                    ['isLoading', <UsageTrend key="l" isLoading />],
                    ['periods={[]}', <UsageTrend key="e" periods={[]} />],
                    ['error', <UsageTrend key="x" error="Usage could not be loaded." />],
                  ]}
                />
              </Labeled>
            </div>
          </Section>

          <Section title="Credits">
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={grid2}>
                <Labeled id="CreditBalance">
                  <CreditBalance balance={BALANCE} />
                </Labeled>
              </div>
              <Labeled id="CreditHistory">
                <CreditHistory operations={[...OPERATIONS]} hasMore onLoadMore={() => {}} />
              </Labeled>
              <Labeled id="CreditBalanceStates" name="CreditBalance states">
                <States
                  items={[
                    ['isLoading', <CreditBalance key="l" isLoading />],
                    ['balance={null}', <CreditBalance key="e" balance={null} />],
                    ['error', <CreditBalance key="x" error="Credits could not be loaded." />],
                  ]}
                />
              </Labeled>
              <Labeled id="CreditHistoryStates" name="CreditHistory states">
                <States
                  items={[
                    ['isLoading', <CreditHistory key="l" isLoading />],
                    ['operations={[]}', <CreditHistory key="e" operations={[]} />],
                    ['error', <CreditHistory key="x" error="Credits could not be loaded." />],
                  ]}
                />
              </Labeled>
            </div>
          </Section>

          <Section title="Access control">
            <div style={grid2}>
              <Labeled id="UpgradePrompt" fit>
                <UpgradePrompt planName="Pro" onUpgrade={() => {}} />
              </Labeled>
              <Labeled id="LockedOverlay">
                <LockedOverlay locked upgradePlanName="Scale" onUpgrade={() => {}}>
                  <div style={{ padding: 24, width: 420, maxWidth: '100%', border: '1px dashed currentColor', borderRadius: 12 }}>
                    <strong>Advanced analytics</strong>
                    <p style={{ margin: '8px 0 0' }}>Revenue by cohort, retention curves and exports.</p>
                  </div>
                </LockedOverlay>
              </Labeled>
              <Labeled id="Gates" name="FeatureGate, PlanGate, UsageGate (fallback shown)">
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
        </div>
      </BillingProvider>
    </div>
  )
}
