import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi, coursesApi, subscriptionsApi } from '../api/client.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [catalog, setCatalog] = useState({ courses: [], subscriptions: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.get();
      setCart(data);
      setItems(data?.items ?? []);
    } catch (err) {
      setError(err.message);
      setItems([]);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    if (catalog.courses.length && catalog.subscriptions.length) return;
    try {
      const [courses, subscriptions] = await Promise.all([coursesApi.list(), subscriptionsApi.list()]);
      setCatalog({ courses: courses ?? [], subscriptions: subscriptions ?? [] });
    } catch { /* non-fatal */ }
  };

  useEffect(() => { loadCatalog(); refreshCart(); }, []);

  const refresh = () => { refreshCart(); };

  const addItem = async (productId, productType, quantity, price) => {
    try {
      const data = await cartApi.add(productId, productType, quantity, price);
      setCart(data);
      setItems(data?.items ?? []);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const data = await cartApi.updateItem(itemId, quantity);
      setCart(data);
      setItems(data?.items ?? []);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const data = await cartApi.remove(itemId);
      setCart(data);
      setItems(data?.items ?? []);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clear = async () => {
    try {
      const data = await cartApi.clear();
      setCart(data);
      setItems([]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const enrichedItems = useMemo(() => {
    const byId = (list) =>
      list.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
    const courseMap = byId(catalog.courses);
    const subMap = byId(catalog.subscriptions);
    return items.map((it) => {
      const src = it.productType === 'subscription' ? subMap[it.productId] : courseMap[it.productId];
      return {
        ...it,
        productName: src?.name || it.productName || 'محصول',
        productImage: src?.image || it.productImage,
        productPrice: src ? (src.salePrice || src.price) : it.price,
      };
    });
  }, [items, catalog]);

  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const totalPrice = enrichedItems.reduce(
    (sum, it) => sum + Number(String(it.productPrice || it.price || 0).replace(/[,٬\s]/g, '')) * it.quantity,
    0
  );

  const value = useMemo(
    () => ({
      cart,
      items: enrichedItems,
      rawItems: items,
      itemCount,
      totalPrice,
      loading,
      error,
      addItem,
      updateItem,
      removeItem,
      clear,
      refresh,
    }),
    [cart, enrichedItems, loading, error]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
