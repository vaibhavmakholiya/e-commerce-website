# NovaCart REST API Documentation

Base URL: `http://localhost:5000/api`

## Health & System Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Access**: Public
- **Description**: Returns server status, timestamp, uptime, and database connection state.
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "NovaCart API is running smoothly",
  "data": {
    "status": "healthy",
    "timestamp": "2026-10-15T16:55:00.000Z",
    "uptime": "12.34s",
    "database": "connected"
  }
}
```

## Authentication & User Endpoints (`/api/auth`)
- `POST /api/auth/sync`: Sync Supabase identity into MongoDB user profile.
- `GET /api/auth/me`: Retrieve currently logged-in user profile with saved addresses.
- `PUT /api/auth/profile`: Update user profile details.
- `POST /api/auth/address`: Add new delivery address.

## Product Endpoints (`/api/products`)
- `GET /api/products`: Query catalog with pagination, category filter, price slider, and text search.
- `GET /api/products/:id`: Fetch single product by ID or slug.
- `POST /api/products`: [Admin] Create a new product.
- `PUT /api/products/:id`: [Admin] Update product details and inventory.
- `DELETE /api/products/:id`: [Admin] Remove product.

## Category Endpoints (`/api/categories`)
- `GET /api/categories`: Fetch all active categories.
- `POST /api/categories`: [Admin] Add new category.

## Cart Endpoints (`/api/cart`)
- `GET /api/cart`: Retrieve active cart items.
- `POST /api/cart`: Synchronize local cart or add item.
- `DELETE /api/cart/:productId`: Remove item from cart.

## Order Endpoints (`/api/orders`)
- `POST /api/orders/create-order`: Create pending order and Razorpay order session.
- `POST /api/orders/verify-payment`: Verify HMAC-SHA256 signature and finalize order.
- `GET /api/orders/my-orders`: Retrieve customer purchase history.
- `GET /api/orders`: [Admin] Retrieve all store orders.
- `PUT /api/orders/:id/status`: [Admin] Update order fulfillment state.
