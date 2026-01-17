# QLess Backend API

Backend API server for the QLess mobile self-checkout application.

## 🎯 Overview

This backend needs to provide REST API endpoints for:
1. **Product lookup** - Scan a barcode and return product details
2. **Checkout processing** - Handle payment and generate exit QR codes
3. **QR validation** - Validate QR codes at store exit scanners

---

## 🔌 Required API Endpoints

### 1. Scan Barcode

Look up a product by its barcode.

```
POST /api/scan-barcode
```

**Request:**
```json
{
  "barcode": "2990000000019",
  "storeId": "nike"
}
```

**Response (200 OK):**
```json
{
  "id": "nike-af1-goretex-vibram",
  "name": "Air Force 1 GORE-TEX Vibram",
  "price": 150.00,
  "barcode": "2990000000019",
  "image": "nike-af1-goretex-vibram"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Product not found",
  "barcode": "1234567890123"
}
```

---

### 2. Process Checkout

Process payment and generate an exit QR code.

```
POST /api/checkout
```

**Request:**
```json
{
  "storeId": "nike",
  "items": [
    { "id": "nike-af1-goretex-vibram", "quantity": 2 },
    { "id": "nike-aj1-low-g", "quantity": 1 }
  ],
  "paymentMethod": "apple_pay",
  "totalAmount": 491.40
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "transactionId": "TXN-1737012345-ABC123XYZ",
  "qrCode": "{\"transactionId\":\"TXN-1737012345-ABC123XYZ\",\"storeId\":\"nike\",\"itemCount\":3,\"timestamp\":\"2026-01-17T12:00:00.000Z\",\"verified\":true}",
  "message": "Payment successful!"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Payment failed",
  "message": "Insufficient funds"
}
```

---

### 3. Get QR Code

Retrieve QR code data for a transaction (for refresh/re-display).

```
GET /api/qr-code/:transactionId
```

**Response (200 OK):**
```json
{
  "qrCode": "{\"transactionId\":\"TXN-123\",\"verified\":true}",
  "expiresAt": "2026-01-17T12:05:00.000Z"
}
```

---

### 4. Validate QR Code (For Store Exit Scanners)

Validate a QR code at store exit.

```
POST /api/validate-exit
```

**Request:**
```json
{
  "transactionId": "TXN-1737012345-ABC123XYZ",
  "storeId": "nike"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "message": "Exit approved",
  "items": [
    { "name": "Air Force 1 GORE-TEX Vibram", "quantity": 2 },
    { "name": "Air Jordan 1 Low G", "quantity": 1 }
  ]
}
```

**Response (403 Forbidden):**
```json
{
  "valid": false,
  "message": "QR code expired or already used"
}
```

---

## 📦 Data Models

### Product
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  storeId: string;
  image?: string;
  inStock: boolean;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  storeId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  qrCode: string;
  createdAt: Date;
  expiresAt: Date;
  exitValidatedAt?: Date;
}
```

### Store
```typescript
interface Store {
  id: string;
  name: string;
  logo: string;
  address: string;
  taxRate: number;  // e.g., 0.08 for 8%
}
```

---

## 🏷 Test Products (Nike Store)

These products are used for testing:

| Product ID | Name | Barcode (EAN-13) | Price |
|------------|------|------------------|-------|
| `nike-af1-goretex-vibram` | Air Force 1 GORE-TEX Vibram | `2990000000019` | $150.00 |
| `nike-aj1-low-g` | Air Jordan 1 Low G | `2990000000026` | $155.00 |
| `nike-solo-swoosh` | Nike Solo Swoosh | `2990000000033` | $105.00 |

---

## 💰 Business Logic

### Tax Calculation
- Tax rate: **8%** (configurable per store)
- `tax = subtotal * 0.08`
- `total = subtotal + tax`

### QR Code Validity
- QR codes expire after **5 minutes**
- QR codes can only be used **once**
- Store exit scanner should call `/api/validate-exit` to verify

### Payment Methods
| Method | ID |
|--------|-----|
| Apple Pay | `apple_pay` |
| Google Pay | `google_pay` |
| Credit/Debit Card | `card` |
| PayPal | `paypal` |

---

## 🔧 Suggested Tech Stack

Choose based on team expertise:

- **Node.js** - Express.js / Fastify / NestJS
- **Python** - FastAPI / Flask / Django
- **Go** - Gin / Echo / Fiber
- **Java** - Spring Boot

### Database Options
- PostgreSQL (recommended)
- MongoDB
- MySQL

### Payment Processing
- Stripe
- Square
- PayPal API

---

## ✅ Implementation Checklist

- [ ] Set up project structure
- [ ] Create database schema
- [ ] Implement `/api/scan-barcode`
- [ ] Implement `/api/checkout`
- [ ] Implement `/api/qr-code/:id`
- [ ] Implement `/api/validate-exit`
- [ ] Add payment gateway integration
- [ ] Add authentication (optional)
- [ ] Add rate limiting
- [ ] Deploy to cloud (AWS/GCP/Azure)

---

## 🚀 Getting Started

```bash
# Install dependencies (example for Node.js)
npm install

# Set environment variables
cp .env.example .env

# Run development server
npm run dev

# Run tests
npm test
```

---

## 📝 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/qless

# Payment (Stripe example)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# JWT (if using authentication)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

---

## 🔗 Frontend Integration

The frontend is located in `../frontend/` and uses mock API calls.

To integrate:
1. Update `frontend/src/services/api.ts`
2. Replace mock functions with actual HTTP calls
3. Point to your backend URL

Example:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';

export const scanBarcode = async (barcode: string): Promise<ScannedItem> => {
  const response = await fetch(`${API_BASE_URL}/scan-barcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode, storeId: currentStoreId }),
  });
  
  if (!response.ok) {
    throw new Error('Product not found');
  }
  
  return response.json();
};
```
