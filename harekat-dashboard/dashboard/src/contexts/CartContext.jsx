import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi.js';
import { ordersApi } from '../api/ordersApi.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [error, setError] = useState(null);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res?.ok && res.data) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.warn('Failed to load cart:', err);
      // Cart might be empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, isAuthenticated]);

  const addToCart = async (productId, productType, quantity, price) => {
    try {
      setLoading(true);
      setError(null);
      const res = await cartApi.addToCart(productId, productType, quantity, price);
      if (res?.ok && res.data) {
        setItems(res.data.items || []);
        setIsDrawerOpen(true); // Open drawer on adding item
        return res.data;
      }
    } catch (err) {
      setError(err.message || 'خطا در افزودن به سبد خرید');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const res = await cartApi.updateCartItem(itemId, quantity);
      if (res?.ok && res.data) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      setError(err.message || 'خطا در به‌روزرسانی سبد خرید');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      const res = await cartApi.removeFromCart(itemId);
      if (res?.ok && res.data) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      setError(err.message || 'خطا در حذف آیتم');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartApi.clearCart();
      setItems([]);
    } catch (err) {
      setError(err.message || 'خطا در پاکسازی سبد');
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (couponCode) => {
    if (!isAuthenticated) {
      throw new Error('برای ثبت سفارش لطفاً ابتدا وارد شوید');
    }
    try {
      setLoading(true);
      const res = await ordersApi.createOrder(couponCode);
      if (res?.ok && res.data) {
        setItems([]);
        setIsDrawerOpen(false);
        // Refresh user profile so new courses are immediately available
        refreshUser();
        return res.data;
      }
      throw new Error(res?.message || 'خطا در ثبت سفارش');
    } catch (err) {
      setError(err.message || 'خطا در ثبت سفارش');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const itemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalAmount = items.reduce((acc, item) => {
    const p = Number(String(item.price).replace(/[,٬\s]/g, '')) || 0;
    return acc + p * (item.quantity || 1);
  }, 0);

  const value = {
    items,
    itemCount,
    totalAmount,
    loading,
    error,
    isDrawerOpen,
    openCart: () => setIsDrawerOpen(true),
    closeCart: () => setIsDrawerOpen(false),
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}

export default CartContext;
