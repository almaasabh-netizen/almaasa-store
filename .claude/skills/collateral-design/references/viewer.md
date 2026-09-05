# The Collateral Viewer — Reviewable at True Size

Collateral is a *set* of fixed-format pieces, and a set is genuinely hard to review. So **ship a viewer** — one self-contained HTML file, next to the real exports, that renders every piece at true size and plays the deck as a deck.

**If a piece was only ever reviewed scaled down, it wasn't reviewed.**

## What the Viewer Must Do

**1. Switch between formats.** Tabs for each format in the set.

**2. Render at true size, with an honest zoom control.** Three modes:
- **Fit** — scale to the stage.
- **100%** — 1:1 native pixels.
- **Actual size** — true *physical* scale, derived from the piece's DPI.

```html
<div class="frame" data-w="1050" data-h="600" data-dpi="300" data-safe="38">…</div>
```
```js
if (mode === 'one')  s = 1;
if (mode === 'phys') s = 96 / dpi;
if (mode === 'fit')  s = Math.min(1, availW / w, availH / h);
```

**3. Present the deck as a deck.** The deck view needs:
- One slide visible at a time
- Arrow keys, space, and click-to-advance
- A slide counter and prev/next buttons
- A filmstrip of live thumbnails
- Fullscreen present mode

**4. Show the piece at trim by default; reveal bleed only when guides are on.**

**Anchor the trim box.** The toggle must reveal the bleed *outward, around* a piece that stays exactly where it was.

**4b. Only show controls that apply to the current format.**

**5. Present pieces on a neutral canvas, with a visible outline.**

**6. Show social in real platform context — and more than one platform.**

**7. Animate the social and screen pieces.**

**7b. Add a scroll test for feed-scale formats.**

**7c. Measure the canvas, don't eyeball it.** Build an **overflow audit** into the viewer.

**7d. Audit the type sizes too — in points, at the piece's DPI.**

**7e. Cache-bust at page load, not at build time.**

**8. Show the specs.** A small info strip per format: what it is, its real dimensions, and what to look for.

**9. Make it deep-linkable.** Read state from the query string.

## Give the Reviewer a Content Layer They Own

Split the artifact:

- **A content file the reviewer owns** — plain data only, no markup, no logic.
- **Rendering code you own** — reads the content file and lays it out.

## Keep the Chrome Out of the Artifact

- **Neutral shell.** Plain dark grey UI. **Never style the chrome in the brand's own colors.**
- **Nothing overlapping the piece.**

## Self-Auditing Through the Viewer

Because the viewer is deep-linkable, you can drive your own adversarial review with it.
