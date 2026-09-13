'use client'

import { useCallback, useEffect, useState } from 'react'

/** Read the signed-in customer's balance through the merchant server. */
export function useCreditBalance() {
  const [balance, setBalance] = useState<number>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const refresh = useCallback(() => setRevision(value => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch('/api/credits/balance', { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Unable to load credits')
        const data = await response.json()
        const available = Number(data.available)
        if (!Number.isFinite(available)) throw new Error('Invalid credit balance')
        setBalance(available)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBalance(undefined)
          setError('Unable to load credits')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [revision])

  return { balance, loading, error, refresh }
}
