---
name: logo-design
description: "Design or evaluate a logo against the SAD bar — Simple, Appropriate, Distinct — always judged in context. Use when designing a new mark, refining one, or assessing whether an existing logo is any good."
metadata:
  version: 1.11.2
---

# Logo Design

You design and evaluate logos. Read `design-principles` and `.agents/brand.md` before you judge or draw anything.

> **A logo is never judged on its own.** Every part of the assessment happens in a context: against the competition, against the feeling the brand must produce, and against every place the mark has to live.

## The Bar: SAD

A good logo is **S**imple, **A**ppropriate, **D**istinct. Each dimension is only judgeable against a specific context.

### Simple — judged across *every implementation*

Simple doesn't mean minimal. It means **one idea that survives every reduction**. The baseline test is **black and white**. Then verify across the whole implementation set:

- Does it hold at a 16px favicon? In a circle-cropped social avatar? Reversed on dark? Single-color?
- Is it the **same** construction in all of them?
- Is there a **single source of truth**?
- **Recognition failure caps Simple.**

### Appropriate — judged against the *core feelings*

A logo can be beautiful and wrong. Appropriate means it produces the feelings the brand is built to produce — the **Emotional Target** in `.agents/brand.md`.

### Distinct — judged against the *direct competition*

Distinctiveness only exists relative to the field.

- Put the mark on a shelf with the **direct competitors' logos**. Does it stand out?
- **Compare silhouettes**, not just details.
- The real test: cover the name. Would the audience know it's *them*?
- **SAD is not averaged — one failed criterion sinks the whole logo.**

## Assess (get) vs. Design (make)

**Assessing an existing mark:**
1. Take it from the live navigation bar, then gather it in *every* form.
2. Confirm whether there's a symbol at all.
3. Run SAD-in-context and report per dimension, with the evidence.
4. Write the verdict into `.agents/brand.md`.

**Designing a new mark:**
1. Work from `.agents/brand.md`: the Emotional Target and muses are the brief.
2. **Find the thematic idea first.** The strongest marks *distill a brand concept into one form*.
3. **Generate sketches broadly across the three families** — typographic/wordmark, pictorial, abstract. Use generative tooling — see [references/generative-tooling.md](references/generative-tooling.md).
4. Resolve in **black and white first.**
5. **Construct it properly.** See [references/logo-construction.md](references/logo-construction.md).
6. Build the **full system**: primary lockup, the standalone mark, clear space, minimum size, reversed and single-color variants.
7. Test against SAD *and* the implementation grid.

## Present it: the identity presentation

Present the **identity presentation**: the mark itself, its black-and-white form, and — the load-bearing part — the mark **applied**: business cards, signage, social, **on the shelf next to the competitors**.

## Deliver the Logo as ONE Locked Element

- **One file per lockup.** The mark and the wordmark are locked together in fixed proportion.
- **The wordmark ships as outlined vector.**
- **Correct artwork bounds.** The viewBox must contain the whole drawing with its intended clear space.
- **Color is fixed and enumerated.**
- **Never drop the name or swap the face.**
- **State the invariants next to the files.**

**The governing principle: the logo behaves identically in every medium.**

## Output & delivery

Write the **Logo** section of `.agents/brand.md`. Also append the Logo section of `.agents/design.md`.

Emit real files to:
```
.agents/assets/logo/
  logo-lockup.svg
  logo-icon.svg
  logo-lockup-inverse.svg
  logo-lockup-black.svg   logo-lockup-white.svg   logo-lockup-gray.svg
  avatar.svg
  app-icon.svg
  raster/
```

## Non-Negotiables

- [ ] Brand context read — Emotional Target *and* competitor set — before judging or drawing
- [ ] Mark has a **thematic idea** traceable to the brand
- [ ] Logo seen in *every* implementation
- [ ] **Distinct** judged against the direct competitor set (shown on the shelf)
- [ ] **Appropriate** judged against the Emotional Target
- [ ] **Simple** verified across the implementation grid
- [ ] Resolves in black and white
- [ ] **Construction sound** — geometric harmony, unified paths, hand-tracked type, balanced lockup
- [ ] Commercial type licenses confirmed
- [ ] Delivered as **one locked element**
- [ ] Delivery package: lockup · icon · avatar · app icon, each in SVG/PNG/JPEG, logotype outlined
- [ ] **Locked asset FILES emitted to `.agents/assets/logo/`**
- [ ] Verdict written to `.agents/brand.md`; Logo section appended to `.agents/design.md`

## Related Skills

- `design-principles`, `brand`, `brand-strategy`, `creative-direction`, `collateral-design`
