import { Payments, Users, Orders, OrderItems } from '../models/index.js';
import { PaymentGateway } from '../services/paymentGateway.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class PaymentsController {
    /**
     * Student: Initiate checkout payment session (Gateway integration placeholder)
     */
    static async initiatePayment(req, res) {
        const userId = req.user?.id;
        const { orderId, gateway = 'mock', returnUrl } = req.body;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });
        if (!orderId) return res.status(400).json({ ok: false, message: 'orderId is required' });

        try {
            const result = await PaymentGateway.initiatePayment({
                orderId,
                userId,
                gateway,
                returnUrl
            });
            return res.status(200).json({ ok: true, data: result });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Fake / Test Payment Gateway process endpoint
     * Handles explicit [ پرداخت ] (pay) and [ لغو پرداخت ] (cancel) actions
     */
    static async processFakePayment(req, res) {
        const userId = req.user?.id;
        const role = req.user?.role;
        const { paymentId, action = 'pay', transactionId, reason } = req.body;

        if (!paymentId) {
            return res.status(400).json({ ok: false, message: 'paymentId is required' });
        }

        try {
            const payment = await Payments.findByPk(paymentId);
            if (!payment) {
                return res.status(404).json({ ok: false, message: 'پرداخت یافت نشد' });
            }

            const isAdmin = role === 'admin' || role === 'superadmin';
            if (!isAdmin && payment.userId !== userId) {
                return res.status(403).json({ ok: false, message: 'forbidden' });
            }

            if (action === 'pay') {
                const simulatedTxn = transactionId || `SIM-${Date.now()}`;
                const result = await PaymentGateway.processSuccessfulPayment(paymentId, { transactionId: simulatedTxn });
                return res.status(200).json({
                    ok: true,
                    message: 'پرداخت با موفقیت انجام شد و دوره‌ها برای شما فعال شدند',
                    data: result
                });
            } else if (action === 'cancel') {
                const result = await PaymentGateway.processCancelledPayment(paymentId, { reason: reason || 'پرداخت توسط کاربر لغو گردید' });
                return res.status(200).json({
                    ok: true,
                    message: 'پرداخت لغو گردید',
                    data: result
                });
            } else {
                return res.status(400).json({ ok: false, message: 'عملیات نامعتبر است (pay یا cancel مجاز است)' });
            }
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Verify payment (e.g. gateway callback placeholder / admin simulation)
     * Automatically grants courses / packages / subscriptions upon verified success
     */
    static async verifyPayment(req, res) {
        const { id } = req.params; // paymentId
        const { transactionId, metadata } = req.body;
        const userId = req.user?.id;
        const role = req.user?.role;

        try {
            const payment = await Payments.findByPk(id);
            if (!payment) {
                return res.status(404).json({ ok: false, message: 'payment not found' });
            }

            const isAdmin = role === 'admin' || role === 'superadmin';
            if (!isAdmin && payment.userId !== userId) {
                return res.status(403).json({ ok: false, message: 'forbidden' });
            }

            const result = await PaymentGateway.processSuccessfulPayment(id, { transactionId, metadata });
            return res.status(200).json({
                ok: true,
                message: 'پرداخت با موفقیت تایید شد و دسترسی‌ها فعال گردیدند',
                data: result
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Get my payment history
     */
    static async getMyPayments(req, res) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const payments = await Payments.findAll({
                where: { userId },
                include: [
                    {
                        model: Orders,
                        as: 'order',
                        include: [{ model: OrderItems, as: 'items' }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const formatted = payments.map((p) => {
                const order = p.order;
                const productNames = order?.items?.map((item) => item.productName || item.productId).join(', ') || 'سفارش دوره';
                return {
                    id: p.id,
                    orderId: p.orderId,
                    amount: p.amount || order?.finalAmount || '0',
                    product: productNames,
                    status: p.status || p.type,
                    gateway: p.gateway,
                    transactionId: p.transactionId,
                    date: p.createdAt,
                    items: order?.items || []
                };
            });

            return res.status(200).json({ ok: true, data: formatted });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async createPayment(req, res) {
        const { userId, type, orderId, amount, gateway, transactionId, status } = req.body;
        if (!userId) {
            return res.status(400).json({ ok: false, message: 'userId is required' });
        }

        try {
            const user = await Users.findByPk(userId);
            if (!user) {
                return res.status(404).json({ ok: false, message: 'user not found' });
            }

            const payment = await Payments.create({
                userId,
                type: type || 'pending',
                status: status || type || 'pending',
                orderId: orderId || null,
                amount: amount ? String(amount) : null,
                gateway: gateway || 'mock',
                transactionId: transactionId || null
            });

            const created = await Payments.findByPk(payment.id, {
                include: [
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Orders, as: 'order' }
                ]
            });

            logSecurityEvent('payment_created', { paymentId: payment.id, userId, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getPayments(req, res) {
        try {
            const payments = await Payments.findAll({
                include: [
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Orders, as: 'order', include: [{ model: OrderItems, as: 'items' }] }
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: payments });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getPaymentById(req, res) {
        const { id } = req.params;
        try {
            const payment = await Payments.findByPk(id, {
                include: [
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Orders, as: 'order', include: [{ model: OrderItems, as: 'items' }] }
                ]
            });
            if (!payment) {
                return res.status(404).json({ ok: false, message: 'payment not found' });
            }
            return res.status(200).json({ ok: true, data: payment });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updatePayment(req, res) {
        const { id } = req.params;
        const { userId, type, status, amount, transactionId } = req.body;

        try {
            const payment = await Payments.findByPk(id);
            if (!payment) {
                return res.status(404).json({ ok: false, message: 'payment not found' });
            }

            if (userId !== undefined) payment.userId = userId;
            if (type !== undefined) payment.type = type;
            if (status !== undefined) payment.status = status;
            if (amount !== undefined) payment.amount = String(amount);
            if (transactionId !== undefined) payment.transactionId = transactionId;

            await payment.save();

            // If updated to 'paid', trigger automatic access provisioning
            if (status === 'paid' || type === 'paid') {
                try {
                    await PaymentGateway.processSuccessfulPayment(payment.id, { transactionId: payment.transactionId });
                } catch (e) {
                    console.warn('Auto access grant on payment update warning:', e.message);
                }
            }

            const updated = await Payments.findByPk(id, {
                include: [
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Orders, as: 'order' }
                ]
            });

            logSecurityEvent('payment_updated', { paymentId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async deletePayment(req, res) {
        const { id } = req.params;
        try {
            const payment = await Payments.findByPk(id);
            if (!payment) {
                return res.status(404).json({ ok: false, message: 'payment not found' });
            }
            await payment.destroy();
            logSecurityEvent('payment_deleted', { paymentId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'payment deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
