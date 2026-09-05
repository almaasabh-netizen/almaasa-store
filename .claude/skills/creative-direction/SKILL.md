---
name: creative-direction
description: "Translate a brand's strategy — its emotional target and muses — into the concrete visual system: color, typography, composition, pattern & texture, iconography, illustration, and photography, as one coherent language. Use after brand-strategy and before logo or application work, or when the user mentions 'creative direction,' 'visual identity,' 'visual system,' 'design language,' 'stylescape,' 'pick our colors and fonts,' 'define our look,' or an audit's moving-forward items. This is where 'what it should feel like' becomes 'what it looks like.'"
metadata:
  version: 1.14.2
---

# Creative Direction

You establish a brand's **visual system** — every asset class, one coherent language, all of it traceable to the feeling the brand is built to produce. This is the stage where strategy becomes visible: the emotional target and muses from `brand-strategy` get translated into actual color, type, composition, pattern, icons, illustration, and photography.

Read `design-principles` first. This skill is where its rules get *applied*: contrast-not-competition, restraint, five stops, emotion before execution, and "state why, or the default stands."

> **Position in the sequence:** after `brand` (the audit/context) and `brand-strategy` (the feeling + muses), before `logo-design` and the application skills.

## Hard Prerequisite: the Emotional Target and Muses

Open `.agents/brand.md`. You need:
- The **Emotional Target** (the feelings the brand must produce)
- The **Muses**, each with its stealable visual cue
- The **confirmed competitor set** (what "distinct" is measured against)
- The **REO depth and the client's appetite**

**If the Emotional Target or muses are missing, stop and route to `brand-strategy`.** Without them you'd be choosing colors and typefaces from taste.

## Scope by Depth

- **Revolution** — build the system from scratch as **three genuinely distinct concepts**, presented as stylescapes.
- **Evolution** — one direction, anchored on the **fixed core** (the equity being kept). Change only the deltas the strategy named.
- **Optimization** — mostly out of scope. At most a light pass to *document* the existing system.

## The Core Move: Abstract the Muses

**Take the muse's *literal* forms and abstract them into modern, ownable brand elements.** You are not decorating with the muse; you are distilling its geometry, materials, and ideas into a system.

- **Pull two things from each muse: a color story and an abstracted idea.**
- **Then render the *product's own work* through that abstraction.**
- **Don't let ease of abstraction crown the winner, and treat on-the-nose as a failure mode.**
- **Typography obeys the same abstraction law as everything else.**

## The System to Establish

1. **Color** — assign by *role*: background, text, **action/CTA** (protected), support. Five stops per color, not ten. **Verify ownership against the confirmed competitor set.**
2. **Typography** — faces by role (display, heading, body), chosen for **contrast, not competition**. **Licensing checkpoint** before approval.
3. **Composition & layout** — the grid, density, spacing logic, section rhythm.
4. **Pattern & texture** — an **ownable motif**, most naturally derived from the mark's geometry.
5. **Iconography** — one source of truth; stroke/fill/grid rules.
6. **Illustration & product abstraction** — branded abstractions over raw screenshots.
7. **Photography** — subjects, treatment/grade, art direction.
8. **Motion** *(directional note)* — what the brand's motion *feels* like.

## Producing the Board

- **Ask what image-generation tools they have, then fork.**
- **You compose the board, not the founder.**
- **Lean on CSS/SVG for the texture it renders well.**
- **Unify every source through one grade.**

## Validate Before You Present

- **Score it against the foundational categories** vs. the confirmed competitor set.
- **Run the AI-slop check** on your own output and **list what it finds**.
- **Confirm the board is a rendered surface, not a CSS-block comp.**
- **Carry-through gate:** the applied fragment must pass cover-the-logo too.
- **Trace every element to a muse or the emotional target.**

## Present, Decide, Record

- **Give it a walkthrough first, then present.**
- **Name the challenges, honestly.**
- **Close with a comparison.**
- **Prove it has legs applied.**
- **Document the styles and their sources.**
- **Revolution:** present the three stylescapes; push for one idea, not a Frankenstein.
- Get **explicit approval** before `logo-design` and the application skills build on it.
- **Write the approved system into `.agents/brand.md`**.

## The Deliverable

1. **`.agents/design.md`** — the full creative-direction record.
2. **`.agents/brand.md`** — the distilled system.

## Non-Negotiables

- [ ] Emotional Target + muses read from `.agents/brand.md` (or routed to `brand-strategy` first)
- [ ] Depth + appetite respected
- [ ] Color ownership verified against the confirmed competitor set
- [ ] Type licensing + character support confirmed
- [ ] Motif is ownable and doesn't collide with a competitor's
- [ ] Every element traces to a muse or the emotional target
- [ ] Adversarial self-audit run on the *rendered* board before presenting
- [ ] Challenges + competitor-differentiation named; direction proven applied
- [ ] Client approval secured; full record written to `.agents/design.md`; distilled system written to `.agents/brand.md`

## Related Skills

- `design-principles` — the rules this skill applies
- `brand` — the audit that diagnoses
- `brand-strategy` — supplies the emotional target and muses (hard prerequisite)
- `logo-design` — the mark, designed inside this system
- `web-design` / `collateral-design` — apply the approved system
