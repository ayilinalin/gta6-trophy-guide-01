# GTA VI Trophy Guide — Vice Got a Price!

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ayilinalin/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ayilinalin/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI PlayStation trophies** (1 platinum, 2 gold, 6 silver, 46 bronze — 28 hidden on PlayStation until earned). Every trophy carries its official name, description and grade, plus a guide written in our own words with its sources cited, a missable warning where one applies, and a roadmap stage on the way to the platinum **“Vice Got a Price!”**.

## What it does

- **Checklist tracker** — tick trophies off; progress is saved in `localStorage`, with export/import as JSON.
- **Filters** — story, missable, collectibles, activities, online (there are none — every trophy is single-player), earned, to do — plus instant text search.
- **Spoiler-safe mode** — hides story trophy names and descriptions until you earn them.
- **Roadmap to platinum** — four stages: story first, then collectibles, then activities, then the 100% cleanup. About 200 hours, one playthrough.
- **Missable warning** — only one trophy can be missed: *Positive Mental Attitude* (the Chapter 1 balcony meditation). The guide says so loudly and tells you how to protect it.
- **Cited guides** — every trophy detail shows its sources (GTABase and Output Lag launch-week lists). Where no unlock method is confirmed at launch, the guide says so instead of inventing one.

## Run it offline

```sh
node serve.ts
# open http://localhost:8080 — no network needed after that
```

Or open `app/index.html` directly in desktop Chrome. Everything loads from `app/` — no network requests at runtime.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide app (static, no build step).
- `app/data/trophies.json` — all 55 official trophies with guides, kinds, missable flags, roadmap stages and sources.
- `main.ts` — copies `app/` + `screenshots/` into `MAKEFUN_OUTPUT_DIR` (default `/output`) and writes `dossier.json` via `vendor/makefun-frontend.ts`.
- `screenshots/` — real renders of this app.

## Notes

Fan-made guide. Grand Theft Auto and GTA are trademarks of Take-Two Interactive. Not affiliated with Rockstar Games. No Rockstar logo or official artwork is used.
