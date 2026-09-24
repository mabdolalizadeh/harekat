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
    paymentGateway: String(process.env.PAYMENT_GATEWAY || 'mock').toLowerCase(),
    zibalMerchant: process.env.ZIBAL_MERCHANT || 'zibal',
    zibalCallbackUrl: process.env.ZIBAL_CALLBACK_URL || '',
    zibalBaseUrl: process.env.ZIBAL_BASE_URL || 'https://gateway.zibal.ir',
    dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:5173',
    backendBaseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:3000',
    otpMode: String(process.env.OTP_MODE || 'mock').toLowerCase(),
    smsirApiKey: process.env.SMSIR_API_KEY || '',
    smsirTemplateId: process.env.SMSIR_TEMPLATE_ID || '',
    smsirTemplateParamName: process.env.SMSIR_TEMPLATE_PARAM_NAME || 'Code',
    smsirBaseUrl: process.env.SMSIR_BASE_URL || 'https://api.sms.ir',
    otpExpiresInSeconds: Number(process.env.OTP_EXPIRES_IN_SECONDS) || 120,
    otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
    otpMaxVerifyAttempts: Number(process.env.OTP_MAX_VERIFY_ATTEMPTS) || 5
};

const validateConfig = () => {
    const errors = [];
    if (!configs.jwtKey || configs.jwtKey.length < 32) {
        errors.push('JWT_KEY must be set and at least 32 characters long');
    }
    if (configs.otpMode === 'smsir') {
        if (!configs.smsirApiKey) {
            errors.push('SMSIR_API_KEY must be set when OTP_MODE is smsir');
        }
        if (!configs.smsirTemplateId) {
            errors.push('SMSIR_TEMPLATE_ID must be set when OTP_MODE is smsir');
        }
    }
    if (errors.length > 0) {
        throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }
};

validateConfig();

export { configs };
