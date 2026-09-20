import { Orders, OrderItems, Payments, Courses, Coupon } from '../models/index.js';
import { AccessService } from './accessService.js';
import { logSecurityEvent } from '../utils/logger.js';

export class PaymentGateway {
    /**
     * Prepare gateway checkout session (Placeholder for Zarinpal / Mellat / IDPay)
     */
    static async initiatePayment({ orderId, userId, gateway = 'mock', returnUrl = '' }) {
        const order = await Orders.findOne({
            where: { id: orderId, userId },
            include: [{ model: OrderItems, as: 'items' }]
        });

        if (!order) throw new Error('Order not found');
        if (order.status === 'paid') throw new Error('Order is already paid');

        const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        let payment = await Payments.findOne({ where: { orderId: order.id } });
        if (payment) {
            payment.status = 'pending';
            payment.type = 'pending';
            payment.amount = order.finalAmount;
            payment.gateway = gateway;
            payment.transactionId = transactionId;
            await payment.save();
        } else {
            payment = await Payments.create({
                userId,
                orderId: order.id,
                amount: order.finalAmount,
                gateway,
                transactionId,
                status: 'pending',
                type: 'pending'
            });
        }

        order.paymentId = payment.id;
        await order.save();

        logSecurityEvent('payment_initiated', { orderId: order.id, paymentId: payment.id, userId });

        return {
            paymentId: payment.id,
            orderId: order.id,
            amount: order.finalAmount,
            gateway,
            transactionId,
            gatewayUrl: `/checkout/review?orderId=${order.id}&paymentId=${payment.id}`,
            requiresGatewayRedirect: false,
            message: 'Gateway transaction initialized. Awaiting user payment confirmation.'
        };
    }

    /**
     * Process verified successful payment and automatically grant courses / packages / subscriptions
     */
    static async processSuccessfulPayment(paymentId, { transactionId = null, metadata = null } = {}) {
        const payment = await Payments.findByPk(paymentId, {
            include: [{ model: Orders, as: 'order', include: [{ model: OrderItems, as: 'items' }] }]
        });

        if (!payment) throw new Error('Payment not found');
        if (!payment.order) throw new Error('Associated order not found');

        const order = payment.order;
        const userId = order.userId;

        // Update payment & order state
        payment.status = 'paid';
        payment.type = 'paid';
        if (transactionId) payment.transactionId = transactionId;
        if (metadata) payment.metadata = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata;
        await payment.save();

        order.status = 'paid';
        await order.save();

        // Increment coupon usage count if coupon was used
        if (order.couponCode) {
            try {
                const coupon = await Coupon.findOne({ where: { code: order.couponCode } });
                if (coupon) {
                    coupon.usageCount = (coupon.usageCount || 0) + 1;
                    await coupon.save();
                }
            } catch (e) {
                console.warn('Coupon usage count increment warning:', e.message);
            }
        }

        // Automatically grant access based on purchased order items
        for (const item of order.items || []) {
            if (item.productType === 'course') {
                const course = await Courses.findByPk(item.productId);
                if (course && course.kind === 'skill') {
                    // Package course
                    await AccessService.grantPackageAccess({ userId, packageId: item.productId, orderId: order.id });
                } else {
                    // Direct individual course
                    await AccessService.grantCourseAccess({
                        userId,
                        courseId: item.productId,
                        sourceType: 'direct',
                        sourceId: order.id,
                        expiresAt: null
                    });
                }
            } else if (item.productType === 'package') {
                await AccessService.grantPackageAccess({ userId, packageId: item.productId, orderId: order.id });
            } else if (item.productType === 'subscription') {
                await AccessService.grantSubscriptionAccess({ userId, subscriptionId: item.productId, orderId: order.id });
            }
        }

        logSecurityEvent('payment_success', { paymentId: payment.id, orderId: order.id, userId });

        return {
            payment,
            order,
            success: true
        };
    }

    /**
     * Process user-cancelled or failed payment
     */
    static async processCancelledPayment(paymentId, { reason = 'پرداخت توسط کاربر لغو شد' } = {}) {
        const payment = await Payments.findByPk(paymentId, {
            include: [{ model: Orders, as: 'order' }]
        });

        if (!payment) throw new Error('Payment not found');

        payment.status = 'cancelled';
        payment.type = 'cancelled';
        payment.metadata = typeof reason === 'object' ? JSON.stringify(reason) : JSON.stringify({ reason });
        await payment.save();

        if (payment.order) {
            payment.order.status = 'cancelled';
            await payment.order.save();
        }

        logSecurityEvent('payment_cancelled', { paymentId: payment.id, orderId: payment.order?.id, userId: payment.userId });

        return {
            payment,
            order: payment.order,
            success: false
        };
    }
}
