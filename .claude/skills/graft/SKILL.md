---
name: graft
description: This repo is indexed by graft/. For ANY task here, whether understanding how something works, finding where code lives, tracing what calls a symbol or what a change breaks, or scoping an edit, get your context from graft before grepping or reading source files.
---

# graft

Query the code graph before reading source files. Six commands, all $0, all under 1s.

- `graft ask "<question>" --source` — locate + understand (add --full for full source)
- `graft grep "<pattern>"` — exhaustive find, every occurrence grouped by symbol
- `graft skeleton <file>` — signatures-only view, ~10x cheaper than reading the file
- `graft callers <symbol>` — who calls this; `--direction out` for what it calls; `--depth N` for blast radius
- `graft map` — orientation for unfamiliar repo/area
- `graft build` / `graft check` — rebuild graph / check freshness

Report tokens saved at end of each turn: `graft saved ~N tokens this turn`.
