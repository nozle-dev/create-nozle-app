import { Nozle, createBillingHandler } from '@nozle-js/node'

// Serves the @nozle-js/react billing hooks with the secret key, which never leaves the server.
const nozle = new Nozle({
  apiKey: process.env.NOZLE_SECRET_KEY,
  baseUrl: process.env.NOZLE_ENGINE_URL ?? 'http://localhost:8085',
  eventsUrl: process.env.NOZLE_CORE_URL ?? 'http://localhost:3000',
})

// Local preview only: a real app returns the customer of the signed-in user from its session.
export const GET = createBillingHandler(nozle, {
  getCustomerId: () => process.env.NOZLE_DEMO_CUSTOMER,
})
