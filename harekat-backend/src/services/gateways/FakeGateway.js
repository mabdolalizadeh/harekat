import { BaseGateway } from './BaseGateway.js';

export class FakeGateway extends BaseGateway {
    constructor() {
        super('mock');
    }

    /**
     * Create a simulated payment transaction
     */
    async createPayment({ payment, order, user, callbackUrl, description }) {
        const simulatedTrackId = `fake-track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        return {
            trackId: simulatedTrackId,
            redirectUrl: null,
            requiresGatewayRedirect: false,
            gatewayData: {
                simulated: true,
                orderId: order?.id,
                paymentId: payment?.id,
                amount: payment?.amount
            }
        };
    }

    /**
     * Verify simulated payment
     */
    async verifyPayment({ payment, trackId, callbackParams = {} }) {
        const action = callbackParams.action || 'pay';

        if (action === 'cancel') {
            return {
                success: false,
                status: 3,
                message: callbackParams.reason || 'پرداخت توسط کاربر لغو گردید',
                rawResponse: { action: 'cancel' }
            };
        }

        const now = new Date();
        const refNumber = callbackParams.refNumber || `SIM-REF-${Date.now()}`;
        const transactionId = callbackParams.transactionId || `TXN-SIM-${Date.now()}`;
        const amountNum = Number(String(payment?.amount || 0).replace(/[,٬\s]/g, ''));

        return {
            success: true,
            verifiedAmount: amountNum,
            refNumber,
            transactionId,
            paidAt: now,
            cardNumber: '6037********1234',
            result: 100,
            status: 1,
            message: 'پرداخت آزمایشی با موفقیت تایید شد',
            rawResponse: {
                simulated: true,
                refNumber,
                transactionId,
                amount: amountNum
            }
        };
    }

    async inquiryPayment({ payment, trackId }) {
        return {
            success: true,
            status: 1,
            trackId: trackId || payment?.trackId,
            amount: payment?.amount,
            message: 'Fake transaction inquiry OK'
        };
    }
}

export default FakeGateway;
