import { PLANS } from '../../../../sample-plans'

// Canned public plan catalog (`GET /api/v1/plans`), so components that read the catalog render on the themes page.
export async function GET() {
  return Response.json({ plans: PLANS, meta: { nozle_branding: false } })
}
