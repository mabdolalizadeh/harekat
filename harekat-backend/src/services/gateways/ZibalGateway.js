import { BaseGateway } from './BaseGateway.js';
import { configs } from '../../config/config.js';
import { logSecurityEvent } from '../../utils/logger.js';

const ZIBAL_RESULT_CODES = {
    100: 'با موفقیت انجام شد',
    102: 'شناسه مرچنت (merchant) یافت نشد',
    103: 'مرچنت غیرفعال است / عدم امضای قرارداد',
    104: 'مرچنت نامعتبر است',
    105: 'مبلغ تراکنش باید بزرگتر از ۱,۰۰۰ ریال باشد',
    106: 'آدرس بازگشت (callbackUrl) نامعتبر است',
    107: 'حالت درصدی نامعتبر است',
    113: 'مبلغ تراکنش از سقف میزان تراکنش بیشتر است',
    114: 'کد ملی ارسالی نامعتبر است',
    115: 'آدرس IP سرور در پنل زیبال ثبت نشده است',
    201: 'تراکنش قبلا تایید شده است',
    202: 'سفارش پرداخت نشده یا ناموفق بوده است',
    203: 'شناسه پیگیری (trackId) نامعتبر است'
};

const ZIBAL_STATUS_CODES = {
    [-1]: 'در انتظار پرداخت',
    [-2]: 'خطای داخلی',
    1: 'پرداخت شده - تاییدشده',
    2: 'پرداخت شده - تاییدنشده',
    3: 'لغو شده توسط کاربر',
    4: 'شماره کارت نامعتبر است',
    5: 'موجودی حساب کافی نیست',
    6: 'رمز وارد شده اشتباه است',
    7: 'تعداد درخواست‌ها بیش از حد مجاز است',
    8: 'تعداد پرداخت اینترنتی روزانه بیش از حد مجاز است',
    9: 'مبلغ پرداخت اینترنتی روزانه بیش از حد مجاز است',
    10: 'صادرکننده کارت نامعتبر است',
    11: 'خطای سوئیچ بانکی',
    12: 'کارت قابل دسترسی نیست',
    15: 'تراکنش استرداد شده',
    16: 'تراکنش در حال استرداد',
    18: 'تراکنش ریورس شده',
    21: 'پذیرنده نامعتبر است'
};

export class ZibalGateway extends BaseGateway {
    constructor() {
        super('zibal');
        this.baseUrl = (configs.zibalBaseUrl || 'https://gateway.zibal.ir').replace(/\/+$/, '');
        this.timeoutMs = 15000;
    }

    getMerchant() {
        const merchant = configs.zibalMerchant;
        if (!merchant) {
            throw new Error('Zibal merchant ID is not configured (ZIBAL_MERCHANT is empty)');
        }
        return merchant;
    }

    /**
     * Helper to perform HTTP request with timeout
     */
    async _post(endpoint, payload) {
        const url = `${this.baseUrl}${endpoint}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timer);

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                throw new Error(`Invalid JSON response from Zibal (${response.status}): ${text.slice(0, 100)}`);
            }

            return { status: response.status, data };
        } catch (err) {
            clearTimeout(timer);
            if (err.name === 'AbortError') {
                throw new Error('Zibal gateway request timed out after 15 seconds');
            }
            throw new Error(`Zibal gateway communication error: ${err.message}`);
        }
    }

    /**
     * Request payment from Zibal IPG
     */
    async createPayment({ payment, order, user, callbackUrl, description }) {
        const merchant = this.getMerchant();
        const amountTomans = Number(String(payment.amount || 0).replace(/[,٬\s]/g, ''));

        if (!amountTomans || amountTomans <= 0) {
            throw new Error('Payment amount must be greater than zero');
        }

        // Convert Toman to Rial (Zibal accepts Rials)
        const amountRials = Math.round(amountTomans * 10);
        if (amountRials < 1000) {
            throw new Error('مبلغ پرداختی حداقل باید ۱۰۰ تومان (۱,۰۰۰ ریال) باشد');
        }

        const effectiveCallbackUrl = callbackUrl || configs.zibalCallbackUrl;
        if (!effectiveCallbackUrl || !/^https?:\/\//i.test(effectiveCallbackUrl)) {
            throw new Error('ZIBAL_CALLBACK_URL must be configured with a valid HTTP(S) URL');
        }

        const safeOrderId = order ? String(order.id) : String(payment.id);
        const mobile = user?.phoneNumber ? String(user.phoneNumber).replace(/[^\d+]/g, '') : undefined;
        const safeDescription = (description || `پرداخت سفارش #${safeOrderId.slice(0, 8)} در حرکت`).slice(0, 255);

        const requestBody = {
            merchant,
            amount: amountRials,
            callbackUrl: effectiveCallbackUrl,
            description: safeDescription,
            orderId: safeOrderId
        };

        if (mobile && /^09\d{9}$/.test(mobile)) {
            requestBody.mobile = mobile;
        }

        const { data } = await this._post('/v1/request', requestBody);

        if (data.result !== 100) {
            const errorMsg = ZIBAL_RESULT_CODES[data.result] || data.message || `خطای درگاه زیبال (کد ${data.result})`;
            throw new Error(errorMsg);
        }

        const trackId = String(data.trackId);
        const redirectUrl = `${this.baseUrl}/start/${trackId}`;

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
    }

    /**
     * Verify transaction with Zibal IPG
     */
    async verifyPayment({ payment, trackId, callbackParams = {} }) {
        const merchant = this.getMerchant();
        const targetTrackId = String(trackId || payment.trackId || callbackParams.trackId || '').trim();

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
            const statusMsg = ZIBAL_STATUS_CODES[statusCode] || 'پرداخت توسط کاربر لغو شد یا انجام نشد';
            return {
                success: false,
                status: statusCode || 3,
                message: statusMsg,
                rawResponse: callbackParams
            };
        }

        const verifyPayload = {
            merchant,
            trackId: targetTrackId
        };

        const { data } = await this._post('/v1/verify', verifyPayload);

        // Result 100 = verified successfully
        // Result 201 = already verified earlier
        if (data.result === 100 || data.result === 201) {
            // Amount returned by Zibal is in Rials -> convert to Tomans
            const verifiedAmountTomans = Math.round(Number(data.amount) / 10);
            const refNumber = data.refNumber ? String(data.refNumber) : String(targetTrackId);
            const paidAt = data.paidAt ? new Date(data.paidAt) : new Date();

            return {
                success: true,
                alreadyVerified: data.result === 201,
                verifiedAmount: verifiedAmountTomans,
                refNumber,
                transactionId: refNumber,
                paidAt,
                cardNumber: data.cardNumber || null,
                result: data.result,
                status: data.status,
                message: data.result === 201 ? 'تراکنش قبلاً با موفقیت تایید شده است' : 'پرداخت با موفقیت تایید شد',
                rawResponse: data
            };
        }

        // Unsuccessful verification
        const failureMsg = ZIBAL_RESULT_CODES[data.result] ||
            ZIBAL_STATUS_CODES[data.status] ||
            data.message ||
            'تایید پرداخت با خطا مواجه شد';

        return {
            success: false,
            result: data.result,
            status: data.status,
            message: failureMsg,
            rawResponse: data
        };
    }

    /**
     * Inquiry payment from Zibal IPG
     */
    async inquiryPayment({ payment, trackId }) {
        const merchant = this.getMerchant();
        const targetTrackId = String(trackId || payment?.trackId || '').trim();

        if (!targetTrackId) {
            throw new Error('trackId is required for inquiry');
        }

        const { data } = await this._post('/v1/inquiry', {
            merchant,
            trackId: targetTrackId
        });

        return {
            success: data.result === 100,
            result: data.result,
            status: data.status,
            amount: data.amount ? Math.round(Number(data.amount) / 10) : null,
            refNumber: data.refNumber ? String(data.refNumber) : null,
            paidAt: data.paidAt ? new Date(data.paidAt) : null,
            cardNumber: data.cardNumber || null,
            message: ZIBAL_RESULT_CODES[data.result] || data.message,
            rawResponse: data
        };
    }
}

export default ZibalGateway;
