
CREATE TABLE discount_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value INTEGER NOT NULL,              -- percentage: 1-100; fixed: cents off
  min_order_cents INTEGER DEFAULT 0,   -- minimum subtotal required to use this code
  usage_limit INTEGER,                 -- NULL = unlimited
  times_used INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,              -- NULL = never expires
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track which code was used on which order, and how much it actually discounted
ALTER TABLE orders ADD COLUMN discount_code_id INTEGER REFERENCES discount_codes(id);
ALTER TABLE orders ADD COLUMN discount_cents INTEGER NOT NULL DEFAULT 0;