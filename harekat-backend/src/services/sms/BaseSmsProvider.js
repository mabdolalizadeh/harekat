/**
 * Abstract Base SMS Provider
 */
export class BaseSmsProvider {
    getName() {
        throw new Error('getName() must be implemented by subclass');
    }

    /**
     * Send OTP code to a mobile number
     * @param {Object} params
     * @param {string} params.phoneNumber Mobile phone number
     * @param {string} params.otp OTP code
     * @param {number} [params.templateId] Optional template ID
     * @param {string} [params.paramName] Optional template parameter name
     * @returns {Promise<{ success: boolean, messageId?: string|number, provider: string }>}
     */
    async sendOtp(params) {
        throw new Error('sendOtp() must be implemented by subclass');
    }
}
