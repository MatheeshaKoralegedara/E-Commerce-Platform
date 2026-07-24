# Mercato — Full-Stack E-Commerce Platform

A custom-built e-commerce platform with a Node.js/Express backend, Next.js frontend, PostgreSQL database, and Stripe payments. Built from scratch with a focus on production-grade concerns: transactional inventory safety, verified webhook payments, purchase-verified reviews, and a full admin dashboard.

**Live site:** https://e-commerce-platform-beta-eight.vercel.app
**Live API:** https://ecommerce-backend-dzsy.onrender.com

---

## Tech Stack

**Backend**
- Node.js + Express
- PostgreSQL (raw SQL via `pg`, no ORM)
- JWT authentication
- Stripe (Payment Intents + signature-verified webhooks)
- bcrypt for password hashing

**Frontend**
- Next.js (App Router)
- Tailwind CSS
- Stripe Elements (`@stripe/react-stripe-js`)
- Custom design system (Fraunces + Inter typography, warm neutral palette)

**Infrastructure**
- **Frontend hosting:** Vercel
- **Backend hosting:** Render
- **Database:** Neon (serverless Postgres)
- **Payments:** Stripe

---

## Features

### Customer-facing
- Browse products with category filtering and keyword search
- Product detail pages with variants (size/color/etc.), stock status, and images
- Star-rating product reviews (restricted to verified purchasers only)
- Cart with live quantity adjustment
- Two-step checkout: order review + discount code entry, then Stripe payment
- Discount codes (percentage or fixed-amount, with usage limits and minimum order thresholds)
- Order history and detailed order view
- Account registration/login with JWT-based sessions

### Admin dashboard (`/admin`)
- **Products** — create, edit, publish/unpublish, manage variants (add/delete), set images
- **Orders** — view all orders, filter by status, update status (pending → paid → shipped → delivered)
- **Discount Codes** — create, view usage, deactivate
- **Categories** — create, delete (blocked if products are still assigned)

### Backend safety guarantees
- **Transactional checkout** — stock reservation, order creation, and cart clearing all happen atomically; any failure rolls back the entire transaction
- **Optimistic locking on inventory** — a `version` column on product variants prevents overselling when multiple customers attempt to buy the last unit simultaneously
- **Order snapshotting** — product name and price are copied into `order_items` at time of purchase, so historical orders remain accurate even if products change or are deleted later
- **Purchase-verified reviews** — a customer can only review a product they have an actual paid/shipped/delivered order for
- **Signature-verified Stripe webhooks** — payment status is only ever updated via Stripe's cryptographically signed webhook events, never trusted from the frontend directly

---

## Project Structure

```
E-Commerce-Platform/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, Stripe client
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth (JWT verification, admin check)
│   │   ├── models/          # Database queries
│   │   ├── routes/          # Express route definitions
│   │   ├── migrations/      # SQL schema migration files (run in order)
│   │   └── server.js        # App entrypoint
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/              # Next.js App Router pages
    │   ├── components/       # Shared React components
    │   └── lib/               # API client, auth context, formatting helpers
    └── package.json
```

---

## Database Schema

Core tables: `users`, `products`, `product_variants`, `categories`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `reviews`, `discount_codes`.

Key design decisions:
- All monetary values stored as **integer cents** to avoid floating-point rounding errors
- `product_variants.version` enables optimistic locking for concurrency-safe stock updates
- `order_items` stores a **snapshot** of product name/price rather than joining live product data
- `reviews` has a `UNIQUE(product_id, user_id)` constraint — one review per customer per product

Migrations live in `backend/src/migrations/` and must be run in numeric order against a fresh database.

---

## Local Development Setup

### Prerequisites
- Node.js
- Docker (for local PostgreSQL)
- A Stripe account (test mode) and the [Stripe CLI](https://docs.stripe.com/stripe-cli) for local webhook testing

### Backend

```bash
cd backend
npm install
docker compose up -d          # starts local Postgres
# Run each file in backend/src/migrations/ in order against the local DB
npm run dev                   # starts on http://localhost:4000
```

In a separate terminal, forward Stripe webhooks to your local server:
```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

**Required `.env` (backend):**
```
DATABASE_URL=postgresql://ecom:ecom_pass@localhost:5433/ecommerce
JWT_SECRET=<random 32+ char string>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # starts on http://localhost:3000
```

**Required `.env.local` (frontend):**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Deployment

| Layer | Provider | Notes |
|---|---|---|
| Frontend | Vercel | Root directory: `frontend`; auto-deploys from `main` |
| Backend | Render | Root directory: `backend`; free tier spins down after 15 min idle |
| Database | Neon | Free tier; compute suspends on inactivity, data persists |
| Payments | Stripe | Currently in **test mode** — see below to go live |

### Going live with real payments
1. Switch the Stripe Dashboard to **Live mode**
2. Generate live API keys and update `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` on Render/Vercel
3. Register a new webhook endpoint under live mode pointing at `https://<backend-url>/api/webhooks/stripe`
4. Update `STRIPE_WEBHOOK_SECRET` on Render with the new live signing secret

---

## Currency

Prices are stored as integer cents and displayed in **Sri Lankan Rupees (Rs.)** via a shared formatter (`frontend/src/lib/format.js`). To change currency, update this single function.

---

## Known Limitations / Future Improvements

- Product images are stored as external URLs (no file upload yet); a real upload flow (e.g. via S3/Cloudflare R2) would be the natural next step
- No automated test suite yet
- Render free tier cold-starts (~30-60s) after inactivity — acceptable for a demo, not for production traffic
- CORS is currently restricted to the production frontend and localhost only