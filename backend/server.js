import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { registerUser, authUser, logout, getCurrentUser } from './api/auth.js';
import { scanBarcode } from './api/scan-barcode.js';
import { checkout } from './api/checkout.js';
import { generateQRForTransaction } from './api/qr-code.js';
import { getStores, getStoreById, getStoreProducts } from './api/stores.js';
import { addToCart, getCart, updateCartItem, deleteCartItem } from './api/cart.js';
import { getTransaction, getTransactionItems, getTransactionQR } from './api/transactions.js';
import { confirmPayment } from './api/payment.js';
import { createPaymentSheet } from './api/stripe-payment.js';
import { verifyQRCode } from './api/verify.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createStore, createProduct, updateProduct, deleteProduct } from './api/admin.js';
import { healthCheck, getVersion } from './api/health.js';
import { protect, admin } from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Hello from the backend server!');
});

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', authUser);
app.post('/api/auth/logout', protect, logout);
app.get('/api/auth/me', protect, getCurrentUser);

// ==================== STORE ROUTES ====================
app.get('/api/stores', getStores);
app.get('/api/stores/:id', getStoreById);
app.get('/api/stores/:id/products', getStoreProducts);

// ==================== CART ROUTES (Protected) ====================
app.post('/api/cart/add', protect, addToCart);
app.get('/api/cart', protect, getCart);
app.patch('/api/cart/item', protect, updateCartItem);
app.delete('/api/cart/item', protect, deleteCartItem);

// ==================== SCAN & CHECKOUT ====================
app.post('/api/scan', scanBarcode);
app.post('/api/checkout/create', protect, checkout);
app.post('/api/payment/sheet', createPaymentSheet);
app.post('/api/verify-qr', verifyQRCode);
app.post('/api/payment/confirm', confirmPayment);

// ==================== TRANSACTION ROUTES ====================
app.get('/api/transaction/:id', getTransaction);
app.get('/api/transaction/:id/items', getTransactionItems);
app.get('/api/transaction/:id/qr', getTransactionQR);

// ==================== VERIFICATION ROUTES ====================
// app.post('/api/verify/qr', verifyQR);
// app.get('/api/verify/transaction/:id', getTransactionForVerification);

// ==================== ADMIN ROUTES (Protected) ====================
app.post('/api/admin/store', protect, admin, createStore);
app.post('/api/admin/product', protect, admin, createProduct);
app.patch('/api/admin/product/:id', protect, admin, updateProduct);
app.delete('/api/admin/product/:id', protect, admin, deleteProduct);

// ==================== HEALTH & UTILITY ====================
app.get('/api/health', healthCheck);
app.get('/api/version', getVersion);

// Legacy QR generation endpoint (can be removed if not needed)
app.get('/api/generate-qr', async (req, res) => {
  try {
    const { transactionId, storeId, itemCount, timestamp } = req.body;
    const qrCode = await generateQRForTransaction(123, '123', 5, new Date());
    res.setHeader('Content-Type', 'image/png');
    const img = Buffer.from(qrCode.split(",")[1], 'base64');
    res.send(img);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});