import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { sequelize } from '../src/models/database.config.js';
import { Users } from '../src/models/index.js';
import { migrateLmsSchema } from '../src/models/migrateLms.js';
import { configs } from '../src/config/config.js';
import { SmsService } from '../src/services/sms/SmsService.js';
import { MockSmsProvider } from '../src/services/sms/MockSmsProvider.js';
import { SmsIrProvider } from '../src/services/sms/SmsIrProvider.js';

let server;
let baseUrl;

test.before(async () => {
    // Set to mock mode for unit and integration testing of mock OTP behaviors
    configs.otpMode = 'mock';

    await sequelize.sync();
    await migrateLmsSchema();

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api/v1`;
});

test.after(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
});

test('1. SMS Service & Provider Architecture', async () => {
    // Default provider in development/test should be mock
    const defaultProvider = SmsService.getProvider('mock');
    assert.equal(defaultProvider.getName(), 'mock');
    assert.ok(defaultProvider instanceof MockSmsProvider);

    // Explicit smsir provider
    const smsirProvider = SmsService.getProvider('smsir');
    assert.equal(smsirProvider.getName(), 'smsir');
    assert.ok(smsirProvider instanceof SmsIrProvider);
});

test('2. Phone Number Normalization', () => {
    assert.equal(SmsIrProvider.normalizeMobile('09121234567'), '09121234567');
    assert.equal(SmsIrProvider.normalizeMobile('+989121234567'), '09121234567');
    assert.equal(SmsIrProvider.normalizeMobile('00989121234567'), '09121234567');
    assert.equal(SmsIrProvider.normalizeMobile('989121234567'), '09121234567');
    assert.equal(SmsIrProvider.normalizeMobile('9121234567'), '09121234567');
    // Persian digits: ۰۹۱۲۱۲۳۴۵۶۷
    assert.equal(SmsIrProvider.normalizeMobile('۰۹۱۲۱۲۳۴۵۶۷'), '09121234567');
});

test('3. Mock SMS Provider output and execution', async () => {
    const mock = new MockSmsProvider();
    let logged = '';
    const originalLog = console.log;
    console.log = (msg) => { logged += msg; };

    try {
        const res = await mock.sendOtp({
            phoneNumber: '09121234567',
            otp: '654321'
        });
        assert.equal(res.success, true);
        assert.equal(res.provider, 'mock');
        assert.ok(logged.includes('[OTP][MOCK] 09121234567 → 654321'));
    } finally {
        console.log = originalLog;
    }
});

test('4. SMS.ir Provider: Request formatting & Response handling', async () => {
    const originalFetch = globalThis.fetch;
    let interceptedUrl = null;
    let interceptedOptions = null;

    const provider = new SmsIrProvider({
        apiKey: 'test-smsir-api-key-12345',
        templateId: 998877,
        paramName: 'Code',
        baseUrl: 'https://api.sms.ir'
    });

    globalThis.fetch = async (url, options) => {
        interceptedUrl = url;
        interceptedOptions = options;
        return {
            ok: true,
            status: 200,
            json: async () => ({
                status: 1,
                message: 'موفق',
                data: { messageId: 445566, cost: 1.0 }
            })
        };
    };

    try {
        const res = await provider.sendOtp({
            phoneNumber: '09123334455',
            otp: '987654'
        });

        assert.equal(interceptedUrl, 'https://api.sms.ir/v1/send/verify');
        assert.equal(interceptedOptions.method, 'POST');
        assert.equal(interceptedOptions.headers['x-api-key'], 'test-smsir-api-key-12345');
        assert.equal(interceptedOptions.headers['Content-Type'], 'application/json');

        const body = JSON.parse(interceptedOptions.body);
        assert.equal(body.mobile, '09123334455');
        assert.equal(body.templateId, 998877);
        assert.deepEqual(body.parameters, [{ name: 'Code', value: '987654' }]);

        assert.equal(res.success, true);
        assert.equal(res.provider, 'smsir');
        assert.equal(res.messageId, 445566);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('5. SMS.ir Provider: Error rejection without credential leakage', async () => {
    const originalFetch = globalThis.fetch;

    const provider = new SmsIrProvider({
        apiKey: 'secret-api-key',
        templateId: 12345,
        paramName: 'Code'
    });

    globalThis.fetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({
            status: 10,
            message: 'کلید وب سرویس نامعتبر است'
        })
    });

    try {
        await assert.rejects(
            async () => {
                await provider.sendOtp({ phoneNumber: '09120000000', otp: '111222' });
            },
            (err) => {
                assert.ok(!err.message.includes('secret-api-key'));
                assert.ok(err.message.includes('کلید وب سرویس نامعتبر است'));
                return true;
            }
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('6. Mock Mode Flow: End-to-End OTP Generation, Cooldown, and Verification', async () => {
    const testPhone = '09128881122';
    await Users.destroy({ where: { phoneNumber: testPhone } });

    // 1. Request OTP
    const reqRes = await fetch(`${baseUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone })
    });

    assert.equal(reqRes.status, 200);
    const reqData = await reqRes.json();
    assert.equal(reqData.ok, true);
    assert.equal(reqData.data.expiresInSeconds, configs.otpExpiresInSeconds);
    // Crucial security check: OTP is never leaked in the API response
    assert.equal(reqData.otp, undefined);
    assert.equal(reqData.data.otp, undefined);

    // 2. Cooldown check: Immediate second request within cooldown must return 429
    const secondReqRes = await fetch(`${baseUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone })
    });
    assert.equal(secondReqRes.status, 429);
    const secondReqData = await secondReqRes.json();
    assert.equal(secondReqData.ok, false);
    assert.ok(secondReqData.data.retryAfterSeconds > 0);

    // 3. Inspect DB for generated OTP
    const user = await Users.findOne({ where: { phoneNumber: testPhone } });
    assert.ok(user);
    assert.ok(user.otp);
    const validOtp = user.otp;

    // 4. Validate with WRONG OTP -> fails 401
    const wrongRes = await fetch(`${baseUrl}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone, otp: '000000' })
    });
    assert.equal(wrongRes.status, 401);
    const wrongData = await wrongRes.json();
    assert.equal(wrongData.ok, false);

    // 5. Validate with CORRECT OTP -> succeeds 200
    const correctRes = await fetch(`${baseUrl}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone, otp: validOtp })
    });
    assert.equal(correctRes.status, 200);
    const correctData = await correctRes.json();
    assert.equal(correctData.ok, true);
    assert.ok(correctData.data.token);

    // 6. Single-use: Replaying already-used OTP must fail (cannot be reused)
    const replayRes = await fetch(`${baseUrl}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone, otp: validOtp })
    });
    assert.equal(replayRes.status, 400);
});

test('7. Brute-Force Defense: Max failed attempts invalidates OTP', async () => {
    const testPhone = '09127773344';
    await Users.destroy({ where: { phoneNumber: testPhone } });

    // Create user with known OTP
    let user = await Users.create({ phoneNumber: testPhone });
    user.otp = '456789';
    user.otpExpiresAt = new Date(Date.now() + 120000);
    user.otpAttempts = 0;
    user.otpLastRequestedAt = null;
    await user.save();

    const maxAttempts = configs.otpMaxVerifyAttempts || 5;

    // Fail maxAttempts times
    for (let i = 0; i < maxAttempts; i++) {
        const failRes = await fetch(`${baseUrl}/auth/validate-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: testPhone, otp: '111111' })
        });
        assert.equal(failRes.status, 401);
    }

    // Attempt #maxAttempts + 1 must be blocked with 429 and invalidate OTP
    const blockedRes = await fetch(`${baseUrl}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone, otp: '111111' })
    });
    assert.equal(blockedRes.status, 429);

    const reloaded = await Users.findOne({ where: { phoneNumber: testPhone } });
    assert.equal(reloaded.otp, null, 'OTP should be cleared after max attempts exceeded');
});

test('8. Expired OTP Rejection', async () => {
    const testPhone = '09126665544';
    await Users.destroy({ where: { phoneNumber: testPhone } });

    let user = await Users.create({ phoneNumber: testPhone });
    user.otp = '334455';
    user.otpExpiresAt = new Date(Date.now() - 5000); // 5 seconds in past
    user.otpAttempts = 0;
    await user.save();

    const expiredRes = await fetch(`${baseUrl}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone, otp: '334455' })
    });

    assert.equal(expiredRes.status, 401);
    const data = await expiredRes.json();
    assert.ok(data.message.includes('منقضی'));

    const reloaded = await Users.findOne({ where: { phoneNumber: testPhone } });
    assert.equal(reloaded.otp, null, 'Expired OTP should be cleared');
});

test('9. SMS Delivery Failure Behavior', async () => {
    const testPhone = '09125556677';
    await Users.destroy({ where: { phoneNumber: testPhone } });

    // Mock SmsService.sendOtp to throw an error
    const originalSendOtp = SmsService.sendOtp;
    SmsService.sendOtp = async () => {
        throw new Error('درگاه پیامک موقتاً در دسترس نیست');
    };

    try {
        const res = await fetch(`${baseUrl}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: testPhone })
        });

        assert.equal(res.status, 502);
        const data = await res.json();
        assert.equal(data.ok, false);
        assert.ok(data.message.includes('در دسترس نیست'));

        // DB record should not have an active OTP that could be guessed
        const user = await Users.findOne({ where: { phoneNumber: testPhone } });
        assert.ok(user);
        assert.equal(user.otp, null, 'Failed SMS dispatch must nullify pending OTP');
    } finally {
        SmsService.sendOtp = originalSendOtp;
    }
});
