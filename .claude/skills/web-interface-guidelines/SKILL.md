---
description: Review UI code for Vercel Web Interface Guidelines compliance
argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review these files for compliance: $ARGUMENTS

Read files, check against rules below. Output concise but comprehensive—sacrifice grammar for brevity. High signal-to-noise.

## Rules

### Accessibility

- Icon-only buttons need `aria-label`
- Form controls need `<label>` or `aria-label`
- Interactive elements need keyboard handlers (`onKeyDown`/`onKeyUp`)
- `<button>` for actions, `<a>`/`<Link>` for navigation (not `<div onClick>`)
- Images need `alt` (or `alt=""` if decorative)
- Decorative icons need `aria-hidden="true"`
- Async updates (toasts, validation) need `aria-live="polite"`
- Use semantic HTML (`<button>`, `<a>`, `<label>`, `<table>`) before ARIA
- Headings hierarchical `<h1>`–`<h6>`; include skip link for main content
- `scroll-margin-top` on heading anchors
- Meaningful media needs captions, transcripts, or descriptions
- Media controls need keyboard support; decorative media needs assistive-tech hiding

### Forms

- Inputs need `autocomplete` and meaningful `name`
- Use correct `type` and `inputmode`
- Never block paste
- Labels clickable (`htmlFor` or wrapping control)
- Submit button stays enabled until request starts
- Errors inline next to fields; focus first error on submit

### Animation

- Honor `prefers-reduced-motion`
- Animate `transform`/`opacity` only
- Never `transition: all`

### Performance

- Large lists (>50 items): virtualize
- No layout reads in render
- Critical fonts: preload with `font-display: swap`

### Anti-patterns (flag these)

- `user-scalable=no` disabling zoom
- `onPaste` with `preventDefault`
- `transition: all`
- `outline-none` without focus-visible replacement
- `<div>` with click handlers (should be `<button>`)
- Images without dimensions
- Form inputs without labels
- Icon buttons without `aria-label`

## Output Format

Group by file. Use `file:line` format. Terse findings.
