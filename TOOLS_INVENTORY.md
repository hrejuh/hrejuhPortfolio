# Local Tools Inventory (P:/ drive)

Reference catalog of scripts and projects on the P:/ drive. **Not hosted on hrejuh.com** — only the tools listed at `/tools` on the site are interactive.

## Live on hrejuh.com

| Tool | Route | Notes |
|------|-------|-------|
| YouTube Transcript | `/tools/youtube` | Fetch captions by URL or video ID; optional Groq summarization |
| Finance Calculator | `/tools/finance` | EMI, ROI, interest, RD, FD, P&L, percentage, loan affordability |

---

## Scrapers

### YouTube Transcript Extractor (original)
- **Path:** `P:/youtube`
- **Stack:** Python, Flask, yt-dlp, Groq, youtube-transcript-api
- **Run:** `cd P:/youtube && pip install -r requirements.txt && python app.py`

### E-Commerce Web Scraper
- **Path:** `P:/Web scraper/CascadeProjects/windsurf-project`
- **Stack:** Python, BeautifulSoup, requests, pandas
- **Run:** `python scraper.py`

---

## AI & Research

### Voice-to-Bill Pipeline
- **Path:** `P:/Qrave/voice-pipeline-test`
- **Stack:** Python, Whisper, PyTorch
- **Purpose:** Restaurant order audio → structured bill (test harness)

---

## CLI & Automation (`P:/Money/`)

| Tool | Path | Purpose |
|------|------|---------|
| Midas | `P:/Money/midas` | Crypto spot arbitrage scanner (ccxt, paper mode) |
| Excavator | `P:/Money/mining` | Ethereum vanity address generator |
| Sniper | `P:/Money/sniper` | Freelance gig RSS scanner |

---

## Web Apps (local only)

| Tool | Path | Stack |
|------|------|-------|
| Contacts | `P:/Contacts` | React 19, Dexie, Capacitor PWA |
| Velocita | `P:/Money/web` | Next.js 16 demo dashboard |
| Vue Expense Tracker | `P:/WebDev/vue-expense-tracker` | Vue 3, Vite |
| StreamHub | `P:/Stremio clone/CascadeProjects/windsurf-project` | Next.js 14, Video.js |

---

## Games

| Tool | Path |
|------|------|
| Snake (Pygame) | `P:/Code games/snake_game.py` |
| Snake (React) | `P:/GPT games/snake-game` |

---

## Vanilla Web Lab (21 mini-apps)

**Path:** `P:/WebDev/That Guy/vanillawebprojects/`

Open any subfolder's `index.html` in a browser — no build step.

`breakout-game`, `custom-video-player`, `dom-array-methods`, `exchange-rate`, `expense-tracker`, `form-validator`, `hangman`, `infinite_scroll_blog`, `lyrics-search`, `meal-finder`, `memory-cards`, `modal-menu-slider`, `movie-seat-booking`, `music-player`, `new-year-countdown`, `product-filtering`, `relaxer-app`, `sortable-list`, `speak-number-guess`, `speech-text-reader`, `typing-game`

---

## Excluded (full products, not utilities)

Qrave, ERP/Coreva, Vela, Cigarro, Onsite, Dukan, DosRickeVentures, Library Management, Taskmaster-AI, Citadel (auth-gated admin).
