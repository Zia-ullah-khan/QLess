// API Service - Mock implementations for hackathon MVP
// In production, these would call actual backend endpoints

const API_BASE_URL = 'https://api.qless.app'; // Mock URL

import { generatedProductByBarcode } from '../data/products.generated';

// Simulated delay for realistic UX
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock product database (auto-generated Nike trial items + fallback)
const mockProducts: Record<string, { id: string; name: string; price: number; image?: string }> = {
  ...Object.fromEntries(
    Object.entries(generatedProductByBarcode).map(([barcode, p]) => [barcode, { id: p.id, name: p.name, price: p.price, image: p.id }])
  ),
  '5901234123457': { id: '1', name: 'Nike Air Max 90', price: 129.99 },
  '4006381333931': { id: '2', name: 'Under Armour T-Shirt', price: 34.99 },
  '5000159484695': { id: '3', name: 'Protein Bar Pack', price: 12.99 },
  '0012345678905': { id: '4', name: 'Wireless Earbuds', price: 79.99 },
  '8710398513939': { id: '5', name: 'Energy Drink 6-Pack', price: 8.99 },
  '5901234123458': { id: '6', name: 'Running Shorts', price: 45.0 },
  '5901234123459': { id: '7', name: 'Water Bottle', price: 24.99 },
  '5901234123460': { id: '8', name: 'Fitness Tracker', price: 149.99 },
};

export interface ScannedItem {
  id: string;
  name: string;
  price: number;
  barcode: string;
  image?: string;
}

export interface CheckoutResponse {
  success: boolean;
  transactionId: string;
  qrCode: string;
  message: string;
}

// POST /scan-barcode
export const scanBarcode = async (barcode: string): Promise<ScannedItem> => {
  await delay(300); // Simulate network delay
  
  // Only accept known products - no random fallbacks
  const product = mockProducts[barcode];
  
  if (product) {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      barcode,
      image: product.image,
    };
  }
  
  // Unknown barcode - throw error instead of creating random product
  throw new Error(`Unknown product: ${barcode}`);
};

// POST /cart/add
export const addItemToCart = async (
  storeId: string,
  item: ScannedItem
): Promise<{ success: boolean }> => {
  await delay(200);
  console.log(`Adding item ${item.id} to cart for store ${storeId}`);
  return { success: true };
};

// POST /checkout
export const processCheckout = async (
  storeId: string,
  items: Array<{ id: string; quantity: number }>,
  paymentMethod: string
): Promise<CheckoutResponse> => {
  await delay(1500); // Simulate payment processing
  
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Generate QR code data
  const qrData = JSON.stringify({
    transactionId,
    storeId,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    timestamp: new Date().toISOString(),
    verified: true,
  });
  
  return {
    success: true,
    transactionId,
    qrCode: qrData,
    message: 'Payment successful!',
  };
};

// GET /qr-code
export const getQRCode = async (transactionId: string): Promise<{ qrCode: string }> => {
  await delay(300);
  
  const qrData = JSON.stringify({
    transactionId,
    timestamp: new Date().toISOString(),
    verified: true,
  });
  
  return { qrCode: qrData };
};
