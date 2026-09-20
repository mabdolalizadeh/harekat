import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerApi, token } from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            const res = await customerApi.getCart();
            if (res?.ok && res.data) {
                setCart(res.data);
            } else if (res?.data) {
                setCart(res.data);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to load cart:', err);
            setError(err.message || 'خطا در بارگذاری سبد خرید');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
        const interval = setInterval(fetchCart, 30000);
        const onStorage = (e) => {
            if (e.key === 'token' || e.key === 'cartSessionId') {
                fetchCart();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', onStorage);
        };
    }, [fetchCart]);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

    const addToCart = useCallback(async (productId, productType = 'course', quantity = 1, price = null) => {
        try {
            setLoading(true);
            const res = await customerApi.addToCart(productId, productType, quantity, price);
            if (res?.ok && res.data) {
                setCart(res.data);
            } else {
                await fetchCart();
            }
            setIsOpen(true);
            return { success: true, data: res?.data };
        } catch (err) {
            console.error('Failed to add to cart:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [fetchCart]);

    const updateQuantity = useCallback(async (itemId, quantity) => {
        if (quantity < 1) return;
        try {
            setLoading(true);
            const res = await customerApi.updateCartItem(itemId, quantity);
            if (res?.ok && res.data) {
                setCart(res.data);
            } else {
                await fetchCart();
            }
        } catch (err) {
            console.error('Failed to update cart quantity:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchCart]);

    const removeItem = useCallback(async (itemId) => {
        try {
            setLoading(true);
            const res = await customerApi.removeFromCart(itemId);
            if (res?.ok && res.data) {
                setCart(res.data);
            } else {
                await fetchCart();
            }
        } catch (err) {
            console.error('Failed to remove cart item:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchCart]);

    const clearCart = useCallback(async () => {
        try {
            setLoading(true);
            await customerApi.clearCart();
            setCart({ items: [] });
        } catch (err) {
            console.error('Failed to clear cart:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const items = cart?.items || [];
    const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const subtotal = items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                items,
                itemCount,
                subtotal,
                isOpen,
                loading,
                error,
                openCart,
                closeCart,
                toggleCart,
                fetchCart,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
