# Generating the Mark — Tooling

**An agent hand-authoring SVG primitives cannot construct a logo.** The mark has to come from a **generative tool**, and the resolved artwork from a **designer**.

## The rule

- **Generate the icon/abstract marks; never hand-draw them.**
- **Set the wordmark in a licensed face and *outline* it — never generate the wordmark.**
- **An agent-rendered mark is a wireframe stand-in, not delivery art.**

## Tool-agnostic by design

Route to whatever generative surface the agent has:

- **QuiverAI** — text → **SVG** (best fit: real editable vectors).
- **Flora** (MCP) — generative design surface.
- **GPT Image 2.0** / any image model — raster sketches; vectorize the winner.
- **Figma** — draw/assemble vectors on a real canvas.

**Read the key from the environment** and **degrade gracefully** when absent.

## Worked example — QuiverAI (text → SVG)

```
POST https://api.quiver.ai/v1/svgs/generations
Authorization: Bearer $QUIVER_API_KEY
Content-Type: application/json
{ "model": "arrow-1.1", "prompt": "<the mark, described>", "instructions": "<constraints>", "n": 1, "stream": false }
```

- Response: `data[].svg` — an SVG string.
- Output is usually a single/multi `<path>` with no `fill` → **recolor by setting `fill` on the wrapping `<svg>`**.
- Prompt discipline: say **"icon only, no text"**; ask for **flat, single-color, transparent, geometric, production-ready**.

## Outlining the wordmark

```python
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
font = TTFont("Face.ttf"); gs = font.getGlyphSet(); cmap = font.getBestCmap()
x = 0
for ch in "Wordmark":
    pen = SVGPathPen(gs); gs[cmap[ord(ch)]].draw(pen)
    # emit <path transform="translate(x 0)" d="{pen.getCommands()}"/>
```

## Honesty (non-negotiable)

Every mark an agent renders itself is a **wireframe**. Say so, route the construction to real tooling, and never score an agent-drawn SVG as a resolved, distinct mark.
