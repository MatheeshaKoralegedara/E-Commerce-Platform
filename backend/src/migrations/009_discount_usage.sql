CREATE TABLE discount_code_usage (
  id SERIAL PRIMARY KEY,
  discount_code_id INTEGER NOT NULL REFERENCES discount_codes(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  order_id INTEGER NOT NULL REFERENCES orders(id),
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discount_usage_code_user ON discount_code_usage(discount_code_id, user_id);

ALTER TABLE discount_codes ADD COLUMN per_user_limit INTEGER;