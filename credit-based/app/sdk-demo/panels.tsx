'use client'

import {
  BillingProvider,
  CreditBalance,
  CreditHistory,
  PlanComparison,
  PricingTable,
  UsageBreakdown,
  UsageTrend,
  usePlans,
  useBillingRefresh,
  useCreditBalance,
  useCreditHistory,
  useEntitlement,
  useSubscription,
  useUpgradePreview,
  useUsage,
  type CreditBalanceData,
  type CreditOperationData,
  type CustomerUsageData,
} from '@nozle-js/react'

const section = { display: 'grid', gap: 16 } as const
const heading = { fontSize: 20, fontWeight: 600 } as const

function Pricing({ planCodes, currentPlanCode }: { planCodes: string[]; currentPlanCode?: string }) {
  const { plans, isLoading, error } = usePlans()
  const shown = (plans ?? []).filter((plan) => planCodes.includes(plan.code))
  if (isLoading) return <p>Loading plans…</p>
  if (error) return <p>Plans failed to load: {error.message}</p>
  return (
    <>
      <section style={section}>
        <h2 style={heading}>PricingTable</h2>
        <PricingTable plans={shown} currentPlanCode={currentPlanCode} returnUrl={typeof window === 'undefined' ? '' : window.location.href} />
      </section>
      <section style={section}>
        <h2 style={heading}>PlanComparison</h2>
        <PlanComparison plans={shown} />
      </section>
    </>
  )
}

export function PricingPanels(props: { publishableKey: string; planCodes: string[]; currentPlanCode?: string }) {
  return (
    <BillingProvider
      publishableKey={props.publishableKey}
      baseUrl="/nozle-engine"
      createCheckout={async () => {
        throw new Error('Checkout is not wired in this local preview')
      }}
    >
      <Pricing planCodes={props.planCodes} currentPlanCode={props.currentPlanCode} />
    </BillingProvider>
  )
}

export function CustomerPanels(props: {
  balance: CreditBalanceData | null
  balanceError: string | null
  operations: CreditOperationData[]
  operationsError: string | null
  current: CustomerUsageData | null
  currentError: string | null
  past: CustomerUsageData[]
  pastError: string | null
}) {
  return (
    <>
      <section style={section}>
        <h2 style={heading}>CreditBalance</h2>
        <CreditBalance balance={props.balance} error={props.balanceError} />
      </section>
      <section style={section}>
        <h2 style={heading}>CreditHistory</h2>
        <CreditHistory operations={props.operations} error={props.operationsError} />
      </section>
      <section style={section}>
        <h2 style={heading}>UsageBreakdown (current period)</h2>
        <UsageBreakdown usage={props.current} error={props.currentError} />
      </section>
      <section style={section}>
        <h2 style={heading}>UsageTrend (past periods)</h2>
        <UsageTrend periods={props.past} error={props.pastError} />
      </section>
    </>
  )
}

function HookPanels({ previewPlan }: { previewPlan: string }) {
  const subscription = useSubscription()
  const entitlement = useEntitlement(process.env.NEXT_PUBLIC_NOZLE_DEMO_FEATURE ?? 'sdkverify_gen')
  const balance = useCreditBalance()
  const history = useCreditHistory({ limit: 3 })
  const usage = useUsage()
  const preview = useUpgradePreview(previewPlan)
  const refresh = useBillingRefresh()
  const show = (query: { data?: unknown; error: unknown; isPending: boolean }) =>
    query.isPending ? 'Loading…' : query.error ? `Error: ${(query.error as Error).message}` : JSON.stringify(query.data, null, 2)
  return (
    <>
      <section style={section}>
        <h2 style={heading}>Hooks (TanStack Query) through /api/nozle</h2>
        <button onClick={() => void refresh()} style={{ justifySelf: 'start', padding: '4px 12px', border: '1px solid #ccc', borderRadius: 6 }}>
          Refresh all billing data
        </button>
        <h3>useSubscription()</h3>
        <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>
          {show({
            ...subscription,
            data: subscription.data && {
              plan: subscription.data.subscription?.plan,
              status: subscription.data.subscription?.status,
              ending_at: subscription.data.subscription?.ending_at,
              pending_change: subscription.data.pending_change,
            },
          })}
        </pre>
        <h3>useEntitlement()</h3>
        <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{show(entitlement)}</pre>
        <h3>useUpgradePreview(&quot;{previewPlan}&quot;)</h3>
        <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{show(preview)}</pre>
      </section>
      <section style={section}>
        <h3>useCreditBalance() + CreditBalance</h3>
        <CreditBalance balance={balance.data} isLoading={balance.isPending} error={balance.error as Error | null} />
        <h3>useCreditHistory() + CreditHistory (3 per page)</h3>
        <CreditHistory
          operations={history.operations}
          isLoading={history.isPending}
          error={history.error as Error | null}
          hasMore={history.hasNextPage}
          onLoadMore={() => void history.fetchNextPage()}
        />
        <h3>useUsage() + UsageBreakdown</h3>
        <UsageBreakdown usage={usage.data as CustomerUsageData | null | undefined} isLoading={usage.isPending} error={usage.error as Error | null} />
      </section>
    </>
  )
}

export function HooksDemo(props: { publishableKey: string; previewPlan: string }) {
  return (
    <BillingProvider publishableKey={props.publishableKey} baseUrl="/nozle-engine" billingEndpoint="/api/nozle">
      <HookPanels previewPlan={props.previewPlan} />
    </BillingProvider>
  )
}
