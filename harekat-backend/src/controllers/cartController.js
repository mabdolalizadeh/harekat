import { Cart, CartItem, Users, Courses, Subscriptions } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class CartController {
    static async getOrCreateCart(req, res) {
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;

        try {
            let cart;
            if (userId) {
                cart = await Cart.findOne({ where: { userId }, include: [{ model: CartItem, as: 'items' }] });
                if (!cart) {
                    cart = await Cart.create({ userId });
                }
            } else if (sessionId) {
                cart = await Cart.findOne({ where: { sessionId }, include: [{ model: CartItem, as: 'items' }] });
                if (!cart) {
                    cart = await Cart.create({ sessionId });
                }
            } else {
                return res.status(400).json({ ok: false, message: 'userId or sessionId required' });
            }

            const items = await CartItem.findAll({ where: { cartId: cart.id } });
            return res.status(200).json({ ok: true, data: { ...cart.toJSON(), items } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async addToCart(req, res) {
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;
        const { productId, productType, quantity, price } = req.body;

        if (!productId || !productType || !price) {
            return res.status(400).json({ ok: false, message: 'productId, productType, and price are required' });
        }

        if (!['course', 'subscription'].includes(productType)) {
            return res.status(400).json({ ok: false, message: 'productType must be course or subscription' });
        }

        try {
            let cart;
            if (userId) {
                cart = await Cart.findOne({ where: { userId } });
                if (!cart) cart = await Cart.create({ userId });
            } else if (sessionId) {
                cart = await Cart.findOne({ where: { sessionId } });
                if (!cart) cart = await Cart.create({ sessionId });
            } else {
                return res.status(400).json({ ok: false, message: 'userId or sessionId required' });
            }

            let existingItem = await CartItem.findOne({
                where: { cartId: cart.id, productId, productType }
            });

            if (existingItem) {
                existingItem.quantity += quantity || 1;
                existingItem.price = price;
                await existingItem.save();
            } else {
                existingItem = await CartItem.create({
                    cartId: cart.id,
                    productId,
                    productType,
                    quantity: quantity || 1,
                    price
                });
            }

            const items = await CartItem.findAll({ where: { cartId: cart.id } });
            logSecurityEvent('cart_item_added', { cartId: cart.id, productId, productType, requesterId: userId, ip: req.ip });
            return res.status(200).json({ ok: true, data: { ...cart.toJSON(), items } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updateCartItem(req, res) {
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 1) {
            return res.status(400).json({ ok: false, message: 'quantity must be >= 1' });
        }

        try {
            let cart;
            if (userId) {
                cart = await Cart.findOne({ where: { userId } });
            } else if (sessionId) {
                cart = await Cart.findOne({ where: { sessionId } });
            } else {
                return res.status(400).json({ ok: false, message: 'userId or sessionId required' });
            }

            if (!cart) {
                return res.status(404).json({ ok: false, message: 'cart not found' });
            }

            const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
            if (!item) {
                return res.status(404).json({ ok: false, message: 'cart item not found' });
            }

            item.quantity = quantity;
            await item.save();

            const items = await CartItem.findAll({ where: { cartId: cart.id } });
            logSecurityEvent('cart_item_updated', { cartId: cart.id, itemId, quantity, requesterId: userId, ip: req.ip });
            return res.status(200).json({ ok: true, data: { ...cart.toJSON(), items } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async removeFromCart(req, res) {
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;
        const { itemId } = req.params;

        try {
            let cart;
            if (userId) {
                cart = await Cart.findOne({ where: { userId } });
            } else if (sessionId) {
                cart = await Cart.findOne({ where: { sessionId } });
            } else {
                return res.status(400).json({ ok: false, message: 'userId or sessionId required' });
            }

            if (!cart) {
                return res.status(404).json({ ok: false, message: 'cart not found' });
            }

            const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
            if (!item) {
                return res.status(404).json({ ok: false, message: 'cart item not found' });
            }

            await item.destroy();

            const items = await CartItem.findAll({ where: { cartId: cart.id } });
            logSecurityEvent('cart_item_removed', { cartId: cart.id, itemId, requesterId: userId, ip: req.ip });
            return res.status(200).json({ ok: true, data: { ...cart.toJSON(), items } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async clearCart(req, res) {
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;

        try {
            let cart;
            if (userId) {
                cart = await Cart.findOne({ where: { userId } });
            } else if (sessionId) {
                cart = await Cart.findOne({ where: { sessionId } });
            } else {
                return res.status(400).json({ ok: false, message: 'userId or sessionId required' });
            }

            if (!cart) {
                return res.status(200).json({ ok: true, data: { items: [] } });
            }

            await CartItem.destroy({ where: { cartId: cart.id } });
            logSecurityEvent('cart_cleared', { cartId: cart.id, requesterId: userId, ip: req.ip });
            return res.status(200).json({ ok: true, data: { ...cart.toJSON(), items: [] } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}