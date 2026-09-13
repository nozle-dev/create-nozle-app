/**
 * DEMO MODE - Mock Credit Balance UI
 * This shows what the Nozle SDK credit components will render
 *
 * PRODUCTION IMPLEMENTATION:
 * Uncomment the code below and remove the mock UI
 *
 * import { CreditBalance, CreditHistory, CreditTopUpButton } from '@nozle-js/react'
 *
 * export default function CreditsPage() {
 *   const { user } = useSession() // Your auth system
 *
 *   return (
 *     <div className="space-y-8">
 *       <h1>Credits</h1>
 *
 *       {/* Credit Balance with Top-Up Button *\/}
 *       <CreditBalance
 *         customerId={user.id}
 *         showActions={true}  // Shows "Buy Credits" button
 *       />
 *
 *       {/* Or use standalone button *\/}
 *       <CreditTopUpButton
 *         customerId={user.id}
 *         presetAmounts={[10, 25, 50, 100, 250]}  // $ amounts
 *       />
 *
 *       {/* Transaction History *\/}
 *       <CreditHistory
 *         customerId={user.id}
 *         limit={10}  // Show last 10 transactions
 *       />
 *     </div>
 *   )
 * }
 *
 * SDK Components Features:
 * - CreditBalance: Shows available credits, auto-updates
 * - CreditTopUpButton: Opens Stripe checkout with preset amounts
 * - CreditHistory: Shows purchases, deductions, grants with type badges
 * - All components theme automatically with your design system
 */

'use client'

import { useState, useEffect } from 'react'
import { Zap, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  action?: string
  description: string
  timestamp: Date
  balance: number
}

export default function CreditsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch credit transactions
    // In production, this would call /api/credits/transactions

    // Mock data for demo
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'debit',
        amount: -10,
        action: 'generate-image',
        description: 'Generated image: Abstract art',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        balance: 490,
      },
      {
        id: '2',
        type: 'debit',
        amount: -5,
        action: 'analyze-text',
        description: 'Text analysis completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        balance: 500,
      },
      {
        id: '3',
        type: 'credit',
        amount: 500,
        description: 'Purchased 500 credit pack',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        balance: 505,
      },
      {
        id: '4',
        type: 'debit',
        amount: -25,
        action: 'generate-music',
        description: 'Generated music track',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        balance: 5,
      },
      {
        id: '5',
        type: 'credit',
        amount: 100,
        description: 'Welcome bonus',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        balance: 30,
      },
    ]

    setTimeout(() => {
      setTransactions(mockTransactions)
      setLoading(false)
    }, 500)
  }, [])

  const stats = {
    totalSpent: transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalPurchased: transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Credits</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your credit balance and view transaction history
        </p>
      </div>

      {/* Current Balance */}
      <div className="rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Zap className="h-4 w-4" />
            Available Credits
          </div>
          <div className="text-5xl font-bold mb-4">490</div>
          <div className="flex items-center justify-center gap-3">
            <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Buy Credits
            </button>
            <button className="rounded-lg border px-6 py-2 text-sm font-medium hover:bg-accent">
              View Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="h-4 w-4" />
            Total Spent
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold">{stats.totalSpent}</div>
            <div className="text-sm text-muted-foreground">credits</div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Total Purchased
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold">{stats.totalPurchased}</div>
            <div className="text-sm text-muted-foreground">credits</div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Transactions
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold">{stats.transactionCount}</div>
            <div className="text-sm text-muted-foreground">total</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Transaction History</h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      transaction.type === 'credit'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-orange-500/10 text-orange-500'
                    }`}
                  >
                    {transaction.type === 'credit' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-500' : 'text-orange-500'
                    }`}
                  >
                    {transaction.type === 'credit' ? '+' : ''}
                    {transaction.amount} credits
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Balance: {transaction.balance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
