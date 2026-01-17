import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { registerUser, authUser } from './api/auth.js';
import { scanBarcode } from './api/scan-barcode.js';
import { checkout } from './api/checkout.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.get('/', (req, res) => {
  res.send('Hello from the backend server!');
});

// Auth Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', authUser);

// Business Routes
app.post('/api/scan-barcode', scanBarcode);
app.post('/api/checkout', checkout);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});