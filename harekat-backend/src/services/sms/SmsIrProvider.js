import { BaseSmsProvider } from './BaseSmsProvider.js';

export class SmsIrProvider extends BaseSmsProvider {
    constructor({ apiKey, templateId, paramName = 'Code', baseUrl = 'https://api.sms.ir' } = {}) {
        super();
        this.apiKey = apiKey;
        this.templateId = templateId ? Number(templateId) : null;
        this.paramName = paramName || 'Code';
        this.baseUrl = (baseUrl || 'https://api.sms.ir').replace(/\/+$/, '');
    }

    getName() {
        return 'smsir';
    }

    /**
     * Clean and format Iranian phone number for SMS.ir
     * Normalizes '+989...', '00989...', '9...' to standard format '09...'
     */
    static normalizeMobile(phoneNumber) {
        if (!phoneNumber) return '';
        let cleaned = String(phoneNumber).trim().replace(/[\s\-\(\)]/g, '');
        // Convert Persian/Arabic digits to English digits
        cleaned = cleaned.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
        cleaned = cleaned.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

        if (cleaned.startsWith('+98')) {
            cleaned = '0' + cleaned.substring(3);
        } else if (cleaned.startsWith('0098')) {
            cleaned = '0' + cleaned.substring(4);
        } else if (cleaned.startsWith('98') && cleaned.length === 12) {
            cleaned = '0' + cleaned.substring(2);
        } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
            cleaned = '0' + cleaned;
        }

        return cleaned;
    }

    /**
     * Sends OTP using the official SMS.ir REST API v1 verify endpoint:
     * POST https://api.sms.ir/v1/send/verify
     */
    async sendOtp({ phoneNumber, otp, templateId = null, paramName = null }) {
        if (!this.apiKey) {
            throw new Error('SMSIR_API_KEY is not configured');
        }

        const effectiveTemplateId = Number(templateId || this.templateId);
        if (!effectiveTemplateId || Number.isNaN(effectiveTemplateId)) {
            throw new Error('SMSIR_TEMPLATE_ID is not configured or invalid');
        }

        const effectiveParamName = String(paramName || this.paramName || 'Code');
        const mobile = SmsIrProvider.normalizeMobile(phoneNumber);

        const url = `${this.baseUrl}/v1/send/verify`;
        const payload = {
            mobile,
            templateId: effectiveTemplateId,
            parameters: [
                {
                    name: effectiveParamName,
                    value: String(otp)
                }
            ]
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const result = await response.json().catch(() => null);

            if (!response.ok || !result || result.status !== 1) {
                const statusCode = result?.status ?? response.status;
                const errorMsg = result?.message || `HTTP ${response.status}`;
                
                // Safe technical logging: NO API KEY, NO OTP, NO FULL USER CREDENTIALS
                console.error(`[OTP][SMSIR][ERROR] Failed to send OTP. status=${statusCode}, message="${errorMsg}"`);
                
                const err = new Error(`ارسال پیامک با درگاه SMS.ir ناموفق بود: ${errorMsg}`);
                err.status = statusCode;
                err.provider = 'smsir';
                throw err;
            }

            // Success logging format: print notification and OTP to console as requested
            console.log(`[OTP][SMSIR] OTP request sent for ${mobile}`);
            console.log(`[OTP] ${mobile} → ${otp}`);

            return {
                success: true,
                provider: 'smsir',
                messageId: result.data?.messageId,
                cost: result.data?.cost
            };
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                console.error('[OTP][SMSIR][ERROR] Request timed out after 10000ms');
                const timeoutErr = new Error('زمان پاسخگویی درگاه پیامک به پایان رسید');
                timeoutErr.status = 504;
                timeoutErr.provider = 'smsir';
                throw timeoutErr;
            }
            if (err.provider === 'smsir') {
                throw err;
            }
            console.error(`[OTP][SMSIR][ERROR] Network or connection error: ${err.message}`);
            const connErr = new Error('خطا در اتصال به درگاه پیامک');
            connErr.status = 502;
            connErr.provider = 'smsir';
            throw connErr;
        }
    }
}
