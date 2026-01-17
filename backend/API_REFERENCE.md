# QLess Backend - Quick Reference

## 🚀 All Available Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` 🔒 - Logout
- `GET /api/auth/me` 🔒 - Get current user

### Stores & Products
- `GET /api/stores` - List all stores
- `GET /api/stores/:id` - Get store details
- `GET /api/stores/:id/products` - Get store products

### Shopping Cart 🔒
- `POST /api/cart/add` - Add to cart
- `GET /api/cart` - Get cart
- `PATCH /api/cart/item` - Update item
- `DELETE /api/cart/item` - Remove item

### Checkout & Payment
- `POST /api/scan` - Scan barcode
- `POST /api/checkout/create` - Create checkout
- `POST /api/payment/confirm` - Confirm payment

### Transactions
- `GET /api/transaction/:id` - Get transaction
- `GET /api/transaction/:id/items` - Get items
- `GET /api/transaction/:id/qr` - Get QR code

### Verification
- `POST /api/verify/qr` - Verify QR at gate
- `GET /api/verify/transaction/:id` - Lookup transaction

### Admin 🔒🔐
- `POST /api/admin/store` - Create store
- `POST /api/admin/product` - Create product
- `PATCH /api/admin/product/:id` - Update product
- `DELETE /api/admin/product/:id` - Delete product

### Health
- `GET /api/health` - Health check
- `GET /api/version` - API version

**Legend:**
- 🔒 = Requires authentication
- 🔐 = Requires admin role

## 📁 New Files Created

### Models
- `model/cart.js`

### APIs
- `api/stores.js`
- `api/cart.js`
- `api/transactions.js`
- `api/payment.js`
- `api/verify.js`
- `api/admin.js`
- `api/health.js`

### Updated
- `api/auth.js` (added logout, getCurrentUser)
- `server.js` (registered all routes)

## ✅ Total: 27 REST Endpoints

See [walkthrough.md](file:///C:/Users/nkaus/.gemini/antigravity/brain/1739464b-7d77-442d-b078-fb907a1bf037/walkthrough.md) for detailed documentation and testing instructions.
