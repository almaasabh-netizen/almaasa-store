---
name: debugging-pro
description: Use when encountering any bug, error, or unexpected behavior before writing a fix. Provides a systematic debugging methodology, Browser DevTools techniques, Node.js debugging, React-specific patterns, and production debugging strategies.
---

# Debugging Pro

## When to invoke this skill
- Any bug, error, or unexpected behavior
- Performance issues (slow page, memory leak)
- Production error investigation
- "It works on my machine" problems
- Confusing stack traces

---

## Systematic Debugging Methodology

**Never guess. Always follow this process:**

```
1. REPRODUCE — Can you make it happen reliably?
2. ISOLATE — Narrow down WHERE it happens
3. UNDERSTAND — Know WHY it happens (not just what)
4. FIX — Make the minimal change
5. VERIFY — Confirm the fix, check for regressions
```

### Step 1: Reproduce reliably
```
- Exact steps to reproduce
- Specific inputs, state, or conditions
- Does it happen every time? Intermittently?
- Which environment? (dev / staging / prod? which browser?)
- When did it start? (after a deploy? specific user action?)
```

### Step 2: Isolate
```
- Binary search: comment out half the code — does it still happen?
- Minimal reproduction: smallest code that shows the bug
- Check: is it data-dependent? user-dependent? time-dependent?
- Add console.log BEFORE the error line, not after
```

### Step 3: Read the error message carefully
```
TypeError: Cannot read properties of undefined (reading 'map')
→ Something is undefined when you expected an array
→ Check: is data loaded? Is the API returning expected shape?
→ Add: console.log(data) BEFORE the .map() call

ReferenceError: X is not defined
→ Scope issue or typo — check spelling, import statements

CORS error
→ Server needs to add Access-Control-Allow-Origin header
→ NOT a frontend fix — the backend must allow the origin
```

---

## Browser DevTools

### Console
```javascript
// Structured logging
console.log({ user, order, items })      // object = expandable
console.table(arrayOfObjects)            // grid view for arrays
console.group('API Response')            // collapsible group
console.log(data)
console.groupEnd()
console.time('fetchProducts')            // measure time
await fetchProducts()
console.timeEnd('fetchProducts')         // logs: "fetchProducts: 42ms"

// Conditional breakpoint in code
if (condition) debugger;                 // pauses only when true
```

### Network Tab
```
1. Filter by XHR/Fetch to see API calls
2. Click request → Headers (check auth headers, content-type)
3. Click request → Response (see actual server response)
4. Red = failed request → check status code in Preview tab
5. Slow requests: check Timing tab (TTFB, download time)
6. "Preserve log" = keep logs across navigation
7. Throttle to simulate slow network (Fast 3G, Slow 3G)
```

### Performance Tab
```
1. Record → do the slow action → Stop
2. Look for: long tasks (red bars) > 50ms
3. Main thread flame chart: find the widest function
4. Check: Layout Shift (purple), Paint (green)
5. "Call Tree" → sort by "Self Time" → find hotspots
```

### Memory Tab (memory leaks)
```
1. Take heap snapshot → do action → take another
2. Compare snapshots: "Objects allocated between snapshots"
3. Look for growing arrays, detached DOM nodes
4. Common leak: event listener on window/document not removed
```

---

## React-Specific Debugging

### React DevTools
```
- Components tab: inspect props and state
- Profiler tab: record render → see what re-rendered and why
  - Look for: components re-rendering when parent updates
  - "Why did this render?" → shows which prop/state changed
```

### Common React bugs
```tsx
// Bug: infinite re-render loop
useEffect(() => {
  setData(processData(data))  // ❌ setting state used in deps
}, [data])

// Fix:
const processedData = useMemo(() => processData(data), [data])  // ✅

// Bug: stale closure
function Counter() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      console.log(count)  // ❌ always logs 0 (stale closure)
      setCount(count + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])  // ❌ empty deps

  // Fix: use functional update
  setCount(prev => prev + 1)  // ✅ no stale closure needed
}

// Bug: object/array in deps causes infinite loop
useEffect(() => { ... }, [{ id: 1 }])  // ❌ new object every render

// Fix: use primitive values or useMemo
useEffect(() => { ... }, [id])  // ✅

// Debug which renders are happening:
function MyComponent(props) {
  console.count('MyComponent render')  // counts how many times
  // ...
}
```

---

## Node.js Debugging

```bash
# Built-in inspector
node --inspect server.js
# Open chrome://inspect in Chrome → click "inspect"

# Break on start
node --inspect-brk server.js

# With ts-node
npx ts-node --inspect src/server.ts

# Environment-specific logging
DEBUG=app:* node server.js  # with 'debug' package
```

```typescript
// Structured logging (use in production)
import pino from 'pino'
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' })

logger.info({ userId, action: 'login' }, 'User logged in')
logger.error({ err, userId }, 'Login failed')

// Error serialization — always log the error object, not just message
logger.error({ err: error }, 'Failed to process payment')
// NOT: logger.error(error.message)  ← loses stack trace
```

---

## Reading Stack Traces

```
Error: Cannot read properties of undefined (reading 'price')
    at formatPrice (utils/format.ts:12:24)   ← bottom of call chain
    at ProductCard (components/ProductCard.tsx:45:8)
    at renderWithHooks (react-dom.development.js:...)
    at ...

Reading:
1. Start at the TOP of YOUR code (not node_modules)
2. First line in your file → that's where the error occurred
3. utils/format.ts:12:24 → line 12, column 24
4. The chain shows HOW it got there

Fix process:
1. Open utils/format.ts at line 12
2. What's undefined? (reading 'price' → something.price)
3. What is 'something'? Trace back to where it came from
4. Go to ProductCard.tsx:45 → what did it pass to formatPrice?
```

---

## Production Debugging

```typescript
// Source maps: always generate for production (but serve privately)
// next.config.js
const config = {
  productionBrowserSourceMaps: true,  // enables in Vercel
}

// Error tracking setup (Sentry)
import * as Sentry from '@sentry/nextjs'
Sentry.captureException(error, { extra: { userId, orderId } })

// Always add context to production errors
try {
  await processPayment(order)
} catch (error) {
  logger.error({ err: error, orderId: order.id, userId }, 'Payment failed')
  Sentry.captureException(error, { tags: { orderId: order.id } })
  throw error  // re-throw so caller knows it failed
}
```

---

## Reproducing Issues Reliably

```
"Works on my machine" checklist:
□ Same Node.js version? (check .nvmrc)
□ Fresh node_modules? (rm -rf node_modules && npm install)
□ Same environment variables? (.env.example up to date?)
□ Same database state? (seed data?)
□ Same browser + version?
□ Cache cleared? (hard refresh: Cmd+Shift+R)
□ Same user account/permissions?

For intermittent bugs:
□ Add extensive logging around the suspect area
□ Is it race condition? (async operations completing out of order)
□ Is it timing-dependent? (setTimeout, animation)
□ Is it state-dependent? (only fails after certain user actions)
□ Increase test iterations: run test 100x
```
