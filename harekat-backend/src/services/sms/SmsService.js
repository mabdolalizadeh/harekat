import { configs } from '../../config/config.js';
import { MockSmsProvider } from './MockSmsProvider.js';
import { SmsIrProvider } from './SmsIrProvider.js';

export class SmsService {
    /**
     * Resolve provider instance based on configured SMSIR_MOCK / OTP_MODE or explicit parameter
     * @param {'mock'|'smsir'} [mode]
     * @returns {BaseSmsProvider}
     */
    static getProvider(mode) {
        let isMock = configs.smsirMock;
        if (mode !== undefined) {
            isMock = String(mode).toLowerCase() === 'mock';
        }

        if (!isMock) {
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

    /**
     * Helper to send verification code to mobile
     * @param {string} mobile
     * @param {string} code
     */
    static async sendVerificationCode(mobile, code) {
        return await this.sendOtp({ phoneNumber: mobile, otp: code });
    }
}

export async function sendVerificationCode(mobile, code) {
    return await SmsService.sendVerificationCode(mobile, code);
}

export default SmsService;
