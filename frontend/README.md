# QLess - Mobile Self-Checkout App

A React Native/Expo mobile application that allows customers to scan product barcodes, add items to cart, pay, and exit the store using a QR code - completely bypassing traditional checkout lines.

## 🎯 Overview

QLess transforms the retail shopping experience by enabling:
1. **Scan** - Customer scans product barcodes with their phone camera
2. **Cart** - Items are added to a digital cart with real-time totals
3. **Pay** - Secure in-app payment processing
4. **Go** - Generate a QR code to scan at store exit for verification

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo | 54.0.31 | Development platform & tooling |
| TypeScript | 5.9.2 | Type-safe JavaScript |
| React Navigation | 7.x | Screen navigation (Stack Navigator) |
| expo-camera | 17.0.10 | Barcode scanning |
| react-native-qrcode-svg | 6.3.21 | QR code generation |
| expo-haptics | 15.0.8 | Haptic feedback |

---

## 📱 App Flow & Screens

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Landing   │───▶│ StoreSelect  │───▶│   Scanner    │
│   Screen    │    │   Screen     │    │   Screen     │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                              │
                                              ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   QRCode    │◀───│   Payment    │◀───│    Cart      │
│   Screen    │    │   Screen     │    │   Screen     │
└─────────────┘    └──────────────┘    └──────────────┘
```

### Screen Descriptions

| Screen | Path | Description |
|--------|------|-------------|
| **LandingScreen** | `/` | App entry point with branding and "Start Shopping" CTA |
| **StoreSelectScreen** | `/store-select` | Grid of available stores (Nike, Walmart, Costco, etc.) |
| **ScannerScreen** | `/scanner` | Camera-based barcode scanner with live preview |
| **CartScreen** | `/cart` | View cart items, adjust quantities, see totals with tax |
| **PaymentScreen** | `/payment` | Payment method selection (Apple Pay, Google Pay, Card, PayPal) |
| **QRCodeScreen** | `/qr-code` | Displays exit QR code after successful payment |

---

## 📦 Data Models

### CartItem
```typescript
interface CartItem {
  id: string;          // Unique product identifier
  name: string;        // Product display name
  price: number;       // Price in USD (e.g., 150.00)
  quantity: number;    // Quantity in cart
  barcode: string;     // EAN-13/UPC barcode string
  image?: string;      // Optional: Product image identifier
}
```

### Store
```typescript
interface Store {
  id: string;          // Unique store identifier (e.g., "nike")
  name: string;        // Display name (e.g., "Nike")
  logo: string;        // Logo identifier for asset lookup
}
```

### ScannedItem (API Response)
```typescript
interface ScannedItem {
  id: string;          // Product ID
  name: string;        // Product name
  price: number;       // Price in USD
  barcode: string;     // Barcode that was scanned
  image?: string;      // Optional: Image identifier
}
```

### CheckoutResponse (API Response)
```typescript
interface CheckoutResponse {
  success: boolean;           // Whether payment succeeded
  transactionId: string;      // Unique transaction ID (e.g., "TXN-1737012345-ABC123")
  qrCode: string;             // QR code data (JSON string)
  message: string;            // Status message
}
```

---

## 🔌 API Contract (Backend Requirements)

The frontend currently uses **mock implementations** in `src/services/api.ts`. For production, the backend should implement these endpoints:

### 1. Scan Barcode
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

**Response (Success - 200):**
```json
{
  "id": "nike-af1-goretex-vibram",
  "name": "Air Force 1 GORE-TEX Vibram",
  "price": 150.00,
  "barcode": "2990000000019",
  "image": "nike-af1-goretex-vibram"
}
```

**Response (Not Found - 404):**
```json
{
  "error": "Product not found",
  "barcode": "1234567890123"
}
```

### 2. Process Checkout
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

**Response (Success - 200):**
```json
{
  "success": true,
  "transactionId": "TXN-1737012345-ABC123XYZ",
  "qrCode": "{\"transactionId\":\"TXN-1737012345-ABC123XYZ\",\"storeId\":\"nike\",\"itemCount\":3,\"timestamp\":\"2026-01-17T12:00:00.000Z\",\"verified\":true}",
  "message": "Payment successful!"
}
```

### 3. Get QR Code (Optional - for refresh)
```
GET /api/qr-code/:transactionId
```

**Response:**
```json
{
  "qrCode": "{\"transactionId\":\"TXN-123\",\"verified\":true}"
}
```

---

## 🏪 Supported Stores

| Store ID | Name | Has Products |
|----------|------|--------------|
| `nike` | Nike | ✅ Yes (3 products) |
| `under-armour` | Under Armour | ❌ Mock only |
| `walmart` | Walmart | ❌ Mock only |
| `costco` | Costco | ❌ Mock only |
| `cvs` | CVS | ❌ Mock only |
| `banana-republic` | Banana Republic | ❌ Mock only |
| `bestbuy` | Best Buy | ❌ Mock only |
| `wegmans` | Wegmans | ❌ Mock only |
| `zara` | Zara | ❌ Mock only |
| `gap` | GAP | ❌ Mock only |

---

## 🏷 Test Products (Nike)

These are the products with real barcodes for testing:

| Product | Barcode (EAN-13) | Price | Image |
|---------|------------------|-------|-------|
| Air Force 1 GORE-TEX Vibram | `2990000000019` | $150.00 | ✅ |
| Air Jordan 1 Low G | `2990000000026` | $155.00 | ✅ |
| Nike Solo Swoosh | `2990000000033` | $105.00 | ✅ |

### Barcode Test Page
Open `barcode-test.html` in a browser to view/print scannable barcodes:
```bash
# Start a local server
cd qless
python3 -m http.server 8888

# Open in browser
open http://localhost:8888/barcode-test.html
```

---

## 📂 Project Structure

```
qless/
├── App.tsx                     # Main app entry, navigation setup
├── index.ts                    # Expo entry point
├── package.json                # Dependencies
├── app.json                    # Expo configuration
├── tsconfig.json               # TypeScript config
├── barcode-test.html           # Printable barcode test page
│
├── assets/
│   ├── barcodes/nike/          # Generated barcode images (PNG)
│   ├── logos/                  # Store logo images
│   └── products/Nike/          # Product images
│
├── scripts/
│   └── generate-barcodes.mjs   # Script to generate EAN-13 barcodes
│
└── src/
    ├── components/
    │   ├── AnimatedCheckmark.tsx   # Success animation
    │   ├── CartItem.tsx            # Cart item with image, quantity controls
    │   └── StoreCard.tsx           # Store selection card
    │
    ├── context/
    │   └── CartContext.tsx         # Global cart state management
    │
    ├── data/
    │   └── products.generated.ts   # Auto-generated product data
    │
    ├── screens/
    │   ├── LandingScreen.tsx       # Welcome screen
    │   ├── StoreSelectScreen.tsx   # Store picker
    │   ├── ScannerScreen.tsx       # Barcode scanner
    │   ├── CartScreen.tsx          # Shopping cart
    │   ├── PaymentScreen.tsx       # Payment options
    │   └── QRCodeScreen.tsx        # Exit QR code
    │
    ├── services/
    │   └── api.ts                  # API service (currently mock)
    │
    ├── theme/
    │   └── typography.ts           # Font styles
    │
    └── utils/
        └── animations.ts           # Reusable animation helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or 22
- npm or yarn
- Expo Go app (for mobile testing)

### Installation
```bash
# Navigate to project
cd qless

# Install dependencies
npm install

# Start Expo development server
npm run start

# Or run on specific platform
npm run web        # Web browser
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

### Testing on Physical Device
1. Install **Expo Go** from App Store / Play Store
2. Run `npm start` in terminal
3. Scan the QR code with Expo Go app
4. The barcode scanner will work on the physical device

> ⚠️ **Note:** Barcode scanning does NOT work on web - it requires native camera APIs.

---

## 💰 Tax Calculation

The app applies an **8% tax rate** on all purchases:
```typescript
const subtotal = getTotal();           // Sum of (price × quantity)
const tax = subtotal * 0.08;           // 8% tax
const total = subtotal + tax;          // Final amount
```

---

## 🔒 Payment Methods

The app supports these payment methods (UI only - actual processing requires backend):

| Method | ID | Icon |
|--------|-----|------|
| Apple Pay | `apple_pay` | Apple logo |
| Google Pay | `google_pay` | Google logo |
| Credit/Debit Card | `card` | Card icon |
| PayPal | `paypal` | PayPal logo |

---

## 📱 QR Code Data Structure

The exit QR code contains this JSON data:
```json
{
  "transactionId": "TXN-1737012345-ABC123XYZ",
  "storeId": "nike",
  "itemCount": 3,
  "timestamp": "2026-01-17T12:00:00.000Z",
  "verified": true
}
```

The store's exit scanner should:
1. Decode the QR code
2. Validate the `transactionId` with the backend
3. Verify `verified: true`
4. Check timestamp is within acceptable window (currently 5 minutes)
5. Allow customer to exit

---

## 🔧 Configuration

### Environment Variables
Currently not used - all config is hardcoded for the hackathon MVP.

For production, consider:
```env
API_BASE_URL=https://api.qless.app
TAX_RATE=0.08
QR_VALIDITY_MINUTES=5
```

### Expo Config (`app.json`)
- Camera permissions configured for iOS and Android
- Portrait orientation only
- Light theme UI style

---

## 🐛 Known Limitations

1. **Web barcode scanning** - Not supported (use mobile device)
2. **Mock API** - All backend calls are simulated with delays
3. **Payment processing** - UI only, no actual transactions
4. **Store inventory** - Only Nike has real products
5. **Offline mode** - Not implemented

---

## 📝 Backend Integration Checklist

When integrating with a real backend:

- [ ] Replace mock API in `src/services/api.ts` with real HTTP calls
- [ ] Implement `/api/scan-barcode` endpoint
- [ ] Implement `/api/checkout` endpoint with payment gateway
- [ ] Add product database with barcode lookup
- [ ] Implement QR code validation for store exit scanners
- [ ] Add user authentication (optional)
- [ ] Add order history (optional)
- [ ] Implement real-time inventory checks (optional)

---

## 👥 Team

Built for NexHacks Hackathon 2026

---

## 📄 License

Private - All rights reserved
