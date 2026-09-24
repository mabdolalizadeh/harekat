import { configs } from '../../config/config.js';
import { MockSmsProvider } from './MockSmsProvider.js';
import { SmsIrProvider } from './SmsIrProvider.js';

export class SmsService {
    /**
     * Resolve provider instance based on configured OTP_MODE or explicit parameter
     * @param {'mock'|'smsir'} [mode]
     * @returns {BaseSmsProvider}
     */
    static getProvider(mode = configs.otpMode) {
        const normalizedMode = String(mode || 'mock').toLowerCase();
        if (normalizedMode === 'smsir') {
            return new SmsIrProvider({
                apiKey: configs.smsirApiKey,
                templateId: configs.smsirTemplateId,
                paramName: configs.smsirTemplateParamName,
                baseUrl: configs.smsirBaseUrl
            });
        }
        return new MockSmsProvider();
    }

    /**
     * Send OTP via active provider
     * @param {Object} params
     * @param {string} params.phoneNumber
     * @param {string} params.otp
     * @param {number} [params.templateId]
     * @param {string} [params.paramName]
     * @param {'mock'|'smsir'} [params.providerOverride]
     */
    static async sendOtp({ phoneNumber, otp, templateId, paramName, providerOverride }) {
        const provider = this.getProvider(providerOverride);
        return await provider.sendOtp({
            phoneNumber,
            otp,
            templateId,
            paramName
        });
    }
}
