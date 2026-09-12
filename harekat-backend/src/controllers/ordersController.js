import { Orders, OrderItems, Cart, CartItem, Users, Courses, Subscriptions, Payments } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

function parsePrice(value) {
    if (value === null || value === undefined || value === '') return 0;
    const n = Number(String(value).replace(/[,٬\s]/g, ''));
    return Number.isFinite(n) ? n : 0;
}

export default class OrdersController {
    static async createOrder(req, res) {
        const userId = req.user?.id;
        const { couponCode } = req.body;

        if (!userId) {
            return res.status(401).json({ ok: false, message: 'authentication required' });
        }

        try {
            const cart = await Cart.findOne({ where: { userId }, include: [{ model: CartItem, as: 'items' }] });
            if (!cart || !cart.items || cart.items.length === 0) {
                return res.status(400).json({ ok: false, message: 'سبد خرید خالی است' });
            }

            let subtotal = 0;
            for (const item of cart.items) {
                subtotal += parsePrice(item.price) * item.quantity;
            }

            let discountAmount = 0;
            if (couponCode) {
                // Coupon validation would go here
                // For now, skip coupon logic
            }

            const finalAmount = subtotal - discountAmount;

            const order = await Orders.create({
                userId,
                status: 'pending',
                totalAmount: String(subtotal),
                discountAmount: String(discountAmount),
                finalAmount: String(finalAmount),
                couponCode: couponCode ?? null
            });

            for (const item of cart.items) {
                let productName = '';
                let productImage = '';
                if (item.productType === 'course') {
                    const course = await Courses.findByPk(item.productId);
                    if (course) {
                        productName = course.name;
                        productImage = course.image;
                    }
                } else if (item.productType === 'subscription') {
                    const sub = await Subscriptions.findByPk(item.productId);
                    if (sub) {
                        productName = sub.name;
                        productImage = sub.image;
                    }
                }

                await OrderItems.create({
                    orderId: order.id,
                    productId: item.productId,
                    productType: item.productType,
                    quantity: item.quantity,
                    price: item.price,
                    productName,
                    productImage
                });
            }

            await CartItem.destroy({ where: { cartId: cart.id } });

            const createdOrder = await Orders.findByPk(order.id, { include: [{ model: OrderItems, as: 'items' }] });
            logSecurityEvent('order_created', { orderId: order.id, userId, requesterId: userId, ip: req.ip });
            return res.status(201).json({ ok: true, data: createdOrder });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getOrders(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ ok: false, message: 'authentication required' });
        }

        try {
            const orders = await Orders.findAll({
                where: { userId },
                include: [{ model: OrderItems, as: 'items' }],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: orders });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getOrderById(req, res) {
        const userId = req.user?.id;
        const { id } = req.params;

        try {
            const order = await Orders.findOne({
                where: { id, userId },
                include: [{ model: OrderItems, as: 'items' }]
            });
            if (!order) {
                return res.status(404).json({ ok: false, message: 'order not found' });
            }
            return res.status(200).json({ ok: true, data: order });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updateOrderStatus(req, res) {
        const { id } = req.params;
        const { status, paymentId } = req.body;

        const validStatuses = ['pending', 'paid', 'failed', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ ok: false, message: 'invalid status' });
        }

        try {
            const order = await Orders.findByPk(id);
            if (!order) {
                return res.status(404).json({ ok: false, message: 'order not found' });
            }

            order.status = status;
            if (paymentId !== undefined) order.paymentId = paymentId;
            await order.save();

            const updated = await Orders.findByPk(id, { include: [{ model: OrderItems, as: 'items' }] });
            logSecurityEvent('order_status_updated', { orderId: id, status, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}