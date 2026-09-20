import { Orders, OrderItems, Cart, CartItem, Users, Courses, Subscriptions, Payments, Coupon } from '../models/index.js';
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

            // Fetch canonical products and calculate subtotal securely
            let subtotal = 0;
            const itemsData = [];

            for (const item of cart.items) {
                let canonicalPrice = '0';
                let productName = '';
                let productImage = '';

                if (item.productType === 'course') {
                    const course = await Courses.findByPk(item.productId);
                    if (course) {
                        canonicalPrice = course.salePrice || course.price;
                        productName = course.name;
                        productImage = course.image;
                    }
                } else if (item.productType === 'subscription') {
                    const sub = await Subscriptions.findByPk(item.productId);
                    if (sub) {
                        canonicalPrice = sub.salePrice || sub.price;
                        productName = sub.name;
                        productImage = sub.image;
                    }
                }

                const priceNum = parsePrice(canonicalPrice);
                const quantity = Math.max(1, item.quantity || 1);
                subtotal += priceNum * quantity;

                itemsData.push({
                    productId: item.productId,
                    productType: item.productType,
                    quantity,
                    price: String(priceNum),
                    productName: productName || item.productName || 'دوره حرکت',
                    productImage: productImage || item.productImage || null
                });
            }

            // Server-side coupon discount calculation (MED-07)
            let discountAmount = 0;
            let appliedCouponCode = null;

            if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
                const code = couponCode.trim();
                const coupon = await Coupon.findOne({ where: { code, isActive: true } });

                if (coupon) {
                    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                    const isOverLimit = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;
                    const isUnderMinAmount = coupon.minimumOrderAmount && subtotal < Number(coupon.minimumOrderAmount);

                    if (!isExpired && !isOverLimit && !isUnderMinAmount) {
                        if (coupon.discountType === 'percent') {
                            discountAmount = Math.round((subtotal * Number(coupon.discountValue)) / 100);
                        } else if (coupon.discountType === 'fixed') {
                            discountAmount = Math.min(subtotal, Math.round(Number(coupon.discountValue)));
                        }
                        appliedCouponCode = code;
                    }
                }
            }

            const finalAmount = Math.max(0, subtotal - discountAmount);

            const order = await Orders.create({
                userId,
                status: 'pending',
                totalAmount: String(subtotal),
                discountAmount: String(discountAmount),
                finalAmount: String(finalAmount),
                couponCode: appliedCouponCode
            });

            for (const item of itemsData) {
                await OrderItems.create({
                    orderId: order.id,
                    productId: item.productId,
                    productType: item.productType,
                    quantity: item.quantity,
                    price: item.price,
                    productName: item.productName,
                    productImage: item.productImage
                });
            }

            // Initialize pending payment entry for this order
            const payment = await Payments.create({
                userId,
                orderId: order.id,
                amount: String(finalAmount),
                status: 'pending',
                type: 'pending',
                gateway: 'mock'
            });

            order.paymentId = payment.id;
            await order.save();

            // Clear user's cart
            await CartItem.destroy({ where: { cartId: cart.id } });

            const createdOrder = await Orders.findByPk(order.id, {
                include: [
                    { model: OrderItems, as: 'items' },
                    { model: Payments, as: 'payment' }
                ]
            });

            logSecurityEvent('order_created', { orderId: order.id, paymentId: payment.id, userId, requesterId: userId, ip: req.ip });
            return res.status(201).json({ ok: true, data: createdOrder });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getOrders(req, res) {
        const userId = req.user?.id;
        const role = req.user?.role;
        if (!userId) {
            return res.status(401).json({ ok: false, message: 'authentication required' });
        }

        try {
            let whereClause = { userId };
            if (role === 'admin' || role === 'superadmin') {
                whereClause = req.query.userId ? { userId: req.query.userId } : {};
            }

            const orders = await Orders.findAll({
                where: whereClause,
                include: [
                    { model: OrderItems, as: 'items' },
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Payments, as: 'payment' }
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: orders });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getOrderById(req, res) {
        const userId = req.user?.id;
        const role = req.user?.role;
        const { id } = req.params;

        try {
            const whereClause = (role === 'admin' || role === 'superadmin') ? { id } : { id, userId };
            const order = await Orders.findOne({
                where: whereClause,
                include: [
                    { model: OrderItems, as: 'items' },
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Payments, as: 'payment' }
                ]
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

            const updated = await Orders.findByPk(id, {
                include: [
                    { model: OrderItems, as: 'items' },
                    { model: Payments, as: 'payment' }
                ]
            });
            logSecurityEvent('order_status_updated', { orderId: id, status, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}