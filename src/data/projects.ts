import type { Project } from "@/types";

export const projects: Project[] = [
  // ─── FLAGSHIP ───
  {
    slug: "qrave",
    title: "Qrave",
    tagline: "Restaurant OS for modern India",
    description:
      "Zero-commission SaaS platform enabling restaurants to own their ordering, delivery, and customer relationships. Real-time KDS, multi-provider delivery, POS, analytics, and more.",
    longDescription: `Qrave is a full-stack restaurant management platform — the "Shopify for Indian restaurants." It replaces aggregator dependency (Swiggy/Zomato) with a direct ordering system where restaurants keep 100% of their revenue.

The platform includes a customer-facing QR menu and ordering flow, a real-time Kitchen Display System (KDS) with urgency indicators and driver assignment, a Point of Sale for walk-in orders, a driver dashboard with live GPS tracking, and a comprehensive admin panel.

Third-party integrations include Cashfree for payments (with Easy Split for vendor commissions), Borzo/ShipRocket/Shadowfax for delivery (with automatic cheapest provider selection), MSG91 for phone OTP and WhatsApp notifications, and UrbanPiper for aggregator order sync.

Notable patterns include idempotency keys for duplicate prevention, guest session management with fingerprint validation, encrypted document vault, distance-based delivery pricing, and GST-compliant invoice generation.`,
    tier: "flagship",
    year: 2024,
    status: "live",
    ownership: "company",
    technologies: ["Next.js 15", "React 18", "Convex", "Tailwind CSS", "Cashfree", "Leaflet/OSRM", "Cloudflare", "MSG91", "ShipRocket", "UrbanPiper"],
    liveUrl: "https://qrave.hrejuh.com",
    accentColor: "#F97316",
    highlights: [
      "Serving 50+ restaurants in Bangalore with zero-commission ordering",
      "Real-time kitchen display system with driver assignment and live GPS tracking",
      "Multi-provider delivery — automatically picks the cheapest option across Borzo, ShipRocket, and Shadowfax",
      "Full POS, loyalty automation, encrypted vault, GST invoicing, and subscription management",
    ],
    narrative: {
      problem: "Indian restaurants lose 20-30% of every online order to aggregator commissions. They don't own their customer data, can't build loyalty, and are entirely at the mercy of platform algorithms.",
      solution: "A zero-commission platform where restaurants own everything — ordering, delivery, payments, customer relationships. Not just an app, but a complete restaurant operating system with KDS, POS, driver tracking, and analytics.",
      insight: "The real product isn't software. It's giving restaurant owners back control over their own business.",
    },
    role: "Founder & Solo Developer",
  },
  {
    slug: "coreva",
    title: "Coreva",
    tagline: "Enterprise resource planning for Indian businesses",
    description:
      "Multi-tenant, mobile-first ERP system for bakery chains and food manufacturing with 10 POS modes, thermal printing, offline caching, B2B invoicing, supply chain, and granular role-based access.",
    longDescription: `Coreva is a comprehensive enterprise resource planning system designed for bakery chains and food manufacturing businesses. It serves 30+ store locations, multiple factories, and warehouses.

The POS system features 10 main modes (Sell, Receive, Expense, Waste, Consumption, DayEnd, Order, FutureOrders, BookOrder, LabelPrint) plus 3 secondary modes. The UI is designed for low-literacy workforces with large tap targets, audio feedback, and Hindi/English translations.

The print system supports ESC/POS thermal printers with a receipt template editor (per-section bold, fontSize, alignment, fontFamily) and label printing with barcode generation. Bluetooth printer support is included.

The offline system uses IndexedDB with version-based cache invalidation — subscribing to lightweight version signals and doing one-shot fetches only when data changes. Three version counters track catalog, config, and entity changes separately.

Additional systems include supply chain (dispatch, inter-branch transfers), B2B credit & invoicing (FIFO payment allocation, aging reports), employee management (payroll, loans, salary), a 7-tier pricing engine, recipes, encrypted vault, and an audit trail.`,
    tier: "flagship",
    year: 2025,
    status: "live",
    ownership: "company",
    technologies: ["React 19", "Convex", "IndexedDB/Dexie", "Tailwind CSS", "Tauri 2", "i18next", "ESC/POS Printing", "JsBarcode"],
    accentColor: "#2563EB",
    highlights: [
      "Running across 30+ bakery store locations with factories and warehouses",
      "10 POS modes designed for flour-covered hands — tap-based, audio feedback, Hindi/English",
      "Offline-first with version-based cache invalidation — works without internet",
      "Thermal receipt & label printing with barcode generation and custom template editors",
    ],
    narrative: {
      problem: "A 30-store bakery chain ran on paper registers and Excel sheets. Staff couldn't use complex software, stock was tracked manually, and inter-branch transfers were chaos.",
      solution: "A tap-based, mobile-first ERP with audio feedback and Hindi translations — designed for flour-covered hands. 10 POS modes, thermal printing, offline caching, B2B invoicing, and supply chain management.",
      insight: "Enterprise software doesn't have to be complex to be powerful. The best interfaces disappear — you just tap and it works.",
    },
    role: "Lead Developer",
  },
  {
    slug: "vela",
    title: "Vela",
    tagline: "Universal streaming aggregator",
    description:
      "Self-hosted Netflix alternative aggregating movies, TV, anime from multiple sources with a 26-archetype recommendation engine and Watch Together co-viewing.",
    longDescription: `Vela is a production-grade streaming platform that unifies Hollywood films, TV series, Bollywood, K-dramas, and anime from multiple sources into a single interface.

The streaming system uses 7 providers (Torrentio+TorBox, Cinemeta, TMDB, Kitsu, HiAnime, OpenSubtitles, Catalog Router) with a deterministic scoring system for stream quality selection. The resolution pipeline checks cache, runs parallel multi-source resolution, and groups results into 4K/1080p/720p/480p tiers.

The recommendation engine uses 26 behavioral archetypes across 6 priority groups with linear scoring (content similarity, popularity, freshness, exposure penalty), ring buffer exposure memory, and in-row diversification. It generates 12 rows of 12 items per batch.

Watch Together enables synchronized group viewing with invite codes, playback sync, member readiness tracking, room chat, and friend system.`,
    tier: "flagship",
    year: 2025,
    status: "beta",
    ownership: "personal-ip",
    technologies: ["Next.js 15", "React 19", "Drizzle ORM", "Turso", "Cloudflare Workers", "Video.js", "HLS.js", "Zustand"],
    accentColor: "#7C3AED",
    highlights: [
      "26-archetype recommendation engine that learns what you like and stops repeating itself",
      "Watch Together — sync playback with friends, chat, and readiness tracking",
      "7-provider streaming system with automatic quality scoring and failover",
      "Custom HLS player with quality, audio track, and subtitle switching",
    ],
    narrative: {
      problem: "Streaming is fragmented across dozens of platforms. Finding what to watch means jumping between apps, and watching together remotely means awkward screen-sharing.",
      solution: "A universal aggregator that pulls from 7 providers, scores streams deterministically, recommends content using 26 behavioral archetypes, and lets you watch together with friends in synchronized rooms.",
      insight: "The best recommendation engine isn't the most complex — it's the one that remembers what it already showed you and stops repeating itself.",
    },
    role: "Solo Developer",
  },
  {
    slug: "cigarro",
    title: "Cigarro",
    tagline: "Premium e-commerce marketplace",
    description:
      "Full-featured luxury cigarette e-commerce platform with automated UPI payment verification via Gmail parsing, admin CMS with homepage builder, referral system, and blog.",
    longDescription: `Cigarro is a production-grade e-commerce platform at cigarro.in — India's premier marketplace for premium cigarettes and tobacco products.

The standout feature is the payment verification system: it connects to Gmail via OAuth2, parses bank-specific email templates (PhonePe, GPay, Paytm, BHIM), matches amounts with confidence scoring, and auto-verifies UPI payments.

The admin dashboard includes product management with smart variants and SEO preview, a homepage builder with drag-and-drop section ordering, blog CMS with moderation, order management with payment verification workflows, and a discount engine.

The checkout is a multi-step flow with adaptive desktop/mobile layouts, saved addresses with pincode lookup, and UPI QR code generation. The referral system includes deep linking, share APIs, leaderboard, and reward tracking.`,
    tier: "flagship",
    year: 2024,
    status: "live",
    ownership: "personal-ip",
    technologies: ["React 18", "Vite", "Supabase", "Cloudflare Workers", "Hono", "Radix UI", "PWA"],
    liveUrl: "https://cigarro.in",
    accentColor: "#059669",
    highlights: [
      "Live at cigarro.in — India's premier marketplace for premium cigarettes",
      "Automated UPI payment verification via Gmail OAuth2 email parsing",
      "Admin CMS with drag-and-drop homepage builder and blog system",
      "Referral system with deep linking, leaderboard, and reward tracking",
    ],
    narrative: {
      problem: "Indian e-commerce sellers using UPI need manual payment verification — checking bank emails one by one, matching amounts, updating order statuses by hand.",
      solution: "An automated system that connects to Gmail via OAuth2, parses bank-specific email templates (PhonePe, GPay, Paytm, BHIM), matches amounts with confidence scoring, and auto-verifies payments.",
      insight: "Sometimes the most valuable feature isn't the storefront — it's the invisible infrastructure that saves the owner 2 hours of manual verification every day.",
    },
    role: "Solo Developer",
  },
  {
    slug: "dosricke-ventures",
    title: "DosRicke Ventures",
    tagline: "Multi-product SaaS company platform",
    description:
      "Turborepo monorepo for a registered SaaS company with custom design system, product-specific theming, and conversion-focused landing pages for 4 products.",
    longDescription: `DosRicke Ventures is the platform for a Bangalore-based registered Pvt Ltd SaaS company building 4 products: Qrave (restaurant ordering), Coreva (ERP), Trustea (community management), and a consulting arm.

The monorepo uses Turborepo + pnpm with 5 packages: apps/web (marketing site), packages/ui (custom @dosricke/ui design system), packages/backend (Convex), packages/config (Tailwind + TypeScript), and packages/utils (formatters).

The product theming system uses CSS custom properties with data-product attributes, switching accent colors across 4 products (Orange, Blue, Emerald, Purple). Landing pages are conversion-focused with ROI calculators, comparison tables, and pricing.`,
    tier: "flagship",
    year: 2025,
    status: "live",
    ownership: "company",
    technologies: ["React 19", "TanStack Router", "Convex", "Turborepo", "Vite 6", "Tailwind CSS 4", "Framer Motion"],
    liveUrl: "https://dosricke.ventures",
    accentColor: "#3730A3",
    highlights: [
      "Live at dosricke.ventures — registered Pvt Ltd company with CIN, TAN, PAN",
      "Turborepo monorepo with shared design system across 4 products",
      "CSS-first Tailwind 4 theme with per-product accent color switching",
      "Conversion-focused landing pages with ROI calculators and pricing",
    ],
    role: "Founder & Developer",
  },

  // ─── STRONG ───
  {
    slug: "library-management",
    title: "Library Management",
    tagline: "Multi-tenant institutional library system",
    description: "Complete library system with borrowing workflows, hold queues, automated fines, scheduled jobs, ISBN lookup, and multi-role access control across institutions.",
    longDescription: "",
    tier: "strong",
    year: 2025,
    status: "live",
    ownership: "personal-ip",
    technologies: ["React 18", "Convex", "Shadcn UI", "Recharts"],
    accentColor: "#0891B2",
    highlights: [
      "Multi-tenant with 4 roles and institution-level data isolation",
      "Complete borrowing lifecycle with hold queues and automated fine calculation",
      "Scheduled jobs for due reminders, overdue marking, and queue advancement",
    ],
    role: "Solo Developer",
  },
  {
    slug: "ecommerce-razorpay",
    title: "E-commerce (Razorpay)",
    tagline: "Next.js store with Indian payments",
    description: "Full e-commerce with Razorpay integration, HMAC payment verification, webhooks for payment events, and Docker deployment.",
    longDescription: "",
    tier: "strong",
    year: 2024,
    status: "development",
    ownership: "personal-ip",
    technologies: ["Next.js 13", "Supabase", "Razorpay", "Docker", "TypeScript"],
    accentColor: "#0284C7",
    highlights: [
      "Full Razorpay payment integration with HMAC-SHA256 verification",
      "Webhook handling for payment, failure, and refund events",
      "Docker Compose multi-service deployment",
    ],
    role: "Solo Developer",
  },
  {
    slug: "hiyori",
    title: "HiyoRi E-commerce",
    tagline: "Full-stack store with GraphQL & Stripe",
    description: "Production-grade e-commerce with admin dashboard, GraphQL codegen, Stripe checkout, S3 uploads, and CI/CD with automated testing.",
    longDescription: "",
    tier: "strong",
    year: 2024,
    status: "development",
    ownership: "personal-ip",
    technologies: ["Next.js 14", "Supabase", "Stripe", "GraphQL", "Drizzle ORM", "Redux", "Docker"],
    accentColor: "#DC2626",
    highlights: [
      "GraphQL integration with automatic code generation",
      "Stripe checkout with webhook handling",
      "CI/CD with Husky pre-commits, Jest, and Cypress testing",
    ],
    role: "Solo Developer",
  },
  {
    slug: "taskmaster-ai",
    title: "Taskmaster AI",
    tagline: "AI-powered developer assistant",
    description: "Async Python backend with FastAPI, GPT-4 code generation and Q&A, PostgreSQL, Redis caching, and Prometheus metrics.",
    longDescription: "",
    tier: "strong",
    year: 2024,
    status: "development",
    ownership: "personal-ip",
    technologies: ["FastAPI", "Python", "PostgreSQL", "Redis", "OpenAI GPT-4", "Docker", "Prometheus"],
    accentColor: "#16A34A",
    highlights: [
      "Async-first Python with FastAPI and SQLAlchemy",
      "Code generation and technical Q&A powered by GPT-4",
      "Docker Compose with PostgreSQL, Redis, and Prometheus monitoring",
    ],
    role: "Solo Developer",
  },
  {
    slug: "velocita",
    title: "Velocita",
    tagline: "Fintech SaaS demo platform",
    description: "Multi-module fintech: crypto arbitrage scanner across 5 exchanges, ETH vanity address miner, gig job sniper, and premium dashboard.",
    longDescription: "",
    tier: "strong",
    year: 2025,
    status: "development",
    ownership: "personal-ip",
    technologies: ["Next.js 16", "React 19", "CCXT", "ethers.js", "rss-parser", "Recharts"],
    accentColor: "#CA8A04",
    highlights: [
      "Real-time crypto arbitrage scanning across 5 exchanges via CCXT",
      "Ethereum vanity address generator with ethers.js",
      "Premium glassmorphism UI with gold/dark theme",
    ],
    role: "Solo Developer",
  },
];
