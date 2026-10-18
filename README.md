# NovaCart — Full-Stack MERN E-Commerce Platform

A production-ready e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js), powered by Supabase Authentication and Razorpay payment integration, tailored for the Indian market (₹ INR).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 / 19, Vite, React Router v6, Vanilla CSS (Custom Design System tokens, glassmorphism, responsive grid), Context API / Custom Hooks |
| **Backend** | Node.js, Express.js (Modular REST API, RBAC Middleware, Rate Limiting, CORS, Error Handling) |
| **Database** | MongoDB Atlas / Mongoose ODM (Strict schemas, validation, indexing) |
| **Authentication** | Supabase Auth (Email/Password, token verification on Express backend, MongoDB User Profile synchronization) |
| **Payment Gateway** | Razorpay (UPI, NetBanking, Cards, Test mode & automated development simulation) |

---

## 📐 Project Structure (Planned)

```text
antiide/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static assets, favicon, logos
│   ├── src/
│   │   ├── api/                # API client & endpoint helpers
│   │   ├── assets/             # Brand logos & icons
│   │   ├── components/         # Reusable UI & domain components
│   │   │   ├── common/         # Navbar, Footer, Modal, Button, Badge, Input, Toast
│   │   │   ├── product/        # ProductCard, ProductGrid, FilterSidebar, Rating
│   │   │   ├── cart/           # CartItem, CartDrawer, OrderSummary
│   │   │   └── admin/          # AdminLayout, AdminTable, StatCard
│   │   ├── context/            # AuthContext, CartContext, NotificationContext
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route pages (Home, Shop, Product, Cart, Checkout, Profile, Admin)
│   │   ├── styles/             # Global CSS, variables, typography, animations
│   │   ├── utils/              # Currency formatting (₹), date helpers, validation
│   │   ├── App.jsx             # App root & route configurations
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/             # Database connection, env loader, Supabase/Razorpay configs
│   │   ├── controllers/        # Request handlers (auth, products, orders, categories, admin)
│   │   ├── middleware/         # Auth verification, role checks, error handlers, validator
│   │   ├── models/             # Mongoose schemas (User, Product, Category, Order, Review)
│   │   ├── routes/             # REST route declarations
│   │   ├── services/           # Payment service, token service, email service
│   │   ├── scripts/            # Database seed script with rich Indian catalog data
│   │   ├── utils/              # Helper utilities, logger, response wrappers
│   │   └── server.js           # Server bootstrap & Express application entry point
│   ├── .env.example            # Environment variables blueprint
│   └── package.json
│
└── README.md                   # Project documentation & execution guide
```

---

## 🚀 Implementation Roadmap

- [x] **Phase 1: Requirements and Project Planning**
  - Architectural blueprint, ER diagram, sequence flow, API specs, user journeys.
- [x] **Phase 2: Project Setup & Foundation**
  - Scaffolding `client/` and `server/`, setting up dependencies, environment configurations, and base design system.
- [x] **Phase 3: Frontend Foundation: HTML, CSS, and Design System**
  - Custom CSS variables, responsive resets, accessible UI component primitives, formatters, and validators.
- [x] **Phase 4: Customer Interface & Pages (Full React Router Implementation)**
  - Home page (Hero, Categories, Featured, Trending, Promotional banners, Newsletter, Search).
  - Product listing page (`/shop`) with filters (category, price range, availability, rating), sorting, search, pagination, and skeletons.
  - Product details page (`/product/:id`) with image gallery, variants, quantity stepper, stock status, reviews, review submission modal, and related products.
  - Shopping cart (`/cart`) with persistent storage, coupon codes (`WELCOME100`, `FESTIVE15`, `NOVA500`), free shipping threshold, and empty states.
  - Checkout page (`/checkout`) with authentication guard, address picker/form, trusted pricing calculations, payment options (Razorpay & COD), and duplicate submission lock.
  - Order confirmation & tracking page (`/order-success/:id`) with itemized breakdown and delivery timeline stepper.
  - Customer account portal (`/profile`) with order history, address management, security/password reset, and account deletion safeguards.
  - Additional pages: About Us, Contact Us with validated form, FAQ with accordions, Shipping Policy, Refund Policy, Privacy Policy, Terms & Conditions, and 404 page.
- [x] **Phase 5: Backend Mongoose Models & Database Seeding**
  - Mongoose models (`User`, `Product`, `Category`, `Cart`, `Order`, `Review`, `Coupon`) with strict validation, indexes, compound unique review constraints, snapshot preservation, and automated seed script (`npm run seed`).
- [x] **Phase 6: Authentication & Authorization (Supabase + Express RBAC)**
  - Supabase client integration on frontend (`client/src/services/supabase.js`) and backend token verification middleware (`server/src/middleware/auth.js`).
  - Zero-trust identity verification, MongoDB profile synchronization, role enforcement (`customer` vs `admin`), and dedicated auth pages (Login, Register, Reset Password, Verify Email).
- [ ] **Phase 7: Razorpay Payment Gateway & Cryptographic Webhooks**
  - Live order creation and HMAC-SHA256 signature verification.
- [ ] **Phase 8: Admin Dashboard & Inventory Control**
  - Protected admin panel, sales analytics, product CRUD, and order fulfillment.

---

## 🔒 Security Best Practices Implemented
1. **Zero Trust Frontend**: Prices and quantities are recalculated directly from MongoDB during order creation.
2. **Cryptographic Signatures**: Razorpay payments are validated via HMAC-SHA256 hash matching on the backend.
3. **Role-Based Access Control**: Sensitive admin endpoints check verified token identity and database role before execution.
4. **Environment Isolation**: Private keys and secrets are never bundled into frontend distributions.
