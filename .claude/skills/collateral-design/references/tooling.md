# Tooling for Collateral

Collateral is produced in the format's native tooling. The rule: **use what's connected, never block on a missing tool, degrade to the next option.**

## By Format

| Format | First choice | Fallbacks |
|--------|--------------|-----------|
| One fixed-format graphic (poster, one-pager, ad, flyer) | **`canvas-design`** skill | Adobe MCP render; Figma canvas → export; HTML/CSS → print-to-PDF |
| Deck / presentation | **`slide-deck`** (makerskills) | HTML/CSS slides → PDF; Figma Slides; Adobe MCP |
| Any chart / stat / dashboard | **`dataviz`** skill | — (always route charts through it) |
| Print production (brochure, business card, multi-page) | **Adobe MCP** | `canvas-design` → CMYK PDF export |
| Visual composition to iterate | **Paper / Pencil / Figma MCP** | — |

## The Tools

- **`canvas-design` skill** — creates static visual art in PNG and PDF. The strong default for a single fixed-format piece.
- **`slide-deck` (makerskills)** — deck generation and structure.
- **`dataviz` skill** — the mandatory stop before *any* chart, stat tile, meter, KPI row, or dashboard.
- **Adobe MCP** (when connected) — for real print and multi-page layout.
- **Paper / Pencil / Figma MCP** — design canvases for composing visually.
- **HTML/CSS as a layout engine** — a legitimate fallback for a screen-PDF deck.

## Where the Message Comes From

- **`copywriting`** — the words for any piece.
- **`sales-enablement`** — the substance of a sales one-pager / battle card.
- **`ad-creative`** — ad copy variants at scale.

## Sourcing Photography

Order of preference:

1. **The brand's own photography** — always first choice.
2. **Properly licensed stock** — a paid library, or Adobe Stock via the Adobe MCP.
3. **Openly licensed images** for exploration and internal comps.

**Label placeholders as placeholders.**

**And skip the clichés.** The handshake, the headset agent, the generic team-at-laptop — a stock trope is a named slop tell.

## Fonts and Assets

- Use the **licensed brand faces** from `.agents/design.md`. **Embed them** in the deliverable.
- Pull the **real mark** from the identity, not a redraw. For print, keep it **vector**.
