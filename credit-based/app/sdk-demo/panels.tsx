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
