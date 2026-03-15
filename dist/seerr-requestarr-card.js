/**
 * Seerr Requestarr Card for Home Assistant
 * https://github.com/berserk88/seerr-requestarr-card
 *
 * Config options:
 *   card_width:         CSS width  (default: "100%")
 *   card_height:        CSS height (default: "auto")
 *   trending_movies_count: number of movies to show (default: 12)
 *   trending_tv_count:     number of TV shows to show (default: 12)
 */

const DOMAIN_PROXY = "/api/seerr_proxy";
const DOMAIN_DEBUG = "/api/seerr_debug";

const STATUS_MAP = {
  1: { label: "Unknown",    color: "#6b7280", icon: "❓" },
  2: { label: "Pending",    color: "#f59e0b", icon: "⏳" },
  3: { label: "Processing", color: "#3b82f6", icon: "⚙️" },
  4: { label: "Partial",    color: "#8b5cf6", icon: "◑"  },
  5: { label: "Available",  color: "#10b981", icon: "✓"  },
};

const REQ_STATUS = {
  1: { label: "Pending",   color: "#f59e0b" },
  2: { label: "Approved",  color: "#3b82f6" },
  3: { label: "Declined",  color: "#ef4444" },
  4: { label: "Available", color: "#10b981" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :host {
    --sr-bg:       #0a0a0f;
    --sr-surface:  #111118;
    --sr-surface2: #1a1a24;
    --sr-border:   rgba(255,255,255,0.07);
    --sr-accent:   #e85d3f;
    --sr-accent2:  #7c5cbf;
    --sr-text:     #f0eff8;
    --sr-muted:    #6b6a80;
    --sr-radius:   16px;
    --sr-display:  'Syne', sans-serif;
    --sr-body:     'DM Sans', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .root {
    background: var(--sr-bg);
    border-radius: var(--sr-radius);
    overflow: hidden;
    font-family: var(--sr-body);
    color: var(--sr-text);
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px 12px;
    border-bottom: 1px solid var(--sr-border);
    background: linear-gradient(135deg, rgba(232,93,63,0.08), rgba(124,92,191,0.06));
    flex-shrink: 0;
  }
  .header-left  { display: flex; align-items: center; gap: 10px; }
  .header-logo  {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, var(--sr-accent), var(--sr-accent2));
    border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .header-name  { font-family: var(--sr-display); font-size: 14px; font-weight: 700; letter-spacing: -0.3px; }
  .header-sub   { font-size: 10px; color: var(--sr-muted); margin-top: 1px; }
  .header-stats { display: flex; gap: 8px; }
  .stat-pill {
    background: var(--sr-surface2); border: 1px solid var(--sr-border);
    border-radius: 20px; padding: 3px 9px; font-size: 10px; font-weight: 500;
    display: flex; align-items: center; gap: 4px;
  }
  .stat-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--sr-accent); }

  /* ── Tabs ── */
  .tabs {
    display: flex; background: var(--sr-surface);
    border-bottom: 1px solid var(--sr-border);
    padding: 0 16px; gap: 2px; flex-shrink: 0;
  }
  .tab {
    background: none; border: none; color: var(--sr-muted);
    font-family: var(--sr-body); font-size: 11px; font-weight: 500;
    padding: 10px 12px 8px; cursor: pointer;
    border-bottom: 2px solid transparent; transition: all 0.2s;
    display: flex; align-items: center; gap: 5px; margin-bottom: -1px;
  }
  .tab:hover { color: var(--sr-text); }
  .tab.active { color: var(--sr-accent); border-bottom-color: var(--sr-accent); }

  /* ── Tab content area ── */
  .tab-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* ── Search ── */
  .search-wrap { padding: 14px 16px 0; flex-shrink: 0; }
  .search-row  { display: flex; gap: 8px; margin-bottom: 10px; }
  .search-input {
    flex: 1; background: var(--sr-surface2); border: 1px solid var(--sr-border);
    border-radius: 9px; padding: 9px 12px; color: var(--sr-text);
    font-family: var(--sr-body); font-size: 13px; outline: none; transition: border-color 0.2s;
  }
  .search-input:focus { border-color: var(--sr-accent); }
  .search-input::placeholder { color: var(--sr-muted); }
  .search-btn {
    background: linear-gradient(135deg, var(--sr-accent), #c94428);
    border: none; border-radius: 9px; padding: 9px 16px; color: #fff;
    font-family: var(--sr-display); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: opacity 0.2s;
  }
  .search-btn:hover    { opacity: 0.88; }
  .search-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .filter-row { display: flex; gap: 6px; margin-bottom: 10px; }
  .filter-chip {
    background: var(--sr-surface2); border: 1px solid var(--sr-border);
    border-radius: 20px; padding: 4px 11px; font-size: 11px; font-weight: 500;
    color: var(--sr-muted); cursor: pointer; transition: all 0.2s;
  }
  .filter-chip.active { background: rgba(232,93,63,0.15); border-color: rgba(232,93,63,0.4); color: var(--sr-accent); }

  /* ── Scrollable poster grid ── */
  .scroll-grid {
    overflow-y: auto; overflow-x: hidden;
    flex: 1; min-height: 0;
    padding: 0 16px 16px;
    scrollbar-width: thin; scrollbar-color: var(--sr-border) transparent;
  }
  .scroll-grid::-webkit-scrollbar { width: 3px; }
  .scroll-grid::-webkit-scrollbar-thumb { background: var(--sr-border); border-radius: 2px; }

  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px; padding-top: 2px;
  }

  .media-card {
    background: var(--sr-surface2); border: 1px solid var(--sr-border);
    border-radius: 9px; overflow: hidden; cursor: pointer; transition: all 0.18s; position: relative;
  }
  .media-card:hover { border-color: rgba(232,93,63,0.45); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.45); }
  .media-card img   { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; background: var(--sr-surface); }
  .no-poster {
    width: 100%; aspect-ratio: 2/3; background: var(--sr-surface);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 24px; gap: 4px;
  }
  .no-poster span { font-size: 9px; color: var(--sr-muted); text-align: center; padding: 0 6px; }
  .card-info  { padding: 6px 7px; }
  .card-title {
    font-size: 10px; font-weight: 500; line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 3px;
  }
  .card-meta  { font-size: 9px; color: var(--sr-muted); display: flex; align-items: center; justify-content: space-between; }
  .type-badge {
    background: rgba(124,92,191,0.25); color: #b09de0;
    border-radius: 3px; padding: 1px 4px; font-size: 8px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  .avail-badge {
    position: absolute; top: 4px; right: 4px; border-radius: 5px; padding: 2px 5px;
    font-size: 8px; font-weight: 700; backdrop-filter: blur(6px); line-height: 1;
  }

  /* ── Detail view ── */
  .detail-wrap { padding: 14px 16px; animation: fadeSlide 0.18s ease; overflow-y: auto; flex: 1; }
  @keyframes fadeSlide { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; } }
  .back-btn {
    background: none; border: none; color: var(--sr-muted); font-family: var(--sr-body);
    font-size: 12px; cursor: pointer; padding: 0; margin-bottom: 12px;
    display: flex; align-items: center; gap: 5px; transition: color 0.2s;
  }
  .back-btn:hover { color: var(--sr-text); }
  .detail-layout { display: flex; gap: 14px; margin-bottom: 14px; }
  .detail-poster { width: 100px; min-width: 100px; border-radius: 9px; overflow: hidden; }
  .detail-poster img { width: 100%; display: block; }
  .detail-poster-ph {
    width: 100px; height: 150px; border-radius: 9px; background: var(--sr-surface2);
    display: flex; align-items: center; justify-content: center; font-size: 28px;
  }
  .detail-info { flex: 1; }
  .detail-title { font-family: var(--sr-display); font-size: 16px; font-weight: 700; line-height: 1.2; margin-bottom: 4px; }
  .detail-meta  { font-size: 11px; color: var(--sr-muted); margin-bottom: 8px; }
  .detail-badges { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .d-badge { background: var(--sr-surface2); border: 1px solid var(--sr-border); border-radius: 5px; padding: 2px 7px; font-size: 10px; }
  .overview {
    font-size: 11px; line-height: 1.6; color: rgba(240,239,248,0.65); margin-bottom: 14px;
    display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;
  }
  .req-btn {
    width: 100%; background: linear-gradient(135deg, var(--sr-accent), #c94428);
    border: none; border-radius: 9px; padding: 11px; color: #fff;
    font-family: var(--sr-display); font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .req-btn:hover    { opacity: 0.88; transform: translateY(-1px); }
  .req-btn:active   { transform: none; }
  .req-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .req-btn.already  { background: var(--sr-surface2); border: 1px solid rgba(16,185,129,0.4); color: #10b981; }
  .req-btn.sent     { background: linear-gradient(135deg, #10b981, #059669); }

  /* ── Trending panels ── */
  .trending-wrap { flex: 1; overflow-y: auto; display: flex; flex-direction: column; min-height: 0; }
  .trend-section { flex-shrink: 0; }
  .section-hdr {
    font-family: var(--sr-display); font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.4px; color: var(--sr-muted);
    padding: 12px 16px 8px; position: sticky; top: 0;
    background: var(--sr-bg); z-index: 1;
  }
  .trend-scroll {
    overflow-x: auto; overflow-y: hidden;
    padding: 0 16px 14px;
    scrollbar-width: thin; scrollbar-color: var(--sr-border) transparent;
  }
  .trend-scroll::-webkit-scrollbar { height: 3px; }
  .trend-scroll::-webkit-scrollbar-thumb { background: var(--sr-border); border-radius: 2px; }
  .trend-row { display: flex; gap: 8px; width: max-content; }
  .trend-card {
    width: 90px; flex-shrink: 0;
    background: var(--sr-surface2); border: 1px solid var(--sr-border);
    border-radius: 9px; overflow: hidden; cursor: pointer; transition: all 0.18s; position: relative;
  }
  .trend-card:hover { border-color: rgba(232,93,63,0.45); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.45); }
  .trend-card img   { width: 90px; height: 135px; object-fit: cover; display: block; background: var(--sr-surface); }
  .trend-card .no-poster { width: 90px; height: 135px; }
  .trend-info { padding: 5px 6px; }
  .trend-title {
    font-size: 9px; font-weight: 500; line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .trend-year { font-size: 8px; color: var(--sr-muted); margin-top: 2px; }

  /* ── Requests panel ── */
  .requests-wrap { flex: 1; overflow-y: auto; padding: 12px 16px; min-height: 0;
    scrollbar-width: thin; scrollbar-color: var(--sr-border) transparent;
  }
  .request-item {
    background: var(--sr-surface2); border: 1px solid var(--sr-border);
    border-radius: 9px; padding: 9px 11px; display: flex; align-items: center;
    gap: 10px; margin-bottom: 7px; transition: border-color 0.2s;
  }
  .request-item:hover { border-color: rgba(255,255,255,0.1); }
  .req-thumb { width: 32px; height: 48px; border-radius: 5px; object-fit: cover; flex-shrink: 0; background: var(--sr-surface); }
  .req-thumb-ph { width: 32px; height: 48px; border-radius: 5px; background: var(--sr-surface); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .req-info  { flex: 1; min-width: 0; }
  .req-title { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .req-meta  { font-size: 10px; color: var(--sr-muted); display: flex; gap: 6px; }
  .req-status {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; flex-shrink: 0;
  }
  .req-status-dot { width: 4px; height: 4px; border-radius: 50%; }

  /* ── States ── */
  .state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px 20px; color: var(--sr-muted); gap: 10px; font-size: 12px; text-align: center; }
  .state-icon { font-size: 28px; }
  .state-title { color: var(--sr-accent); font-weight: 600; font-size: 13px; }
  .state-msg   { max-width: 220px; line-height: 1.5; }
  .spinner { width: 24px; height: 24px; border: 2px solid var(--sr-border); border-top-color: var(--sr-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .retry-btn {
    background: var(--sr-surface2); border: 1px solid var(--sr-border); border-radius: 7px;
    padding: 5px 13px; color: var(--sr-text); font-family: var(--sr-body); font-size: 11px;
    cursor: pointer; transition: border-color 0.2s; margin-top: 4px;
  }
  .retry-btn:hover { border-color: var(--sr-accent); }
  .debug-link { font-size: 10px; color: var(--sr-muted); text-decoration: underline; cursor: pointer; }

  /* ── Toast ── */
  .toast {
    position: absolute; bottom: 14px; left: 50%;
    transform: translateX(-50%) translateY(50px);
    background: var(--sr-surface2); border: 1px solid var(--sr-border);
    border-radius: 9px; padding: 8px 16px; font-size: 12px; font-weight: 500;
    white-space: nowrap; transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 20; pointer-events: none; box-shadow: 0 6px 24px rgba(0,0,0,0.4);
  }
  .toast.show    { transform: translateX(-50%) translateY(0); }
  .toast.success { border-color: rgba(16,185,129,0.5); color: #10b981; }
  .toast.error   { border-color: rgba(232,93,63,0.5);  color: var(--sr-accent); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Card element
// ─────────────────────────────────────────────────────────────────────────────
class SeerrRequestarrCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass            = null;
    this._config          = {};
    this._tab             = "search";
    this._initialized     = false;
    this._selectedMedia   = null;
    this._searchResults   = [];
    this._searchQuery     = "";
    this._searchFilter    = "all";
    this._searching       = false;
    this._trendMovies     = [];
    this._trendTV         = [];
    this._trendError      = null;
    this._requests        = [];
    this._requestsLoading = false;
    this._requestsError   = null;
    this._pendingCount    = 0;
    this._totalCount      = 0;
  }

  static getStubConfig() {
    return {
      card_width: "100%",
      card_height: "560px",
      trending_movies_count: 12,
      trending_tv_count: 12,
    };
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this._loadTrending();
      this._loadRequests();
    }
    this._syncStats();
  }

  // ── Config helpers ──────────────────────────────────────────────────────

  get _cardWidth()  { return this._config.card_width  || "100%";  }
  get _cardHeight() { return this._config.card_height || "560px"; }
  get _moviesCount(){ return parseInt(this._config.trending_movies_count) || 12; }
  get _tvCount()    { return parseInt(this._config.trending_tv_count)     || 12; }

  // ── Stats ───────────────────────────────────────────────────────────────

  _syncStats() {
    if (!this._hass) return;
    const states = Object.values(this._hass.states);
    const p = states.find(s => s.entity_id.includes("seerr") && s.entity_id.includes("pending"));
    const t = states.find(s => s.entity_id.includes("seerr") && s.entity_id.includes("total"));
    if (p) this._pendingCount = parseInt(p.state) || 0;
    if (t) this._totalCount   = parseInt(t.state) || 0;
    const ep = this.shadowRoot.querySelector(".stat-pending");
    const et = this.shadowRoot.querySelector(".stat-total");
    if (ep) ep.textContent = this._pendingCount;
    if (et) et.textContent = this._totalCount;
  }

  // ── API proxy ────────────────────────────────────────────────────────────
  // Uses /api/seerr_proxy/{path} — the integration forwards these to Overseerr
  // server-side using GET-only headers (no Content-Type on GETs).

  async _get(path, params = {}) {
    const url = new URL(DOMAIN_PROXY + path, window.location.origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await this._hass.fetchWithAuth(url.pathname + url.search);
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = j.message || j.error || JSON.stringify(j).slice(0,120); } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  async _post(path, body) {
    const res = await this._hass.fetchWithAuth(DOMAIN_PROXY + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = j.message || j.error || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  // ── Data loaders ─────────────────────────────────────────────────────────

  async _search() {
    const input = this.shadowRoot.querySelector(".search-input");
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    this._searchQuery   = q;
    this._searching     = true;
    this._selectedMedia = null;
    this._updateSearchContent();
    try {
      const data = await this._get("/search", { query: q, page: 1 });
      let results = (data.results || []).filter(r => r.mediaType === "movie" || r.mediaType === "tv");
      if (this._searchFilter === "movie") results = results.filter(r => r.mediaType === "movie");
      if (this._searchFilter === "tv")    results = results.filter(r => r.mediaType === "tv");
      this._searchResults = results;
    } catch (e) {
      this._toast("Search failed: " + e.message, "error");
      this._searchResults = [];
    } finally {
      this._searching = false;
      this._updateSearchContent();
    }
  }

  async _loadTrending() {
    this._trendError = null;
    try {
      const [movies, tv] = await Promise.all([
        this._get("/discover/movies"),
        this._get("/discover/tv"),
      ]);
      this._trendMovies = (movies.results || []).slice(0, this._moviesCount);
      this._trendTV     = (tv.results    || []).slice(0, this._tvCount);
    } catch (e) {
      this._trendError = e.message;
    }
    if (this._tab === "trending") this._updateTabContent();
  }

  async _loadRequests() {
    this._requestsLoading = true;
    this._requestsError   = null;
    if (this._tab === "requests") this._updateTabContent();
    try {
      const data = await this._get("/request", { take: 25, skip: 0, filter: "all" });
      const raw  = data.results || [];
      // Enrich each request with full media details from /movie/{id} or /tv/{id}
      const enriched = await Promise.all(
        raw.map(async req => {
          const media    = req.media || {};
          const tmdbId   = media.tmdbId;
          const mType    = req.type || media.mediaType;
          try {
            if (tmdbId && mType === "movie") {
              return { ...req, _d: await this._get(`/movie/${tmdbId}`) };
            } else if (tmdbId && (mType === "tv" || mType === "series")) {
              return { ...req, _d: await this._get(`/tv/${tmdbId}`) };
            }
          } catch {}
          return req;
        })
      );
      this._requests = enriched;
    } catch (e) {
      this._requestsError = e.message;
    } finally {
      this._requestsLoading = false;
    }
    if (this._tab === "requests") this._updateTabContent();
  }

  async _requestMedia(media) {
    const btn = this.shadowRoot.querySelector(".req-btn");
    if (btn) { btn.disabled = true; btn.innerHTML = `<div class="spinner" style="width:16px;height:16px"></div>`; }
    try {
      const payload = { mediaType: media.mediaType, mediaId: media.id };
      if (media.mediaType === "tv") payload.seasons = "all";
      await this._post("/request", payload);
      this._toast(`✓ "${media.title || media.name}" requested!`, "success");
      if (btn) { btn.classList.add("sent"); btn.textContent = "✓ Request Sent!"; }
      this._loadRequests();
    } catch (e) {
      this._toast("Request failed: " + e.message, "error");
      if (btn) { btn.disabled = false; btn.textContent = "🎬 Request This"; }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _toast(msg, type = "success") {
    const t = this.shadowRoot.querySelector(".toast");
    if (!t) return;
    t.textContent = msg;
    t.className   = `toast ${type}`;
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
    setTimeout(() => t.classList.remove("show"), 3500);
  }

  _poster(path, size = "w185") {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  }

  _year(item) {
    const d = item.releaseDate || item.firstAirDate || "";
    return d ? d.slice(0, 4) : "—";
  }

  _availBadge(mediaInfo) {
    if (!mediaInfo) return "";
    const s = STATUS_MAP[mediaInfo.status];
    if (!s || mediaInfo.status === 1) return "";
    return `<div class="avail-badge" style="background:${s.color}28;color:${s.color};border:1px solid ${s.color}44">${s.icon}</div>`;
  }

  // ── HTML builders ─────────────────────────────────────────────────────────

  _mediaCardHtml(item, cls = "media-card", imgSize = "w185") {
    const poster = this._poster(item.posterPath, imgSize);
    const year   = this._year(item);
    const type   = item.mediaType === "movie" ? "Film" : "TV";
    const noImg  = item.mediaType === "movie" ? "🎬" : "📺";
    return `
      <div class="${cls}" data-id="${item.id}" data-type="${item.mediaType}">
        ${this._availBadge(item.mediaInfo)}
        ${poster
          ? `<img src="${poster}" alt="" loading="lazy">`
          : `<div class="no-poster">${noImg}<span>${(item.title || item.name || "").slice(0, 20)}</span></div>`}
        <div class="${cls === "trend-card" ? "trend-info" : "card-info"}">
          <div class="${cls === "trend-card" ? "trend-title" : "card-title"}">${item.title || item.name || "Unknown"}</div>
          ${cls === "trend-card"
            ? `<div class="trend-year">${year}</div>`
            : `<div class="card-meta"><span>${year}</span><span class="type-badge">${type}</span></div>`}
        </div>
      </div>`;
  }

  _gridHtml(items, emptyMsg, errMsg, retryKey) {
    if (errMsg) return this._stateHtml("⚠️", "Could not load", errMsg, retryKey);
    if (this._searching) return `<div class="state-box"><div class="spinner"></div><span>Searching...</span></div>`;
    if (!items.length) return `<div class="state-box"><div class="state-icon">🔍</div>${emptyMsg}</div>`;
    return `<div class="poster-grid">${items.map(i => this._mediaCardHtml(i)).join("")}</div>`;
  }

  _stateHtml(icon, title, msg, retryKey) {
    return `
      <div class="state-box">
        <div class="state-icon">${icon}</div>
        <div class="state-title">${title}</div>
        <div class="state-msg">${msg}</div>
        ${retryKey ? `<button class="retry-btn" data-retry="${retryKey}">↺ Retry</button>` : ""}
        <span class="debug-link" data-action="debug">Run diagnostics</span>
      </div>`;
  }

  _detailHtml(media) {
    const poster      = this._poster(media.posterPath, "w342");
    const year        = this._year(media);
    const si          = media.mediaInfo ? STATUS_MAP[media.mediaInfo.status] : null;
    const isAvail     = media.mediaInfo?.status === 5;
    const isReq       = !isAvail && (media.mediaInfo?.status || 0) >= 2;
    const btnClass    = (isAvail || isReq) ? "already" : "";
    const btnLabel    = isAvail ? "✓ Already in Library" : isReq ? "⏳ Already Requested" : "🎬 Request This";
    return `
      <div class="detail-wrap">
        <button class="back-btn">← Back</button>
        <div class="detail-layout">
          <div>
            ${poster
              ? `<div class="detail-poster"><img src="${poster}" alt="" loading="lazy"></div>`
              : `<div class="detail-poster-ph">${media.mediaType === "movie" ? "🎬" : "📺"}</div>`}
          </div>
          <div class="detail-info">
            <div class="detail-title">${media.title || media.name || "Unknown"}</div>
            <div class="detail-meta">${year} · ${media.mediaType === "movie" ? "Movie" : "TV Series"}</div>
            <div class="detail-badges">
              ${media.voteAverage ? `<div class="d-badge">⭐ ${Number(media.voteAverage).toFixed(1)}</div>` : ""}
              ${si ? `<div class="d-badge" style="color:${si.color}">${si.icon} ${si.label}</div>` : ""}
            </div>
            <div class="overview">${media.overview || "No description available."}</div>
          </div>
        </div>
        <button class="req-btn ${btnClass}" ${isAvail ? "disabled" : ""}>${btnLabel}</button>
      </div>`;
  }

  // ── Tab content builders ──────────────────────────────────────────────────

  _searchTabHtml() {
    if (this._selectedMedia) return this._detailHtml(this._selectedMedia);
    const chips = [
      { k: "all",   l: "All"        },
      { k: "movie", l: "🎬 Movies"  },
      { k: "tv",    l: "📺 TV"      },
    ];
    return `
      <div class="search-wrap">
        <div class="search-row">
          <input class="search-input" type="text" placeholder="Search movies & TV shows…" value="${this._searchQuery}">
          <button class="search-btn">Search</button>
        </div>
        <div class="filter-row">
          ${chips.map(c => `<div class="filter-chip${this._searchFilter === c.k ? " active" : ""}" data-filter="${c.k}">${c.l}</div>`).join("")}
        </div>
      </div>
      <div class="scroll-grid">
        ${this._gridHtml(this._searchResults, "Search for movies or TV shows above", null, null)}
      </div>`;
  }

  _trendingTabHtml() {
    if (this._trendError) {
      return `<div class="trending-wrap">${this._stateHtml("⚠️", "Could not load trending", this._trendError, "trending")}</div>`;
    }
    const movieRow = this._trendMovies.map(i => this._mediaCardHtml(i, "trend-card")).join("");
    const tvRow    = this._trendTV.map(i => this._mediaCardHtml(i, "trend-card")).join("");
    return `
      <div class="trending-wrap">
        <div class="trend-section">
          <div class="section-hdr">🎬 Trending Movies</div>
          ${this._trendMovies.length
            ? `<div class="trend-scroll"><div class="trend-row">${movieRow}</div></div>`
            : `<div class="state-box" style="padding:16px"><div class="state-icon">🎬</div>No movies found</div>`}
        </div>
        <div class="trend-section">
          <div class="section-hdr">📺 Trending TV Shows</div>
          ${this._trendTV.length
            ? `<div class="trend-scroll"><div class="trend-row">${tvRow}</div></div>`
            : `<div class="state-box" style="padding:16px"><div class="state-icon">📺</div>No TV shows found</div>`}
        </div>
      </div>`;
  }

  _requestsTabHtml() {
    if (this._requestsLoading) {
      return `<div class="requests-wrap"><div class="state-box"><div class="spinner"></div><span>Loading requests…</span></div></div>`;
    }
    if (this._requestsError) {
      return `<div class="requests-wrap">${this._stateHtml("⚠️", "Could not load requests", this._requestsError, "requests")}</div>`;
    }
    if (!this._requests.length) {
      return `<div class="requests-wrap"><div class="state-box"><div class="state-icon">📋</div>No requests yet</div></div>`;
    }
    const items = this._requests.map(req => {
      const d      = req._d || {};
      const media  = req.media || {};
      const title  = d.title || d.name || "Unknown Title";
      const year   = this._year(d);
      const poster = this._poster(d.posterPath, "w92");
      const type   = (req.type === "movie" || media.mediaType === "movie") ? "Movie" : "TV";
      const rs     = REQ_STATUS[req.status] || REQ_STATUS[1];
      const date   = req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "";
      return `
        <div class="request-item">
          ${poster
            ? `<img class="req-thumb" src="${poster}" alt="" loading="lazy">`
            : `<div class="req-thumb-ph">${type === "Movie" ? "🎬" : "📺"}</div>`}
          <div class="req-info">
            <div class="req-title">${title}${year !== "—" ? ` (${year})` : ""}</div>
            <div class="req-meta"><span>${type}</span>${date ? `<span>${date}</span>` : ""}</div>
          </div>
          <div class="req-status" style="background:${rs.color}18;color:${rs.color}">
            <div class="req-status-dot" style="background:${rs.color}"></div>${rs.label}
          </div>
        </div>`;
    });
    return `<div class="requests-wrap">${items.join("")}</div>`;
  }

  // ── Partial update helpers ────────────────────────────────────────────────

  _updateSearchContent() {
    if (this._tab !== "search" || this._selectedMedia) return;
    const sg = this.shadowRoot.querySelector(".scroll-grid");
    if (sg) {
      sg.innerHTML = this._gridHtml(this._searchResults, "Search for movies or TV shows above", null, null);
      this._bindMediaCards(sg);
    }
  }

  _updateTabContent() {
    const tc = this.shadowRoot.querySelector(".tab-content");
    if (!tc) return;
    switch (this._tab) {
      case "search":   tc.innerHTML = this._searchTabHtml();   this._bindSearchListeners(tc);  break;
      case "trending": tc.innerHTML = this._trendingTabHtml(); this._bindTrendCards(tc);        break;
      case "requests": tc.innerHTML = this._requestsTabHtml(); this._bindRetry(tc);             break;
    }
  }

  // ── Event binding ─────────────────────────────────────────────────────────

  _bindSearchListeners(tc) {
    const btn   = tc.querySelector(".search-btn");
    const input = tc.querySelector(".search-input");
    btn?.addEventListener("click",    () => this._search());
    input?.addEventListener("keydown", e => { if (e.key === "Enter") this._search(); });
    tc.querySelectorAll(".filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        this._searchFilter = chip.dataset.filter;
        if (this._searchQuery) this._search();
        else {
          tc.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
        }
      });
    });
    tc.querySelector(".back-btn")?.addEventListener("click", () => {
      this._selectedMedia = null; this._updateTabContent();
    });
    const rb = tc.querySelector(".req-btn");
    if (rb && this._selectedMedia && !rb.disabled) {
      rb.addEventListener("click", () => this._requestMedia(this._selectedMedia));
    }
    this._bindMediaCards(tc);
    this._bindRetry(tc);
  }

  _bindMediaCards(root) {
    root.querySelectorAll(".media-card, .trend-card").forEach(card => {
      card.addEventListener("click", () => {
        const id   = parseInt(card.dataset.id);
        const type = card.dataset.type;
        const pool = [...this._searchResults, ...this._trendMovies, ...this._trendTV];
        const m    = pool.find(x => x.id === id && x.mediaType === type);
        if (m) { this._tab = "search"; this._updateTabs(); this._selectedMedia = m; this._updateTabContent(); }
      });
    });
  }

  _bindTrendCards(tc) {
    this._bindMediaCards(tc);
    this._bindRetry(tc);
  }

  _bindRetry(root) {
    root.querySelectorAll(".retry-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.retry === "trending") { this._trendError = null; this._loadTrending(); }
        if (btn.dataset.retry === "requests") { this._requestsError = null; this._loadRequests(); }
        this._updateTabContent();
      });
    });
    root.querySelectorAll("[data-action='debug']").forEach(el => {
      el.addEventListener("click", () => this._runDiag());
    });
  }

  async _runDiag() {
    try {
      const res  = await this._hass.fetchWithAuth(DOMAIN_DEBUG);
      const data = await res.json();
      this._toast(
        data.overseerr_reachable
          ? `✓ Connected — Overseerr v${data.overseerr_version}`
          : `✗ Overseerr unreachable: ${data.overseerr_error}`,
        data.overseerr_reachable ? "success" : "error"
      );
    } catch (e) {
      this._toast("Diag failed: " + e.message, "error");
    }
  }

  _updateTabs() {
    this.shadowRoot.querySelectorAll(".tab").forEach(t => {
      t.classList.toggle("active", t.dataset.tab === this._tab);
    });
  }

  // ── Root render ───────────────────────────────────────────────────────────

  _render() {
    const tabs = [
      { k: "search",   i: "🔍", l: "Search"   },
      { k: "trending", i: "🔥", l: "Trending"  },
      { k: "requests", i: "📋", l: "Requests"  },
    ];
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="root" style="width:${this._cardWidth};height:${this._cardHeight}">
        <div class="header">
          <div class="header-left">
            <div class="header-logo">🎬</div>
            <div>
              <div class="header-name">Seerr Requestarr</div>
              <div class="header-sub">Media Request Center</div>
            </div>
          </div>
          <div class="header-stats">
            <div class="stat-pill"><div class="stat-dot" style="background:#f59e0b"></div><span class="stat-pending">${this._pendingCount}</span> pending</div>
            <div class="stat-pill"><div class="stat-dot" style="background:var(--sr-muted)"></div><span class="stat-total">${this._totalCount}</span> total</div>
          </div>
        </div>
        <div class="tabs">
          ${tabs.map(t => `<button class="tab${this._tab === t.k ? " active" : ""}" data-tab="${t.k}">${t.i} ${t.l}</button>`).join("")}
        </div>
        <div class="tab-content"></div>
        <div class="toast"></div>
      </div>`;

    this.shadowRoot.querySelectorAll(".tab").forEach(btn => {
      btn.addEventListener("click", () => {
        this._tab           = btn.dataset.tab;
        this._selectedMedia = null;
        this._updateTabs();
        this._updateTabContent();
        if (this._tab === "requests" && !this._requests.length && !this._requestsLoading) this._loadRequests();
        if (this._tab === "trending" && !this._trendMovies.length && !this._trendError) this._loadTrending();
      });
    });

    this._updateTabContent();
  }

  getCardSize() { return 6; }
}

customElements.define("seerr-requestarr-card", SeerrRequestarrCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        "seerr-requestarr-card",
  name:        "Seerr Requestarr",
  description: "Search and request movies & TV shows via Overseerr",
  preview:     true,
});
