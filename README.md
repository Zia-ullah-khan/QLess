# QLess - Skip the Line, Shop Smarter

A mobile self-checkout solution that allows customers to scan, pay, and go - completely bypassing traditional checkout lines.

## 📁 Project Structure

```
nexhacks/
├── frontend/          # React Native/Expo mobile app
│   ├── README.md      # Detailed frontend documentation
│   ├── src/           # Source code
│   └── ...
│
├── backend/           # Backend API (to be implemented)
│   └── ...
│
└── README.md          # This file
```

## 🚀 Quick Start

### Frontend (Mobile App)

```bash
cd frontend
npm install
npm start
```

See [frontend/README.md](./frontend/README.md) for detailed documentation.

### Backend (API Server)

*To be implemented by backend team*

See the API contract in [frontend/README.md](./frontend/README.md#-api-contract-backend-requirements) for required endpoints.

---

## 📱 App Flow

```
Scan Products → Add to Cart → Pay → Show QR Code → Exit Store
```

## 🔌 Required Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scan-barcode` | POST | Look up product by barcode |
| `/api/checkout` | POST | Process payment and generate QR |
| `/api/qr-code/:id` | GET | Retrieve QR code for transaction |

See [frontend/README.md](./frontend/README.md) for full API specifications.

---

## 👥 Team

Built for NexHacks Hackathon 2026
