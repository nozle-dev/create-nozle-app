'use client'

import { useState } from 'react'
import { useCreditBalance } from '@/lib/use-credit-balance'
import { Zap, Image, FileText, Video, Music, Code, Palette, Loader2 } from 'lucide-react'

export default function StudioPage() {
  const { balance: credits, loading: creditsLoading, error: balanceError, refresh } = useCreditBalance()
  const [executing, setExecuting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const actions = [
    { id: 'generate-image', name: 'Generate Image', desc: 'AI-powered image generation', icon: Image, cost: 10 },
    { id: 'analyze-text', name: 'Analyze Text', desc: 'Extract insights from text', icon: FileText, cost: 5 },
    { id: 'create-video', name: 'Create Video', desc: 'Generate short videos', icon: Video, cost: 50 },
    { id: 'generate-music', name: 'Generate Music', desc: 'AI music composition', icon: Music, cost: 25 },
    { id: 'code-review', name: 'Code Review', desc: 'Automated code analysis', icon: Code, cost: 15 },
    { id: 'color-palette', name: 'Color Palette', desc: 'Generate color schemes', icon: Palette, cost: 3 },
  ]

  const executeAction = async (actionId: string, actionCost: number) => {
    setExecuting(actionId)
    setError(null)

    try {
      const response = await fetch(`/api/actions/${actionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Demo prompt',
          // Add action-specific parameters here
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute action')
      }

      refresh()
      // Success - redirect to gallery or show result
      alert(`Action completed! ${actionCost} credits used. ${data.creditsRemaining} remaining.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute action')
    } finally {
      setExecuting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Action Studio</h1>
        <p className="mt-1 text-muted-foreground">Choose an action to create with credits</p>
      </div>

      {/* Credit Balance */}
      {!creditsLoading && credits !== undefined && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Available Credits</div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{credits}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(error || balanceError) && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-500">
          {error || balanceError}
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon
          const isExecuting = executing === action.id
          const hasEnoughCredits = credits !== undefined && credits >= action.cost

          return (
            <button
              key={action.id}
              onClick={() => executeAction(action.id, action.cost)}
              disabled={isExecuting || !hasEnoughCredits}
              className="rounded-lg border p-6 text-left transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExecuting ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <Icon className="h-10 w-10 text-primary" />
              )}
              <div className="mt-4 font-semibold">{action.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{action.desc}</div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                {action.cost} credits
              </div>
              {!hasEnoughCredits && (
                <div className="mt-2 text-xs text-red-500">Insufficient credits</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
