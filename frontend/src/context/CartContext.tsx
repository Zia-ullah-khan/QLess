import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  image?: string; // Product image identifier
}

export interface Store {
  id: string;
  name: string;
  logo: string;
}

interface CartContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  transactionId: string | null;
  setTransactionId: (id: string | null) => void;
  qrCode: string | null;
  setQrCode: (code: string | null) => void;
}

import { addItemToCart, getCart } from '../services/api';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Clear cart when store changes (optional, but good practice if carts are per-store)
  // Logic from backend: cart is per-store
  // For now, we just keep local state

  React.useEffect(() => {
    const loadCart = async () => {
      try {
        const cartData = await getCart();
        if (cartData && cartData.items) {
          // Map backend items to frontend CartItem
          const mappedItems: CartItem[] = cartData.items.map((item: any) => ({
            id: item.product_id._id || item.product_id.id,
            name: item.product_id.name,
            price: item.product_id.price,
            image: item.product_id.image_url,
            quantity: item.qty,
            barcode: item.product_id.barcode_value || item.product_id.barcode || '',
          }));
          setCartItems(mappedItems);

          // Restore selected store if available
          if (cartData.store_id) {
            setSelectedStore({
              id: cartData.store_id._id || cartData.store_id.id,
              name: cartData.store_id.name,
              logo: cartData.store_id.logo_url || cartData.store_id.logo,
            });
          }
        }
      } catch (error) {
        console.log('No active cart or user not logged in');
      }
    };
    loadCart();
  }, []);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    // Optimistic update
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });

    try {
      if (selectedStore) {
        await addItemToCart(selectedStore.id, item);
        // We could update state from server response here, but let's stick to optimistic for smoothness
        // and because server response mapping requires care
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      // Could show toast or rollback here
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setTransactionId(null);
    setQrCode(null);
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        selectedStore,
        setSelectedStore,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        transactionId,
        setTransactionId,
        qrCode,
        setQrCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
