# Seerr Requestarr Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/berserk88/seerr-requestarr-card)

A Lovelace card for Home Assistant that provides a full media request interface for [Overseerr](https://overseerr.dev/).

> **Requires the integration first:** [seerr-requestarr](https://github.com/berserk88/seerr-requestarr)

---

## Installation via HACS

1. HACS → Frontend → ⋮ → Custom repositories
2. Add `https://github.com/berserk88/seerr-requestarr-card` → Category: **Frontend**
3. Download → Hard-refresh browser (`Ctrl+Shift+R` / `Cmd+Shift+R`)

> **After updating:** always do a hard-refresh or clear the browser cache. HACS updates the file but the browser may serve the old cached version.

---

## Card configuration

```yaml
type: custom:seerr-requestarr-card
# All options are optional — defaults work out of the box

card_width:  "100%"    # any CSS value, e.g. "800px"
card_height: "580px"   # any CSS value, e.g. "100vh" for full-screen

trending_movies_count: 20   # titles in the Trending movies row (max ~100)
trending_tv_count:     20   # titles in the Trending TV row

omdb_api_key: ""   # optional — enables IMDb ratings on movie tiles
                   # free key at https://www.omdbapi.com/apikey.aspx
```

---

## Tabs

### 🔥 Trending
Two horizontally-scrolling rows: **Trending Movies** and **Trending TV Shows**. Tap **See all ›** on either heading to open a full scrollable grid with infinite load-more. Tap any title to open the detail view.

### 🧭 Discover
Mirrors the Overseerr Discover page. Switch between **Movies** and **TV Shows** with the type buttons. Core sections (Popular, Top Rated, Upcoming, Airing Today) and **10 genre filters** per type are shown as scrollable pills in a single row — core sections in orange, genres in purple.

### 🔍 Search
Search any movie or TV show. Filter by All / Movies / TV. Tap any result for full details.

### 📋 Requests
All media requests with poster, title, year, type, date, and status badge. **Tap any request** to open its full detail view.

---

## Detail view

Tapping any title opens a full detail page showing:
- Backdrop image + poster
- Title, year, type
- Runtime / seasons / episodes
- **Ratings**: TMDB ⭐, IMDb 🎬 (requires OMDb key), RT Critics 🍅, RT Audience 🍿 — displayed in a 3-column grid
- Genre chips
- Tagline
- Overview
- Director / network / studio / release date
- Cast (top 5)
- **Request button** — one tap to request, shows current status if already requested/available

---

## Navigation

- **Back button (←)** in any detail or browse view navigates back one level
- **Phone back button** navigates within the card; at the top level, shows *"Press back again to exit"* then exits on the second press
- **Scroll position is remembered** when switching tabs or navigating back — you return to exactly where you left off

---

## IMDb ratings

Overseerr's ratings endpoint only returns Rotten Tomatoes data. To also show IMDb ratings on movie tiles and detail pages:

1. Get a free API key at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) (1,000 requests/day free)
2. Add to your card config:
```yaml
omdb_api_key: "your_key_here"
```

IMDb ratings are not available for TV shows (OMDb doesn't reliably provide series-level ratings).

---

## Troubleshooting

**Old version still showing after update**
Clear your browser cache or do a hard-refresh (`Ctrl+Shift+R`). On mobile, force-close and reopen the HA app.

**"Seerr Requestarr integration not configured" error**
Make sure the integration is installed and configured in Settings → Devices & Services.

**Run diagnostics**
Tap "Run diagnostics" on any error state in the card, or visit `http://YOUR_HA:8123/api/seerr_debug` while logged in.

**Ratings not appearing**
- TMDB scores appear immediately from list data
- RT scores load in the background — allow a few seconds
- IMDb requires `omdb_api_key` in card config
- Check HA logs for proxy errors: Settings → System → Logs, search "Seerr"
