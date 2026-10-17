import { Nozle } from '@nozle-js/node'
import type { CustomerUsageData } from '@nozle-js/react'
import { CustomerPanels, HooksDemo, PricingPanels } from './panels'

// Local preview of the @nozle-js integration build. The secret key stays on this server;
// the browser only gets the publishable key for the public plan catalog.
export const dynamic = 'force-dynamic'

const coreUrl = process.env.NOZLE_CORE_URL ?? 'http://localhost:3000'
const customerId = process.env.NOZLE_DEMO_CUSTOMER ?? ''

const nozle = new Nozle({
  apiKey: process.env.NOZLE_SECRET_KEY,
  baseUrl: process.env.NOZLE_ENGINE_URL ?? 'http://localhost:8085',
  eventsUrl: coreUrl,
})

async function core<T>(path: string): Promise<T> {
  const response = await fetch(`${coreUrl}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${process.env.NOZLE_SECRET_KEY}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`)
  return response.json() as Promise<T>
}

async function settle<T>(work: Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await work, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) }
  }
}

export default async function SdkDemoPage() {
  const subscriptions = await settle(
    core<{ subscriptions: { external_id: string; plan_code: string }[] }>(
      `/subscriptions?external_customer_id=${encodeURIComponent(customerId)}&status[]=active`,
    ),
  )
  const subscription = subscriptions.data?.subscriptions[0]
  const query = subscription ? `?external_subscription_id=${encodeURIComponent(subscription.external_id)}` : ''
  const id = encodeURIComponent(customerId)

  const [balances, operations, current, past] = await Promise.all([
    settle(nozle.credits.listBalances(customerId)),
    settle(nozle.credits.listOperations(customerId, { limit: 10 })),
    settle(core<{ customer_usage: CustomerUsageData }>(`/customers/${id}/current_usage${query}`)),
    settle(core<{ usage_periods: CustomerUsageData[] }>(`/customers/${id}/past_usage${query}${query ? '&' : '?'}periods_count=6`)),
  ])

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px', display: 'grid', gap: 40 }}>
      <header>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Nozle SDK preview (local)</h1>
        <p style={{ opacity: 0.7 }}>
          @nozle-js/react and @nozle-js/node from the local integration branch, against the local Core and Engine.
          Customer <code>{customerId}</code>
          {subscription ? <> on plan <code>{subscription.plan_code}</code></> : null}.
        </p>
      </header>
      <PricingPanels
        publishableKey={process.env.NEXT_PUBLIC_NOZLE_PUBLISHABLE_KEY ?? ''}
        planCodes={(process.env.NOZLE_DEMO_PLANS ?? 'free,pro,max').split(',')}
        currentPlanCode={subscription?.plan_code}
      />
      <HooksDemo publishableKey={process.env.NEXT_PUBLIC_NOZLE_PUBLISHABLE_KEY ?? ''} previewPlan={process.env.NOZLE_DEMO_PREVIEW_PLAN ?? 'sdkverify_plan2'} />
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Same components, data read on the server</h2>
      <CustomerPanels
        balance={balances.data?.balances.find((b) => Number(b.available) > 0) ?? balances.data?.balances[0] ?? null}
        balanceError={balances.error}
        operations={operations.data?.operations ?? []}
        operationsError={operations.error}
        current={current.data?.customer_usage ?? null}
        currentError={current.error}
        past={past.data?.usage_periods ?? []}
        pastError={past.error}
      />
    </main>
  )
}
