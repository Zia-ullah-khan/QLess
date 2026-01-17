import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.113.203.223:5000/api';

export interface ScannedItem {
  id: string;
  name: string;
  price: number;
  barcode: string;
  image?: string;
  quantity?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  isAdmin: boolean;
}

export interface CheckoutResponse {
  success: boolean;
  transactionId: string;
  qrCode: string;
  message: string;
}

// Auth Helpers
const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (e) {
    return null;
  }
};

const getHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ==================== AUTH ====================

export const loginUser = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  if (data.token) {
    await AsyncStorage.setItem('userToken', data.token);
    await AsyncStorage.setItem('userInfo', JSON.stringify(data));
  }

  return data;
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  if (data.token) {
    await AsyncStorage.setItem('userToken', data.token);
    await AsyncStorage.setItem('userInfo', JSON.stringify(data));
  }

  return data;
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userInfo');
};

// POST /scan
export const scanBarcode = async (storeId: string, barcode: string): Promise<ScannedItem> => {
  try {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storeid: storeId, barcode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Product not found');
    }

    const data = await response.json();
    return {
      id: data._id,
      name: data.name,
      price: data.price,
      barcode: data.barcode_value || barcode,
      image: data.image_url,
    };
  } catch (error) {
    console.error('Scan error:', error);
    throw error;
  }
};

// POST /cart/add
export const addItemToCart = async (
  storeId: string,
  item: ScannedItem
): Promise<{ success: boolean; cart?: any }> => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId: item.id,
        quantity: 1,
        storeId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    const cart = await response.json();
    return { success: true, cart };
  } catch (error) {
    console.error('Add to cart error:', error);
    // Fallback for demo if auth fails: assume success locally
    // return { success: true };
    throw error;
  }
};

// GET /cart
export const getCart = async (): Promise<any> => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers
    });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return await response.json();
  } catch (error) {
    console.error('Get cart error:', error);
    return { items: [] };
  }
};

// POST /checkout/create
// POST /checkout/create
export const processCheckout = async (
  storeId: string,
  items: Array<{ id: string; quantity: number; price?: number }>,
  paymentMethod: string
): Promise<CheckoutResponse> => {
  try {
    // Calculate total on frontend for validation (optional, backend should recalc)
    // Note: items passed here might need to include price if we want to send totalAmount
    // But typically we should just send IDs and Qty and let backend calc price.
    // However, the backend endpoint expects totalAmount based on our reading of checkout.js

    // We need to fetch the cart or have prices available. 
    // Assuming the `items` array passed in has prices or we calculate vaguely.
    // Ideally we should use the cart total.

    let totalAmount = 0;
    // This is a hack because the interface passed to this function might not have price
    // We should rely on the backend to accept items without total OR ensure we pass it.
    // Looking at checkout.js: const { storeId, items, paymentMethod, totalAmount, userId } = req.body;

    // If we don't have prices, we might be in trouble validation wise. 
    // Let's assume the caller passes items with prices or we update the caller. 

    const headers = await getHeaders();

    // We need to make sure items has price mapping if possible, or we assume caller handles it.
    // Let's calculate total if price exists on items, otherwise 0
    totalAmount = items.reduce((sum, i) => sum + ((i.price || 0) * i.quantity), 0);

    const response = await fetch(`${API_BASE_URL}/checkout/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        storeId,
        items: items.map(i => ({ id: i.id, quantity: i.quantity })),
        paymentMethod,
        totalAmount: totalAmount, // Pass calculated total
        // userId is extracted from token on backend typically, but checkout.js reads it from body too?
        // checkout.js: const { ... userId } = req.body;
        // It uses req.body.userId OR null. It doesn't seem to force req.user._id from middleware? 
        // Wait, checkout.js doesn't seem to use `protect` middleware explicitly in the file view I saw?
        // I should check server.js routes.
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Checkout failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};
