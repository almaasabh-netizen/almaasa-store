# Frontend / Production-Craft Boilerplate

The non-negotiable craft floor for anything rendered — stylescapes here, and every applied surface the application skills (`web-design`, `collateral-design`, …) build later.

## Success criteria

- Distinct visual identity with a clear narrative and a **signature element**
- Production-grade: complete states, responsive behavior, real failure paths
- Accessibility by default (WCAG AA intent)
- **Token-driven** — a design system, not one-off styling
- **Zero reliance on recognizable AI tropes**

## 1. Commit to one radical art direction — derived from the muses, never picked from a list

Pick one extreme per concept and execute it with precision. The direction always comes from the brand's muses and Emotional Target, not from a style catalog.

**No two concepts converge** on the same fonts, palette, layout, or energy.

## 2. Invent a signature element

Every direction includes **one unforgettable, functional hook** — not decoration. Valid hooks: a morphing frame that responds to scroll/state; a typographic hero with deliberate optical kerning; a navigation pattern with spatial logic; a branded data-viz language; an orchestrated scroll reveal.

## 3. Define tokens before layout

```css
:root {
  /* Color — by role, not by swatch */
  --color-bg:; --color-surface:; --color-text:; --color-muted:;
  --color-accent:; --color-focus:; --color-success:; --color-warning:; --color-danger:;
  /* Typography — named faces, by role */
  --font-display:; --font-body:; --font-mono:;
  --text-xs:; --leading-xs:; --text-sm:; --leading-sm:; --text-base:; --leading-base:;
  --text-lg:; --leading-lg:; --text-xl:; --leading-xl:; --text-2xl:; --leading-2xl:;
  /* Spacing */
  --space-1:; --space-2:; --space-3:; --space-4:; --space-6:; --space-8:;
  /* Radius + Shadow */
  --radius-sm:; --radius-md:; --radius-lg:; --shadow-sm:; --shadow-md:; --shadow-lg:;
  /* Motion */
  --duration-fast:; --duration-base:; --duration-slow:; --ease-out:; --ease-spring:;
}
```

## Aesthetic hard rules

**Typography** — **Banned: Space Grotesk, Fraunces** and their cohort. A **neutral face used deliberately (Inter) is legitimate**. Hard rules: the **subhead uses the secondary/body face, never the headline face**; **body is never set in a monospace**; type must show **real hierarchy**; **no italic/oblique serif display**; **weight discipline: default is regular-to-semibold — bold is reserved**.

**Color** — no emoji icons anywhere; **no default purple/blue gradient on white SaaS**; one dominant hue + 1–3 accents with *defined roles*.

**Layout** — **no predictable center-hero → three cards → icon row**; consistent grid logic *plus at least one intentional grid break*.

**Motion** — communicates structure, feedback, affordance; prefer *one orchestrated entrance*; respect `prefers-reduced-motion`.

**Texture & material** — **Avoid flat, sterile backgrounds unless austerity is a deliberate, stated choice.** Texture must support hierarchy. Allowed: subtle grain overlay · SVG parametric patterns · noise-driven gradients · paper-fold shadows · CRT scanlines · procedural canvas texture.

## Required interaction states

Every interactive element: **default · hover · active/pressed · focus-visible · disabled · loading · error · empty**.

## Production requirements

- **A11y:** semantic HTML; ARIA only where needed; full keyboard nav; visible focus.
- **Responsive:** ≥3 breakpoints; narrative + hierarchy preserved; touch targets ≥44px.
- **Performance:** avoid heavy effects by default; GPU-friendly animation.
- **Failure handling:** design network-failure/offline, partial/delayed data, and user-error recovery.

## Reject the output if any are true

- **Narrative incoherence** — typography, motion, layout, or copy feel authored by different systems.
- **Placeholder energy** — lorem/filler, vague marketing language, empty states without guidance.
- **Abominations** — Inter + purple gradient + rounded cards + generic icons; default-Tailwind appearance; marketplace-template resemblance.

## Final quality gate

Signature element exists and is functional · tokens drive styling · a11y met · all interaction states implemented · failure/recovery designed · narrative consistency holds · responsive rhythm preserved · no AI-trope patterns. **If any check fails, the output is invalid.**
