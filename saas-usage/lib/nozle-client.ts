import { Nozle } from '@nozle-js/node'

if (!process.env.NOZLE_API_KEY) {
  throw new Error('NOZLE_API_KEY is not set')
}

export const nozle = new Nozle({
  apiKey: process.env.NOZLE_API_KEY,
  baseUrl: process.env.NOZLE_API_URL || 'https://api.nozle.app/engine',
  eventsUrl: process.env.NOZLE_EVENTS_URL || 'https://api.nozle.app/core',
})

/**
 * Get customer ID from session in API routes
 *
 * @example
 * import { getSession } from '@/lib/session'
 *
 * const session = await getSession()
 * if (!session.userId) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 *
 * const result = await nozle.can(session.userId, 'feature_name')
 */
