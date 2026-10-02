-- NOVA E-Commerce schema (PostgreSQL 14+)

-- Shared trigger function: keeps updated_at accurate on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users
CREATE TABLE users (
  id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(20)  NOT NULL DEFAULT 'customer'
                   CHECK (role IN ('customer', 'admin')),
  phone          VARCHAR(20),
  address_line1  VARCHAR(255),
  address_line2  VARCHAR(255),
  city           VARCHAR(100),
  state          VARCHAR(100),
  postal_code    VARCHAR(20),
  country        VARCHAR(100),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX users_email_unique_idx ON users (LOWER(email));

-- categories
CREATE TABLE categories (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         VARCHAR(100) NOT NULL UNIQUE,
  slug         VARCHAR(100) NOT NULL UNIQUE,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
CREATE TABLE products (
  id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id       INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name              VARCHAR(200) NOT NULL,
  description       TEXT NOT NULL,
  price             NUMERIC(10,2) NOT NULL CHECK (price > 0),
  discount_percent  SMALLINT NOT NULL DEFAULT 0
                      CHECK (discount_percent BETWEEN 0 AND 90),
  stock             INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url         VARCHAR(500),
  specs             JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX products_category_idx ON products (category_id);
CREATE INDEX products_price_idx    ON products (price);
CREATE INDEX products_created_idx  ON products (created_at DESC);

-- ------------------------------------------------------------
-- carts (one per user) and cart_items
-- ------------------------------------------------------------
CREATE TABLE carts (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id     INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);
CREATE INDEX cart_items_cart_idx ON cart_items (cart_id);

-- ------------------------------------------------------------
-- wishlist_items
-- ------------------------------------------------------------
CREATE TABLE wishlist_items (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ------------------------------------------------------------
-- reviews
-- ------------------------------------------------------------
CREATE TABLE reviews (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX reviews_product_idx ON reviews (product_id);

-- ------------------------------------------------------------
-- orders and order_items
-- ------------------------------------------------------------
CREATE TABLE orders (
  id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_ref        VARCHAR(30) NOT NULL UNIQUE,        -- e.g. NOVA-2026-A8F3K2
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','processing',
                                       'shipped','delivered','cancelled')),
  subtotal         NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  tax              NUMERIC(10,2) NOT NULL CHECK (tax >= 0),
  shipping_fee     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  payment_method   VARCHAR(30) NOT NULL DEFAULT 'simulated',
  -- Shipping snapshot: later profile edits must not alter order history
  shipping_name    VARCHAR(100) NOT NULL,
  shipping_phone   VARCHAR(20)  NOT NULL,
  shipping_line1   VARCHAR(255) NOT NULL,
  shipping_line2   VARCHAR(255),
  shipping_city    VARCHAR(100) NOT NULL,
  shipping_state   VARCHAR(100) NOT NULL,
  shipping_postal  VARCHAR(20)  NOT NULL,
  shipping_country VARCHAR(100) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC);
CREATE INDEX orders_status_idx       ON orders (status);

CREATE TABLE order_items (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,  -- nullable on purpose
  product_name  VARCHAR(200) NOT NULL,                               -- snapshot
  unit_price    NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),      -- snapshot, after discount
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX order_items_order_idx ON order_items (order_id);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
CREATE TRIGGER trg_users_updated      BEFORE UPDATE ON users      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated   BEFORE UPDATE ON products   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_carts_updated      BEFORE UPDATE ON carts      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cart_items_updated BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reviews_updated    BEFORE UPDATE ON reviews    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated     BEFORE UPDATE ON orders     FOR EACH ROW EXECUTE FUNCTION set_updated_at();