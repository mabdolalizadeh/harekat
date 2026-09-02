import { Payments, Users } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

const PAYMENT_TYPES = ['paid', 'pending', 'failed', 'refunded'];

export default class PaymentsController {
    static async createPayment(req, res) {
        const { userId, type } = req.body;
        if (!userId || !type) {
            return res.status(400).json({ ok: false, message: 'userId and type are required' });
        }
        if (!PAYMENT_TYPES.includes(type)) {
            return res.status(400).json({ ok: false, message: 'type must be one of: paid, pending, failed, refunded' });
        }

        try {
            const user = await Users.findByPk(userId);
            if (!user) {
                return res.status(404).json({ ok: false, message: 'user not found' });
            }

            const payment = await Payments.create({ userId, type });
            const created = await Payments.findByPk(payment.id, { include: { model: Users, as: 'user' } });
            logSecurityEvent('payment_created', { paymentId: payment.id, userId, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getPayments(req, res) {
        try {
            const payments = await Payments.findAll({ include: { model: Users, as: 'user' } });
            return res.status(200).json({ ok: true, data: payments });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getPaymentById(req, res) {
        const { id } = req.params;
        try {
            const payment = await Payments.findByPk(id, { include: { model: Users, as: 'user' } });
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
        const { userId, type } = req.body;

        try {
            const payment = await Payments.findByPk(id);
            if (!payment) {
                return res.status(404).json({ ok: false, message: 'payment not found' });
            }

            if (userId !== undefined) {
                const user = await Users.findByPk(userId);
                if (!user) {
                    return res.status(404).json({ ok: false, message: 'user not found' });
                }
                payment.userId = userId;
            }
            if (type !== undefined) {
                if (!PAYMENT_TYPES.includes(type)) {
                    return res.status(400).json({ ok: false, message: 'type must be one of: paid, pending, failed, refunded' });
                }
                payment.type = type;
            }

            await payment.save();
            const updated = await Payments.findByPk(id, { include: { model: Users, as: 'user' } });
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
