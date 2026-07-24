CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    provider VARCHAR(30) NOT NULL DEFAULT 'stripe',    
    provider_payment_id VARCHAR(255) UNIQUE NOT NULL ,   --stripe's paymentIntent id
    status VARCHAR(20) NOT NULL DEFAULT 'pending',       --pending | succeeded | failed
    amount_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id)