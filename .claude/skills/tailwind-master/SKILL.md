---
name: tailwind-master
description: Use when writing Tailwind CSS classes, setting up a design system, implementing dark mode, responsive layouts, or debugging Tailwind configuration. Covers Tailwind v4 syntax, utility organization, theming, and common pitfalls.
---

# Tailwind Master

## When to invoke this skill
- Writing or reviewing Tailwind class strings
- Setting up theme/design tokens
- Implementing responsive or dark mode styles
- Organizing large className strings
- Debugging Tailwind not applying styles

---

## Tailwind v4 — Key Changes

```css
/* v4: CSS-first config instead of tailwind.config.js */
@import "tailwindcss";

@theme {
  --color-brand: #6366f1;
  --color-brand-dark: #4f46e5;
  --font-sans: 'Inter', sans-serif;
  --radius-card: 0.75rem;
  --spacing-section: 5rem;
}
```

```tsx
// v4: use CSS variables in utilities
<div className="bg-[--color-brand] rounded-[--radius-card]" />

// v4: @utility for custom utilities
// In CSS:
// @utility btn-primary { @apply bg-brand text-white px-4 py-2 rounded-md; }
```

---

## Utility Class Organization

Always organize in this order (improves readability and diffing):

```tsx
// 1. Layout       2. Spacing       3. Sizing
// 4. Typography   5. Colors        6. Borders
// 7. Effects      8. Transitions   9. States/variants

<div className={cn(
  // Layout
  'flex items-center justify-between',
  // Spacing
  'px-4 py-3 gap-2',
  // Sizing
  'w-full max-w-lg',
  // Typography
  'text-sm font-medium',
  // Colors
  'bg-white text-gray-900',
  // Borders
  'border border-gray-200 rounded-lg',
  // Effects
  'shadow-sm',
  // Transitions
  'transition-colors duration-200',
  // States
  'hover:bg-gray-50 focus:outline-none focus:ring-2',
)} />
```

### cn() helper — always use this

```tsx
// Install: npm i clsx tailwind-merge
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage — handles conflicts correctly
cn('px-2 py-1', condition && 'px-4')     // → 'py-1 px-4' (not 'px-2 py-1 px-4')
cn('bg-red-500', 'bg-blue-500')          // → 'bg-blue-500'
```

---

## Custom Theme Extensions

```css
/* @theme in CSS (v4) */
@theme {
  /* Colors — follow shadcn/ui convention for compatibility */
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 221.2 83.2% 53.3%;
  --color-primary-foreground: 210 40% 98%;
  --color-muted: 210 40% 96.1%;
  --color-muted-foreground: 215.4 16.3% 46.9%;
  --color-border: 214.3 31.8% 91.4%;
  --color-ring: 221.2 83.2% 53.3%;

  /* Spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;

  /* Typography */
  --font-heading: 'Cal Sans', sans-serif;

  /* Animations */
  --animate-fade-in: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## Responsive Design (Mobile-First)

```tsx
// Default = mobile, then layer up
<div className="
  flex flex-col          // mobile: stack
  md:flex-row            // tablet: side by side
  lg:gap-8               // desktop: larger gap
">

// Breakpoints: sm(640) md(768) lg(1024) xl(1280) 2xl(1536)
// Custom in v4:
// @theme { --breakpoint-3xl: 1920px; }

// Container pattern
<div className="container mx-auto px-4 sm:px-6 lg:px-8">

// Hide/show at breakpoints
<div className="block md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>
```

---

## Dark Mode

```css
/* v4: configure in CSS */
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

```tsx
// In components
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// Toggle dark mode (Next.js with next-themes)
import { useTheme } from 'next-themes'
const { theme, setTheme } = useTheme()
<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
```

---

## Animation Utilities

```tsx
// Built-in
<div className="animate-spin" />      // loading spinner
<div className="animate-pulse" />     // skeleton loading
<div className="animate-bounce" />    // attention indicator
<div className="animate-ping" />      // notification badge

// Custom (defined in @theme)
<div className="animate-fade-in" />

// Transition on hover
<button className="
  bg-blue-500
  transition-all duration-200 ease-in-out
  hover:bg-blue-600 hover:scale-105 hover:shadow-md
  active:scale-95
">

// Reduced motion
<div className="animate-spin motion-reduce:animate-none" />
```

---

## Arbitrary Values

```tsx
// Use when design requires exact values not in scale
<div className="w-[342px]" />
<div className="top-[117px]" />
<div className="bg-[#bada55]" />
<div className="grid-cols-[1fr_2fr_1fr]" />
<div className="font-[550]" />

// CSS variables as arbitrary values
<div className="bg-[--brand-color]" />

// Best practice: if used 3+ times, add to @theme instead
```

---

## Common Pitfalls

```tsx
// ❌ Dynamic class construction — Tailwind can't detect
const color = 'red'
<div className={`bg-${color}-500`} />    // won't work

// ✅ Use full class names
const classes = { red: 'bg-red-500', blue: 'bg-blue-500' }
<div className={classes[color]} />

// ❌ Conflicting classes without twMerge
<div className={`px-2 ${largePadding ? 'px-8' : ''}`} />  // both apply!

// ✅ Use cn()
<div className={cn('px-2', largePadding && 'px-8')} />

// ❌ Inline styles for things Tailwind can do
<div style={{ marginTop: '16px' }} />

// ✅
<div className="mt-4" />

// ❌ @apply overuse — defeats the purpose
// Only use @apply for truly reusable multi-utility patterns
```

---

## Variant Patterns with CVA

```tsx
// For component variants: npm i class-variance-authority
import { cva, type VariantProps } from 'class-variance-authority'

const button = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

interface ButtonProps extends VariantProps<typeof button> {
  className?: string
  children: React.ReactNode
}
```
