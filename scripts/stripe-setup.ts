// Usage: pnpm stripe:setup   (creates the Pathora products/prices in Stripe if missing)
import { ensurePrices } from '../src/lib/billing'

const prices = await ensurePrices()
for (const [lookupKey, id] of Object.entries(prices)) console.log(`${lookupKey} -> ${id}`)
process.exit(0)
