'use client'

/**
 * ============================================================================
 * NOZLE SDK PROVIDERS SETUP
 * ============================================================================
 *
 * This file shows how to wrap your app with Nozle SDK providers.
 * For demo mode, the providers are commented out. Uncomment for production.
 */

// STEP 1: Import the Nozle provider
// import { BillingProvider } from '@nozle-js/react'

import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  // DEMO MODE: Only auth provider active
  // For demonstration, we're not connecting to Nozle API yet

  // PRODUCTION: Uncomment below to enable Nozle SDK
  // Wrap with both AuthProvider and BillingProvider
  /*
  return (
    <AuthProvider>
      <BillingProvider
        publicKey={process.env.NEXT_PUBLIC_NOZLE_PUBLISHABLE_KEY!}
        customerId={user?.id} // Get from auth context
      >
        {children}
      </BillingProvider>
    </AuthProvider>
  )
  */

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
