import Zibal from 'zibal';
import { BaseGateway } from './BaseGateway.js';
import { configs } from '../../config/config.js';
import { logSecurityEvent } from '../../utils/logger.js';

export class ZibalGateway extends BaseGateway {
    constructor() {
        super('zibal');
        this.timeoutMs = 15000;
    }

    getMerchant() {
        const merchant = (process.env.ZIBAL_MERCHANT || configs.zibalMerchant || '').trim();
        if (!merchant) {
            throw new Error('Zibal merchant ID is not configured (ZIBAL_MERCHANT is empty in .env)');
        }
        return merchant;
    }

    getCallbackUrl(overrideUrl) {
        const callbackUrl = (overrideUrl || process.env.ZIBAL_CALLBACK_URL || configs.zibalCallbackUrl || '').trim();
        if (!callbackUrl) {
            throw new Error('Zibal callback URL is not configured (ZIBAL_CALLBACK_URL is empty in .env)');
        }
        return callbackUrl;
    }

    getClient(customCallbackUrl) {
        const merchant = this.getMerchant();
        const callbackUrl = this.getCallbackUrl(customCallbackUrl);

        return new Zibal({
            merchant,
            callbackUrl,
            timeout: this.timeoutMs
        });
    }

    /**
     * Request payment from Zibal IPG using official Zibal Node.js SDK
     * Amounts are authoritatively stored in Tomans, converted to Rials (* 10) for Zibal.
     */
    async createPayment({ payment, order, user, callbackUrl, description }) {
        const effectiveCallbackUrl = this.getCallbackUrl(callbackUrl);
        const client = this.getClient(effectiveCallbackUrl);

        const amountTomans = Number(String(payment.amount || 0).replace(/[,٬\s]/g, ''));
        if (!amountTomans || amountTomans <= 0) {
            throw new Error('Payment amount must be greater than zero');
        }

        // Zibal accepts Rials
        const amountRials = Math.round(amountTomans * 10);
        if (amountRials < 1000) {
            throw new Error('مبلغ پرداختی حداقل باید ۱۰۰ تومان (۱,۰۰۰ ریال) باشد');
        }

        const safeOrderId = order ? String(order.id) : String(payment.id);
        const mobile = user?.phoneNumber ? String(user.phoneNumber).replace(/[^\d+]/g, '') : undefined;
        const safeDescription = (description || `پرداخت سفارش #${safeOrderId.slice(0, 8)} در مدرسه حرکت`).slice(0, 255);

        logSecurityEvent('Zibal request started', {
            paymentId: payment.id,
            orderId: safeOrderId,
            amountTomans,
            amountRials
        });

        try {
            const zibalResponse = await client.request({
                amount: amountRials,
                callbackUrl: effectiveCallbackUrl,
                orderId: safeOrderId,
                description: safeDescription,
                mobile: (mobile && /^09\d{9}$/.test(mobile)) ? mobile : undefined
            });

            const trackId = String(zibalResponse.trackId);
            const redirectUrl = zibalResponse.paymentUrl;

            logSecurityEvent('Zibal trackId received', {
                paymentId: payment.id,
                orderId: safeOrderId,
                trackId
            });

            logSecurityEvent('user redirected to Zibal', {
                paymentId: payment.id,
                orderId: safeOrderId,
                trackId
            });

            return {
                trackId,
                redirectUrl,
                requiresGatewayRedirect: true,
                gatewayData: {
                    trackId,
                    amountRials,
                    amountTomans
                }
            };
        } catch (err) {
            logSecurityEvent('verification failed', {
                paymentId: payment.id,
                orderId: safeOrderId,
                reason: err.message
            });
            throw new Error(err.message || 'خطا در ایجاد تراکنش با درگاه زیبال');
        }
    }

    /**
     * Verify transaction with Zibal IPG using official Zibal Node.js SDK
     */
    async verifyPayment({ payment, trackId, callbackParams = {} }) {
        const targetTrackId = String(trackId || payment?.trackId || callbackParams.trackId || '').trim();

        if (!targetTrackId) {
            return {
                success: false,
                message: 'شناسه پیگیری (trackId) یافت نشد',
                result: 203
            };
        }

        // If the callback explicitly reports failure/cancellation before verify
        if (callbackParams.success !== undefined && String(callbackParams.success) === '0') {
            const statusCode = Number(callbackParams.status);
            return {
                success: false,
                status: statusCode || 3,
                message: 'پرداخت توسط کاربر در درگاه زیبال لغو شد یا انجام نشد',
                rawResponse: callbackParams
            };
        }

        const amountTomans = Number(String(payment.amount || 0).replace(/[,٬\s]/g, ''));
        const expectedAmountRials = Math.round(amountTomans * 10);
        const expectedOrderId = payment.orderId ? String(payment.orderId) : (payment.order?.id ? String(payment.order.id) : undefined);

        logSecurityEvent('verification started', {
            paymentId: payment.id,
            trackId: targetTrackId,
            expectedAmountRials
        });

        try {
            const client = this.getClient();
            const verifyRes = await client.verify({
                trackId: targetTrackId,
                expectedAmount: expectedAmountRials,
                expectedOrderId
            });

            const verifiedAmountTomans = Math.round(Number(verifyRes.amount) / 10);
            const refNumber = verifyRes.refNumber ? String(verifyRes.refNumber) : String(targetTrackId);
            const paidAt = verifyRes.paidAt ? new Date(verifyRes.paidAt) : new Date();

            logSecurityEvent('verification succeeded', {
                paymentId: payment.id,
                trackId: targetTrackId,
                refNumber,
                amountTomans: verifiedAmountTomans
            });

            return {
                success: true,
                alreadyVerified: false,
                verifiedAmount: verifiedAmountTomans,
                refNumber,
                transactionId: refNumber,
                paidAt,
                cardNumber: verifyRes.cardNumber || null,
                result: verifyRes.result,
                status: verifyRes.status,
                message: verifyRes.persianMessage || 'پرداخت با موفقیت تایید شد',
                rawResponse: verifyRes
            };
        } catch (err) {
            // If already verified earlier (Result code 201)
            if (err.details?.result === 201) {
                logSecurityEvent('verification succeeded', {
                    paymentId: payment.id,
                    trackId: targetTrackId,
                    note: 'already_verified'
                });
                return {
                    success: true,
                    alreadyVerified: true,
                    verifiedAmount: amountTomans,
                    refNumber: String(targetTrackId),
                    transactionId: String(targetTrackId),
                    paidAt: new Date(),
                    result: 201,
                    status: 1,
                    message: 'تراکنش قبلاً با موفقیت تایید شده است',
                    rawResponse: err.details
                };
            }

            logSecurityEvent('verification failed', {
                paymentId: payment.id,
                trackId: targetTrackId,
                reason: err.message
            });

            return {
                success: false,
                result: err.details?.result || -1,
                status: err.details?.status || -1,
                message: err.message || 'تایید پرداخت با خطا مواجه شد',
                rawResponse: err.details || null
            };
        }
    }
}

export default ZibalGateway;
