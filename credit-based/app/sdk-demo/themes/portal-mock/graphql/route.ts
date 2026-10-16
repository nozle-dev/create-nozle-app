// Canned customer-portal GraphQL answers, so BillingPortal renders on the themes page without a session.
const plan = { id: 'plan-pro', name: 'Pro', code: 'pro', invoiceDisplayName: null, amountCents: '2900', amountCurrency: 'USD', interval: 'monthly' }
const subscription = {
  id: 'sub-1', externalId: 'sub-demo-1', status: 'active', endingAt: null, nextSubscription: null,
  name: 'Pro subscription', currentBillingPeriodEndingAt: '2026-11-01T00:00:00Z', plan,
}
const page = (collection: unknown[]) => ({ collection, metadata: { currentPage: 1, totalPages: 1, totalCount: collection.length } })

const DATA: Record<string, unknown> = {
  SdkPortalIdentity: {
    customerPortalUser: {
      id: 'cus-1', name: 'Acme Inc', firstname: null, lastname: null, customerType: 'company', email: 'billing@acme.test',
      legalName: 'Acme Inc', taxIdentificationNumber: null, currency: 'USD', applicableTimezone: 'TZ_UTC',
      addressLine1: '1 Market St', addressLine2: null, city: 'San Francisco', state: 'CA', zipcode: '94105', country: 'US',
      shippingAddress: null,
    },
    customerPortalOrganization: { id: 'org', name: 'Your SaaS' },
  },
  SdkPortalSubscriptions: { customerPortalSubscriptions: page([subscription]) },
  SdkPortalSubscription: { customerPortalSubscription: subscription },
  SdkPortalUsage: {
    customerPortalCustomerUsage: {
      amountCents: '1840', currency: 'USD', fromDatetime: '2026-10-01T00:00:00Z', toDatetime: '2026-11-01T00:00:00Z',
      chargesUsage: [
        { id: 'c1', units: 31200, amountCents: '1240', charge: null, feature: { id: 'f1', code: 'api_calls', name: 'API calls' } },
        { id: 'c2', units: 9, amountCents: '600', charge: null, feature: { id: 'f2', code: 'seats', name: 'Seats' } },
      ],
    },
  },
  SdkPortalInvoices: {
    customerPortalInvoices: page([
      { id: 'inv-2', number: 'ACME-002', issuingDate: '2026-10-01', totalAmountCents: '2900', totalDueAmountCents: '0', currency: 'USD', paymentStatus: 'succeeded', paymentOverdue: false, paymentDisputeLostAt: null },
      { id: 'inv-1', number: 'ACME-001', issuingDate: '2026-09-01', totalAmountCents: '2900', totalDueAmountCents: '0', currency: 'USD', paymentStatus: 'succeeded', paymentOverdue: false, paymentDisputeLostAt: null },
    ]),
  },
  SdkPortalWallets: {
    customerPortalWallets: page([
      { id: 'w1', name: 'Prepaid credits', currency: 'USD', balanceCents: '12400', creditsBalance: 1240, consumedCredits: 260, expirationAt: null, rateAmount: 0.1, paidTopUpMinAmountCents: null, paidTopUpMaxAmountCents: null },
    ]),
  },
  SdkPortalUpdateCustomer: { updateCustomerPortalCustomer: { id: 'cus-1' } },
  SdkPortalTopUp: { createCustomerPortalWalletTransaction: { collection: [{ id: 'tx-1' }] } },
}

export async function POST(request: Request) {
  const { query } = (await request.json()) as { query: string }
  const name = query.match(/^(?:query|mutation)\s+(\w+)/)?.[1] ?? ''
  if (!(name in DATA)) return Response.json({ errors: [{ message: 'not mocked' }] }, { status: 400 })
  return Response.json({ data: DATA[name] })
}
