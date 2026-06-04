---
name: security-essentials
description: Use when reviewing code for security issues, implementing authentication, handling user input, storing secrets, or setting up security headers. Covers OWASP Top 10, XSS/CSRF/SQLi prevention, password security, secrets management, and dependency scanning.
---

# Security Essentials

## When to invoke this skill
- Handling user input (forms, query params, URL params)
- Building auth or session management
- Storing or accessing secrets/credentials
- Reviewing code before deployment
- Setting up HTTP security headers
- Any feature touching user data or permissions

---

## OWASP Top 10 Quick Reference

| # | Vulnerability | One-line defense |
|---|--------------|-----------------|
| 1 | Broken Access Control | Check permissions on EVERY request server-side |
| 2 | Cryptographic Failures | HTTPS everywhere, bcrypt passwords, never store plaintext |
| 3 | Injection (SQL/XSS/etc) | Parameterized queries, escape output, validate input |
| 4 | Insecure Design | Threat model, principle of least privilege |
| 5 | Security Misconfiguration | Remove defaults, disable debug in prod, security headers |
| 6 | Vulnerable Components | Audit deps regularly, `npm audit`, keep updated |
| 7 | Auth & Session Failures | Strong passwords, MFA, expire sessions |
| 8 | SSRF | Validate URLs, whitelist allowed hosts |
| 9 | Security Logging Failures | Log auth events, anomalies; alert on failures |
| 10 | Server-Side Request Forgery | Validate/restrict outbound HTTP requests |

---

## XSS Prevention

```typescript
// ❌ NEVER inject raw user input into HTML
element.innerHTML = userInput              // DOM XSS
`<div>${req.query.search}</div>`           // Reflected XSS

// ✅ React escapes by default — keep it that way
<div>{userInput}</div>   // safe — React escapes automatically

// ❌ dangerouslySetInnerHTML with user content
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ If you must render HTML, sanitize first
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ Content Security Policy header (also stops injected scripts)
// In next.config.js headers or middleware
'Content-Security-Policy': "default-src 'self'; script-src 'self'"
```

---

## SQL Injection Prevention

```typescript
// ❌ String concatenation / interpolation
const query = `SELECT * FROM users WHERE email = '${email}'`
db.query(query)  // attacker can inject: ' OR '1'='1

// ✅ Parameterized queries (ALWAYS)
db.query('SELECT * FROM users WHERE email = $1', [email])

// ✅ ORM (Prisma/Drizzle) — safe by default
const user = await prisma.user.findUnique({ where: { email } })

// ✅ If using raw SQL in Drizzle
import { sql } from 'drizzle-orm'
db.execute(sql`SELECT * FROM users WHERE email = ${email}`)
```

---

## CSRF Protection

```typescript
// Modern protection: SameSite cookie attribute
// Set on session/auth cookies:
Set-Cookie: session=abc123; SameSite=Strict; HttpOnly; Secure; Path=/

// SameSite=Strict — cookie never sent cross-site (most secure)
// SameSite=Lax    — cookie sent on top-level navigation GET (good default)
// SameSite=None   — always sent (requires Secure, needed for embeds)

// For state-changing API endpoints: verify Origin header
export function middleware(req: NextRequest) {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.get('origin')
    if (origin && origin !== process.env.NEXT_PUBLIC_URL) {
      return new Response('Forbidden', { status: 403 })
    }
  }
}

// Next.js Server Actions: CSRF protection built-in (checks Origin)
```

---

## Authentication Security

```typescript
// Password hashing — ALWAYS use bcrypt or argon2
import bcrypt from 'bcryptjs'

// Hash (registration)
const hash = await bcrypt.hash(password, 12)  // cost 12 is safe default
await db.users.update({ passwordHash: hash })

// Verify (login)
const valid = await bcrypt.compare(password, user.passwordHash)
if (!valid) {
  // ❌ Don't reveal which field was wrong
  throw new Error('Invalid credentials')  // not "wrong password"
}

// Timing attack protection — compare takes same time regardless
// bcrypt.compare is constant-time ✅

// Session tokens — use crypto.randomBytes
import { randomBytes } from 'crypto'
const token = randomBytes(32).toString('hex')  // 64 char hex string
```

**Password requirements (NIST 2024):**
- Minimum 8 characters (prefer 12+)
- Check against known breached passwords (haveibeenpwned API)
- Do NOT require special characters/numbers (causes weak predictable patterns)
- Do NOT expire passwords unless breach suspected
- Allow paste in password fields

---

## Secrets Management

```bash
# ❌ Never commit secrets
API_KEY=sk-abc123  # in .env committed to git

# ✅ .env.local (never committed)
# Always in .gitignore: .env.local, .env.*.local

# ✅ .env.example with placeholder values (commit this)
DATABASE_URL=postgresql://user:password@host/dbname
OPENAI_API_KEY=sk-your-key-here

# Rotate if accidentally committed:
# 1. Revoke the secret immediately at the provider
# 2. git filter-repo to remove from history (or consider history compromised)
# 3. Generate new secret
```

```typescript
// Validate env vars at startup — fail fast
function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

const config = {
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
}
```

**Production secrets:**
- Vercel: Environment Variables in dashboard
- AWS: Secrets Manager or Parameter Store
- Self-hosted: HashiCorp Vault or Doppler
- Never log secrets: `console.log(process.env)` logs ALL env vars

---

## Security Headers

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",    // 'unsafe-inline' for Next.js inline scripts
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.yourservice.com",
    ].join('; ')
  },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  }
}
```

---

## Input Validation

```typescript
// Validate at system boundaries (user input, external APIs)
// Internal function calls don't need defensive validation

// Use Zod for schema validation
import { z } from 'zod'

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(50),
  shippingAddress: z.object({
    street: z.string().min(1).max(255),
    city: z.string().min(1).max(100),
  }),
})

// In API handler
const result = CreateOrderSchema.safeParse(await req.json())
if (!result.success) {
  return Response.json({ error: result.error.flatten() }, { status: 422 })
}
const order = result.data  // fully typed and validated
```

---

## Dependency Scanning

```bash
# Audit for known vulnerabilities
npm audit
npm audit --audit-level=high  # fail only on high/critical

# Fix automatically (patch versions)
npm audit fix

# Check for outdated packages
npx npm-check-updates

# Regular automation:
# - Add npm audit to CI pipeline
# - Use Dependabot (GitHub) or Renovate for automated PRs
# - Subscribe to security advisories for key packages (Next.js, express, etc.)
```

---

## Authorization Checklist

```typescript
// Check permissions server-side on EVERY mutation
// Client-side checks are UX only — never security

export async function deleteProduct(productId: string) {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthorized')          // authenticated?

  const product = await db.products.findUnique({ where: { id: productId } })
  if (!product) throw new Error('Not found')

  if (product.merchantId !== session.user.merchantId) {  // authorized?
    throw new Error('Forbidden')                         // owns this resource?
  }

  await db.products.delete({ where: { id: productId } })
}

// IDOR (Insecure Direct Object Reference) prevention:
// ❌ DELETE /products/123  — no ownership check
// ✅ Always verify: does this user OWN or have permission for resource 123?
```
