ALTER TABLE carts ADD COLUMN guest_token TEXT;
CREATE UNIQUE INDEX idx_carts_guest_token ON carts(guest_token) WHERE guest_token IS NOT NULL;
