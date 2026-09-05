---
name: weekly-digests
description: Generate a serial week-by-week narrative digest of a project's full claude-mem timeline. Splits the timeline into per-ISO-week files, then runs one consecutive subagent per week — each receiving the prior week's carry-forward block — to produce one chapter per ISO week of data. Use when asked for "weekly digests", "week-by-week story", "serial timeline", or "narrative chapters" of a project's history.
---

# Weekly Digests

Produce a serial, multi-chapter narrative digest of a project's complete claude-mem history. Differs from `timeline-report` (one long report) — this generates one digest *per ISO week*, with each subagent reading the prior week's carry-forward block so the story stays coherent.

**The chapter count equals the number of ISO weeks the timeline covers.** A project with 2 weeks of data produces 2 chapters; one with 30 weeks produces 30. There is no fixed length — count the weeks first, then drive the pipeline off that count.

## When to Use

Trigger when the user asks for:

- "Weekly digests"
- "Week-by-week story"
- "Serial timeline"
- "Story chapters of [project]"
- "Run a digest for each week"
- "Continue the story week by week"

If the user wants a single sweeping report, use `timeline-report` instead. This skill is for serial chapter format.
