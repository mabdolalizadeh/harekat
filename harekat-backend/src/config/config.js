import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
dotenv.config();

const configs = {
    jwtKey: process.env.JWT_KEY,
    jwtExpiry: process.env.JWT_EXPIRY || '7d',
    userJwtExpiry: process.env.USER_JWT_EXPIRY || '7d',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    nodeEnv: String(process.env.NODE_ENV || 'production').toLowerCase(),
    paymentMode: (String(process.env.PAYMENT_MODE || process.env.PAYMENT_GATEWAY || 'mock').trim().toLowerCase() === 'zibal') ? 'zibal' : 'fake',
    paymentGateway: (String(process.env.PAYMENT_MODE || process.env.PAYMENT_GATEWAY || 'mock').trim().toLowerCase() === 'zibal') ? 'zibal' : 'mock',
    zibalMerchant: (process.env.ZIBAL_MERCHANT || '').trim(),
    zibalCallbackUrl: (process.env.ZIBAL_CALLBACK_URL || '').trim(),
    zibalBaseUrl: process.env.ZIBAL_BASE_URL || 'https://gateway.zibal.ir',
    dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:5173',
    backendBaseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:3000',
    smsirMock: process.env.SMSIR_MOCK !== undefined
        ? (String(process.env.SMSIR_MOCK).trim().toLowerCase() === 'true' || process.env.SMSIR_MOCK === '1')
        : (String(process.env.OTP_MODE || 'mock').toLowerCase() === 'mock'),
    otpMode: (process.env.SMSIR_MOCK !== undefined
        ? ((String(process.env.SMSIR_MOCK).trim().toLowerCase() === 'true' || process.env.SMSIR_MOCK === '1') ? 'mock' : 'smsir')
        : String(process.env.OTP_MODE || 'mock').toLowerCase()),
    smsirApiKey: (process.env.SMSIR_API_KEY || '').trim(),
    smsirTemplateId: (process.env.SMSIR_TEMPLATE_ID || '').trim(),
    smsirTemplateParamName: (process.env.SMSIR_TEMPLATE_PARAM_NAME || 'Code').trim(),
    smsirBaseUrl: (process.env.SMSIR_BASE_URL || 'https://api.sms.ir').trim(),
    otpLength: Number(process.env.OTP_LENGTH) || 5,
    otpExpiresInSeconds: Number(process.env.OTP_EXPIRES_IN_SECONDS) || 120,
    otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
    otpMaxVerifyAttempts: Number(process.env.OTP_MAX_VERIFY_ATTEMPTS) || 5
};

const validateConfig = () => {
    const errors = [];
    if (!configs.jwtKey || configs.jwtKey.length < 32) {
        errors.push('JWT_KEY must be set and at least 32 characters long');
    }
    if (!configs.smsirMock) {
        if (!configs.smsirApiKey) {
            errors.push('SMSIR_API_KEY must be set when SMSIR_MOCK is false');
        }
        if (!configs.smsirTemplateId) {
            errors.push('SMSIR_TEMPLATE_ID must be set when SMSIR_MOCK is false');
        }
        if (!configs.smsirTemplateParamName) {
            errors.push('SMSIR_TEMPLATE_PARAM_NAME must be set when SMSIR_MOCK is false');
        }
        if (!configs.smsirBaseUrl) {
            errors.push('SMSIR_BASE_URL must be set when SMSIR_MOCK is false');
        }
    }
    if (errors.length > 0) {
        throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }
};

validateConfig();

export { configs };
