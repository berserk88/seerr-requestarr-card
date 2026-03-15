# Seerr Requestarr Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

Lovelace card for searching, browsing, and requesting movies & TV shows via Overseerr.

> **Requires the integration:** [seerr-requestarr](https://github.com/berserk88/seerr-requestarr)

---

## Installation via HACS

1. HACS → Frontend → ⋮ → Custom repositories
2. Add `https://github.com/berserk88/seerr-requestarr-card` → Category: **Frontend**
3. Download → Hard-refresh browser (Ctrl+Shift+R)

---

## Card configuration

```yaml
type: custom:seerr-requestarr-card
card_width: "100%"          # any CSS value, e.g. "800px" for full-width
card_height: "560px"        # any CSS value, e.g. "100vh" for full-screen
trending_movies_count: 12   # how many trending movies to show
trending_tv_count: 12       # how many trending TV shows to show
```

All options are optional — defaults work out of the box.

---

## Features

- **Search** — search any title, filter by Movies / TV
- **Trending** — separate horizontally-scrolling rows for movies and TV shows
- **Requests** — all requests with enriched title, poster, year and status
- **Configurable size** — set any width/height via card config
- **Diagnostics** — tap "Run diagnostics" on any error to test connectivity
