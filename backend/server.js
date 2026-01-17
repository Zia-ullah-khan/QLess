import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend server!');
});
app.get('/api/scan-barcode', scanBarcode);
app.get('/api/checkout', checkout);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});