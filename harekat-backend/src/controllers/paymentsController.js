import { Op } from 'sequelize';
import { Payments, Users, Orders, OrderItems } from '../models/index.js';
import { PaymentGateway } from '../services/paymentGateway.js';
import { ZibalGateway } from '../services/gateways/ZibalGateway.js';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class PaymentsController {
    /**
     * Student: Initiate checkout payment session with selected gateway
     */
    static async initiatePayment(req, res) {
        const userId = req.user?.id;
        const { orderId, gateway, returnUrl, description } = req.body;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });
        if (!orderId) return res.status(400).json({ ok: false, message: 'orderId is required' });

        try {
            const result = await PaymentGateway.initiatePayment({
                orderId,
                userId,
                gateway,
                callbackUrl: returnUrl,
                description
            });
            return res.status(200).json({ ok: true, data: result });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Public Gateway Callback: Handles return from Zibal IPG
     * Zibal redirects user via GET with query: ?trackId=...&success=1&status=2&orderId=...
     */
    static async handleZibalCallback(req, res) {
        const params = { ...req.query, ...req.body };
        const { trackId, success, status, orderId } = params;

        const acceptsJson = req.headers.accept?.includes('application/json') && !req.headers.accept?.includes('text/html');
        const dashboardBase = (configs.dashboardUrl || 'http://localhost:5173').replace(/\/+$/, '');

        try {
            const result = await PaymentGateway.verifyZibalCallback({
                trackId,
                success,
                status,
                orderId
            });

            const payment = result.payment;
            let resultStatus = 'failed';
            if (result.success) {
                resultStatus = 'success';
            } else if (result.reason === 'cancelled') {
                resultStatus = 'cancelled';
            }

            const redirectParams = new URLSearchParams({
                paymentId: payment?.id || '',
                status: resultStatus,
                trackId: trackId || payment?.trackId || '',
                refNumber: result.refNumber || payment?.transactionId || '',
                message: result.message || ''
            });

            if (acceptsJson) {
                return res.status(200).json({
                    ok: result.success,
                    data: {
                        paymentId: payment?.id,
                        status: resultStatus,
                        refNumber: result.refNumber,
                        trackId,
                        message: result.message
                    }
                });
            }

            const targetUrl = `${dashboardBase}/payments/result?${redirectParams.toString()}`;
            return res.redirect(targetUrl);
        } catch (err) {
            logSecurityEvent('payment_callback_error', {
                error: err.message,
                params
            });

            if (acceptsJson) {
                return res.status(400).json({ ok: false, message: err.message });
            }

            const errorParams = new URLSearchParams({
                status: 'failed',
                trackId: trackId || '',
                orderId: orderId || '',
                message: err.message || 'خطا در پردازش نتیجه تراکنش'
            });

            const targetUrl = `${dashboardBase}/payments/result?${errorParams.toString()}`;
            return res.redirect(targetUrl);
        }
    }

    /**
     * Get real-time status of a payment for the payment result page
     */
    static async getPaymentStatus(req, res) {
        const { id } = req.params; // paymentId or trackId
        const userId = req.user?.id;
        const role = req.user?.role;

        try {
            const payment = await Payments.findOne({
                where: {
                    [Op.or]: [
                        { id },
                        { trackId: id }
                    ]
                },
                include: [
                    {
                        model: Orders,
                        as: 'order',
                        include: [{ model: OrderItems, as: 'items' }]
                    },
                    {
                        model: Users,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
                    }
                ]
            });

            if (!payment) {
                return res.status(404).json({ ok: false, message: 'تراکنش پرداخت یافت نشد' });
            }

            const isAdmin = role === 'admin' || role === 'superadmin';
            if (userId && !isAdmin && payment.userId !== userId) {
                return res.status(403).json({ ok: false, message: 'forbidden' });
            }

            return res.status(200).json({
                ok: true,
                data: {
                    id: payment.id,
                    orderId: payment.orderId,
                    amount: payment.amount,
                    status: payment.status || payment.type,
                    gateway: payment.gateway,
                    trackId: payment.trackId,
                    transactionId: payment.transactionId,
                    cardNumber: payment.cardNumber,
                    description: payment.description,
                    failureReason: payment.failureReason,
                    paidAt: payment.paidAt,
                    createdAt: payment.createdAt,
                    items: payment.order?.items || []
                }
            });
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
                const result = await PaymentGateway.processSuccessfulPayment(paymentId, {
                    transactionId: simulatedTxn,
                    cardNumber: '6037********1234',
                    paidAt: new Date()
                });
                return res.status(200).json({
                    ok: true,
                    message: 'پرداخت با موفقیت انجام شد و دوره‌ها برای شما فعال شدند',
                    data: result
                });
            } else if (action === 'cancel') {
                const result = await PaymentGateway.processCancelledPayment(paymentId, {
                    reason: reason || 'پرداخت توسط کاربر لغو گردید'
                });
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
     * Verify payment (admin simulation or manual verification)
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

            // If it's a Zibal payment and pending, attempt gateway inquiry/verify
            if (payment.gateway === 'zibal' && payment.trackId && payment.status === 'pending') {
                try {
                    const zibalGateway = new ZibalGateway();
                    const verifyResult = await zibalGateway.verifyPayment({ payment, trackId: payment.trackId });
                    if (verifyResult.success) {
                        const result = await PaymentGateway.processSuccessfulPayment(id, {
                            transactionId: verifyResult.transactionId || verifyResult.refNumber,
                            cardNumber: verifyResult.cardNumber,
                            paidAt: verifyResult.paidAt,
                            callbackData: verifyResult.rawResponse
                        });
                        return res.status(200).json({
                            ok: true,
                            message: 'پرداخت با موفقیت از درگاه زیبال استعلام و تایید شد',
                            data: result
                        });
                    }
                } catch (zibalErr) {
                    console.warn('Manual Zibal verification inquiry notice:', zibalErr.message);
                }
            }

            const result = await PaymentGateway.processSuccessfulPayment(id, {
                transactionId: transactionId || payment.transactionId || `TXN-${Date.now()}`,
                metadata
            });

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
                    trackId: p.trackId,
                    transactionId: p.transactionId,
                    cardNumber: p.cardNumber,
                    paidAt: p.paidAt,
                    failureReason: p.failureReason,
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
        const { userId, type, orderId, amount, gateway, transactionId, trackId, status } = req.body;
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
                transactionId: transactionId || null,
                trackId: trackId || null
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
        const { userId, type, status, amount, transactionId, trackId, cardNumber } = req.body;

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
            if (trackId !== undefined) payment.trackId = trackId;
            if (cardNumber !== undefined) payment.cardNumber = cardNumber;

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
