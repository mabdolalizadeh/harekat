import { Orders, OrderItems, Payments, Courses, Coupon, sequelize } from '../models/index.js';
import { AccessService } from './accessService.js';
import { FakeGateway } from './gateways/FakeGateway.js';
import { ZibalGateway } from './gateways/ZibalGateway.js';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';

export class PaymentGateway {
    /**
     * Resolve gateway adapter instance by name or default config
     * @param {string} [gatewayName]
     * @returns {BaseGateway}
     */
    static getGateway(gatewayName) {
        const normalized = String(gatewayName || configs.paymentGateway || 'mock').trim().toLowerCase();
        if (normalized === 'zibal') {
            return new ZibalGateway();
        }
        return new FakeGateway();
    }

    /**
     * Prepare gateway checkout session and store pending payment
     * The price is ALWAYS authoritatively resolved from the database order.
     */
    static async initiatePayment({ orderId, userId, gateway, callbackUrl, description }) {
        const order = await Orders.findOne({
            where: { id: orderId, userId },
            include: [{ model: OrderItems, as: 'items' }]
        });

        if (!order) throw new Error('Order not found');
        if (order.status === 'paid') throw new Error('Order is already paid');

        const activeGateway = this.getGateway(gateway);
        const resolvedGatewayName = activeGateway.getName();

        // Authoritative amount from database order
        const finalAmountStr = String(order.finalAmount);

        let payment = await Payments.findOne({ where: { orderId: order.id } });
        if (payment) {
            payment.status = 'pending';
            payment.type = 'pending';
            payment.amount = finalAmountStr;
            payment.gateway = resolvedGatewayName;
            payment.failureReason = null;
            await payment.save();
        } else {
            payment = await Payments.create({
                userId,
                orderId: order.id,
                amount: finalAmountStr,
                gateway: resolvedGatewayName,
                status: 'pending',
                type: 'pending'
            });
        }

        order.paymentId = payment.id;
        await order.save();

        const defaultDescription = `پرداخت سفارش #${order.id.slice(0, 8)} در آکادمی حرکت`;

        // Request payment from gateway driver
        const gatewayResult = await activeGateway.createPayment({
            payment,
            order,
            user: { id: userId },
            callbackUrl,
            description: description || defaultDescription
        });

        // Store returned trackId
        if (gatewayResult.trackId) {
            payment.trackId = String(gatewayResult.trackId);
            await payment.save();
        }

        logSecurityEvent('payment_initiated', {
            orderId: order.id,
            paymentId: payment.id,
            userId,
            gateway: resolvedGatewayName,
            trackId: payment.trackId
        });

        return {
            paymentId: payment.id,
            orderId: order.id,
            amount: payment.amount,
            gateway: resolvedGatewayName,
            trackId: payment.trackId,
            redirectUrl: gatewayResult.redirectUrl || null,
            requiresGatewayRedirect: Boolean(gatewayResult.requiresGatewayRedirect),
            message: gatewayResult.requiresGatewayRedirect
                ? 'در حال انتقال به درگاه پرداخت زیبال...'
                : 'جلسه تراکنش درگاه آزمایشی ایجاد شد.'
        };
    }

    /**
     * Handle incoming callback from Zibal IPG
     * Validates callback params, queries Zibal verify, ensures amount match,
     * and performs idempotent status transition.
     */
    static async verifyZibalCallback({ trackId, success, status, orderId }) {
        if (!trackId) {
            throw new Error('پارامتر trackId در کال‌بک الزامی است');
        }

        const cleanTrackId = String(trackId).trim();
        let payment = await Payments.findOne({
            where: { trackId: cleanTrackId },
            include: [{ model: Orders, as: 'order', include: [{ model: OrderItems, as: 'items' }] }]
        });

        // Fallback search by orderId if trackId index is delayed
        if (!payment && orderId) {
            payment = await Payments.findOne({
                where: { orderId: String(orderId) },
                include: [{ model: Orders, as: 'order', include: [{ model: OrderItems, as: 'items' }] }]
            });
        }

        if (!payment) {
            logSecurityEvent('payment_callback_not_found', { trackId: cleanTrackId, orderId });
            throw new Error(`تراکنش با شناسه پیگیری ${cleanTrackId} یافت نشد`);
        }

        // Idempotency: If payment was already verified and marked as PAID, do not reprocess
        if (payment.status === 'paid' || payment.type === 'paid') {
            logSecurityEvent('payment_callback_already_paid', {
                paymentId: payment.id,
                trackId: cleanTrackId,
                orderId: payment.orderId
            });
            return {
                payment,
                success: true,
                alreadyPaid: true,
                refNumber: payment.transactionId,
                message: 'این تراکنش قبلاً با موفقیت تایید و پرداخت شده است.'
            };
        }

        // Check if user cancelled or transaction failed before reaching bank
        const isUserCancelled = success === '0' || success === 0 || String(status) === '3';
        if (isUserCancelled) {
            await this.processCancelledPayment(payment.id, {
                reason: 'پرداخت توسط کاربر در درگاه زیبال لغو گردید',
                callbackData: { trackId: cleanTrackId, success, status, orderId }
            });
            return {
                payment,
                success: false,
                reason: 'cancelled',
                message: 'پرداخت در درگاه بانکی لغو گردید.'
            };
        }

        // Call Zibal verify endpoint
        const zibalGateway = new ZibalGateway();
        const verifyResult = await zibalGateway.verifyPayment({
            payment,
            trackId: cleanTrackId,
            callbackParams: { trackId: cleanTrackId, success, status, orderId }
        });

        if (!verifyResult.success) {
            await this.processCancelledPayment(payment.id, {
                reason: verifyResult.message || 'خطا در تایید تراکنش با درگاه زیبال',
                callbackData: verifyResult
            });
            return {
                payment,
                success: false,
                reason: 'verification_failed',
                message: verifyResult.message || 'تایید تراکنش با درگاه ناموفق بود.'
            };
        }

        // Strict Amount Validation: verified amount in Tomans must match stored payment amount
        const expectedAmount = Number(String(payment.amount).replace(/[,٬\s]/g, ''));
        const verifiedAmount = Number(verifyResult.verifiedAmount);

        if (!Number.isFinite(verifiedAmount) || verifiedAmount !== expectedAmount) {
            const mismatchReason = `مغایرت مبلغ پرداختی: مبلغ تاییدشده درگاه (${verifiedAmount} تومان) با مبلغ سفارش (${expectedAmount} تومان) همخوانی ندارد.`;
            logSecurityEvent('payment_amount_mismatch', {
                paymentId: payment.id,
                orderId: payment.orderId,
                expectedAmount,
                verifiedAmount
            });
            await this.processCancelledPayment(payment.id, {
                reason: mismatchReason,
                callbackData: verifyResult
            });
            return {
                payment,
                success: false,
                reason: 'amount_mismatch',
                message: mismatchReason
            };
        }

        // Process successful payment and entitlement granting in an atomic transaction
        const processed = await this.processSuccessfulPayment(payment.id, {
            transactionId: verifyResult.transactionId || verifyResult.refNumber,
            cardNumber: verifyResult.cardNumber,
            paidAt: verifyResult.paidAt,
            callbackData: verifyResult.rawResponse,
            verifiedAmount
        });

        return {
            payment: processed.payment,
            order: processed.order,
            success: true,
            refNumber: verifyResult.refNumber,
            message: 'پرداخت با موفقیت انجام شد و دوره‌ها برای شما فعال شدند.'
        };
    }

    /**
     * Process verified successful payment and automatically grant courses / packages / subscriptions
     * Uses atomic database transaction and idempotent verification checks.
     */
    static async processSuccessfulPayment(paymentId, {
        transactionId = null,
        cardNumber = null,
        paidAt = null,
        callbackData = null,
        metadata = null,
        verifiedAmount = null
    } = {}) {
        return await sequelize.transaction(async (t) => {
            const payment = await Payments.findByPk(paymentId, {
                include: [{
                    model: Orders,
                    as: 'order',
                    include: [{ model: OrderItems, as: 'items' }]
                }],
                transaction: t
            });

            if (!payment) throw new Error('Payment not found');
            if (!payment.order) throw new Error('Associated order not found');

            // Idempotency: If already paid, do not re-grant entitlements
            if (payment.status === 'paid' && payment.order.status === 'paid') {
                return {
                    payment,
                    order: payment.order,
                    success: true,
                    alreadyProcessed: true
                };
            }

            const order = payment.order;
            const userId = order.userId;
            const effectivePaidAt = paidAt || new Date();

            // Update payment record
            payment.status = 'paid';
            payment.type = 'paid';
            payment.paidAt = effectivePaidAt;
            payment.failureReason = null;
            if (transactionId) payment.transactionId = String(transactionId);
            if (cardNumber) payment.cardNumber = String(cardNumber);
            if (callbackData) {
                payment.callbackData = typeof callbackData === 'object'
                    ? JSON.stringify(callbackData)
                    : String(callbackData);
            }
            if (metadata) {
                payment.metadata = typeof metadata === 'object'
                    ? JSON.stringify(metadata)
                    : String(metadata);
            }
            await payment.save({ transaction: t });

            // Update order record
            order.status = 'paid';
            await order.save({ transaction: t });

            // Increment coupon usage count if applied
            if (order.couponCode) {
                try {
                    const coupon = await Coupon.findOne({ where: { code: order.couponCode }, transaction: t });
                    if (coupon) {
                        coupon.usageCount = (coupon.usageCount || 0) + 1;
                        await coupon.save({ transaction: t });
                    }
                } catch (e) {
                    console.warn('Coupon usage count increment warning:', e.message);
                }
            }

            // Automatically grant access based on purchased order items
            for (const item of order.items || []) {
                if (item.productType === 'course') {
                    const course = await Courses.findByPk(item.productId, { transaction: t });
                    if (course && course.kind === 'skill') {
                        // Package course -> grants package itself + all included courses
                        await AccessService.grantPackageAccess({
                            userId,
                            packageId: item.productId,
                            orderId: order.id
                        }, { transaction: t });
                    } else {
                        // Direct individual course
                        await AccessService.grantCourseAccess({
                            userId,
                            courseId: item.productId,
                            sourceType: 'direct',
                            sourceId: order.id,
                            expiresAt: null
                        }, { transaction: t });
                    }
                } else if (item.productType === 'package') {
                    await AccessService.grantPackageAccess({
                        userId,
                        packageId: item.productId,
                        orderId: order.id
                    }, { transaction: t });
                } else if (item.productType === 'subscription') {
                    await AccessService.grantSubscriptionAccess({
                        userId,
                        subscriptionId: item.productId,
                        orderId: order.id
                    }, { transaction: t });
                }
            }

            logSecurityEvent('payment_success', {
                paymentId: payment.id,
                orderId: order.id,
                userId,
                transactionId: payment.transactionId,
                gateway: payment.gateway
            });

            return {
                payment,
                order,
                success: true
            };
        });
    }

    /**
     * Process user-cancelled or failed payment
     */
    static async processCancelledPayment(paymentId, {
        reason = 'پرداخت توسط کاربر لغو شد',
        callbackData = null
    } = {}) {
        const payment = await Payments.findByPk(paymentId, {
            include: [{ model: Orders, as: 'order' }]
        });

        if (!payment) throw new Error('Payment not found');

        // Never cancel an already verified paid payment
        if (payment.status === 'paid') {
            return { payment, order: payment.order, success: true };
        }

        const reasonStr = typeof reason === 'object' ? JSON.stringify(reason) : String(reason);

        payment.status = 'cancelled';
        payment.type = 'cancelled';
        payment.failureReason = reasonStr;
        if (callbackData) {
            payment.callbackData = typeof callbackData === 'object'
                ? JSON.stringify(callbackData)
                : String(callbackData);
        }
        await payment.save();

        if (payment.order && payment.order.status !== 'paid') {
            payment.order.status = 'cancelled';
            await payment.order.save();
        }

        logSecurityEvent('payment_cancelled', {
            paymentId: payment.id,
            orderId: payment.order?.id,
            userId: payment.userId,
            reason: reasonStr
        });

        return {
            payment,
            order: payment.order,
            success: false,
            reason: reasonStr
        };
    }
}

export default PaymentGateway;
