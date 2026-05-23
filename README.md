<div align="center">

# ZlipKart

### Full-Stack Flipkart-Inspired Ecommerce Platform

*Built as part of the Scaler SDE Internship Round 2 Assignment*

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## Overview

**ZlipKart** is a production-style, full-stack ecommerce platform built to closely resemble the real-world Flipkart shopping experience. Developed as a Scaler SDE Internship assignment, it demonstrates end-to-end software engineering across a modern TypeScript-first stack — from a layered REST API backend to a responsive, Redux-powered React frontend.

The project intentionally mirrors Flipkart's UI/UX and information density while maintaining its own branding and identity as **ZlipKart**. Every feature — from the product listing page to AI-powered shopping assistance — is implemented with production-grade patterns including proper error boundaries, loading states, type safety, and a clean layered architecture.

---

## Table of Contents

1. [Live Features](#-live-features)
2. [Tech Stack](#-tech-stack)
3. [Architecture](#-architecture)
4. [Project Structure](#-project-structure)
5. [Authentication](#-authentication)
6. [AI Features](#-ai-features-extra)
7. [Assignment Requirements Mapping](#-assignment-requirements-mapping)
8. [Setup Instructions](#-setup-instructions)
9. [Environment Variables](#-environment-variables)
10. [Responsive Design](#-responsive-design)
11. [Email Confirmation System](#-email-confirmation-system)
12. [API Endpoints](#-api-endpoints)
13. [Screenshots](#-screenshots)
14. [Future Improvements](#-future-improvements)

---

## ✨ Live Features

### Core Ecommerce Features

| Feature | Description |
|---|---|
| 🏠 **Homepage** | Flipkart-style marketplace homepage with hero carousel, category strip, deal sections, promo banners |
| 📦 **Product Listing** | Grid view with Flipkart-style borders, skeleton loaders, result count, breadcrumbs |
| 🔍 **Search** | Global search with instant suggestions dropdown, trending searches, URL-synced query state |
| 🧹 **Advanced Filters** | Brand, rating, price range, discount %, availability, new arrivals — all URL-param driven |
| 🗂️ **Sorting** | Relevance, Price Low→High, Price High→Low, Rating |
| 📄 **Pagination** | Smooth page transitions, "Showing X–Y of Z" counters, correct meta from backend |
| 🛍️ **Product Detail Page** | Multi-image gallery, thumbnails, rating badge, stock status, trust badges, delivery ETA |
| 🛒 **Cart** | Add, remove, update quantity, move to wishlist, subtotal, savings summary |
| ❤️ **Wishlist** | Add/remove from PDP and product cards, badge sync in navbar, move to cart |
| 💳 **Checkout** | Address selection, payment method picker (COD/UPI/Card/Net Banking), order summary |
| ✅ **Order Placement** | Full order lifecycle — placement → confirmation → email |
| 📦 **Order History** | Timeline view, order status, item breakdown, delivery address snapshot |
| 📍 **Address Management** | Add, edit, delete saved addresses with form validation |
| 👤 **Profile** | User account info view |
| 🏪 **Seller Page** | Flipkart-inspired seller landing with benefits, stats, FAQ accordion, registration form |
| 🔐 **Auth** | Register, login, logout with JWT token persistence and protected routes |

### Advanced / Extra Features

| Feature | Description |
|---|---|
| 🤖 **AI Shopping Assistant** | Floating chat panel — type any query ("gaming laptop under ₹60k") and get category-aware product recommendations from a curated scoring engine |
| 🎯 **Similar Products** | Category + keyword-aware product recommendations on every PDP |
| 🔍 **Search Suggestions** | Instant debounced dropdown with product-seeded suggestions on every keystroke |
| 📈 **Trending Searches** | Pre-populated trending chips shown on search focus |
| 🕐 **Recently Viewed** | localStorage-based recently viewed products — persisted across sessions |
| 📧 **Email Confirmation** | Resend API-powered HTML order confirmation emails — non-blocking, order never fails if email fails |
| 💀 **Skeleton Loaders** | All loading states use contextual skeleton cards (not spinners) — PLP, Cart, Wishlist, Orders |
| 🛡️ **Protected Routes** | Route-level auth guards — unauthenticated users redirected to login |
| 🔄 **Optimistic Updates** | Wishlist toggles update UI immediately via Redux before API response |
| 🖼️ **Image Fallbacks** | Custom SVG fallback via `ProductImage` component — no broken images, no external placeholder services |
| 🚫 **404 Page** | Ecommerce-themed Not Found page with product-discovery CTAs |
| 📱 **Fully Responsive** | Mobile (320px) to ultrawide (1600px+) — tested at every breakpoint |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18 | UI framework |
| **TypeScript** | 5 | Type safety across all components and API calls |
| **Vite** | 6 | Build tool — fast HMR, optimised production bundles |
| **Redux Toolkit** | 2 | Global state (auth, cart, wishlist, products, orders, addresses) |
| **Tailwind CSS** | 3 | Utility-first styling with custom Flipkart-inspired design tokens |
| **React Router** | 7 | Client-side routing with protected and public route patterns |
| **Axios** | 1 | HTTP client with request/response interceptors |
| **React Hook Form** | 7 | Performant forms with minimal re-renders |
| **Zod** | 3 | Runtime validation schemas shared with form resolvers |
| **Lucide React** | — | Consistent icon system |
| **React Hot Toast** | — | Non-intrusive toast notifications |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 23+ | JavaScript runtime |
| **Express.js** | 4 | HTTP server and routing |
| **TypeScript** | 5 | Full type safety across the API layer |
| **Prisma ORM** | 5 | Type-safe database access with migration support |
| **PostgreSQL** | 18 | Relational database for all persistent data |
| **JSON Web Tokens** | — | Stateless authentication |
| **Zod** | 3 | Request body validation on every endpoint |
| **Resend** | — | Transactional email API for order confirmations |
| **bcryptjs** | — | Password hashing |

---

## 🏗 Architecture

### Why This Architecture?

The project follows a **layered backend architecture** to mirror production engineering standards — the kind of structure you'd find at companies like Flipkart, Swiggy, or Meesho. This approach enforces separation of concerns and makes each layer independently testable.

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────┐
│              Route Layer                │  ← Express routes + Zod middleware
│         (auth, products, cart…)         │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│           Controller Layer              │  ← Handles HTTP req/res, delegates to service
│     (validates input, shapes response)  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│            Service Layer                │  ← Business logic (auth, pricing, ordering)
│     (pure functions, no HTTP concerns)  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          Repository / Prisma            │  ← Database queries via Prisma ORM
│      (single source of data access)     │
└────────────────────┬────────────────────┘
                     │
                     ▼
              PostgreSQL Database
```

**Why this matters for the assignment:**

- **Controller** knows nothing about the database — it only talks to services
- **Service** knows nothing about HTTP — it's reusable and unit-testable
- **Prisma** provides a fully type-safe query layer — no raw SQL, no ORM magic strings
- **Zod middleware** validates all incoming requests before they reach the controller, so services receive clean, typed data

### Frontend Architecture

```
┌──────────────────────────────────────────────────┐
│                  React Pages                     │
│   (Home, Products, PDP, Cart, Checkout…)         │
└──────────────────────┬───────────────────────────┘
                       │ dispatch / useSelector
                       ▼
┌──────────────────────────────────────────────────┐
│              Redux Toolkit Store                 │
│  authSlice │ cartSlice │ wishlistSlice           │
│  productSlice │ ordersSlice │ addressSlice       │
└──────────────────────┬───────────────────────────┘
                       │ createAsyncThunk
                       ▼
┌──────────────────────────────────────────────────┐
│               API Layer (api/)                   │
│  authApi │ cartApi │ productApi │ orderApi…      │
└──────────────────────┬───────────────────────────┘
                       │ Axios interceptors (JWT + 401 handling)
                       ▼
                  Express REST API
```

**Key frontend decisions:**

- **One Redux slice per domain** — auth, cart, wishlist, products, orders, addresses, checkout, categories
- **Centralised Axios instance** — request interceptor attaches JWT; response interceptor handles 401 by dispatching `logout()` via a custom DOM event (avoiding circular imports)
- **URL-as-state for filters** — all filter/search/pagination state lives in URL params so the browser back button and page sharing work correctly
- **`ProductImage` component** — wraps every product image with an inline SVG fallback so broken URLs never cause layout shifts

---

## 📁 Project Structure

```
zlipkart/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models
│   │   └── seed.ts                # 48 products, 8 categories, demo users
│   └── src/
│       ├── config/
│       │   ├── db.ts              # Prisma client singleton
│       │   └── env.ts             # Validated env vars (Zod)
│       ├── middleware/
│       │   ├── auth.middleware.ts  # JWT verify + attach user
│       │   └── validate.ts        # Zod request body validation
│       ├── modules/
│       │   ├── auth/              # Register, Login
│       │   ├── products/          # Listing, Detail, Filters, AI
│       │   ├── cart/              # Add, Update, Remove, Get
│       │   ├── wishlist/          # Add, Remove, Get
│       │   ├── orders/            # Place, Get All, Get By ID
│       │   ├── addresses/         # CRUD address management
│       │   ├── categories/        # Category listing
│       │   ├── users/             # Profile
│       │   └── ai/                # AI recommendation engine
│       ├── services/
│       │   └── email/
│       │       └── resend.service.ts  # Order confirmation emails
│       ├── routes/
│       │   └── index.ts           # Route aggregator
│       ├── app.ts                 # Express app factory
│       └── server.ts              # HTTP server + graceful shutdown
│
└── frontend/
    └── src/
        ├── api/                   # Axios API functions per domain
        ├── components/
        │   ├── layout/            # Navbar, Footer, Layout wrapper
        │   ├── shared/            # ProductCard, CartItemCard, AIAssistant…
        │   └── ui/                # Button, Input, Badge, Spinner, Pagination…
        ├── hooks/                 # useAuth, useCart, useRecentlyViewed
        ├── pages/                 # One folder per route
        ├── routes/                # AppRoutes, ProtectedRoute, PublicRoute
        ├── schemas/               # Zod schemas for forms
        ├── store/
        │   └── slices/            # One slice per domain
        ├── types/                 # api.types.ts, product.types.ts
        └── utils/                 # formatCurrency, formatDate, deliveryFee
```

---

## 🔐 Authentication

ZlipKart uses **JWT-based stateless authentication**:

1. **Registration / Login** — the backend hashes passwords with `bcryptjs` and returns a signed JWT access token
2. **Token persistence** — the token and user object are stored in `localStorage` and loaded into Redux on app start
3. **Axios interceptor** — every outgoing request automatically receives `Authorization: Bearer <token>` from `localStorage`
4. **401 handling** — on a 401 response the Axios interceptor dispatches a custom DOM event (`auth:session-expired`) which triggers a Redux `logout()` dispatch from `main.tsx`, clearing all state and storage
5. **Protected routes** — the `ProtectedRoute` component reads `isAuthenticated` from Redux; unauthenticated users are redirected to `/auth/login` with the return path preserved
6. **Public routes** — `PublicRoute` prevents authenticated users from accessing `/auth/login` and `/auth/register` (redirects to `/`)

### Demo Credentials

For evaluation convenience, the database seed creates a demo user:

> ⚠️ Replace with actual credentials from your seeded database before submission.

```
Username : TestUser
Email:    test12@gmail.com
Password: Test@123456
```

To create a fresh account, use the `/auth/register` page.

---

## 🤖 AI Features *(Extra)*

The AI features were built entirely without external LLM APIs or vector databases — making them lightweight, deterministic, and zero-cost to run.

### AI Shopping Assistant

A floating chat panel (bottom-right corner) that accepts natural language queries like:

- *"Best wireless headphones under ₹5000"*
- *"Gaming laptops under ₹80k"*
- *"Face wash for oily skin"*

**How the recommendation engine works:**

```
User Query
    │
    ▼
1. Category Detection
   Keyword map: "headphones" → Electronics/Audio
   "face wash" → Beauty
   "running shoes" → Sports/Footwear

    │
    ▼
2. Budget Extraction
   Regex: "under ₹5000" → maxPrice: 5000

    │
    ▼
3. Multi-factor Scoring
   category match score   × 50 pts
   keyword match score    × 30 pts (name + description + brand)
   rating bonus           × 10 pts
   discount bonus         × 10 pts

    │
    ▼
4. Ranked results returned
   (Top N by score, filtered by category + price)
```

This approach ensures "headphones" **always returns audio products** even if a highly-rated phone is in the database.

### Similar Products

On every Product Detail Page, a `SimilarProducts` section fetches products from the same category, excludes the current product, and ranks them by rating. This creates a genuine "customers also viewed" experience.

### Search Suggestions

A debounced substring match against a curated seed dictionary of 38 product names — renders instantly without any API call. Trending searches are shown on focus before the user types.

---

## ✅ Assignment Requirements Mapping

> All requirements from the Scaler SDE Internship Round 2 Assignment PDF are implemented.

| Requirement | Status | Notes |
|---|---|---|
| Product Listing Page | ✅ Complete | Grid view, pagination, sorting |
| Product Detail Page | ✅ Complete | Gallery, rating, stock, add to cart/wishlist |
| Search Functionality | ✅ Complete | URL-synced, suggestions dropdown, trending |
| Category Filtering | ✅ Complete | Sidebar with live URL param updates |
| Price Range Filtering | ✅ Complete | Min/max price with apply button |
| Add to Cart | ✅ Complete | From PDP and cart management |
| Cart Management | ✅ Complete | Update qty, remove, move to wishlist |
| Checkout Flow | ✅ Complete | Address + payment method + order placement |
| Order Placement | ✅ Complete | Full order creation via backend API |
| Order History | ✅ Complete | List + individual order detail with timeline |
| Wishlist | ✅ Complete | Add/remove from card and PDP, navbar badge |
| Address Management | ✅ Complete | Add, edit, delete saved addresses |
| User Authentication | ✅ Complete | Register, login, logout, JWT persistence |
| Protected Routes | ✅ Complete | Cart, checkout, orders, wishlist, profile |
| Responsive Design | ✅ Complete | Mobile 320px → ultrawide 1600px+ |
| REST API Backend | ✅ Complete | Node.js + Express + PostgreSQL |
| Database Integration | ✅ Complete | Prisma ORM + PostgreSQL with full schema |
| Form Validation | ✅ Complete | React Hook Form + Zod on all forms |
| Error Handling | ✅ Complete | API errors, empty states, fallback images |
| Loading States | ✅ Complete | Skeleton loaders on all data-fetching pages |
| **Email Confirmation** | ✅ **Extra** | Resend API — branded HTML email on order |
| **AI Shopping Assistant** | ✅ **Extra** | Category-aware recommendation engine |
| **Similar Products** | ✅ **Extra** | Category + keyword ranked on every PDP |
| **Recently Viewed** | ✅ **Extra** | localStorage persistent history |
| **Trending Searches** | ✅ **Extra** | Pre-seeded trending chip suggestions |
| **Seller Landing Page** | ✅ **Extra** | Full marketing page with FAQ + registration |

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 14 running locally
- npm ≥ 9

---

### Backend Setup

```bash
# 1. Navigate to the backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env — add your DATABASE_URL, JWT_SECRET, and optionally RESEND_API_KEY

# 4. Run Prisma migrations (creates all tables)
npx prisma migrate dev

# 5. Seed the database (48 products, 8 categories, demo users)
npx prisma db seed

# 6. Start the development server
npm run dev
# Server runs at http://localhost:5000
```

---

### Frontend Setup

```bash
# 1. Navigate to the frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Copy and configure environment variables
cp .env.example .env
# Edit VITE_API_BASE_URL if your backend runs on a different port

# 4. Start the development server
npm run dev
# App runs at http://localhost:5173
```

---

### Production Build (Frontend)

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/zlipkart_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
JWT_EXPIRES_IN="7d"

# API
API_VERSION="v1"

# Frontend (for email links)
FRONTEND_URL="http://localhost:5173"

# Email — Resend (optional: orders succeed even without this)
# Get a free key at https://resend.com (100 emails/day free)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="onboarding@resend.dev"
```

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL="http://localhost:5000/api/v1"
```

---

## 📱 Responsive Design

ZlipKart is built **mobile-first** and tested at every major breakpoint:

| Breakpoint | Layout |
|---|---|
| 320px (mobile S) | Single column grid, stacked cart/checkout, hamburger menu |
| 375px (mobile M) | Single column, touch-friendly targets |
| 425px (mobile L) | Single column with wider cards |
| 768px (tablet) | 2-column product grid, sidebar collapsed |
| 1024px (laptop) | 3-column grid, filters sidebar visible, 3-col checkout |
| 1280px (desktop) | 4-column grid, full marketplace density |
| 1600px+ (ultrawide) | Max-width containers centred, no stretch |

**Key responsive decisions:**

- **Product grid** — `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4` with Flipkart-style borders between cells
- **Filter sidebar** — collapsible on mobile, always-visible on desktop
- **Cart/Checkout** — single-column on mobile, 2/3 + 1/3 grid on desktop
- **Navbar** — full search bar on desktop, icon-only + hamburger on mobile
- **HeroCarousel** — 240px tall on mobile, 360px on desktop
- **AI Assistant panel** — full-width bottom sheet on mobile, fixed 420px panel on desktop

---

## 📧 Email Confirmation System

When a user places an order, ZlipKart sends a rich HTML confirmation email via the **Resend API**.

### How it works

```
Order Placed (POST /orders)
       │
       ▼
 Order created in PostgreSQL ✅
       │
       ▼
 sendOrderConfirmationEmail() called (non-blocking)
       │
       ├─── RESEND_API_KEY set? ───No──→ Skip silently, log info
       │
       └─── Yes ──→ Build HTML email
                         │
                         ▼
                    Resend API call
                         │
                    ├── Success → emailSent: true → "📧 Email sent" toast
                    └── Failure → emailSent: false → No toast, order unaffected
```

### Email Contents

- ✅ ZlipKart branded header (gradient blue)
- 📋 Full items table with quantity and line totals
- 💰 Order total in ₹
- 📍 Delivery address block
- 📦 Estimated delivery note (3–5 business days)
- 🔗 "Track Your Order →" CTA button (links to `/orders`)
- ⚡ Auto-footer with disclaimer

### Non-blocking Architecture

The `sendOrderConfirmationEmail` function is intentionally designed to **never throw**. All errors are caught internally and logged. This guarantees:

> Order placement **always succeeds** regardless of email delivery status.

To enable emails: add `RESEND_API_KEY=re_...` to `backend/.env`. Free tier provides 100 emails/day.

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create new user account |
| POST | `/auth/login` | Public | Login, returns JWT token |
| GET | `/auth/me` | 🔒 | Get current user profile |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List products with filters, search, pagination |
| GET | `/products/:id` | Public | Get single product details |

**Query params for `/products`:**
`page`, `limit`, `sortBy`, `categoryId`, `search`, `minPrice`, `maxPrice`, `minRating`, `brand`, `minDiscount`, `inStock`

### Cart
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cart` | 🔒 | Get user's cart with totals |
| POST | `/cart` | 🔒 | Add item to cart |
| PATCH | `/cart/:itemId` | 🔒 | Update item quantity |
| DELETE | `/cart/:itemId` | 🔒 | Remove item from cart |

### Wishlist
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/wishlist` | 🔒 | Get wishlist items |
| POST | `/wishlist/:productId` | 🔒 | Add product to wishlist |
| DELETE | `/wishlist/:productId` | 🔒 | Remove from wishlist |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | 🔒 | Place a new order |
| GET | `/orders` | 🔒 | Get order history |
| GET | `/orders/:id` | 🔒 | Get order details |

### Addresses
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/addresses` | 🔒 | List saved addresses |
| POST | `/addresses` | 🔒 | Create new address |
| PATCH | `/addresses/:id` | 🔒 | Update address |
| DELETE | `/addresses/:id` | 🔒 | Delete address |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ai/recommend` | Public | Get AI product recommendations |

### Categories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Public | List all product categories |

---

## 🖼️ Screenshots

### Homepage
![Homepage](docs/screenshots/homepage.png)
![Homepage 2](docs/screenshots/homepage2.png)

### Product Listing Page
![Product Listing 1](docs/screenshots/PLP1.png)
![Product Listing 2](docs/screenshots/PLP2.png)

### Search
![Search](docs/screenshots/Search1.png)

### Product Detail Page
![Product Detail](docs/screenshots/PDP1.png)
![Similar Products](docs/screenshots/PDP2-similar-products.png)

### Cart
![Cart](docs/screenshots/Cart1.png)
![Cart 2](docs/screenshots/Cart2.png)

### Checkout
![Checkout](docs/screenshots/Checkout.png)

### Order Placed & Order History
![Order Placed](docs/screenshots/OrderPlaced.png)
![Order History](docs/screenshots/OrderHistory.png)

### Email Confirmation
![Order Confirmation Email 1](docs/screenshots/OrderConfirmationEmail1.png)
![Order Confirmation Email 2](docs/screenshots/OrderConfirmationEmail2.png)

### Wishlist
![Wishlist](docs/screenshots/Wishlist.png)

### AI Shopping Assistant
![AI Assistant](docs/screenshots/AI-assistant.png)
![AI Assistant 2](docs/screenshots/Ai-assistant2.png)

### Seller Page
![Seller 1](docs/screenshots/Seller1.png)
![Seller 2](docs/screenshots/Seller2.png)
![Seller 3](docs/screenshots/Seller3.png)

### Auth & Profile
![Login](docs/screenshots/Login.png)
![User Profile](docs/screenshots/UserProfile.png)

---

## 🔮 Future Improvements

| Feature | Description |
|---|---|
| 🏦 **Payment Gateway** | Razorpay / Stripe integration for real payments |
| 📊 **Seller Dashboard** | Inventory management, sales analytics, order tracking |
| 🧠 **Real AI Personalization** | Replace the scoring engine with an embeddings-based vector search (pgvector) |
| 📣 **Real-time Notifications** | WebSocket / SSE for order status updates |
| 🎨 **Product Reviews** | User-generated ratings and review system |
| 📦 **Inventory Management** | Stock tracking, low-stock alerts, auto-disable |
| 🗺️ **Delivery Estimation** | Pincode-based estimated delivery dates |
| 🔗 **Social Auth** | Google OAuth login |
| 🌍 **i18n** | Multi-language support |
| 🚀 **Docker + CI/CD** | Containerised deployment with GitHub Actions |

---

## 📋 Final Notes

ZlipKart was built with a deliberate focus on:

- **Production-grade architecture** — layered backend, typed API contracts, proper error boundaries
- **Assignment alignment** — every requirement from the Scaler brief is implemented and mapped above
- **Developer experience** — TypeScript throughout means every component, API call, and Redux slice is type-safe with zero `any` in critical paths
- **Extra mile features** — the AI Shopping Assistant, Resend email integration, Recently Viewed, and Seller Page go beyond the base requirements to demonstrate initiative and product thinking

The codebase is designed to be easy to navigate during an interview walkthrough — every module has a clear responsibility, naming is consistent, and the folder structure mirrors real-world SDE team conventions.

---

<div align="center">

Built with ❤️ for the Scaler SDE Internship Assignment

**ZlipKart** — *India's Online Marketplace*

</div>
