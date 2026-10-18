# NovaCart Architecture Documentation

## System Architecture

NovaCart is designed as a decoupled 3-tier full-stack system:

```text
[ React 19 Frontend (Vite) ]
       │              ▲
       │ (1) Auth     │ (2) Tokens & Sessions
       ▼              │
[ Supabase Auth Service ]
       │
       │ (3) HTTP Requests with Bearer JWT
       ▼
[ Express.js REST API Server ]
   ├── Authentication Middleware (Verifies Supabase JWT)
   ├── Role-Based Access Control (Admin / Customer)
   ├── Input Validation & Sanitization
   ├── Razorpay Payment Integration (HMAC SHA-256 Verification)
   └── Mongoose Models (ODM)
       │
       ▼
[ MongoDB Atlas (Database) ]
```

## Communication Principles

1. **Authentication Handshake**:
   - The user signs in using the Supabase client library on the frontend.
   - Upon successful login, the frontend receives a short-lived JWT `access_token`.
   - All protected requests to the Express backend include `Authorization: Bearer <token>`.
   - Express verifies the cryptographic token directly using Supabase public keys or JWT secret.
   - The user's role, preferences, addresses, and purchase history are kept in MongoDB under the indexed `supabaseId`.

2. **Security & Zero-Trust Logic**:
   - Prices, discounts, tax calculations, and inventory subtractions are computed solely on the backend.
   - Payments are created as Razorpay server orders. Frontend modal obtains signatures, and the backend validates signatures before acknowledging payment.

3. **Error Handling Strategy**:
   - All Express controllers use async wrapper or centralized error forwarding.
   - Standardized JSON responses: `{ success: boolean, message: string, data?: any, errors?: any }`.
