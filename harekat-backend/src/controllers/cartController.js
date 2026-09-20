import { Cart, CartItem, Users, Courses, Subscriptions } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

function getSessionId(req) {
    return req.headers['x-session-id'] || req.query?.sessionId || req.body?.sessionId || null;
}

export default class CartController {
    static async getOrCreateCart(req, res) {
        const userId = req.user?.id;
        const sessionId = getSessionId(req);

        try {
            let cart;
            if (userId) {
                cart = await Cart.findOne({ where: { userId } });
                if (!cart) {
                    cart = await Cart.create({ userId });
                }

                // If guest session cart exists, merge items into user cart
                if (sessionId) {
                    const guestCart = await Cart.findOne({ where: { sessionId } });
                    if (guestCart && guestCart.id !== cart.id) {
                        const guestItems = await CartItem.findAll({ where: { cartId: guestCart.id } });
                        for (const gItem of guestItems) {
                            const existing = await CartItem.findOne({
                                where: { cartId: cart.id, productId: gItem.productId, productType: gItem.productType }
                            });
                            if (existing) {
                                existing.quantity += gItem.quantity;
                                await existing.save();
                            } else {
                                await CartItem.create({
                                    cartId: cart.id,
                                    productId: gItem.productId,
                                    productType: gItem.productType,
                                    quantity: gItem.quantity,
                                    price: gItem.price
                                });
                            }
                        }
                        await CartItem.destroy({ where: { cartId: guestCart.id } });
                        await guestCart.destroy();
                    }
                }
            } else if (sessionId) {
                cart = await Cart.findOne({ where: { sessionId } });
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
        const sessionId = getSessionId(req);
        const { productId, productType, quantity } = req.body;

        if (!productId || !productType) {
            return res.status(400).json({ ok: false, message: 'productId and productType are required' });
        }

        if (!['course', 'subscription'].includes(productType)) {
            return res.status(400).json({ ok: false, message: 'productType must be course or subscription' });
        }

        try {
            // Determine canonical server-side price from database
            let canonicalPrice = '0';
            let productName = '';
            let productImage = '';

            if (productType === 'course') {
                const course = await Courses.findByPk(productId);
                if (!course) {
                    return res.status(404).json({ ok: false, message: 'course not found' });
                }
                canonicalPrice = course.salePrice || course.price;
                productName = course.name;
                productImage = course.image;
            } else if (productType === 'subscription') {
                const sub = await Subscriptions.findByPk(productId);
                if (!sub) {
                    return res.status(404).json({ ok: false, message: 'subscription not found' });
                }
                canonicalPrice = sub.salePrice || sub.price;
                productName = sub.name;
                productImage = sub.image;
            }

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

            const qty = Math.max(1, parseInt(quantity, 10) || 1);

            if (existingItem) {
                existingItem.quantity += qty;
                existingItem.price = canonicalPrice;
                await existingItem.save();
            } else {
                existingItem = await CartItem.create({
                    cartId: cart.id,
                    productId,
                    productType,
                    quantity: qty,
                    price: canonicalPrice
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
        const sessionId = getSessionId(req);
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
        const sessionId = getSessionId(req);
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
        const sessionId = getSessionId(req);

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