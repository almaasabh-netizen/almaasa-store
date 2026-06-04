---
name: react-best-practices
description: Use when building or reviewing React components, deciding on state management, optimizing performance, or structuring a React/Next.js project. Covers React 19, Server Components, TypeScript strict mode, accessibility, and modern patterns.
---

# React Best Practices

## When to invoke this skill
- Starting a new React component or page
- Choosing between state management solutions
- Optimizing re-renders or bundle size
- Reviewing component architecture
- Adding accessibility to UI

---

## React 19 + Server Components

### Server vs Client Components
```tsx
// Server Component (default in Next.js App Router) — no 'use client'
// Can: async/await, direct DB access, no useState/useEffect
export default async function ProductList() {
  const products = await db.products.findMany()
  return <ul>{products.map(p => <ProductItem key={p.id} product={p} />)}</ul>
}

// Client Component — needs interactivity
'use client'
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  // ...
}
```

**Rules:**
- Default to Server Components — only add `'use client'` when you need: `useState`, `useEffect`, event handlers, browser APIs
- Push `'use client'` boundary as far down the tree as possible
- Server Components can import Client Components, NOT vice versa (for async data)

### React 19 New APIs
```tsx
// useActionState — form actions with loading/error state
const [state, formAction, isPending] = useActionState(submitForm, null)

// use() — read promises and context in render
const data = use(fetchPromise) // suspends until resolved

// useOptimistic — optimistic UI updates
const [optimisticItems, addOptimistic] = useOptimistic(items, (state, newItem) => [...state, newItem])
```

---

## TypeScript Strict Mode

### Always Do
```tsx
// Explicit prop types
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

// Generic components with constraints
function Select<T extends { id: string; label: string }>({ options }: { options: T[] }) {}

// Discriminated unions for state
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

### Never Do
```tsx
// ❌ any
const handleData = (data: any) => {}

// ❌ non-null assertion without certainty
const el = document.getElementById('app')!

// ❌ implicit any via loose config
// Always use strict: true in tsconfig.json
```

---

## State Management Decisions

| Scenario | Solution |
|----------|----------|
| Local UI state (toggle, form input) | `useState` |
| Derived/computed values | `useMemo` or derive inline |
| Shared state across sibling components | Lift state up or Context |
| Global UI state (theme, modal, sidebar) | Zustand or Jotai |
| Server data + caching | TanStack Query |
| Complex local state with actions | `useReducer` |
| URL-driven state | `useSearchParams` |

### Zustand (global client state)
```tsx
// Use when: auth state, cart, UI preferences, cross-route state
import { create } from 'zustand'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}))
```

### Jotai (atomic state)
```tsx
// Use when: fine-grained reactivity, derived atoms, less boilerplate than Zustand
import { atom, useAtom } from 'jotai'

const countAtom = atom(0)
const doubleAtom = atom((get) => get(countAtom) * 2) // derived
```

### Context (use sparingly)
```tsx
// Use when: theming, locale, auth (read-heavy, rarely updated)
// ❌ Don't use for frequently changing state — causes full subtree re-renders
```

---

## Performance

### memo / useMemo / useCallback Rules

```tsx
// React.memo — wrap when: pure component, expensive render, receives same props often
const ExpensiveList = memo(function ExpensiveList({ items }: { items: Item[] }) {
  return <>{items.map(i => <Item key={i.id} {...i} />)}</>
})

// useMemo — use when: expensive computation, reference stability for deps
const sortedItems = useMemo(
  () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// useCallback — use when: passing callbacks to memoized children
const handleSubmit = useCallback((values: FormValues) => {
  submitForm(values)
}, [submitForm])
```

**Do NOT:**
- `useMemo` for simple calculations (string concat, arithmetic)
- `useCallback` on every function by default — only when passed as prop to memo'd components
- Premature optimization without profiling first

---

## Accessibility (a11y)

```tsx
// Semantic HTML first
<nav>, <main>, <article>, <button>, <header> // not <div> for everything

// ARIA only when semantic HTML isn't enough
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">

// Interactive elements must be focusable and keyboard-operable
<button onClick={handler}>  // ✅ not <div onClick={handler}>

// Images always need alt
<Image src={src} alt="Descriptive text" />  // ✅
<Image src={icon} alt="" />                  // ✅ decorative = empty string

// Form labels always linked
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Announce dynamic content
<div aria-live="polite">{statusMessage}</div>
```

---

## Error Boundaries

```tsx
'use client'
import { Component, ReactNode } from 'react'

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Boundary caught:', error, info)
    // reportToErrorTracking(error)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

// Usage: wrap route segments and async data-fetching boundaries
```

---

## Custom Hooks Patterns

```tsx
// Rule: extract when logic is reused OR when it cleans up a component
// Rule: hooks return [value, setter] or { data, loading, error } — be consistent

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }, [key])

  return [value, setStoredValue] as const
}
```

---

## File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   └── dashboard/
│       └── page.tsx
├── components/
│   ├── ui/                 # Headless/primitive components (Button, Input)
│   └── features/           # Feature-specific components (CartDrawer, ProductCard)
├── hooks/                  # Custom hooks (useCart, useAuth)
├── lib/                    # Utilities, API clients, helpers
├── stores/                 # Zustand/Jotai stores
└── types/                  # Shared TypeScript types
```

**Naming:**
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Types: colocate with usage, or `types/` for shared
