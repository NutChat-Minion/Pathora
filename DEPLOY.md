# Pathora launch checklist

Node lives in your home folder. In each new terminal, run this first:

```sh
export PATH=$HOME/.local/opt/node/bin:$PATH
cd ~/Downloads/Pathora-web-V1
```

## 1. Fill in `.env`

`PAYLOAD_SECRET` and `CRON_SECRET` are already generated. Add these:

- `DATABASE_URL`: Neon → Connect → connection string
- `ANTHROPIC_API_KEY`: console.anthropic.com → API Keys
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe (test mode) → Developers → API keys

## 2. Create the database tables and run locally

```sh
pnpm migrate            # creates all tables in Neon
pnpm dev                # http://localhost:3000
```

- Open http://localhost:3000/admin and create the first **admin** account (this is for you, not for students).
- Students sign up at http://localhost:3000/login.

## 3. Fill the catalog with real listings (AI research)

```sh
pnpm research -- --topics=8
```

Each topic takes about 1–3 minutes and finds up to 6 listings. Run it a few times to cover all 20 default topics. Topics are editable in /admin → Listings → Research topics, and run logs are in Research runs.

## 4. Stripe

```sh
pnpm stripe:setup       # creates the 4 THB monthly plans (run once per mode)
```

In the Stripe dashboard (test mode):
- **Settings → Billing → Customer portal**: activate it and allow plan switching and cancellation.
- After deploying (step 5): **Developers → Webhooks → Add endpoint**:
  `https://<your-domain>/pathora-api/billing/webhook` with these events:
  `checkout.session.completed`, `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
  Copy the signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` (in Vercel too).
- Test card: `4242 4242 4242 4242`, any future date, any CVC.

## 5. Deploy to Vercel

1. Push this folder to a **private** GitHub repo. `.env` is git-ignored, so keys never leave your machine.
2. vercel.com → Add New → Project → import the repo. The framework is auto-detected as Next.js.
3. **Storage → Create → Blob**, connected to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. **Settings → Environment Variables**: add every variable from `.env`. Set
   `NEXT_PUBLIC_SITE_URL` to the production URL (e.g. `https://pathora.vercel.app`).
5. Deploy. The build runs `payload migrate` first, so the database stays in sync.
6. Add the Stripe webhook (step 4), then redeploy.
7. The Vercel cron (`vercel.json`) refreshes listings daily at 02:00 Bangkok time.

## Changing the schema later

After editing a collection, run `pnpm payload migrate:create <name>` and commit the new file in
`src/migrations/`. The next deploy applies it.

## Known limits for launch

- **Unreviewed listings:** AI listings auto-publish. Each one links to its official source, but no human reviews it first. Spot-check them in /admin.
- **Private documents:** documents are stored under random URLs in Vercel Blob (public-access storage, but not guessable) and served through access-checked routes.
- **No email:** password reset emails and other mail print to the server log until an email provider is added.
