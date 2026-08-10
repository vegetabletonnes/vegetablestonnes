# VegetableTonnes — Full-Stack React.js Bidding Platform

## Overview
Transform the existing single-page HTML prototype into a production-grade, full-stack B2B agricultural bidding platform using **React.js + Node.js/Express + MongoDB (local/in-memory)**. The platform connects farmers directly to bulk buyers, bypassing middlemen — with live auctions, real-time bid tracking, and a comprehensive admin panel.

## Architecture

```
vegetables/
├── frontend/          (React.js + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── styles/
│   └── package.json
└── backend/           (Node.js + Express + lowdb JSON)
    ├── routes/
    ├── data/          (JSON flat-file DB — no setup needed)
    └── server.js
```

## Design System — Glassmorphism
- **Background**: Dark green gradient (`#0a1628` → `#0d2b0d`)
- **Cards**: `backdrop-filter: blur(20px)` + `rgba(255,255,255,0.08)` glass panels
- **Accent**: Vibrant green `#22c55e`, orange `#f97316`, gold `#fbbf24`
- **Typography**: Google Fonts — **Outfit** (headings) + **Inter** (body)
- **Animations**: Framer Motion for page transitions, auction countdown, bid pulses
- **Mobile-first**: Full responsive layout, hamburger menu, touch-friendly modals

---

## Frontend Pages & Components

### Public Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, featured auctions, stats counter |
| Auctions | `/auctions` | Live auction grid with countdown timers |
| Auction Detail | `/auctions/:id` | Bid placement, bid history, live leaderboard |
| Products | `/products` | Browse produce catalog |
| Farmers | `/farmers` | Registered farmers list |
| About | `/about` | Platform info |
| Login / Register | `/auth` | Tabbed form for Buyer + Farmer registration |
| Buyer Dashboard | `/dashboard` | My bids, order status, vehicle dispatch |
| Farmer Dashboard | `/farmer-dashboard` | My listings, received bids, approvals |

### Admin Panel (`/admin`)
| Feature | Description |
|---------|-------------|
| Admin Login | Secure admin authentication |
| Dashboard | Platform stats overview |
| Products CRUD | Add/edit/delete vegetable listings |
| Auctions CRUD | Create/close/manage auctions |
| Bids Management | View all bids, approve/reject |
| Users Management | View buyers and farmers |
| Orders Tracking | All orders + logistics status |

---

## Backend API (Express.js + lowdb JSON store)

### Endpoints
```
POST   /api/auth/register        — Register buyer or farmer
POST   /api/auth/login           — Login (returns JWT-like token)
GET    /api/products             — List all products
POST   /api/products             — Admin: create product
PUT    /api/products/:id         — Admin: update product
DELETE /api/products/:id         — Admin: delete product
GET    /api/auctions             — List active auctions
POST   /api/auctions             — Admin: create auction
PUT    /api/auctions/:id         — Admin: update/close auction
GET    /api/auctions/:id/bids    — Get bids for an auction
POST   /api/auctions/:id/bids    — Place a bid
GET    /api/orders               — Get user orders (filtered by buyer)
PUT    /api/orders/:id/vehicle   — Assign vehicle/driver
GET    /api/admin/stats          — Admin: platform statistics
PUT    /api/admin/bids/:id       — Admin: approve/reject bid
```

### Data Store (lowdb - JSON files, zero setup)
- `data/users.json`
- `data/products.json`
- `data/auctions.json`
- `data/bids.json`
- `data/orders.json`

---

## Proposed Changes

### Backend

#### [NEW] `backend/package.json`
#### [NEW] `backend/server.js`
#### [NEW] `backend/routes/auth.js`
#### [NEW] `backend/routes/products.js`
#### [NEW] `backend/routes/auctions.js`
#### [NEW] `backend/routes/bids.js`
#### [NEW] `backend/routes/orders.js`
#### [NEW] `backend/routes/admin.js`
#### [NEW] `backend/data/*.json` (seed data files)
#### [NEW] `backend/middleware/auth.js`

---

### Frontend

#### [NEW] `frontend/` — Vite + React project
- `src/main.jsx` + `src/App.jsx` with React Router
- `src/context/AuthContext.jsx` — global auth/user state
- `src/context/AuctionContext.jsx` — auction state + polling
- `src/styles/global.css` — full glassmorphism design system
- Full page components in `src/pages/`
- Reusable components in `src/components/`

---

## Verification Plan

### Automated
- Run `npm run dev` in both `frontend/` and `backend/` simultaneously
- Verify all API routes respond correctly in browser/terminal

### Manual Walkthrough
1. Register as Buyer → Login → Browse auctions → Place bid
2. Register as Farmer → Login → Create product listing
3. Admin login → Create auction with product → Manage bids → Approve order
4. Buyer Dashboard → Assign vehicle → Gate pass shown

> [!IMPORTANT]
> The backend uses **lowdb** (JSON flat-file) — no database installation needed. Just `npm install` and `npm start`.

> [!NOTE]
> Frontend runs on port **5173**, Backend on port **5000**. A proxy is configured in Vite so all `/api` calls route correctly.
