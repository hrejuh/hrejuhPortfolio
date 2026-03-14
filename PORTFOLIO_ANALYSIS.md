# Abdul Ahad - Complete Project Portfolio Analysis

> Generated: March 14, 2026
> Total Projects Analyzed: 30+ across P:/ and Google Drive

---

## Table of Contents
1. [Portfolio Summary](#portfolio-summary)
2. [Tier 1: Flagship Projects](#tier-1-flagship-projects)
3. [Tier 2: Strong Technical Projects](#tier-2-strong-technical-projects)
4. [Tier 3: Smaller / Utility Projects](#tier-3-smaller--utility-projects)
5. [Design & Business Work](#design--business-work)
6. [Technical Skills Matrix](#technical-skills-matrix)
7. [Aggregate Statistics](#aggregate-statistics)

---

## Portfolio Summary

| Metric | Value |
|--------|-------|
| **Total Software Projects** | 18 |
| **Total Lines of Code (estimated)** | ~140,000+ |
| **Total Database Tables** | 160+ |
| **Total API Endpoints** | 200+ |
| **Total React Components** | 600+ |
| **Design/Business Projects** | 12+ |
| **Languages** | TypeScript, Python, JavaScript, R |
| **Primary Stack** | React/Next.js + Convex/Supabase + Tailwind |

---

## Tier 1: Flagship Projects

These are production-grade, portfolio-highlight projects demonstrating deep full-stack expertise.

---

### 1. Qrave - Digital Ordering Platform for Restaurants

**The "Shopify for Indian Restaurants"** - a zero-commission SaaS platform enabling restaurants to own their ordering, delivery, and customer relationships.

| Attribute | Detail |
|-----------|--------|
| **Location** | `P:/Qrave` |
| **Stack** | Next.js 15, React 18, TypeScript, Convex, Tailwind CSS 4, Shadcn UI |
| **Status** | Production MVP Live, Phase 2 In Progress |
| **Estimated LOC** | ~25,000 - 35,000 |
| **Source Files** | ~230+ TypeScript/TSX |

#### Scale & Scope
- **54 pages/routes** (13 guest, 16 admin, 11 super admin, 3 driver, 4 store KDS, 7+ more)
- **77 Convex backend files** (21 queries, 28 mutations, 2 actions, 3 scheduled jobs, 2 HTTP webhooks)
- **87 React components** (18 admin, 14 menu, 5 KDS, 4 delivery, 20 UI, 12 shared, others)

#### Features Actually Built
- **Customer Ordering Flow**: QR menu browsing, product customizations/add-ons, cart with tips & coupons, multi-address management with map picker, live order tracking with driver GPS
- **Kitchen Display System (KDS)**: Real-time 3-column order board, elapsed time tracking, urgency color coding, driver assignment interface, delivery dispatch with multiple providers
- **Mobile KDS**: Phone-optimized variant with tab navigation
- **Point of Sale (POS)**: Full billing system for walk-in/phone orders, split payments, table assignment, discount application
- **Driver Dashboard**: Delivery assignments, "Mark as Picked Up", live GPS sharing (5-second updates), Google Maps navigation, OTP delivery verification, availability toggle
- **Admin Dashboard**: Menu catalog & customization groups, store settings with map-based location picker, staff management, discounts & coupons, asset library, analytics dashboard, subscription management, loyalty automation, document vault with encryption, invoice generation (GST-compliant)
- **Super Admin Panel**: Platform-wide organization management, backend access/impersonation, delivery config, user management, wallet system

#### Third-Party Integrations (Actually Coded)
- **Cashfree**: Full payment processing with Easy Split for vendor commissions, refund processing
- **Borzo**: Delivery adapter with quote requests and tracking
- **ShipRocket**: Full integration with AWB tracking, rider info, webhook handling
- **Shadowfax**: Delivery adapter
- **MSG91**: Phone OTP verification, WhatsApp notifications
- **UrbanPiper**: Aggregator integration (Swiggy, Zomato, MagicPin order sync)
- **Leaflet/OSRM**: Live tracking maps with store/driver/customer markers and route visualization
- **Google OAuth**: Social login
- **Cloudflare R2**: Asset storage with presigned URLs
- **Web Push API**: Browser notifications with batch sending and retry logic

#### Notable Technical Patterns
- Multi-adapter delivery system with automatic cheapest provider selection
- Idempotency key pattern preventing duplicate orders
- Guest session management with fingerprint validation and migration on signup
- Encrypted document vault with client-side encryption
- Distance-based delivery pricing with configurable slabs
- Flexible operating hours (simple + advanced multi-slot modes)
- Order source tracking across 6 platforms (Qrave, POS, Swiggy, Zomato, MagicPin, UrbanPiper)
- Custom Phone OTP provider extending Convex Auth
- GST invoice generation with Indian fiscal year support

#### Business Materials (Google Drive)
- Pitch deck, sales playbook, proposal deck, financial projections, leads tracking CRM

---

### 2. Taj ERP - Multi-Tenant Bakery Chain ERP System

**A complete ERP system built for 30+ bakery stores, multiple factories, and warehouses** - with a mobile-first, tap-based interface designed for low-literacy rural workforces.

| Attribute | Detail |
|-----------|--------|
| **Location** | `P:/ERP` |
| **Stack** | React 19, TypeScript, Convex, Dexie (IndexedDB), Tailwind CSS/Shadcn, Tauri 2, i18next |
| **Status** | ~99% Phase 0-2, Phase 3 85%, Phases 4-11 Completed |
| **Estimated LOC** | ~37,000 |
| **Source Files** | 224 TypeScript/TSX |

#### Scale & Scope
- **35+ routes/pages** (POS, admin, products, suppliers, employees, customers, invoices, print templates, reports, vault)
- **57 Convex backend files** with hundreds of queries/mutations/actions
- **86+ React components** across 15+ feature areas
- **50+ database tables** with compound indexes and version counters

#### POS System (10 Main Modes + 3 Secondary)
1. **SellMode**: Product grid + cart, cash/UPI/card/credit/split payment, discount (% or fixed), bill hold/park/recall, wholesale picker, FSSAI on bills, GST-compliant (CGST/SGST), reprint/void/edit, credit sales with auto-invoice
2. **ReceiveMode**: EntityBrowser for suppliers/factories, quantity entry, goods receipt with discrepancy notes, PO/transfer linking
3. **ExpenseMode**: 8+ category icons, product-like card grid, custom categories, per-item notes, color-coded icons
4. **WasteMode**: Raw material list, quantity input, department tracking
5. **ConsumptionMode**: Day-end closing stock, auto-calculated consumed qty, color-coded badges
6. **DayEndMode**: Daily sales/expense summary, cash reconciliation, shift totals
7. **OrderMode**: PO creation to suppliers, transfer requests, calendar picker, pricing override
8. **FutureOrdersMode**: Scheduled orders, incoming POs, transfer requests, acknowledgment flow
9. **BookOrderMode**: 4-step form (customer, details, delivery, pricing), wholesale/B2B picker
10. **LabelPrintMode**: Product selector, template picker, barcode generation (Code128/EAN13/EAN8)
- **MoreMode**, **ExpectedDeliveriesMode**, **ProductionMode**

#### Print System (Fully Implemented)
- **Receipt Printing**: ESC/POS (thermal 80mm/58mm) + HTML browser fallback
- **Receipt Template Editor**: Per-section bold/fontSize/alignment/fontFamily, drag-reorder, live preview, 13 configurable sections
- **Label Printing**: Barcode generation (JsBarcode), multi-column layouts (1-up, 2-up, 3-up)
- **Label Template Editor**: Per-field controls, drag reorder, live preview
- **Bluetooth Printer Support** + Day-End Report Printing

#### Offline & Caching (Version-Based)
- **Dexie v4 IndexedDB**: 7 tables (products, cacheMeta, cachedData, imageCache, salesQueue, billCounter, customers)
- **Version-Based Cache Invalidation**: Subscribe to lightweight version signals, one-shot fetch only on version change
- **Three Version Counters**: catalogVersion (products), configVersion (categories/templates), entityVersion (customers/suppliers)
- **Generic Cache Hooks**: `useCachedCatalog()`, `useCachedConfig()`, `useCachedEntity()`

#### RBAC & Permissions
- **60+ granular permissions** across 25 permission groups
- **4 system roles**: Owner (full), Manager (store-level), Staff (POS-only), Super Admin (platform)
- Every mutation gated by permission checks, PIN re-auth for sensitive operations

#### Additional Systems
- **Supply Chain**: Dispatch management, inter-branch transfers, transfer pricing
- **B2B Credit & Invoicing**: Customer accounts with limits, FIFO payment allocation, aging reports
- **Employee Management**: Payroll, loans, salary calculations, job history, branch payments
- **Supplier Accounts**: Financial tracking, opening balance migration, vendor invoices & payments
- **7-Tier Pricing Engine**: Customer-specific > customer group > product > list type > org defaults
- **Recipes/BOM**: Ingredient definitions with yield tracking
- **Encrypted Vault**, **Bulk Image Manager**, **Zen Theme System** (10 presets)
- **Audit Trail**: All mutations logged with before/after JSON
- **Hindi/English** i18next translations, **Audio Feedback** (Howler.js)

---

### 3. Vela - Universal Streaming Aggregator

**A self-hosted Netflix alternative** that aggregates movies, TV, anime from multiple sources with intelligent recommendations and social co-viewing.

| Attribute | Detail |
|-----------|--------|
| **Location** | `P:/Vela` |
| **Stack** | Next.js 15, React 19, TypeScript, Drizzle ORM/Turso (SQLite), Cloudflare Workers, Video.js/HLS.js, Zustand |
| **Status** | Production-Ready Beta |
| **Estimated LOC** | ~15,000 - 18,000 |
| **Source Files** | 195 TypeScript/TSX |

#### Scale & Scope
- **21 pages/routes**, **39 API endpoints**, **56+ React components**, **27 database tables**

#### Streaming System (7 Providers)
- **Torrentio + TorBox** (PRIMARY): ~2-3s end-to-end stream resolution
- **Cinemeta**, **TMDB**, **Kitsu** (anime), **HiAnime**, **OpenSubtitles**
- **Deterministic scoring**: usenet +3M, cached +1.5M, HLS +200k, quality match +100k
- **Quality grouping**: 4K/1080p/720p/480p with 6 alternatives each

#### Recommendation Engine V2 (26 Archetypes)
- 6 priority groups: Continuation > Personalization > Content Properties > Discovery (Popular) > Discovery (New) > Curation
- Linear scoring: contentSim * 1.0 + popularity * 0.3 + freshness * 0.2 - exposurePenalty * 0.5
- Ring buffer exposure memory (200-300 items), in-row diversification
- Deterministic seeding from userId + sessionId, 144 items per generation

#### Watch Together
- Room system: 6-char invite codes, 4-hour TTL, max 10 members
- WebSocket sync with polling fallback, member readiness tracking, room chat, friend system
- 5 database tables for the feature

#### Video Player
- HLS.js with Safari native fallback, quality/audio/subtitle switching, 0.5x-2x playback rate
- Buffer management: 30s max, 120MB size

#### Auth: JWT (HS256, 7-day), HttpOnly cookies, bcrypt, encrypted API keys

---

### 4. Cigarro - Premium E-Commerce Marketplace

**Full-featured luxury cigarette e-commerce** (cigarro.in) with automated UPI payment verification and comprehensive admin CMS.

| Attribute | Detail |
|-----------|--------|
| **Location** | `P:/Figma Cigarette` |
| **Stack** | React 18, TypeScript, Vite 6, Supabase, Cloudflare Workers/Hono, Radix UI, PWA |
| **Status** | Production-Grade |
| **Estimated LOC** | ~35,000 - 45,000 |
| **Source Files** | 271 TypeScript/TSX |

#### Scale & Scope
- **58+ total routes** (33 customer + 25 admin)
- **11 Cloudflare serverless functions**
- **41 database tables + 3 views** (~700+ columns)

#### Payment Verification System
- Gmail OAuth2 automated email scanning for UPI confirmations
- Bank-specific parsing: PhonePe, Google Pay, Paytm, BHIM, generic UPI
- Confidence scoring with amount tolerance, timestamp validation, VPA matching
- 5-minute polling with comprehensive logging

#### Checkout Flow (600+ lines)
- 3-step: Shipping > Review > Payment (UPI QR generation)
- Adaptive desktop/mobile layouts, saved addresses with pincode lookup

#### Admin Dashboard (25+ Pages)
- Product management with smart variants, SEO preview, bulk import/export
- Homepage Builder: Hero slides, featured products, category showcases (drag-and-drop)
- Blog CMS, order management, discount engine, customer management, asset manager, analytics

#### Referral System: Stats, leaderboard, deep linking, share APIs, reward tracking
#### Cart: Guest/authenticated sync, variant/combo support (566 lines)
#### SEO: Dynamic sitemap, bot-aware SSR middleware, PWA, structured data

---

### 5. DosRicke Ventures - SaaS Company Platform (Monorepo)

**The parent company website** for a registered Bangalore-based SaaS company.

| Attribute | Detail |
|-----------|--------|
| **Location** | `P:/DosrickeVentures` |
| **Stack** | React 19, TanStack Router v1, Convex, Turborepo/pnpm, Vite 6, Tailwind CSS 4, Framer Motion |
| **Estimated LOC** | ~4,700 |

#### Monorepo: 5 packages
- `apps/web` (7 routes), `packages/ui` (7 components), `packages/backend` (Convex), `packages/config`, `packages/utils`

#### Product Theming: CSS custom properties switching via `data-product` attribute across 4 products (Qrave/Coreva/Trustea/Consultancy)
#### Landing Pages: Conversion-focused with ROI calculators, comparison tables, pricing, FAQs
#### Scroll-triggered animations with Framer Motion
#### Registered company with CIN, TAN, PAN, MOA, AOA (Google Drive)

---

## Tier 2: Strong Technical Projects

---

### 6. LibraryManagement - Institutional Library System

| Attribute | Detail |
|-----------|--------|
| **Stack** | React 18, TypeScript, Convex, Shadcn UI (53 components), React Router, Recharts |
| **LOC** | ~10,000+ | **Files** | 123+ |

- **11 pages**, **60+ Convex functions**, **10 tables**, **62 components**
- Multi-tenant with 4 roles, complete borrowing lifecycle (request > approval > renewal > return > fine)
- Hold queue with auto-advancement, 4 cron jobs, 8 notification types
- ISBN lookup (Google Books + OpenLibrary), configurable circulation rules per patron type

---

### 7. E-commerce (Supabase + Razorpay)

| **Stack** | Next.js 13, Supabase, Razorpay, Docker | **LOC** | ~6,000-8,000 | **Files** | 146 |

- 15+ routes, 10 API endpoints, 45+ components
- Full Razorpay: HMAC-SHA256 verification, webhooks, refund processing
- Docker Compose, migrated from Payload CMS/MongoDB/Stripe

---

### 8. HiyoRi E-commerce (GraphQL + Stripe)

| **Stack** | Next.js 14, Supabase, Stripe, GraphQL, Drizzle ORM, Redux | **LOC** | ~10,000+ | **Files** | 252 |

- 20+ routes, 80+ components, full admin dashboard
- GraphQL with codegen, Stripe webhooks, S3 uploads, CI/CD (Husky, Jest, Cypress)

---

### 9. Taskmaster-AI (Python AI Assistant)

| **Stack** | FastAPI, PostgreSQL, Redis, OpenAI GPT-4, Docker, Prometheus |

- Async Python, code gen + Q&A endpoints, JWT auth, rate limiting, Prometheus metrics
- Docker Compose (API + PostgreSQL + Redis)

---

### 10. Velocita (Fintech SaaS Demo)

| **Stack** | Next.js 16 + React 19 (frontend), Node.js + CCXT + ethers.js (backends) |

- 4 modules: Crypto arbitrage (5 exchanges), ETH vanity miner, gig job sniper, glassmorphism dashboard

---

## Tier 3: Smaller / Utility Projects

| Project | Stack | Description |
|---------|-------|-------------|
| **StreamHub** | Next.js 14, Zustand, Video.js | Stremio clone with debrid support, 7 routes, 5 stores |
| **E-commerce 2** | Next.js 15, Supabase | Vercel Commerce fork, 7 routes |
| **Web Scraper** | Python, BeautifulSoup | Multi-site product scraper, 15 modules, ~3,500 LOC |
| **YouTube Summarizer** | Python, Flask, Groq LLM | Transcript extraction + AI summarization |
| **Snake Game** | Python, Pygame | Classic game with sound effects |
| **WebDev** | Vue 3, vanilla JS | Learning projects (expense tracker, games) |

---

## Design & Business Work

### Graphic Design Portfolio

| Project | Type | Description |
|---------|------|-------------|
| **The Indi Mums** | Product Design | Baby product labels (7 SKUs, multiple size variants) in AI + PDF |
| **K-Khane** | Brand Identity | Restaurant branding (AI, EPS, PSD, JPG, PNG) |
| **Taj Bakery** | Brand Identity | Bakery logo + social media |
| **Eato Foods** | Brand Design | Pamphlets + company profile |
| **Gusto** | Brand Identity | Logo design (AI, PNG, PDF) |
| **TEDx** | Event Design | Posters, t-shirts, mugs, banners, speaker photos |
| **Startup Indian** | Content Design | 8-part series on Indian startups + social media plan |
| **EID 2025** | Seasonal | Eid Mubarak greeting card (AI) |
| **Showofff** | Promotional | Republic Day Sale (PSD) |
| **Laveena AI** | AI Art | Generated artwork collection |

### Business & Events

| Project | Description |
|---------|-------------|
| **DosRicke Ventures Pvt Ltd** | Registered company (CIN, TAN, PAN, MOA, AOA, tax compliance) |
| **Funtainment** | Event booking platform (artist DB, show docs, promo videos, wireframes) |
| **Watchalore** | Film festival community (Discord, Interstellar Screening, Nolan Film Festival) |
| **Interstellar Screening** | Event with ticketing, seat allocation, payment processing |
| **Maati by Neha** | Design consulting + portfolio work |
| **St Broseph** | Community org (enrollment drives, awareness campaigns) |

---

## Technical Skills Matrix

### Core Stack

| Technology | Level | Used In |
|-----------|-------|---------|
| **TypeScript** | Expert | 12+ projects |
| **React / Next.js** | Expert | 12+ projects |
| **Convex** | Expert | Qrave, ERP, DosRicke, Library |
| **Supabase** | Expert | Cigarro, E-commerce x3 |
| **Tailwind CSS** | Expert | All frontend |
| **Python** | Strong | 4 projects |
| **Docker** | Strong | 2 projects |
| **Cloudflare** | Strong | 4 projects |

### Specialized Skills

| Skill | Evidence |
|-------|---------|
| **Payment Integration** | Cashfree, Razorpay, Stripe, UPI email verification (4 gateways) |
| **Real-time Systems** | Convex subscriptions, WebSocket sync, live GPS tracking |
| **Offline-First / PWA** | Dexie IndexedDB, Service Workers, version-based cache invalidation |
| **Thermal Printing** | ESC/POS, Bluetooth, receipt/label template editors |
| **Multi-tenancy** | Org-scoped isolation (ERP, Qrave, Library) |
| **RBAC** | 60+ permissions (ERP), multi-role systems |
| **Recommendation Engines** | 26-archetype engine with ring buffers (Vela) |
| **Delivery/Logistics** | Multi-provider adapters, live tracking (Qrave) |
| **GST/Indian Compliance** | CGST/SGST, FSSAI, GSTIN, fiscal year invoicing |
| **Maps & Geolocation** | Leaflet/OSRM, Google Maps, Haversine |
| **AI Integration** | OpenAI GPT-4, Groq LLaMA, Google GenAI |
| **Crypto/Web3** | CCXT, ethers.js |
| **SEO** | Dynamic sitemaps, structured data, bot-aware SSR |
| **GraphQL** | HiyoRi with codegen |
| **Design** | Adobe Illustrator, Photoshop, Figma |

---

## Aggregate Statistics

| Project | Files | Est. LOC | DB Tables | Endpoints | Components |
|---------|-------|----------|-----------|-----------|------------|
| Qrave | 230+ | 30,000 | 20+ | 77 | 87 |
| Taj ERP | 224 | 37,000 | 50+ | 57 files | 86+ |
| Vela | 195 | 16,500 | 27 | 39 | 56+ |
| Cigarro | 271 | 40,000 | 44 | 11 | 271 files |
| DosRicke | 49 | 4,700 | 8 | 2 | 7 |
| Library | 123+ | 10,000 | 10 | 60+ | 62 |
| E-commerce 1 | 146 | 7,000 | 10+ | 10 | 45+ |
| HiyoRi | 252 | 10,000 | 10+ | 6 | 80+ |
| Taskmaster-AI | 15+ | 2,000 | 5+ | 3 | - |
| Velocita | 20+ | 1,500 | - | - | 5 |
| Others | 45+ | 5,000 | - | 5+ | 20+ |
| **TOTAL** | **~1,570+** | **~140,000+** | **~160+** | **~200+** | **~600+** |

### Domain Expertise
1. **Restaurant/Food Tech** - Qrave, Taj ERP, Eato Foods
2. **E-commerce** - Cigarro, E-commerce 1/2/3 (4 implementations)
3. **Enterprise Software** - ERP with POS, supply chain, invoicing, payroll
4. **Media/Entertainment** - Vela, StreamHub, Funtainment, Watchalore
5. **FinTech** - Velocita, 4 payment gateway integrations
6. **Community/Institutional** - LibraryManagement, St Broseph, Trustea
7. **Consumer Products** - Indi Mums, K-Khane
8. **Consulting/Agency** - DosRicke Consultancy, Startup Indian
