/**
 * Base abstract class for payment gateways
 */
export class BaseGateway {
    /**
     * @param {string} name - Unique identifier of the gateway
     */
    constructor(name) {
        if (!name) throw new Error('Gateway name is required');
        this.name = name;
    }

    getName() {
        return this.name;
    }

    /**
     * Request a payment transaction from the gateway
     * @param {Object} params
     * @param {Object} params.payment - The pending payment model instance
     * @param {Object} params.order - The associated order model instance
     * @param {Object} [params.user] - The purchasing user
     * @param {string} [params.callbackUrl] - The URL the gateway will redirect back to
     * @param {string} [params.description] - Transaction description
     * @returns {Promise<{ trackId: string, redirectUrl: string|null, requiresGatewayRedirect: boolean, gatewayData?: any }>}
     */
    async createPayment(params) {
        throw new Error(`createPayment() not implemented in ${this.name}`);
    }

    /**
     * Verify payment status with the gateway
     * @param {Object} params
     * @param {Object} params.payment - The payment model instance
     * @param {string|number} params.trackId - The transaction tracking ID
     * @param {Object} [params.callbackParams] - Query/body parameters received from callback
     * @returns {Promise<{ success: boolean, verifiedAmount?: number, refNumber?: string, transactionId?: string, paidAt?: Date, cardNumber?: string, result?: number, status?: number, message?: string, rawResponse?: any }>}
     */
    async verifyPayment(params) {
        throw new Error(`verifyPayment() not implemented in ${this.name}`);
    }

    /**
     * Inquire transaction report from the gateway
     * @param {Object} params
     * @returns {Promise<any>}
     */
    async inquiryPayment(params) {
        throw new Error(`inquiryPayment() not implemented in ${this.name}`);
    }
}

export default BaseGateway;
