---
name: database-pro
description: Use when designing database schemas, writing SQL queries, setting up Row Level Security in Supabase, optimizing slow queries, or planning migrations. Covers PostgreSQL best practices, indexing, RLS, connection pooling, and Supabase/Neon/Railway patterns.
---

# Database Pro

## When to invoke this skill
- Designing a new schema or table
- Writing or optimizing a SQL query
- Setting up RLS policies in Supabase
- Debugging slow queries
- Planning a migration
- Choosing indexes

---

## Schema Design Principles

### Naming Conventions
```sql
-- Tables: plural, snake_case
CREATE TABLE products (...);
CREATE TABLE order_items (...);

-- Columns: snake_case, descriptive
-- IDs: use uuid (Supabase default) or bigserial for performance
-- Timestamps: always include created_at, updated_at

CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  price       numeric(10,2) NOT NULL CHECK (price >= 0),
  stock_qty   integer NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Normalization vs Denormalization

**Normalize (3NF) when:**
- Data changes frequently (user profile, prices)
- Data consistency is critical
- OLTP workloads (many small reads/writes)

**Denormalize when:**
- Read-heavy, analytics queries (dashboard, reports)
- The JOIN cost is measurably hurting performance
- Data rarely changes (product categories, country names)

```sql
-- Normalized (preferred default)
users (id, email, name)
orders (id, user_id FK, total, created_at)
order_items (id, order_id FK, product_id FK, qty, unit_price)

-- Denormalized (acceptable for read models)
order_summary (order_id, user_email, user_name, total, item_count)
```

---

## Row Level Security (RLS) — Supabase

```sql
-- ALWAYS enable RLS on user-facing tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own orders
CREATE POLICY "users_own_orders"
ON orders FOR ALL
USING (auth.uid() = user_id);

-- Policy: everyone can read published products
CREATE POLICY "read_active_products"
ON products FOR SELECT
USING (is_active = true);

-- Policy: only admins can modify products
CREATE POLICY "admins_manage_products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Service role bypasses RLS — use for server-side admin operations
-- Never expose service key to client
```

**RLS checklist:**
- [ ] Enable RLS on every table before going to production
- [ ] Test policies with both authenticated and anonymous users
- [ ] Use `auth.uid()` not `current_user` for Supabase
- [ ] Create separate read/write policies for clarity

---

## Indexing Strategies

```sql
-- B-tree (default) — equality, range, ORDER BY
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Partial index — subset of rows (much smaller, faster)
CREATE INDEX idx_active_products ON products(name) WHERE is_active = true;
CREATE INDEX idx_pending_orders ON orders(created_at) WHERE status = 'pending';

-- Composite index — multiple columns (order matters!)
-- Good for queries that filter/sort by multiple columns
CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at DESC);
-- Covers: WHERE user_id = ? AND status = ?
-- Covers: WHERE user_id = ? ORDER BY created_at DESC
-- Does NOT cover: WHERE status = ? (without user_id)

-- GIN index — JSONB, arrays, full-text search
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_search ON products USING GIN(
  to_tsvector('arabic', name || ' ' || description)
);

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;  -- low idx_scan = unused index, consider removing
```

**When NOT to index:**
- Columns with very low cardinality (boolean, status with 2 values)
- Small tables (< 1000 rows) — sequential scan is faster
- Columns that are rarely queried

---

## Query Optimization

```sql
-- Always EXPLAIN ANALYZE before optimizing
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.*, COUNT(oi.id) as sold_count
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
WHERE p.is_active = true
GROUP BY p.id
ORDER BY sold_count DESC
LIMIT 20;

-- Look for:
-- Seq Scan on large table → needs index
-- Hash Join with large rows → needs index on join key
-- High actual rows vs estimated rows → run ANALYZE table_name (updates stats)
-- Nested Loop with large outer → might benefit from hash join hint
```

**Common slow query patterns:**

```sql
-- ❌ Function on indexed column kills index
WHERE LOWER(email) = 'user@example.com'

-- ✅ Functional index or store lowercase
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
-- or: store email as lowercase in application

-- ❌ SELECT * in production queries
SELECT * FROM products WHERE ...

-- ✅ Select only needed columns
SELECT id, name, price, slug FROM products WHERE ...

-- ❌ N+1 in ORM
orders.forEach(o => fetchUser(o.userId))  // N queries

-- ✅ JOIN or IN
SELECT o.*, u.name FROM orders o JOIN users u ON u.id = o.user_id
```

---

## Migrations Workflow

```sql
-- Use sequential versioned files: 001_create_users.sql, 002_add_products.sql
-- Or use Supabase migrations: supabase migration new add_products_table

-- Always include both up and down
-- Up migration:
ALTER TABLE products ADD COLUMN weight_kg numeric(8,3);
CREATE INDEX idx_products_weight ON products(weight_kg);

-- Down migration (in separate file or comments):
-- DROP INDEX idx_products_weight;
-- ALTER TABLE products DROP COLUMN weight_kg;

-- Adding NOT NULL column to existing table safely:
-- Step 1: add nullable with default
ALTER TABLE products ADD COLUMN sku text;
-- Step 2: backfill (in batches for large tables)
UPDATE products SET sku = 'SKU-' || id::text WHERE sku IS NULL;
-- Step 3: add constraint
ALTER TABLE products ALTER COLUMN sku SET NOT NULL;
```

---

## Connection Pooling

```
-- Supabase: use connection pooler URL (port 6543) for serverless/edge
-- Direct connection (port 5432): for migrations, long-running scripts

-- In .env:
DATABASE_URL=postgresql://...@pooler.supabase.com:6543/postgres  # ✅ serverless
DIRECT_URL=postgresql://...@project.supabase.com:5432/postgres   # migrations only

-- Prisma config:
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Pool sizing rule of thumb:**
- Serverless (Vercel/Netlify): use Supabase pooler (PgBouncer) — max 15 connections per worker
- Long-running server: `pool_size = (2 × CPU cores) + 1`
- Never exceed database `max_connections` (Supabase free: 60)

---

## Backup Strategies

```bash
# Manual backup
pg_dump --format=custom --no-acl --no-owner \
  postgresql://user:pass@host/dbname > backup_$(date +%Y%m%d).dump

# Restore
pg_restore --clean --no-acl --no-owner \
  -d postgresql://user:pass@host/dbname backup_20240101.dump

# Supabase: enable Point-in-Time Recovery (PITR) on Pro plan
# Neon: branching = instant DB copy for staging/testing
```

**Backup checklist:**
- [ ] Automated daily backups
- [ ] Test restore monthly
- [ ] Backups stored in separate region
- [ ] Retention: 30 days minimum for production
