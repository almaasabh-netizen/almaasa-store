---
name: api-architect
description: Use when designing REST APIs, choosing between REST and GraphQL, implementing authentication, handling errors consistently, versioning an API, or setting up rate limiting. Covers HTTP standards, JWT/OAuth, OpenAPI docs, and WebSocket basics.
---

# API Architect

## When to invoke this skill
- Designing a new API endpoint or resource
- Choosing REST vs GraphQL
- Implementing auth (JWT, OAuth, sessions)
- Standardizing error responses
- Adding rate limiting
- Documenting an API

---

## REST API Standards

### HTTP Verbs
```
GET    /products          → list products (safe, idempotent)
GET    /products/:id      → get single product
POST   /products          → create product (not idempotent)
PUT    /products/:id      → replace entire resource (idempotent)
PATCH  /products/:id      → partial update (idempotent)
DELETE /products/:id      → delete (idempotent)
```

### URL Design
```
✅ Nouns, not verbs
GET /orders/:id/cancel   ❌
POST /orders/:id/cancellations  ✅  (creates a cancellation resource)

✅ Plural resource names
/user/:id   ❌
/users/:id  ✅

✅ Nested only when relationship is strong
/users/:id/orders     ✅ (orders belong to user)
/users/:id/products   ❌ (products are independent)

✅ Query params for filtering/sorting/pagination
GET /products?category=shoes&sort=price&order=asc&page=2&limit=20
```

### Status Codes
```
200 OK              — successful GET, PATCH, PUT
201 Created         — successful POST (include Location header)
204 No Content      — successful DELETE
400 Bad Request     — validation error, malformed request
401 Unauthorized    — not authenticated (wrong/missing token)
403 Forbidden       — authenticated but not allowed
404 Not Found       — resource doesn't exist
409 Conflict        — duplicate unique field, version conflict
422 Unprocessable   — semantic validation error
429 Too Many Requests — rate limited
500 Internal Error  — server bug (never expose stack trace)
```

---

## Error Response Format

**Always use a consistent error envelope:**

```typescript
// Successful response
{
  "data": { ... },
  "meta": { "total": 100, "page": 1 }  // optional
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",           // machine-readable
    "message": "Validation failed",       // human-readable
    "details": [                          // optional, for validation
      { "field": "email", "message": "Invalid email format" },
      { "field": "price", "message": "Must be greater than 0" }
    ]
  }
}
```

```typescript
// Next.js API Route — error helper
export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown[]
) {
  return Response.json({ error: { code, message, details } }, { status })
}

// Usage
if (!product) return apiError('NOT_FOUND', 'Product not found', 404)
if (!valid) return apiError('VALIDATION_ERROR', 'Invalid input', 422, errors)
```

---

## Authentication Patterns

### JWT (Stateless, good for APIs)
```typescript
// Access token: short-lived (15min), stored in memory
// Refresh token: long-lived (7d), stored in httpOnly cookie

// Sign JWT
import { SignJWT } from 'jose'
const token = await new SignJWT({ userId: user.id, role: user.role })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('15m')
  .sign(secret)

// Verify JWT (middleware)
try {
  const { payload } = await jwtVerify(token, secret)
  req.user = payload
} catch {
  return apiError('INVALID_TOKEN', 'Token expired or invalid', 401)
}
```

### Session-based (good for web apps with SSR)
```typescript
// Next.js with iron-session or next-auth
import { getServerSession } from 'next-auth'
const session = await getServerSession(authOptions)
if (!session) return redirect('/login')
```

### OAuth patterns
```
Authorization Code + PKCE → web apps (use next-auth)
Client Credentials → server-to-server (no user context)
Device Flow → CLI tools, TVs
```

---

## Rate Limiting

```typescript
// Upstash Redis rate limiting (works on Edge/Vercel)
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1m'),  // 10 req/min
})

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success, limit, remaining, reset } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    })
  }
}

// Different limits per endpoint:
// Auth endpoints: 5/min (prevent brute force)
// General API: 100/min per user
// Public search: 30/min per IP
```

---

## API Versioning

```
// URL versioning (most common, easiest to reason about)
/api/v1/products
/api/v2/products

// Header versioning (cleaner URLs, harder to test in browser)
Accept: application/vnd.yourapi.v2+json

// Query param (avoid — caching issues)
/api/products?version=2
```

**Deprecation strategy:**
1. Add `Deprecation: true` and `Sunset: Wed, 01 Jan 2025 00:00:00 GMT` headers
2. Keep v1 alive for 6+ months after v2 launch
3. Document breaking changes in CHANGELOG

---

## OpenAPI Documentation

```typescript
// Use Zod for validation + openapi-zod for docs
import { z } from 'zod'

const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
})

// Then generate OpenAPI spec from Zod schemas
// Tools: zod-to-openapi, @asteasolutions/zod-to-openapi

// Minimum docs per endpoint:
// - Description
// - Request body schema
// - Response schema (200, 400, 401, 404)
// - Auth requirement
// - Rate limit note
```

---

## REST vs GraphQL Decision

**Use REST when:**
- Simple CRUD operations
- Public API (easier to document, cache, secure)
- Team is unfamiliar with GraphQL
- Strict HTTP caching needs

**Use GraphQL when:**
- Complex, nested data with variable shapes (e.g., social feed)
- Multiple clients with different data needs (web + mobile)
- Rapid frontend iteration without backend changes
- Already using (Supabase GraphQL, Hasura, etc.)

---

## WebSockets & SSE

```typescript
// SSE (Server-Sent Events) — one-way, simpler, auto-reconnect
// Use for: real-time notifications, progress updates, live data

// Next.js App Router
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (data: string) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      const interval = setInterval(() => send({ time: new Date() }), 1000)
      setTimeout(() => { clearInterval(interval); controller.close() }, 30000)
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
  })
}

// WebSockets — bidirectional
// Use for: chat, collaborative editing, multiplayer games
// In Next.js: use a separate WebSocket server (ws) or Pusher/Ably/Supabase Realtime
```
