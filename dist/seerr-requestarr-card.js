/** @version 1.3.0 */
/**
 * Seerr Requestarr Card for Home Assistant
 * https://github.com/berserk88/seerr-requestarr-card
 *
 * Card config options:
 *   card_width:              CSS width  (default: "100%")
 *   card_height:             CSS height (default: "580px")
 *   trending_movies_count:   titles to show in movies row (default: 20)
 *   trending_tv_count:       titles to show in TV row     (default: 20)
 *   omdb_api_key:            OMDb API key for IMDb/RT ratings on tiles
 *                            Get a free key: https://www.omdbapi.com/apikey.aspx
 */

const PROXY  = "/api/seerr_proxy";
const DEBUG  = "/api/seerr_debug";
const TMDB_W = "https://image.tmdb.org/t/p/";

const DISCOVER_SECTIONS = {
  movies: [
    { id: "popular",    label: "Popular",         path: "/discover/movies",          params: {} },
    { id: "toprated",   label: "Top Rated",       path: "/discover/movies",          params: { sortBy: "vote_average.desc" } },
    { id: "upcoming",   label: "Upcoming",        path: "/discover/movies/upcoming", params: {} },
    { id: "nowplaying", label: "Now Playing",     path: "/discover/movies",          params: { primaryReleaseDateGte: new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10) } },
    { id: "g-action",   label: "Action",          path: "/discover/movies",          params: { genre: "28" } },
    { id: "g-comedy",   label: "Comedy",          path: "/discover/movies",          params: { genre: "35" } },
    { id: "g-drama",    label: "Drama",           path: "/discover/movies",          params: { genre: "18" } },
    { id: "g-horror",   label: "Horror",          path: "/discover/movies",          params: { genre: "27" } },
    { id: "g-scifi",    label: "Sci-Fi",          path: "/discover/movies",          params: { genre: "878" } },
    { id: "g-anim",     label: "Animation",       path: "/discover/movies",          params: { genre: "16" } },
    { id: "g-romance",  label: "Romance",         path: "/discover/movies",          params: { genre: "10749" } },
    { id: "g-thriller", label: "Thriller",        path: "/discover/movies",          params: { genre: "53" } },
    { id: "g-crime",    label: "Crime",           path: "/discover/movies",          params: { genre: "80" } },
    { id: "g-doc",      label: "Documentary",     path: "/discover/movies",          params: { genre: "99" } },
  ],
  tv: [
    { id: "popular",    label: "Popular",         path: "/discover/tv",              params: {} },
    { id: "toprated",   label: "Top Rated",       path: "/discover/tv",              params: { sortBy: "vote_average.desc" } },
    { id: "airing",     label: "Airing Today",    path: "/discover/tv/upcoming",     params: {} },
    { id: "g-drama",    label: "Drama",           path: "/discover/tv",              params: { genre: "18" } },
    { id: "g-comedy",   label: "Comedy",          path: "/discover/tv",              params: { genre: "35" } },
    { id: "g-action",   label: "Action & Adv.",   path: "/discover/tv",              params: { genre: "10759" } },
    { id: "g-scifi",    label: "Sci-Fi & Fantasy",path: "/discover/tv",              params: { genre: "10765" } },
    { id: "g-crime",    label: "Crime",           path: "/discover/tv",              params: { genre: "80" } },
    { id: "g-anim",     label: "Animation",       path: "/discover/tv",              params: { genre: "16" } },
    { id: "g-mystery",  label: "Mystery",         path: "/discover/tv",              params: { genre: "9648" } },
    { id: "g-reality",  label: "Reality",         path: "/discover/tv",              params: { genre: "10764" } },
    { id: "g-doc",      label: "Documentary",     path: "/discover/tv",              params: { genre: "99" } },
    { id: "g-family",   label: "Family",          path: "/discover/tv",              params: { genre: "10751" } },
  ],
};

const RT_LABEL = score => score >= 75 ? { label: "Fresh", color: "#f84" }
               : score >= 60 ? { label: "Fresh", color: "#f84" }
               : { label: "Rotten", color: "#e44" };
const RT_CERT  = score => score >= 75;

const AVAIL = {
  1: { label: "Unknown",    color: "#6b7280", icon: "❓" },
  2: { label: "Pending",    color: "#f59e0b", icon: "⏳" },
  3: { label: "Processing", color: "#3b82f6", icon: "⚙️" },
  4: { label: "Partial",    color: "#8b5cf6", icon: "◑"  },
  5: { label: "Available",  color: "#10b981", icon: "✓"  },
};
const REQST = {
  1: { label: "Pending",   color: "#f59e0b" },
  2: { label: "Approved",  color: "#3b82f6" },
  3: { label: "Declined",  color: "#ef4444" },
  4: { label: "Available", color: "#10b981" },
};

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:host {
--bg: #0a0a0f;
--surf: #111118;
--surf2: #1a1a24;
--border: rgba(255,255,255,0.07);
--accent: #e88800;
--accent2: #7c5cbf;
--text: #f0eff8;
--muted: #6b6a80;
--r: 16px;
--disp: 'Syne', sans-serif;
--body: 'DM Sans', sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
.root {
background: var(--bg);
border-radius: var(--r);
overflow: hidden;
font-family: var(--body);
color: var(--text);
display: flex;
flex-direction: column;
position: relative;
}
.hdr {
display: flex; align-items: center; justify-content: space-between;
padding: 14px 18px 11px; border-bottom: 1px solid var(--border);
background: linear-gradient(135deg,rgba(232,136,0,.09),rgba(124,92,191,.06));
flex-shrink: 0;
}
.hdr-left { display: flex; align-items: center; gap: 10px; }
.hdr-logo {
width: 32px; height: auto;
border-radius: 7px; flex-shrink: 0; display: block;
}
.hdr-name { font-family: var(--disp); font-size: 13px; font-weight: 700; letter-spacing: -.3px; }
.hdr-sub { font-size: 10px; color: var(--muted); margin-top: 1px; }
.hdr-stats { display: flex; gap: 7px; }
.stat-pill {
background: var(--surf2); border: 1px solid var(--border);
border-radius: 20px; padding: 3px 8px; font-size: 10px; font-weight: 500;
display: flex; align-items: center; gap: 4px;
}
.sdot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }
.tabs {
display: flex; background: var(--surf);
border-bottom: 1px solid var(--border); padding: 0 14px; gap: 2px; flex-shrink: 0;
}
.tab {
background: none; border: none; color: var(--muted);
font-family: var(--body); font-size: 11px; font-weight: 500;
padding: 10px 12px 8px; cursor: pointer;
border-bottom: 2px solid transparent; transition: all .2s;
display: flex; align-items: center; gap: 5px; margin-bottom: -1px;
}
.tab:hover { color: var(--text); }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.tc { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
.trend-wrap { flex: 1; overflow-y: auto; display: flex; flex-direction: column; min-height: 0;
scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.trend-section { flex-shrink: 0; }
.sec-hdr {
font-family: var(--disp); font-size: 10px; font-weight: 700;
text-transform: uppercase; letter-spacing: 1.4px; color: var(--muted);
padding: 11px 16px 7px; position: sticky; top: 0;
background: var(--bg); z-index: 2;
display: flex; align-items: center; justify-content: space-between;
}
.sec-hdr-btn {
font-size: 10px; color: var(--accent); cursor: pointer; font-weight: 600;
background: none; border: none; font-family: var(--body);
padding: 2px 6px; border-radius: 4px; transition: background .15s;
}
.sec-hdr-btn:hover { background: rgba(232,136,0,.12); }
.h-scroll {
overflow-x: auto; overflow-y: hidden; padding: 0 16px 14px;
scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.h-scroll::-webkit-scrollbar { height: 3px; }
.h-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.h-row { display: flex; gap: 8px; width: max-content; }
.browse-wrap {
flex: 1; display: flex; flex-direction: column; min-height: 0;
}
.browse-hdr {
display: flex; align-items: center; gap: 10px;
padding: 12px 16px 10px; border-bottom: 1px solid var(--border); flex-shrink: 0;
background: var(--bg);
}
.browse-back {
background: none; border: none; color: var(--muted); cursor: pointer;
font-size: 13px; font-family: var(--body); padding: 0; transition: color .2s;
}
.browse-back:hover { color: var(--text); }
.browse-title { font-family: var(--disp); font-size: 14px; font-weight: 700; }
.browse-grid {
flex: 1; overflow-y: auto; padding: 12px 16px 16px; min-height: 0;
scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.browse-grid::-webkit-scrollbar { width: 3px; }
.browse-grid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.poster-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
gap: 8px;
}
.media-card, .trend-card, .rating-card {
background: var(--surf2); border: 1px solid var(--border);
border-radius: 9px; overflow: hidden; cursor: pointer; transition: all .18s; position: relative;
display: flex; flex-direction: column;
}
.media-card:hover, .trend-card:hover, .rating-card:hover {
border-color: rgba(232,136,0,.5); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.45);
}
.media-card img, .trend-card img, .rating-card img {
width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; background: var(--surf); flex-shrink: 0;
}
.trend-card img { width: 120px; height: 180px; }
.no-poster {
aspect-ratio: 2/3; background: var(--surf); flex-shrink: 0;
display: flex; flex-direction: column; align-items: center; justify-content: center;
font-size: 22px; gap: 4px; width: 100%;
}
.trend-card .no-poster { width: 120px; height: 180px; }
.no-poster span { font-size: 9px; color: var(--muted); text-align: center; padding: 0 6px; }
.card-body { display: flex; flex-direction: column; flex: 1; }
.card-info { padding: 6px 7px 4px; flex: 1; }
.card-title {
font-size: 10px; font-weight: 500; line-height: 1.3;
display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 3px;
min-height: calc(1.3em * 2);
}
.card-tagline {
font-size: 8px; color: var(--muted); line-height: 1.3; margin-bottom: 3px;
display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
font-style: italic;
}
.card-meta { font-size: 9px; color: var(--muted); display: flex; align-items: center; justify-content: space-between; }
.type-badge {
background: rgba(124,92,191,.25); color: #b09de0;
border-radius: 3px; padding: 1px 4px; font-size: 8px; font-weight: 600;
text-transform: uppercase; letter-spacing: .4px;
}
.lang-badge {
background: rgba(16,185,129,.15); color: #10b981;
border-radius: 3px; padding: 1px 4px; font-size: 8px; font-weight: 600;
letter-spacing: .2px;
}
.avail-dot {
position: absolute; top: 5px; right: 5px; border-radius: 5px; padding: 2px 5px;
font-size: 8px; font-weight: 700; backdrop-filter: blur(6px); line-height: 1;
}
.trend-card { width: 120px; flex-shrink: 0; }
.trend-info { padding: 5px 6px 3px; flex: 1; }
.trend-title {
font-size: 9px; font-weight: 500; line-height: 1.3;
display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
min-height: calc(1.3em * 2);
}
.trend-tagline {
font-size: 7.5px; color: var(--muted); line-height: 1.3; margin-bottom: 2px;
display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
font-style: italic;
}
.trend-year { font-size: 8px; color: var(--muted); margin-top: 1px; }
.detail-outer {
flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0;
}
.detail-back-bar {
display: flex; align-items: center; gap: 8px; padding: 10px 16px 8px;
border-bottom: 1px solid var(--border); flex-shrink: 0; background: var(--bg);
}
.back-btn {
background: none; border: none; color: var(--muted); font-family: var(--body);
font-size: 12px; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 5px; transition: color .2s;
}
.back-btn:hover { color: var(--text); }
.detail-scroll { flex: 1; overflow-y: auto; min-height: 0;
scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.detail-hero {
position: relative; width: 100%; height: 160px; overflow: hidden; flex-shrink: 0;
}
.detail-backdrop {
width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(.45);
}
.detail-backdrop-ph { width: 100%; height: 160px; background: var(--surf2); }
.detail-hero-overlay {
position: absolute; bottom: 0; left: 0; right: 0;
background: linear-gradient(transparent, var(--bg));
height: 80px;
}
.detail-body { padding: 0 16px 16px; }
.detail-top { display: flex; gap: 14px; margin-top: -50px; margin-bottom: 14px; position: relative; z-index: 1; }
.detail-poster { width: 90px; min-width: 90px; border-radius: 9px; overflow: hidden; box-shadow: 0 6px 24px rgba(0,0,0,.6); }
.detail-poster img { width: 100%; display: block; }
.detail-poster-ph {
width: 90px; height: 135px; border-radius: 9px; background: var(--surf2);
display: flex; align-items: center; justify-content: center; font-size: 28px;
}
.detail-meta-block { flex: 1; padding-top: 52px; }
.detail-title { font-family: var(--disp); font-size: 17px; font-weight: 700; line-height: 1.2; margin-bottom: 4px; }
.detail-year { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
.detail-badges { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.badge {
background: var(--surf2); border: 1px solid var(--border);
border-radius: 5px; padding: 3px 8px; font-size: 10px; display: flex; align-items: center; gap: 4px;
}
.detail-section-title {
font-family: var(--disp); font-size: 10px; font-weight: 700; text-transform: uppercase;
letter-spacing: 1.2px; color: var(--muted); margin-bottom: 6px; margin-top: 14px;
}
.detail-overview { font-size: 12px; line-height: 1.65; color: rgba(240,239,248,.7); margin-bottom: 4px; }
.detail-info-grid {
display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;
}
.info-item { background: var(--surf2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
.info-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 3px; }
.info-value { font-size: 12px; font-weight: 500; }
.genre-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
.genre-chip {
background: rgba(232,136,0,.12); border: 1px solid rgba(232,136,0,.25);
color: var(--accent); border-radius: 20px; padding: 3px 9px; font-size: 10px; font-weight: 500;
}
.req-btn {
width: 100%; background: linear-gradient(135deg,var(--accent),#c47800);
border: none; border-radius: 9px; padding: 12px; color: #fff;
font-family: var(--disp); font-size: 13px; font-weight: 700;
cursor: pointer; transition: all .18s;
display: flex; align-items: center; justify-content: center; gap: 7px;
}
.req-btn:hover { opacity: .88; transform: translateY(-1px); }
.req-btn:active { transform: none; }
.req-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
.req-btn.already { background: var(--surf2); border: 1px solid rgba(16,185,129,.4); color: #10b981; }
.req-btn.sent { background: linear-gradient(135deg,#10b981,#059669); }
.search-top { padding: 12px 16px 0; flex-shrink: 0; }
.search-row { display: flex; gap: 8px; margin-bottom: 10px; }
.search-input {
flex: 1; background: var(--surf2); border: 1px solid var(--border);
border-radius: 9px; padding: 9px 12px; color: var(--text);
font-family: var(--body); font-size: 13px; outline: none; transition: border-color .2s;
}
.search-input:focus { border-color: var(--accent); }
.search-input::placeholder { color: var(--muted); }
.search-btn {
background: linear-gradient(135deg,var(--accent),#c47800);
border: none; border-radius: 9px; padding: 9px 15px; color: #fff;
font-family: var(--disp); font-size: 12px; font-weight: 600;
cursor: pointer; transition: opacity .2s;
}
.search-btn:hover { opacity: .88; }
.search-btn:disabled { opacity: .4; cursor: not-allowed; }
.filter-row { display: flex; gap: 6px; margin-bottom: 10px; }
.f-chip {
background: var(--surf2); border: 1px solid var(--border);
border-radius: 20px; padding: 4px 11px; font-size: 11px; font-weight: 500;
color: var(--muted); cursor: pointer; transition: all .2s;
}
.f-chip.active { background: rgba(232,136,0,.15); border-color: rgba(232,136,0,.4); color: var(--accent); }
.scroll-grid {
flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0 16px 16px; min-height: 0;
scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.scroll-grid::-webkit-scrollbar { width: 3px; }
.scroll-grid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.req-wrap { flex: 1; overflow-y: auto; padding: 10px 16px; min-height: 0;
scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.req-item {
background: var(--surf2); border: 1px solid var(--border);
border-radius: 9px; padding: 9px 11px; display: flex; align-items: center;
gap: 10px; margin-bottom: 7px;
}
.req-thumb { width: 32px; height: 48px; border-radius: 5px; object-fit: cover; flex-shrink: 0; background: var(--surf); }
.req-thumb-ph { width: 32px; height: 48px; border-radius: 5px; background: var(--surf); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.req-info { flex: 1; min-width: 0; }
.req-title { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.req-meta { font-size: 10px; color: var(--muted); display: flex; gap: 6px; }
.req-stat { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; }
.req-stat-dot { width: 4px; height: 4px; border-radius: 50%; }
.state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 20px; color: var(--muted); gap: 9px; font-size: 12px; text-align: center; }
.state-icon { font-size: 26px; }
.state-ttl { color: var(--accent); font-weight: 600; font-size: 13px; }
.state-msg { max-width: 220px; line-height: 1.5; }
.spinner { width: 22px; height: 22px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn {
background: var(--surf2); border: 1px solid var(--border); border-radius: 7px;
padding: 5px 13px; color: var(--text); font-family: var(--body); font-size: 11px;
cursor: pointer; transition: border-color .2s; margin-top: 4px;
}
.retry-btn:hover { border-color: var(--accent); }
.dbg-link { font-size: 10px; color: var(--muted); text-decoration: underline; cursor: pointer; margin-top: 2px; }
.rating-bar {
display: flex; flex-wrap: nowrap; gap: 2px; padding: 3px 5px 4px;
border-top: 1px solid var(--border); height: 22px; background: rgba(0,0,0,.25);
margin-top: auto; flex-shrink: 0; overflow: hidden; align-items: center;
}
.rating-bar:empty { display: none; }
.rb-item {
font-size: 7.5px; font-weight: 600; white-space: nowrap;
background: rgba(255,255,255,.06); border-radius: 3px; padding: 1px 3px;
color: var(--text); flex-shrink: 0;
}
.rb-tmdb { color: #e88800; }
.rb-imdb { color: #f5c518; }
.rb-rt { }
.rb-rta { color: #a8d8a8; }
.disc-wrap { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.disc-controls {
display: flex; flex-direction: column; gap: 0; flex-shrink: 0;
border-bottom: 1px solid var(--border); background: var(--surf);
}
.disc-type-row {
display: flex; padding: 8px 14px 0; gap: 6px;
}
.disc-type-btn {
background: none; border: none; color: var(--muted);
font-family: var(--body); font-size: 12px; font-weight: 600;
padding: 6px 14px 8px; cursor: pointer;
border-bottom: 2px solid transparent; transition: all .2s; margin-bottom: -1px;
}
.disc-type-btn:hover { color: var(--text); }
.disc-type-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
.disc-section-row {
display: flex; gap: 5px; padding: 7px 14px; overflow-x: auto;
scrollbar-width: none;
}
.disc-section-row::-webkit-scrollbar { display: none; }
.disc-sec-btn {
background: var(--surf2); border: 1px solid var(--border);
border-radius: 20px; padding: 4px 11px; font-size: 10px; font-weight: 500;
color: var(--muted); cursor: pointer; transition: all .18s; white-space: nowrap; flex-shrink: 0;
}
.disc-sec-btn.active { background: rgba(232,136,0,.15); border-color: rgba(232,136,0,.4); color: var(--accent); }
.disc-genre-btn { background: rgba(124,92,191,.1); border-color: rgba(124,92,191,.2); }
.disc-genre-btn.active { background: rgba(124,92,191,.25); border-color: rgba(124,92,191,.5); color: #c0a8f0; }
.disc-sec-divider {
color: var(--border); font-size: 14px; line-height: 1;
display: flex; align-items: center; padding: 0 4px; flex-shrink: 0; user-select: none;
}
.disc-grid {
flex: 1; overflow-y: auto; padding: 10px 14px 14px; min-height: 0;
scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.disc-grid::-webkit-scrollbar { width: 3px; }
.disc-grid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.disc-footer { display: flex; justify-content: center; padding: 10px 0 4px; }
.detail-ratings {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 7px; margin-bottom: 14px;
}
.rating-block:nth-child(3n+1):last-child,
.rating-block:nth-child(3n+2):last-child {
}
.rating-block {
background: var(--surf2); border: 1px solid var(--border);
border-radius: 9px; padding: 10px 6px; display: flex; flex-direction: column;
align-items: center; justify-content: center;
min-height: 72px;
}
.rating-logo { font-size: 15px; margin-bottom: 3px; line-height: 1; }
.rating-score { font-family: var(--disp); font-size: 18px; font-weight: 800; line-height: 1; white-space: nowrap; }
.rating-sublabel { font-size: 8px; color: var(--muted); margin-top: 3px; text-align: center; letter-spacing: .3px; white-space: nowrap; }
.toast {
position: absolute; bottom: 12px; left: 50%;
transform: translateX(-50%) translateY(50px);
background: var(--surf2); border: 1px solid var(--border);
border-radius: 9px; padding: 8px 16px; font-size: 12px; font-weight: 500;
white-space: nowrap; transition: transform .28s cubic-bezier(.34,1.56,.64,1);
z-index: 50; pointer-events: none; box-shadow: 0 6px 24px rgba(0,0,0,.4);
}
.toast.show { transform: translateX(-50%) translateY(0); }
.toast.success { border-color: rgba(16,185,129,.5); color: #10b981; }
.toast.error { border-color: rgba(232,136,0,.5); color: var(--accent); }`;

const LANGS = { en:"English", ja:"Japanese", ko:"Korean", zh:"Chinese", fr:"French", es:"Spanish", de:"German", it:"Italian", pt:"Portuguese", ru:"Russian", ar:"Arabic", hi:"Hindi", th:"Thai", tr:"Turkish", pl:"Polish", nl:"Dutch", sv:"Swedish", da:"Danish", no:"Norwegian", fi:"Finnish", cs:"Czech", hu:"Hungarian", ro:"Romanian", id:"Indonesian", vi:"Vietnamese", he:"Hebrew", fa:"Persian", uk:"Ukrainian", el:"Greek", bg:"Bulgarian" };
class SeerrRequestarrCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass          = null;
    this._cfg           = {};
    this._tab           = "trending";
    this._initialized   = false;

    this._detail        = null;
    this._detailFull    = null;
    this._detailLoading = false;
    this._browseMode    = null;
    this._browseData    = [];
    this._browseLoading = false;
    this._browsePage    = 1;
    this._browseDone    = false;
    this._browseDetail        = null;
    this._browseDetailFull    = null;
    this._browseDetailLoading = false;

    this._trendMovies   = [];
    this._trendTV       = [];
    this._trendLoading  = false;
    this._trendError    = null;
    this._searchResults = [];
    this._searchQuery   = "";
    this._searchFilter  = "all";
    this._searching     = false;
    this._requests      = [];
    this._reqLoading    = false;
    this._reqError      = null;
    this._pending       = 0;
    this._total         = 0;

    this._discType      = "movies";
    this._discSection   = "popular";
    this._discData      = [];
    this._discLoading   = false;
    this._discError     = null;
    this._discPage      = 1;
    this._discDone      = false;
    this._ratingsCache  = {};
    this._historyBound  = false;
    this._warnActive    = false;
    this._scrollPos     = {};
  }

  static getStubConfig() {
    return { card_width: "100%", card_height: "580px", trending_movies_count: 20, trending_tv_count: 20, omdb_api_key: "" };
  }

  setConfig(cfg) {
    const prev = this._cfg;
    this._cfg  = cfg || {};

    if (this._initialized && this._hass &&
        (prev.trending_movies_count !== cfg.trending_movies_count ||
         prev.trending_tv_count     !== cfg.trending_tv_count)) {
      this._trendMovies = []; this._trendTV = []; this._trendError = null;
      this._loadTrending();
    }
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this._loadTrending();
      this._loadRequests();
      this._loadDiscover(1);
      this._setupHistory();

      this._reqRefreshInterval = setInterval(() => {
        this._loadRequests();
      }, 120000);
    }
    this._syncStats();
  }

  get _W()  { return this._cfg.card_width  || "100%";  }
  get _H()  { return this._cfg.card_height || "580px"; }
  get _MC() { return Math.max(1, parseInt(this._cfg.trending_movies_count) || 20); }
  get _TC() { return Math.max(1, parseInt(this._cfg.trending_tv_count)     || 20); }

  _syncStats() {
    if (!this._hass) return;
    const ss = Object.values(this._hass.states);
    const p  = ss.find(s => s.entity_id.includes("seerr") && s.entity_id.includes("pending"));
    const t  = ss.find(s => s.entity_id.includes("seerr") && s.entity_id.includes("total"));
    if (p) this._pending = parseInt(p.state) || 0;
    if (t) this._total   = parseInt(t.state) || 0;
    const ep = this.shadowRoot.querySelector(".stat-pending");
    const et = this.shadowRoot.querySelector(".stat-total");
    if (ep) ep.textContent = this._pending;
    if (et) et.textContent = this._total;
  }

  async _get(path, params = {}) {
    const url = new URL(PROXY + path, window.location.origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const r = await this._hass.fetchWithAuth(url.pathname + url.search);
    if (!r.ok) {
      let m = `HTTP ${r.status}`;
      try { const j = await r.json(); m = j.message || j.error || m; } catch {}
      throw new Error(m);
    }
    return r.json();
  }

  async _post(path, body) {
    const r = await this._hass.fetchWithAuth(PROXY + path, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!r.ok) {
      let m = `HTTP ${r.status}`;
      try { const j = await r.json(); m = j.message || j.error || m; } catch {}
      throw new Error(m);
    }
    return r.json();
  }

  async _loadTrending() {
    if (this._trendLoading) return;
    this._trendLoading = true;
    this._trendError   = null;

    if (this._tab === "trending") this._paint();
    try {
      const fetchN = async (path, count) => {
        const pages   = Math.ceil(count / 20);
        const results = [];
        for (let p = 1; p <= pages; p++) {
          const data = await this._get(path, { page: p });
          results.push(...(data.results || []));
          if ((data.results || []).length < 20) break;
        }
        return results.slice(0, count);
      };
      const [movies, tv] = await Promise.all([
        fetchN("/discover/movies", this._MC),
        fetchN("/discover/tv",     this._TC),
      ]);
      this._trendMovies = movies;
      this._trendTV     = tv;
      if(this._tab==="trending") this._fetchRatingsForItems(movies);
    } catch (e) {
      this._trendError = e.message;
    } finally {
      this._trendLoading = false;
    }

    if (this._tab === "trending") this._paint();
  }

  async _loadBrowse(type, page = 1) {
    this._browseLoading = true;
    if (page === 1) {

      this._browseData = [];
      this._paint();
    } else {

      const footer = this.shadowRoot.querySelector(".browse-footer");
      if (footer) footer.innerHTML = `<div class="spinner" style="width:22px;height:22px;margin:0 auto"></div>`;
    }
    try {
      const path = type === "movies" ? "/discover/movies" : "/discover/tv";
      const data = await this._get(path, { page: page });
      const results = data.results || [];
      if (page === 1) {
        this._browseData = results;
        this._browseDone = results.length < 20;
        this._browsePage = page;
        this._browseLoading = false;
        this._paint();
        return;
      }

      this._browseData.push(...results);
      this._browseDone = results.length < 20;
      this._browsePage = page;
      this._browseLoading = false;

      const grid = this.shadowRoot.querySelector(".browse-grid .poster-grid");
      if (grid) {
        const frag = document.createDocumentFragment();
        results.forEach(item => {
          const tmp = document.createElement("div");
          tmp.innerHTML = this._mediaCardHtml(item);
          const card = tmp.firstElementChild;
          card.addEventListener("click", () => this._openDetailFromBrowse(card));
          frag.appendChild(card);
        });
        grid.appendChild(frag);
      }

      const footer2 = this.shadowRoot.querySelector(".browse-footer");
      if (footer2) {
        footer2.innerHTML = this._browseDone
          ? ""
          : `<button class="retry-btn" data-action="load-more">Load more</button>`;
        footer2.querySelector("[data-action='load-more']")?.addEventListener("click", () =>
          this._loadBrowse(this._browseMode, this._browsePage + 1));
      }
    } catch (e) {
      this._browseLoading = false;
      this._toast("Failed to load: " + e.message, "error");
      const footer = this.shadowRoot.querySelector(".browse-footer");
      if (footer) footer.innerHTML = `<button class="retry-btn" data-action="load-more">Retry</button>`;
      this.shadowRoot.querySelector("[data-action='load-more']")?.addEventListener("click", () =>
        this._loadBrowse(this._browseMode, this._browsePage + 1));
    }
  }

  async _loadRequests() {
    if (this._reqLoading) return;
    this._reqLoading = true;
    this._reqError   = null;

    if (this._tab === "requests") this._paint();
    try {
      const data = await this._get("/request", { take: 25, skip: 0, filter: "all" });
      const raw  = data.results || [];
      const enriched = await Promise.all(
        raw.map(async req => {
          const media  = req.media || {};
          const tmdbId = media.tmdbId;
          const mType  = req.type || media.mediaType;
          try {
            if (tmdbId && mType === "movie") return { ...req, _d: await this._get(`/movie/${tmdbId}`) };
            if (tmdbId && (mType === "tv" || mType === "series")) return { ...req, _d: await this._get(`/tv/${tmdbId}`) };
          } catch {}
          return req;
        })
      );
      this._requests = enriched;

      this._fetchRatingsForItems(
        enriched.map(r => ({ ...r._d, mediaType: r.type || r.media?.mediaType })).filter(Boolean)
      );
    } catch (e) {
      this._reqError = e.message;
    } finally {
      this._reqLoading = false;
    }

    if (this._tab === "requests") {
      this._paint();
    } else {

      this._syncStats();
    }
  }

  async _loadDetail(media) {
    this._cancelGrace();
    this._pushNav();
    this._detail        = media;
    this._detailFull    = null;
    this._detailLoading = true;
    this._browseDetail  = null;
    this._paint();
    try {
      const path = media.mediaType === "movie" ? `/movie/${media.id}` : `/tv/${media.id}`;
      const ratingPath = media.mediaType === "tv" ? null : path + "/ratings";
      const [full, ratings] = await Promise.all([
        this._get(path),
        ratingPath ? this._get(ratingPath).catch(() => null) : Promise.resolve(null),
      ]);
      if (ratings) this._ratingsCache[media.id] = ratings;
      this._detailFull = { ...full, _ratings: ratings };
    } catch (e) {
      this._detailFull = media;
    } finally {
      this._detailLoading = false;
    }
    this._paint();
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
      // Optimistically increment stats immediately so header badges update now
      this._total++;
      this._pending++;
      this._syncStats();
      // Then do a full reload in the background
      this._loadRequests();
    } catch (e) {
      this._toast("Request failed: " + e.message, "error");
      if (btn) { btn.disabled = false; btn.textContent = "🎬 Request This"; }
    }
  }

  async _loadDiscoverGrid(page = 1) {

    if (this._discLoading) return;
    this._discLoading = true;

    const grid = this.shadowRoot.querySelector(".disc-grid");

    if (page === 1) {

      if (grid) grid.innerHTML = `<div class="state-box"><div class="spinner"></div><span>Loading…</span></div>`;
    } else {

      const footer = grid?.querySelector(".disc-footer");
      if (footer) {
        footer.innerHTML = `<div class="spinner" style="width:22px;height:22px;margin:0 auto"></div>`;
      }
    }

    try {
      const sections = DISCOVER_SECTIONS[this._discType];
      const sec      = sections.find(s => s.id === this._discSection) || sections[0];
      const params   = { ...sec.params, page };
      const data     = await this._get(sec.path, params);
      const results  = data.results || [];

      if (page === 1) {
        this._discData = results;
      } else {
        this._discData.push(...results);
      }
      this._discDone = results.length < 20;
      this._discPage = page;
      this._discLoading = false;

      const liveGrid = this.shadowRoot.querySelector(".disc-grid");
      if (!liveGrid) return;

      const bindFooter = (container) => {
        container.querySelector("[data-action='disc-more']")
          ?.addEventListener("click", () => this._loadDiscoverGrid(this._discPage + 1));
      };

      if (page === 1) {

        const footerHtml = this._discDone
          ? `<div class="disc-footer"></div>`
          : `<div class="disc-footer"><button class="retry-btn" data-action="disc-more">Load more</button></div>`;
        liveGrid.innerHTML = `<div class="poster-grid">${this._discData.map(i => this._ratingCardHtml(i)).join("")}</div>${footerHtml}`;
        liveGrid.querySelectorAll(".rating-card").forEach(c =>
          c.addEventListener("click", () => this._openDiscoverDetail(c)));
        bindFooter(liveGrid);
      } else {

        const posterGrid = liveGrid.querySelector(".poster-grid");
        if (posterGrid) {
          const frag = document.createDocumentFragment();
          results.forEach(item => {
            const tmp = document.createElement("div");
            tmp.innerHTML = this._ratingCardHtml(item);
            const card = tmp.firstElementChild;
            card.addEventListener("click", () => this._openDiscoverDetail(card));
            frag.appendChild(card);
          });
          posterGrid.appendChild(frag);
        }
        const footer2 = liveGrid.querySelector(".disc-footer");
        if (footer2) {
          footer2.innerHTML = this._discDone
            ? ""
            : `<button class="retry-btn" data-action="disc-more">Load more</button>`;
          bindFooter(liveGrid);
        }
      }

      this._fetchRatingsForItems(results);

    } catch (e) {
      this._discLoading = false;
      this._discError   = e.message;
      const g = this.shadowRoot.querySelector(".disc-grid");
      if (g) g.innerHTML = this._stateHtml("⚠️", "Could not load", e.message, "discover");
    }
  }

  async _loadDiscover(page = 1) {

    if (page > 1) { this._loadDiscoverGrid(page); return; }

    if (this._discLoading) return;
    this._discLoading = true;
    this._discError   = null;
    this._discData    = [];
    if (this._tab === "discover") this._paint();
    try {
      const sections = DISCOVER_SECTIONS[this._discType];
      const sec      = sections.find(s => s.id === this._discSection) || sections[0];
      const data     = await this._get(sec.path, { ...sec.params, page: 1 });
      const results  = data.results || [];
      this._discData = results;
      this._discDone = results.length < 20;
      this._discPage = 1;
      this._discLoading = false;
      if (this._tab === "discover") this._paint();
      this._fetchRatingsForItems(results);
    } catch (e) {
      this._discLoading = false;
      this._discError   = e.message;
      if (this._tab === "discover") this._paint();
    }
  }

  async _fetchRatingsForItems(items) {

    const TTL=600000,now=Date.now();
    const movies = items.filter(item =>
      item.mediaType !== "tv" &&
      (!this._ratingsCache[item.id] || now-(this._ratingsCache[item.id]._ts||0)>TTL)
    );
    await Promise.all(
      movies.map(async item => {
        try {
          const r = await this._get(`/movie/${item.id}/ratings`);

          if (this._cfg.omdb_api_key && item.externalIds?.imdbId) {
            const imdb = await this._fetchOmdb(item.externalIds.imdbId);
            if (imdb) r._imdb = imdb;
          }
          this._ratingsCache[item.id] = {...r, _ts:Date.now()};
          this._updateRatingBadge(item.id, item.voteAverage, r);
        } catch {}
      })
    );
  }

  async _fetchOmdb(imdbId) {

    if (!this._cfg.omdb_api_key || !imdbId) return null;
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${encodeURIComponent(this._cfg.omdb_api_key)}`);
      if (!res.ok) return null;
      const d = await res.json();
      return (d.Response === "True" && d.imdbRating && d.imdbRating !== "N/A") ? d.imdbRating : null;
    } catch { return null; }
  }

  _updateRatingBadge(tmdbId, tmdbScore, ratings) {

    const card = this.shadowRoot.querySelector(`[data-id="${tmdbId}"]`);
    if (!card) return;
    const rb = card.querySelector(".rating-bar");
    if (rb) rb.innerHTML = this._ratingBarInner(tmdbScore, ratings);
  }

  _ratingBarInner(tmdbScore, r) {

    const parts = [];
    if (tmdbScore) {
      parts.push(`<span class="rb-item rb-tmdb" title="TMDB">⭐ ${Number(tmdbScore).toFixed(1)}</span>`);
    }

    if (r && r._imdb) {
      parts.push(`<span class="rb-item rb-imdb" title="IMDb">🎬 ${r._imdb}</span>`);
    }
    if (r && r.criticsScore != null) {
      const fresh = r.criticsScore >= 60;
      const cert  = r.criticsScore >= 75 && r.criticsRating === "Certified Fresh";
      parts.push(`<span class="rb-item rb-rt" title="RT Critics" style="color:${fresh?"#f84":"#e44"}">${cert?"🍅":(fresh?"🍅":"🤢")} ${r.criticsScore}%</span>`);
    }
    if (r && r.audienceScore != null) {
      parts.push(`<span class="rb-item rb-rta" title="RT Audience">🍿 ${r.audienceScore}%</span>`);
    }
    return parts.join("") || "";
  }

  _ratingBarHtml(tmdbScore, r) {
    return `<div class="rating-bar">${this._ratingBarInner(tmdbScore, r)}</div>`;
  }

  _openDiscoverDetail(card) {
    const id   = parseInt(card.dataset.id);
    const type = card.dataset.type;
    const m    = this._discData.find(x => x.id === id);
    if (!m) return;

    this._cancelGrace();
    this._pushNav();
    this._browseDetail        = { ...m, mediaType: type || m.mediaType };
    this._browseDetailFull    = null;
    this._browseDetailLoading = true;
    this._paint();
    const path = (type === "tv" || m.mediaType === "tv") ? `/tv/${m.id}` : `/movie/${m.id}`;

    const ratingPath = (m.mediaType === "tv") ? null : path + "/ratings";
    Promise.all([
      this._get(path),
      ratingPath ? this._get(ratingPath).catch(() => null) : Promise.resolve(null),
    ]).then(([full, ratings]) => {
      if (ratings) this._ratingsCache[m.id] = ratings;
      this._browseDetailFull    = { ...full, _ratings: ratings };
      this._browseDetailLoading = false;
      this._paint();
    }).catch(() => {
      this._browseDetailFull    = m;
      this._browseDetailLoading = false;
      this._paint();
    });
  }

  async _search() {
    const input = this.shadowRoot.querySelector(".search-input");
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    this._searchQuery = q; this._searching = true; this._detail = null;
    this._paintSearch();
    try {
      const data = await this._get("/search", { query: q, page: 1 });
      let res = (data.results || []).filter(r => r.mediaType === "movie" || r.mediaType === "tv");
      if (this._searchFilter === "movie") res = res.filter(r => r.mediaType === "movie");
      if (this._searchFilter === "tv")    res = res.filter(r => r.mediaType === "tv");
      this._searchResults = res;

      this._fetchRatingsForItems(res);
    } catch (e) {
      this._toast("Search failed: " + e.message, "error"); this._searchResults = [];
    } finally {
      this._searching = false; this._paintSearch();
    }
  }

  _toast(msg, type = "success") {
    const t = this.shadowRoot.querySelector(".toast");
    if (!t) return;
    t.textContent = msg; t.className = `toast ${type}`;
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
    setTimeout(() => t.classList.remove("show"), 3500);
  }

  _img(path, size = "w185") { return path ? `${TMDB_W}${size}${path}` : null; }
  _year(m) { const d = m?.releaseDate || m?.firstAirDate || ""; return d ? d.slice(0, 4) : "—"; }

  _availBadge(mediaInfo) {
    if (!mediaInfo || mediaInfo.status <= 1) return "";
    const s = AVAIL[mediaInfo.status];
    if (!s) return "";
    return `<div class="avail-dot" style="background:${s.color}28;color:${s.color};border:1px solid ${s.color}44">${s.icon}</div>`;
  }

  _detailRatingsHtml(m) {

    const r    = m._ratings || this._ratingsCache[m.id] || null;
    const tmdb = m.voteAverage;
    const imdb = r?._imdb;
    const rtC  = r?.criticsScore;
    const rtA  = r?.audienceScore;
    if (!tmdb && !imdb && rtC == null && rtA == null) return "";

    const blocks = [];
    if (tmdb) blocks.push(`
      <div class="rating-block">
        <div class="rating-logo">⭐</div>
        <div class="rating-score" style="color:#e88800">${Number(tmdb).toFixed(1)}</div>
        <div class="rating-sublabel">TMDB</div>
      </div>`);
    if (imdb) blocks.push(`
      <div class="rating-block">
        <div class="rating-logo">🎬</div>
        <div class="rating-score" style="color:#f5c518">${imdb}</div>
        <div class="rating-sublabel">IMDb</div>
      </div>`);
    if (rtC != null) {
      const fresh = rtC >= 60;
      const cert  = rtC >= 75 && r.criticsRating === "Certified Fresh";
      blocks.push(`
        <div class="rating-block">
          <div class="rating-logo">${cert ? "🍅" : fresh ? "🍅" : "🤢"}</div>
          <div class="rating-score" style="color:${fresh?"#f84":"#e44"}">${rtC}%</div>
          <div class="rating-sublabel">RT Critics</div>
        </div>`);
    }
    if (rtA != null) {
      const pos = rtA >= 60;
      blocks.push(`
        <div class="rating-block">
          <div class="rating-logo">${pos ? "🍿" : "😐"}</div>
          <div class="rating-score" style="color:${pos?"#a8d8a8":"#e44"}">${rtA}%</div>
          <div class="rating-sublabel">RT Audience</div>
        </div>`);
    }
    return blocks.length ? `<div class="detail-ratings">${blocks.join("")}</div>` : "";
  }

  _langName(code) {
    if (!code) return null;

    const LANGS = {
      en:"English", ja:"Japanese", ko:"Korean", zh:"Chinese", fr:"French",
      es:"Spanish", de:"German", it:"Italian", pt:"Portuguese", ru:"Russian",
      ar:"Arabic", hi:"Hindi", th:"Thai", tr:"Turkish", pl:"Polish",
      nl:"Dutch", sv:"Swedish", da:"Danish", no:"Norwegian", fi:"Finnish",
      cs:"Czech", hu:"Hungarian", ro:"Romanian", id:"Indonesian", vi:"Vietnamese",
      he:"Hebrew", fa:"Persian", uk:"Ukrainian", el:"Greek", bg:"Bulgarian",
    };
    return LANGS[code] || code.toUpperCase();
  }

  _cardTagline(item) {

    if (item.tagline) return item.tagline;
    if (item.overview) {
      const sentence = item.overview.split(/[.!?]/)[0].trim();
      if (sentence.length > 10) {
        return sentence.length > 65 ? sentence.slice(0, 63) + "…" : sentence;
      }
    }
    return "";
  }

  _runtime(m) {
    const r = m?.runtime;
    if (!r) return null;
    return r >= 60 ? `${Math.floor(r/60)}h ${r%60}m` : `${r}m`;
  }

  _trendCardHtml(item) {
    const p      = this._img(item.posterPath, "w185");
    const year   = this._year(item);
    const ico    = item.mediaType === "movie" ? "🎬" : "📺";
    const cached = this._ratingsCache[item.id];
    const rbar   = `<div class="rating-bar">${this._ratingBarInner(item.voteAverage, cached)}</div>`;
    return `
      <div class="trend-card" data-id="${item.id}" data-type="${item.mediaType}">
        ${this._availBadge(item.mediaInfo)}
        ${p ? `<img src="${p}" alt="" loading="lazy">` : `<div class="no-poster">${ico}<span>${(item.title||item.name||"").slice(0,18)}</span></div>`}
        <div class="card-body">
          <div class="trend-info">
            <div class="trend-title">${item.title || item.name || "Unknown"}</div>
            ${this._cardTagline(item) ? `<div class="trend-tagline">${this._cardTagline(item)}</div>` : ""}
            <div class="trend-year">${year}${item.originalLanguage && item.originalLanguage !== "en" ? ` <span class="lang-badge">${this._langName(item.originalLanguage)}</span>` : ""}</div>
          </div>
          ${rbar}
        </div>
      </div>`;
  }

  _mediaCardHtml(item) {
    const p      = this._img(item.posterPath, "w185");
    const year   = this._year(item);
    const type   = item.mediaType === "movie" ? "Film" : "TV";
    const ico    = item.mediaType === "movie" ? "🎬" : "📺";
    const cached = this._ratingsCache[item.id];
    const rbar   = `<div class="rating-bar">${this._ratingBarInner(item.voteAverage, cached)}</div>`;
    return `
      <div class="media-card" data-id="${item.id}" data-type="${item.mediaType}">
        ${this._availBadge(item.mediaInfo)}
        ${p ? `<img src="${p}" alt="" loading="lazy">` : `<div class="no-poster">${ico}<span>${(item.title||item.name||"").slice(0,18)}</span></div>`}
        <div class="card-body">
          <div class="card-info">
            <div class="card-title">${item.title || item.name || "Unknown"}</div>
            ${this._cardTagline(item) ? `<div class="card-tagline">${this._cardTagline(item)}</div>` : ""}
            <div class="card-meta"><span>${year}</span><span class="type-badge">${type}</span>${item.originalLanguage && item.originalLanguage !== "en" ? `<span class="lang-badge">${this._langName(item.originalLanguage)}</span>` : ""}</div>
          </div>
          ${rbar}
        </div>
      </div>`;
  }

  _ratingCardHtml(item) {
    const p      = this._img(item.posterPath, "w185");
    const year   = this._year(item);
    const ico    = item.mediaType === "tv" ? "📺" : "🎬";
    const type   = item.mediaType === "tv" ? "TV" : "Film";
    const cached = this._ratingsCache[item.id];
    const rbar   = `<div class="rating-bar">${this._ratingBarInner(item.voteAverage, cached)}</div>`;
    return `
      <div class="rating-card" data-id="${item.id}" data-type="${item.mediaType || 'movie'}">
        ${this._availBadge(item.mediaInfo)}
        ${p ? `<img src="${p}" alt="" loading="lazy">` : `<div class="no-poster">${ico}<span>${(item.title||item.name||"").slice(0,18)}</span></div>`}
        <div class="card-body">
          <div class="card-info">
            <div class="card-title">${item.title || item.name || "Unknown"}</div>
            ${this._cardTagline(item) ? `<div class="card-tagline">${this._cardTagline(item)}</div>` : ""}
            <div class="card-meta"><span>${year}</span><span class="type-badge">${type}</span>${item.originalLanguage && item.originalLanguage !== "en" ? `<span class="lang-badge">${this._langName(item.originalLanguage)}</span>` : ""}</div>
          </div>
          ${rbar}
        </div>
      </div>`;
  }

  _stateHtml(icon, title, msg, retry) {
    return `<div class="state-box">
      <div class="state-icon">${icon}</div>
      <div class="state-ttl">${title}</div>
      <div class="state-msg">${msg}</div>
      ${retry ? `<button class="retry-btn" data-retry="${retry}">↺ Retry</button>` : ""}
      <span class="dbg-link" data-action="debug">Run diagnostics</span>
    </div>`;
  }

  _discoverHtml() {
    const sections = DISCOVER_SECTIONS[this._discType];
    const typeButtons = [
      { k: "movies", l: "🎬 Movies" },
      { k: "tv",     l: "📺 TV Shows" },
    ].map(t => `<button class="disc-type-btn${this._discType===t.k?" active":""}" data-dtype="${t.k}">${t.l}</button>`).join("");

    const coreSecs  = sections.filter(s => !s.id.startsWith("g-"));
    const genreSecs = sections.filter(s =>  s.id.startsWith("g-"));
    const secButtons =
      coreSecs.map(s =>
        `<button class="disc-sec-btn${this._discSection===s.id?" active":""}" data-dsec="${s.id}">${s.label}</button>`
      ).join("") +
      (genreSecs.length ? `<span class="disc-sec-divider">|</span>` : "") +
      genreSecs.map(s =>
        `<button class="disc-sec-btn disc-genre-btn${this._discSection===s.id?" active":""}" data-dsec="${s.id}">${s.label}</button>`
      ).join("");

    const footer = !this._discDone
      ? `<div class="disc-footer">${this._discLoading
          ? `<div class="spinner" style="width:22px;height:22px"></div>`
          : `<button class="retry-btn" data-action="disc-more">Load more</button>`}</div>`
      : `<div class="disc-footer"></div>`;

    let gridContent;
    if (this._discLoading && !this._discData.length) {

      gridContent = `<div class="state-box"><div class="spinner"></div><span>Loading…</span></div>`;
    } else if (this._discError) {
      gridContent = this._stateHtml("⚠️", "Could not load", this._discError, "discover");
    } else if (!this._discData.length) {
      gridContent = `<div class="state-box"><div class="state-icon">🎬</div>No results</div>`;
    } else {

      gridContent = `<div class="poster-grid">${this._discData.map(i => this._ratingCardHtml(i)).join("")}</div>${footer}`;
    }

    return `
      <div class="disc-wrap">
        <div class="disc-controls">
          <div class="disc-type-row">${typeButtons}</div>
          <div class="disc-section-row">${secButtons}</div>
        </div>
        <div class="disc-grid">${gridContent}</div>
      </div>`;
  }

  _trendingHtml() {
    if (this._trendLoading && !this._trendMovies.length && !this._trendTV.length) {
      return `<div class="trend-wrap"><div class="state-box"><div class="spinner"></div><span>Loading…</span></div></div>`;
    }
    if (this._trendError) {
      return `<div class="trend-wrap">${this._stateHtml("⚠️", "Could not load trending", this._trendError, "trending")}</div>`;
    }
    return `
      <div class="trend-wrap">
        <div class="trend-section">
          <div class="sec-hdr">
            🎬 Trending Movies
            <button class="sec-hdr-btn" data-browse="movies">See all ›</button>
          </div>
          ${this._trendMovies.length
            ? `<div class="h-scroll"><div class="h-row">${this._trendMovies.map(i => this._trendCardHtml(i)).join("")}</div></div>`
            : `<div class="state-box" style="padding:12px 16px"><div class="state-icon">🎬</div>No movies</div>`}
        </div>
        <div class="trend-section">
          <div class="sec-hdr">
            📺 Trending TV Shows
            <button class="sec-hdr-btn" data-browse="tv">See all ›</button>
          </div>
          ${this._trendTV.length
            ? `<div class="h-scroll"><div class="h-row">${this._trendTV.map(i => this._trendCardHtml(i)).join("")}</div></div>`
            : `<div class="state-box" style="padding:12px 16px"><div class="state-icon">📺</div>No TV shows</div>`}
        </div>
      </div>`;
  }

  _browseHtml() {
    const label  = this._browseMode === "movies" ? "🎬 Trending Movies" : "📺 Trending TV Shows";

    const footer = !this._browseDone
      ? `<div class="browse-footer" style="display:flex;justify-content:center;padding:10px 0 4px">
          ${this._browseLoading
            ? `<div class="spinner" style="width:22px;height:22px"></div>`
            : `<button class="retry-btn" data-action="load-more">Load more</button>`}
        </div>`
      : `<div class="browse-footer"></div>`;
    const grid   = this._browseData.length
      ? `<div class="poster-grid">${this._browseData.map(i => this._mediaCardHtml(i)).join("")}</div>${footer}`
      : (this._browseLoading
          ? `<div class="state-box"><div class="spinner"></div><span>Loading…</span></div>`
          : "");
    return `
      <div class="browse-wrap">
        <div class="browse-hdr">
          <button class="browse-back">← Back</button>
          <div class="browse-title">${label}</div>
        </div>
        <div class="browse-grid">${grid}</div>
      </div>`;
  }

  _detailHtml(m, full, loading) {
    if (!m) return "";
    const isLoading   = loading && !full;
    m = full || m;
    const isMovie     = m.mediaType === "movie";
    const title       = m.title || m.name || "Unknown";
    const year        = this._year(m);
    const poster      = this._img(m.posterPath, "w342");
    const backdrop    = this._img(m.backdropPath, "w780");
    const overview    = m.overview || "No description available.";
    const rating      = m.voteAverage ? Number(m.voteAverage).toFixed(1) : null;
    const runtime     = this._runtime(m);
    const genres      = (m.genres || []).map(g => g.name);
    const status      = m.mediaInfo ? AVAIL[m.mediaInfo.status] : null;
    const isAvail     = m.mediaInfo?.status === 5;
    const isReq       = !isAvail && (m.mediaInfo?.status || 0) >= 2;
    const btnClass    = (isAvail || isReq) ? "already" : "";
    const btnLabel    = isAvail ? "✓ Already in Library" : isReq ? "⏳ Already Requested" : "🎬 Request This";

    const network     = (m.networks || [])[0]?.name || null;
    const studio      = (m.productionCompanies || [])[0]?.name || null;
    const seasons     = m.numberOfSeasons;
    const episodes    = m.numberOfEpisodes;
    const director    = (m.credits?.crew || []).find(c => c.job === "Director")?.name;
    const cast        = (m.credits?.cast || []).slice(0, 5).map(c => c.name).join(", ");
    const tagline     = m.tagline;
    const origLang    = m.originalLanguage ? this._langName(m.originalLanguage) : null;
    const origTitle   = m.originalTitle || m.originalName || null;

    return `
      <div class="detail-outer">
        <div class="detail-back-bar">
          <button class="back-btn">← Back</button>
        </div>
        <div class="detail-scroll">
          <div class="detail-hero">
            ${backdrop
              ? `<img class="detail-backdrop" src="${backdrop}" alt="" loading="lazy">`
              : `<div class="detail-backdrop-ph"></div>`}
            <div class="detail-hero-overlay"></div>
          </div>
          <div class="detail-body">
            <div class="detail-top">
              <div>
                ${poster
                  ? `<div class="detail-poster"><img src="${poster}" alt="" loading="lazy"></div>`
                  : `<div class="detail-poster-ph">${isMovie ? "🎬" : "📺"}</div>`}
              </div>
              <div class="detail-meta-block">
                <div class="detail-title">${title}</div>
                <div class="detail-year">${year} · ${isMovie ? "Movie" : "TV Series"}</div>
                <div class="detail-badges">
                  ${rating   ? `<div class="badge">⭐ ${rating}</div>` : ""}
                  ${runtime  ? `<div class="badge">🕐 ${runtime}</div>` : ""}
                  ${seasons  ? `<div class="badge">📺 ${seasons} season${seasons > 1 ? "s" : ""}</div>` : ""}
                  ${episodes ? `<div class="badge">▶ ${episodes} eps</div>` : ""}
                  ${status   ? `<div class="badge" style="color:${status.color}">${status.icon} ${status.label}</div>` : ""}
                </div>
              </div>
            </div>

            ${tagline ? `<div style="font-style:italic;color:var(--muted);font-size:11px;margin-bottom:10px">"${tagline}"</div>` : ""}

            ${genres.length ? `<div class="genre-row">${genres.map(g => `<div class="genre-chip">${g}</div>`).join("")}</div>` : ""}

            ${this._detailRatingsHtml(m)}
            <div class="detail-section-title">Overview</div>
            <div class="detail-overview">${overview}</div>

            ${isLoading ? `<div class="state-box" style="padding:10px"><div class="spinner"></div></div>` : `
            <div class="detail-info-grid">
              ${director  ? `<div class="info-item"><div class="info-label">Director</div><div class="info-value">${director}</div></div>` : ""}
              ${network   ? `<div class="info-item"><div class="info-label">Network</div><div class="info-value">${network}</div></div>` : ""}
              ${studio    ? `<div class="info-item"><div class="info-label">Studio</div><div class="info-value">${studio}</div></div>` : ""}
              ${year !== "—" ? `<div class="info-item"><div class="info-label">${isMovie ? "Released" : "First Aired"}</div><div class="info-value">${isMovie ? (m.releaseDate||year) : (m.firstAirDate||year)}</div></div>` : ""}
              ${origLang  ? `<div class="info-item"><div class="info-label">Original Language</div><div class="info-value">${origLang}${origTitle && origTitle !== (m.title||m.name) ? `<div style="font-size:10px;color:var(--muted);margin-top:2px">${origTitle}</div>` : ""}</div></div>` : ""}
            </div>
            ${cast ? `<div class="detail-section-title">Cast</div><div class="detail-overview">${cast}</div>` : ""}
            `}

            <button class="req-btn ${btnClass}" ${isAvail ? "disabled" : ""} style="margin-top:14px">${btnLabel}</button>
          </div>
        </div>
      </div>`;
  }

  _searchHtml() {
    if (this._detail) return this._detailHtml(this._detailFull || this._detail, this._detailFull, this._detailLoading);
    const chips = [{k:"all",l:"All"},{k:"movie",l:"🎬 Movies"},{k:"tv",l:"📺 TV"}];
    const grid  = this._searching
      ? `<div class="state-box"><div class="spinner"></div><span>Searching…</span></div>`
      : this._searchResults.length
        ? `<div class="poster-grid">${this._searchResults.map(i => this._mediaCardHtml(i)).join("")}</div>`
        : `<div class="state-box"><div class="state-icon">🔍</div>Search for movies or TV shows above</div>`;
    return `
      <div class="search-top">
        <div class="search-row">
          <input class="search-input" type="text" placeholder="Search movies & TV shows…" value="${this._searchQuery}">
          <button class="search-btn">Search</button>
        </div>
        <div class="filter-row">
          ${chips.map(c => `<div class="f-chip${this._searchFilter===c.k?" active":""}" data-filter="${c.k}">${c.l}</div>`).join("")}
        </div>
      </div>
      <div class="scroll-grid">${grid}</div>`;
  }

  _requestsHtml() {
    if (this._reqLoading && !this._requests.length)
      return `<div class="req-wrap"><div class="state-box"><div class="spinner"></div><span>Loading requests…</span></div></div>`;
    if (this._reqError)
      return `<div class="req-wrap">${this._stateHtml("⚠️","Could not load",this._reqError,"requests")}</div>`;
    if (!this._requests.length)
      return `<div class="req-wrap"><div class="state-box"><div class="state-icon">📋</div>No requests yet</div></div>`;

    return `<div class="req-wrap">${this._requests.map(req => {
      const d    = req._d || {};
      const med  = req.media || {};
      const title= d.title || d.name || "Unknown";
      const year = this._year(d);
      const p    = this._img(d.posterPath, "w92");
      const type = (req.type==="movie"||med.mediaType==="movie") ? "Movie" : "TV";
      const rs   = REQST[req.status] || REQST[1];
      const date = req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "";

      const tmdbId = med.tmdbId || (req._d?.id);
      const mType  = (req.type==="movie"||med.mediaType==="movie") ? "movie" : "tv";
      return `
        <div class="req-item" data-reqid="${tmdbId}" data-reqtype="${mType}" style="cursor:pointer">
          ${p ? `<img class="req-thumb" src="${p}" alt="" loading="lazy">` : `<div class="req-thumb-ph">${type==="Movie"?"🎬":"📺"}</div>`}
          <div class="req-info">
            <div class="req-title">${title}${year!=="—"?` (${year})`:""}</div>
            <div class="req-meta"><span>${type}</span>${date?`<span>${date}</span>`:""}</div>
          </div>
          <div class="req-stat" style="background:${rs.color}18;color:${rs.color}">
            <div class="req-stat-dot" style="background:${rs.color}"></div>${rs.label}
          </div>
        </div>`;
    }).join("")}</div>`;
  }

  _paint() {
    const tc = this.shadowRoot.querySelector(".tc");
    if (!tc) return;

    if (this._browseDetail) {
      tc.innerHTML = this._detailHtml(this._browseDetail, this._browseDetailFull, this._browseDetailLoading);
      this._bindBrowseDetail(tc);
      this._restoreScroll();
      return;
    }

    if (this._browseMode) {
      tc.innerHTML = this._browseHtml();
      this._bindBrowse(tc);
      this._restoreScroll();
      return;
    }

    if (this._detail) {
      tc.innerHTML = this._detailHtml(this._detailFull || this._detail, this._detailFull, this._detailLoading);
      this._bindDetail(tc);
      this._restoreScroll();
      return;
    }

    switch (this._tab) {
      case "trending": tc.innerHTML = this._trendingHtml(); this._bindTrending(tc);  break;
      case "discover": tc.innerHTML = this._discoverHtml(); this._bindDiscover(tc); break;
      case "search":   tc.innerHTML = this._searchHtml();   this._bindSearch(tc);   break;
      case "requests": tc.innerHTML = this._requestsHtml(); this._bindRetry(tc); this._bindRequests(tc); break;
    }
    this._restoreScroll();
  }

  _paintSearch() {
    if (this._tab !== "search" || this._detail || this._browseMode) return;
    const sg = this.shadowRoot.querySelector(".scroll-grid");
    if (!sg) { this._paint(); return; }
    const grid = this._searching
      ? `<div class="state-box"><div class="spinner"></div><span>Searching…</span></div>`
      : this._searchResults.length
        ? `<div class="poster-grid">${this._searchResults.map(i => this._mediaCardHtml(i)).join("")}</div>`
        : `<div class="state-box"><div class="state-icon">🔍</div>Search for movies or TV shows above</div>`;
    sg.innerHTML = grid;
    sg.querySelectorAll(".media-card").forEach(c => c.addEventListener("click", () => this._openDetail(c)));
  }

  _openDetail(card) {
    const id   = parseInt(card.dataset.id);
    const type = card.dataset.type;
    const pool = [...this._searchResults, ...this._trendMovies, ...this._trendTV, ...this._browseData];
    const m    = pool.find(x => x.id === id && x.mediaType === type);
    if (m) this._loadDetail(m);
  }

  _openDetailFromBrowse(card) {
    const id   = parseInt(card.dataset.id);
    const type = card.dataset.type;
    const m    = this._browseData.find(x => x.id === id && x.mediaType === type);
    if (!m) return;

    this._cancelGrace();
    this._pushNav();
    this._browseDetail        = m;
    this._browseDetailFull    = null;
    this._browseDetailLoading = true;
    this._paint();

    const path = m.mediaType === "movie" ? `/movie/${m.id}` : `/tv/${m.id}`;
    const rPath = m.mediaType === "tv" ? null : path + "/ratings";
    Promise.all([
      this._get(path),
      rPath ? this._get(rPath).catch(() => null) : Promise.resolve(null),
    ]).then(([full, ratings]) => {
      if (ratings) this._ratingsCache[m.id] = ratings;
      this._browseDetailFull    = { ...full, _ratings: ratings };
      this._browseDetailLoading = false;
      this._paint();
    }).catch(() => {
      this._browseDetailFull    = m;
      this._browseDetailLoading = false;
      this._paint();
    });
  }

  _bindTrending(tc) {
    tc.querySelectorAll(".trend-card, .media-card").forEach(c =>
      c.addEventListener("click", () => this._openDetail(c)));
    tc.querySelectorAll("[data-browse]").forEach(btn =>
      btn.addEventListener("click", () => {
        this._cancelGrace();
        this._pushNav();
        this._browseMode = btn.dataset.browse;
        this._browseData = [];
        this._browsePage = 1;
        this._browseDone = false;
        this._loadBrowse(this._browseMode, 1);
      })
    );
    this._bindRetry(tc);
  }

  _bindDiscover(tc) {

    tc.querySelectorAll("[data-dtype]").forEach(btn =>
      btn.addEventListener("click", () => {
        if (this._discType === btn.dataset.dtype) return;
        this._cancelGrace();
        this._saveScroll();
        this._discType    = btn.dataset.dtype;
        this._discSection = DISCOVER_SECTIONS[this._discType][0].id;
        this._discData    = []; this._discPage = 1; this._discDone = false;
        this._loadDiscover(1);
      })
    );

    tc.querySelectorAll("[data-dsec]").forEach(btn =>
      btn.addEventListener("click", () => {
        if (this._discSection === btn.dataset.dsec) return;
        this._cancelGrace();
        this._saveScroll();

        this.shadowRoot.querySelectorAll("[data-dsec]").forEach(b =>
          b.classList.toggle("active", b.dataset.dsec === btn.dataset.dsec));
        this._discSection = btn.dataset.dsec;
        this._discData    = []; this._discPage = 1; this._discDone = false;
        this._loadDiscoverGrid(1);
      })
    );

    tc.querySelectorAll(".rating-card").forEach(c =>
      c.addEventListener("click", () => this._openDiscoverDetail(c)));

    tc.querySelector("[data-action='disc-more']")?.addEventListener("click", () =>
      this._loadDiscoverGrid(this._discPage + 1));

    tc.querySelectorAll(".retry-btn[data-retry='discover']").forEach(btn =>
      btn.addEventListener("click", () => {
        this._discError = null; this._loadDiscover(1);
      })
    );
    this._bindRetry(tc);
  }

  _bindBrowse(tc) {
    tc.querySelector(".browse-back")?.addEventListener("click", () => {
      this._cancelGrace();
      this._saveScroll();
      this._browseMode = null; this._paint();
    });
    tc.querySelectorAll(".media-card").forEach(c =>
      c.addEventListener("click", () => this._openDetailFromBrowse(c)));
    tc.querySelector("[data-action='load-more']")?.addEventListener("click", () =>
      this._loadBrowse(this._browseMode, this._browsePage + 1));
  }

  _bindBrowseDetail(tc) {
    tc.querySelector(".back-btn")?.addEventListener("click", () => {
      this._cancelGrace();
      this._saveScroll();
      this._browseDetail = null; this._browseDetailFull = null;
      this._paint();
    });
    const rb = tc.querySelector(".req-btn");
    if (rb && !rb.disabled) rb.addEventListener("click", () => this._requestMedia(this._browseDetail));
  }

  _bindDetail(tc) {
    tc.querySelector(".back-btn")?.addEventListener("click", () => {
      this._cancelGrace();
      this._saveScroll();
      this._detail = null; this._detailFull = null; this._paint();
    });
    const rb = tc.querySelector(".req-btn");
    if (rb && !rb.disabled) rb.addEventListener("click", () => this._requestMedia(this._detail));
  }

  _bindSearch(tc) {
    const btn   = tc.querySelector(".search-btn");
    const input = tc.querySelector(".search-input");
    btn?.addEventListener("click",    () => this._search());
    input?.addEventListener("keydown", e => { if (e.key === "Enter") this._search(); });
    tc.querySelectorAll(".f-chip").forEach(chip =>
      chip.addEventListener("click", () => {
        this._searchFilter = chip.dataset.filter;
        tc.querySelectorAll(".f-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        if (this._searchQuery) this._search();
      })
    );
    tc.querySelectorAll(".media-card").forEach(c =>
      c.addEventListener("click", () => this._openDetail(c)));
    this._bindRetry(tc);
  }

  _bindRequests(tc) {
    tc.querySelectorAll(".req-item[data-reqid]").forEach(item => {
      item.addEventListener("click", () => {
        const tmdbId = parseInt(item.dataset.reqid);
        const mType  = item.dataset.reqtype;
        if (!tmdbId || !mType) return;

        const req = this._requests.find(r => {
          const med = r.media || {};
          return (med.tmdbId === tmdbId || r._d?.id === tmdbId);
        });
        const stub = req?._d || req?.media || {};

        const media = { id: tmdbId, mediaType: mType, ...stub };
        this._loadDetail(media);
      });
    });
  }

  _bindRetry(tc) {

    tc.querySelectorAll(".retry-btn[data-retry]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.retry === "trending") { this._trendError = null; this._loadTrending(); }
        if (btn.dataset.retry === "requests") { this._reqError   = null; this._loadRequests(); }
        this._paint();
      });
    });
    tc.querySelectorAll("[data-action='debug']").forEach(el =>
      el.addEventListener("click", async () => {
        try {
          const r = await this._hass.fetchWithAuth(DEBUG);
          const d = await r.json();
          this._toast(d.overseerr_reachable
            ? `✓ Connected — Overseerr v${d.overseerr_version}`
            : `✗ Unreachable: ${d.overseerr_error}`, d.overseerr_reachable ? "success" : "error");
        } catch (e) { this._toast("Diag failed: " + e.message, "error"); }
      })
    );
  }

  _updateTabs() {
    this.shadowRoot.querySelectorAll(".tab").forEach(t =>
      t.classList.toggle("active", t.dataset.tab === this._tab));
  }

  _scrollKey() {

    if (this._browseDetail)  return `browseDetail:${this._browseDetail?.id}`;
    if (this._detail)        return `detail:${this._detail?.id}`;
    if (this._browseMode)    return `browse:${this._browseMode}`;
    if (this._tab === "discover") return `discover:${this._discType}:${this._discSection}`;
    if (this._tab === "requests") return "requests";
    if (this._tab === "trending") return "trending";
    if (this._tab === "search")   return `search:${this._searchQuery}`;
    return this._tab;
  }

  _saveScroll() {
    const key = this._scrollKey();
    const el  = this._scrollEl();
    if (el) this._scrollPos[key] = el.scrollTop;
  }

  _restoreScroll() {
    const key = this._scrollKey();
    const el  = this._scrollEl();
    if (el && this._scrollPos[key] != null) {

      requestAnimationFrame(() => { el.scrollTop = this._scrollPos[key]; });
    }
  }

  _scrollEl() {

    const sr = this.shadowRoot;
    if (this._browseDetail)  return sr.querySelector(".detail-scroll");
    if (this._detail)        return sr.querySelector(".detail-scroll");
    if (this._browseMode)    return sr.querySelector(".browse-grid");
    if (this._tab === "discover") return sr.querySelector(".disc-grid");
    if (this._tab === "requests") return sr.querySelector(".req-wrap");
    if (this._tab === "trending") return sr.querySelector(".trend-wrap");
    if (this._tab === "search")   return sr.querySelector(".scroll-grid");
    return null;
  }

  _setupHistory() {
    if (this._historyBound) return;
    this._historyBound = true;
    this._warnActive     = false;
    this._backGraceTimer = null;

    const pushGrace = () => history.pushState({ seerr: "grace" }, "");
    const pushNav   = () => history.pushState({ seerr: "nav"   }, "");

    pushGrace();

    window.addEventListener("popstate", e => {
      const s = e.state?.seerr;

      if (this._browseDetail || this._detail || this._browseMode) {
        this._cancelGrace();
        this._saveScroll();
        if      (this._browseDetail) { this._browseDetail = null; this._browseDetailFull = null; }
        else if (this._detail)       { this._detail = null; this._detailFull = null; }
        else                         { this._browseMode = null; }

        this._paint();
        return;
      }

      if (!this._warnActive) {

        pushGrace();
        this._warnActive = true;
        this._toast("Press back again to exit", "error");
        clearTimeout(this._backGraceTimer);
        this._backGraceTimer = setTimeout(() => { this._warnActive = false; }, 3000);
      } else {

        this._warnActive = false;
        clearTimeout(this._backGraceTimer);
      }
    });
  }

  _cancelGrace() {
    this._warnActive = false;
    clearTimeout(this._backGraceTimer);
    this._backGraceTimer = null;
  }

  _pushNav() {
    history.pushState({ seerr: "nav" }, "");
  }

  _render() {

    const tabs = [
      { k: "trending", i: "🔥", l: "Trending"  },
      { k: "discover", i: "🧭", l: "Discover"  },
      { k: "search",   i: "🔍", l: "Search"    },
      { k: "requests", i: "📋", l: "Requests"  },
    ];
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="root" style="width:${this._W};height:${this._H}">
        <div class="hdr">
          <div class="hdr-left">
            <img class="hdr-logo" src="data:image/png;base64,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" alt="Seerr Requestarr" style="width:32px;height:auto;border-radius:7px;flex-shrink:0">
            <div><div class="hdr-name">Seerr Requestarr</div><div class="hdr-sub">Media Request Center</div></div>
          </div>
          <div class="hdr-stats">
            <div class="stat-pill"><div class="sdot" style="background:#f59e0b"></div><span class="stat-pending">${this._pending}</span> pending</div>
            <div class="stat-pill"><div class="sdot" style="background:var(--muted)"></div><span class="stat-total">${this._total}</span> total</div>
          </div>
        </div>
        <div class="tabs">
          ${tabs.map(t => `<button class="tab${this._tab===t.k?" active":""}" data-tab="${t.k}">${t.i} ${t.l}</button>`).join("")}
        </div>
        <div class="tc"></div>
        <div class="toast"></div>
      </div>`;

    this.shadowRoot.querySelector(".root")?.addEventListener("click", e => {
      const btn = e.target.closest(".tab");
      if (!btn) return;
      const tab = btn.dataset.tab;
      if (!tab || tab === this._tab && !this._detail && !this._browseDetail && !this._browseMode) return;
      this._saveScroll();
      this._cancelGrace();
      this._tab              = tab;
      this._detail           = null;
      this._detailFull       = null;
      this._detailLoading    = false;
      this._browseMode       = null;
      this._browseDetail     = null;
      this._browseDetailFull = null;
      this._browseDetailLoading = false;
      this._updateTabs();
      this._paint();
      if (this._tab === "requests" && !this._reqLoading) this._loadRequests();
      if (this._tab === "trending" && !this._trendMovies.length && !this._trendLoading) this._loadTrending();
      if (this._tab === "trending" && this._trendMovies.length && !this._trendLoading) this._fetchRatingsForItems(this._trendMovies);
      if (this._tab === "discover" && !this._discData.length && !this._discLoading) this._loadDiscover(1);
    });
    this._paint();
  }

  getCardSize() { return 6; }
}

customElements.define("seerr-requestarr-card", SeerrRequestarrCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:             "seerr-requestarr-card",
  name:             "Seerr Requestarr",
  description:      "Search and request movies & TV shows via Overseerr",
  preview:          true,
  documentationURL: "https://github.com/berserk88/seerr-requestarr-card",
  icon:             "data:image/png;base64,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",
});
