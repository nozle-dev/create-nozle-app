import { NextResponse } from 'next/server'
import { nozle } from '@/lib/nozle-client'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const creditSystemCode = process.env.NOZLE_CREDIT_SYSTEM_CODE
  if (!creditSystemCode) {
    return NextResponse.json({ error: 'Credit system is not configured' }, { status: 503 })
  }

  try {
    const balance = await nozle.credits.getBalance(session.userId, creditSystemCode)
    return NextResponse.json({ available: balance.available }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'Unable to load credits' }, { status: 502 })
  }
}
