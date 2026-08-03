
ALTER TABLE orders ADD COLUMN shipping_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN shipping_phone VARCHAR(30);
ALTER TABLE orders ADD COLUMN shipping_address_line1 VARCHAR(255);
ALTER TABLE orders ADD COLUMN shipping_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN shipping_postal_code VARCHAR(20);
ALTER TABLE orders ADD COLUMN shipping_country VARCHAR(100);