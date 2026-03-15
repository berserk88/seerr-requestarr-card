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
    const prev = this._config || {};
    this._config = config || {};
    // If trending counts changed, clear cached results so they reload with new counts
    if (prev.trending_movies_count !== this._config.trending_movies_count ||
        prev.trending_tv_count     !== this._config.trending_tv_count) {
      this._trendMovies = [];
      this._trendTV     = [];
      this._trendError  = null;
      // Reload if already initialized
      if (this._initialized && this._hass) {
        this._loadTrending();
      }
    }
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
      // Fetch enough pages to satisfy the configured counts.
      // Overseerr returns 20 results per page.
      const PAGE_SIZE = 20;
      const moviePages = Math.ceil(this._moviesCount / PAGE_SIZE);
      const tvPages    = Math.ceil(this._tvCount    / PAGE_SIZE);

      const fetchPages = async (path, pages) => {
        const results = [];
        for (let p = 1; p <= pages; p++) {
          const data = await this._get(path, { page: p });
          results.push(...(data.results || []));
        }
        return results;
      };

      const [movieResults, tvResults] = await Promise.all([
        fetchPages("/discover/movies", moviePages),
        fetchPages("/discover/tv",    tvPages),
      ]);

      this._trendMovies = movieResults.slice(0, this._moviesCount);
      this._trendTV     = tvResults.slice(0,    this._tvCount);
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
  documentationURL: "https://github.com/berserk88/seerr-requestarr-card",
  icon:        "data:image/png;base64,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",
});
