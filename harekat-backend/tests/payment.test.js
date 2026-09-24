import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { sequelize } from '../src/models/database.config.js';
import {
    Users,
    Courses,
    Subscriptions,
    Orders,
    OrderItems,
    Payments,
    CourseAccess,
    UserSubscriptions,
    PackageCourses
} from '../src/models/index.js';
import { PaymentGateway } from '../src/services/paymentGateway.js';
import { ZibalGateway } from '../src/services/gateways/ZibalGateway.js';
import { FakeGateway } from '../src/services/gateways/FakeGateway.js';
import { AccessService } from '../src/services/accessService.js';
import { migrateLmsSchema } from '../src/models/migrateLms.js';
import { configs } from '../src/config/config.js';
import jwt from 'jsonwebtoken';

let server;
let baseUrl;
let testUser;
let testUserToken;
let testCourse;
let testPackage;
let testPackageSubCourse;

function generateToken(user) {
    return jwt.sign(
        { id: user.id, phoneNumber: user.phoneNumber, role: 'student' },
        configs.jwtKey,
        { expiresIn: '1d' }
    );
}

async function createTestCourse(overrides = {}) {
    return await Courses.create({
        name: overrides.name || 'دوره تست',
        price: overrides.price || '100000',
        salePrice: overrides.salePrice || null,
        kind: overrides.kind || 'regular',
        isActive: overrides.isActive ?? true,
        image: '/uploads/test.jpg',
        level: 'جامع',
        duration: '20 ساعت',
        typeOfAttendence: 'آنلاین',
        statusOfRegistration: 'open',
        ...overrides
    });
}

test.before(async () => {
    await migrateLmsSchema();
    await sequelize.sync();

    // Create unique test student
    testUser = await Users.create({
        phoneNumber: `0910${Math.floor(1000000 + Math.random() * 9000000)}`,
        firstName: 'تست',
        lastName: 'درگاه زیبال',
        status: 'active'
    });
    testUserToken = generateToken(testUser);

    // Create a regular course
    testCourse = await createTestCourse({
        name: 'دوره جامع برنامه نویسی جاوا اسکریپت',
        price: '300000',
        salePrice: '250000',
        kind: 'regular'
    });

    // Create a package course (kind = 'skill') with an included course
    testPackageSubCourse = await createTestCourse({
        name: 'دوره مکمل پکیج مهارتی',
        price: '150000',
        kind: 'regular'
    });

    testPackage = await createTestCourse({
        name: 'پکیج جامع مهارت حرکت',
        price: '500000',
        salePrice: '450000',
        kind: 'skill'
    });

    await PackageCourses.create({
        packageId: testPackage.id,
        courseId: testPackageSubCourse.id
    });

    // Spin up test server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api/v1`;
});

test.after(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    await sequelize.close();
});

test('Payment Gateway: Architecture & Adapter resolution', () => {
    const mockGw = PaymentGateway.getGateway('mock');
    assert.equal(mockGw instanceof FakeGateway, true);
    assert.equal(mockGw.getName(), 'mock');

    const fakeGw = PaymentGateway.getGateway('fake');
    assert.equal(fakeGw instanceof FakeGateway, true);

    const zibalGw = PaymentGateway.getGateway('zibal');
    assert.equal(zibalGw instanceof ZibalGateway, true);
    assert.equal(zibalGw.getName(), 'zibal');
});

test('Fake Gateway: End-to-End Payment, Verification & Entitlement Activation', async () => {
    // 1. Create order
    const order = await Orders.create({
        userId: testUser.id,
        status: 'pending',
        totalAmount: '250000',
        discountAmount: '0',
        finalAmount: '250000'
    });

    await OrderItems.create({
        orderId: order.id,
        productId: testCourse.id,
        productType: 'course',
        price: '250000',
        productName: testCourse.name,
        quantity: 1
    });

    // 2. Initiate payment
    const initRes = await fetch(`${baseUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({
            orderId: order.id,
            gateway: 'mock'
        })
    });

    assert.equal(initRes.status, 200);
    const initData = await initRes.json();
    assert.equal(initData.ok, true);
    assert.equal(initData.data.amount, '250000');
    assert.equal(initData.data.gateway, 'mock');
    assert.ok(initData.data.trackId);
    const paymentId = initData.data.paymentId;

    // Verify payment is currently PENDING in DB
    const pendingPayment = await Payments.findByPk(paymentId);
    assert.equal(pendingPayment.status, 'pending');

    // Verify course is NOT accessible yet
    const accessBefore = await AccessService.hasCourseAccess(testUser.id, testCourse.id);
    assert.equal(accessBefore, false, 'Course must not be accessible before verification');

    // 3. Process fake payment
    const payRes = await fetch(`${baseUrl}/payments/fake/process`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({
            paymentId,
            action: 'pay',
            transactionId: 'TEST-TXN-12345'
        })
    });

    assert.equal(payRes.status, 200);
    const payData = await payRes.json();
    assert.equal(payData.ok, true);

    // 4. Verify payment in DB is now PAID
    const paidPayment = await Payments.findByPk(paymentId);
    assert.equal(paidPayment.status, 'paid');
    assert.equal(paidPayment.transactionId, 'TEST-TXN-12345');
    assert.ok(paidPayment.paidAt);

    const paidOrder = await Orders.findByPk(order.id);
    assert.equal(paidOrder.status, 'paid');

    // 5. Verify course access is now UNLOCKED
    const accessAfter = await AccessService.hasCourseAccess(testUser.id, testCourse.id);
    assert.equal(accessAfter, true, 'Course must be unlocked after paid payment');

    // 6. Idempotency test: re-verifying must NOT duplicate or fail
    const reprocess = await PaymentGateway.processSuccessfulPayment(paymentId, { transactionId: 'TEST-TXN-12345' });
    assert.equal(reprocess.success, true);
    assert.equal(reprocess.alreadyProcessed, true);

    const accessRecords = await CourseAccess.findAll({
        where: { userId: testUser.id, courseId: testCourse.id }
    });
    assert.equal(accessRecords.length, 1, 'Should not create duplicate course access records');
});

test('Fake Gateway: Cancellation flow prevents course unlock', async () => {
    // 1. Create order
    const unboughtCourse = await createTestCourse({
        name: 'دوره تست لغو پرداخت',
        price: '180000',
        kind: 'regular'
    });

    const order = await Orders.create({
        userId: testUser.id,
        status: 'pending',
        totalAmount: '180000',
        discountAmount: '0',
        finalAmount: '180000'
    });

    await OrderItems.create({
        orderId: order.id,
        productId: unboughtCourse.id,
        productType: 'course',
        price: '180000',
        productName: unboughtCourse.name,
        quantity: 1
    });

    // 2. Initiate payment
    const initRes = await fetch(`${baseUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({ orderId: order.id, gateway: 'mock' })
    });
    const initData = await initRes.json();
    const paymentId = initData.data.paymentId;

    // 3. User cancels payment
    const cancelRes = await fetch(`${baseUrl}/payments/fake/process`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({
            paymentId,
            action: 'cancel',
            reason: 'کاربر پنجره پرداخت را بست'
        })
    });

    assert.equal(cancelRes.status, 200);
    const cancelData = await cancelRes.json();
    assert.equal(cancelData.ok, true);

    const cancelledPayment = await Payments.findByPk(paymentId);
    assert.equal(cancelledPayment.status, 'cancelled');

    const cancelledOrder = await Orders.findByPk(order.id);
    assert.equal(cancelledOrder.status, 'cancelled');

    // 4. Verify course remains locked
    const hasAccess = await AccessService.hasCourseAccess(testUser.id, unboughtCourse.id);
    assert.equal(hasAccess, false, 'Cancelled payment must NOT grant course access');
});

test('Zibal Gateway: Request payment parameters and Toman-to-Rial conversion', async () => {
    const zibal = new ZibalGateway();
    assert.equal(zibal.getName(), 'zibal');

    // Test Toman to Rial conversion
    const payment = { id: 'test-pay-1', amount: '45000' }; // 45,000 Tomans
    const order = { id: 'test-order-1' };
    const user = { phoneNumber: '09121112233' };

    // Mock _post on zibal instance to test request body formatting
    let interceptedEndpoint = null;
    let interceptedPayload = null;

    zibal._post = async (endpoint, payload) => {
        interceptedEndpoint = endpoint;
        interceptedPayload = payload;
        return {
            status: 200,
            data: {
                trackId: 1234567890,
                result: 100,
                message: 'success'
            }
        };
    };

    const res = await zibal.createPayment({
        payment,
        order,
        user,
        callbackUrl: 'http://localhost:3000/api/v1/payments/zibal/callback',
        description: 'تست درگاه زیبال'
    });

    assert.equal(interceptedEndpoint, '/v1/request');
    assert.equal(interceptedPayload.merchant, configs.zibalMerchant);
    // 45,000 Tomans * 10 = 450,000 Rials
    assert.equal(interceptedPayload.amount, 450000);
    assert.equal(interceptedPayload.mobile, '09121112233');
    assert.equal(interceptedPayload.orderId, 'test-order-1');
    assert.equal(res.trackId, '1234567890');
    assert.equal(res.redirectUrl, 'https://gateway.zibal.ir/start/1234567890');
    assert.equal(res.requiresGatewayRedirect, true);
});

test('Zibal Callback & Verification: Successful flow with Package unlocking', async () => {
    // 1. Create order for package (which contains testPackageSubCourse)
    const order = await Orders.create({
        userId: testUser.id,
        status: 'pending',
        totalAmount: '450000',
        discountAmount: '0',
        finalAmount: '450000'
    });

    await OrderItems.create({
        orderId: order.id,
        productId: testPackage.id,
        productType: 'course',
        price: '450000',
        productName: testPackage.name,
        quantity: 1
    });

    const mockTrackId = `zbl-track-${Date.now()}`;
    const payment = await Payments.create({
        userId: testUser.id,
        orderId: order.id,
        amount: '450000',
        gateway: 'zibal',
        trackId: mockTrackId,
        status: 'pending',
        type: 'pending'
    });
    order.paymentId = payment.id;
    await order.save();

    // 2. Mock Zibal verify API
    const originalPost = ZibalGateway.prototype._post;
    ZibalGateway.prototype._post = async function (endpoint, payload) {
        if (endpoint === '/v1/verify') {
            assert.equal(payload.trackId, mockTrackId);
            return {
                status: 200,
                data: {
                    result: 100, // Success
                    status: 1, // Paid and verified
                    amount: 4500000, // 4,500,000 Rials = 450,000 Tomans
                    refNumber: 88776655,
                    paidAt: new Date().toISOString(),
                    cardNumber: '627419******1234',
                    orderId: order.id,
                    message: 'success'
                }
            };
        }
        return originalPost.call(this, endpoint, payload);
    };

    try {
        // 3. Trigger Zibal Callback endpoint
        const callbackRes = await fetch(
            `${baseUrl}/payments/zibal/callback?trackId=${mockTrackId}&success=1&status=2&orderId=${order.id}`,
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );

        assert.equal(callbackRes.status, 200);
        const callbackData = await callbackRes.json();
        assert.equal(callbackData.ok, true);
        assert.equal(callbackData.data.status, 'success');
        assert.equal(callbackData.data.refNumber, '88776655');

        // 4. Verify Payment in DB is PAID
        const updatedPayment = await Payments.findByPk(payment.id);
        assert.equal(updatedPayment.status, 'paid');
        assert.equal(updatedPayment.transactionId, '88776655');
        assert.equal(updatedPayment.cardNumber, '627419******1234');
        assert.ok(updatedPayment.paidAt);

        // 5. Verify Package AND included sub-course are now active
        const hasPackageAccess = await AccessService.hasCourseAccess(testUser.id, testPackage.id);
        assert.equal(hasPackageAccess, true, 'Package itself must be unlocked');

        const hasSubCourseAccess = await AccessService.hasCourseAccess(testUser.id, testPackageSubCourse.id);
        assert.equal(hasSubCourseAccess, true, 'Courses included in the package must be unlocked');

        // 6. Test Idempotent Duplicate Callback
        const dupRes = await fetch(
            `${baseUrl}/payments/zibal/callback?trackId=${mockTrackId}&success=1&status=2&orderId=${order.id}`,
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );
        assert.equal(dupRes.status, 200);
        const dupData = await dupRes.json();
        assert.equal(dupData.ok, true);
        assert.equal(dupData.data.status, 'success');
    } finally {
        ZibalGateway.prototype._post = originalPost;
    }
});

test('Zibal Callback Security: Amount mismatch is blocked and marks payment failed', async () => {
    const unboughtCourse = await createTestCourse({
        name: 'دوره ضد تقلب درگاه',
        price: '500000',
        kind: 'regular'
    });

    const order = await Orders.create({
        userId: testUser.id,
        status: 'pending',
        totalAmount: '500000',
        discountAmount: '0',
        finalAmount: '500000'
    });

    await OrderItems.create({
        orderId: order.id,
        productId: unboughtCourse.id,
        productType: 'course',
        price: '500000',
        productName: unboughtCourse.name,
        quantity: 1
    });

    const mismatchTrackId = `zbl-mismatch-${Date.now()}`;
    const payment = await Payments.create({
        userId: testUser.id,
        orderId: order.id,
        amount: '500000', // Expected: 500,000 Tomans
        gateway: 'zibal',
        trackId: mismatchTrackId,
        status: 'pending',
        type: 'pending'
    });

    const originalPost = ZibalGateway.prototype._post;
    ZibalGateway.prototype._post = async function (endpoint, payload) {
        if (endpoint === '/v1/verify') {
            // Zibal reports only 100,000 Tomans (1,000,000 Rials) instead of 500,000 Tomans
            return {
                status: 200,
                data: {
                    result: 100,
                    status: 1,
                    amount: 1000000, // 100,000 Tomans
                    refNumber: 11223344,
                    paidAt: new Date().toISOString(),
                    cardNumber: '627419******1234',
                    message: 'success'
                }
            };
        }
        return originalPost.call(this, endpoint, payload);
    };

    try {
        const callbackRes = await fetch(
            `${baseUrl}/payments/zibal/callback?trackId=${mismatchTrackId}&success=1&status=2`,
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );

        assert.equal(callbackRes.status, 200);
        const data = await callbackRes.json();
        assert.equal(data.ok, false);
        assert.equal(data.data.status, 'failed');

        const failedPayment = await Payments.findByPk(payment.id);
        assert.equal(failedPayment.status, 'cancelled');
        assert.match(failedPayment.failureReason, /مغایرت مبلغ/);

        // Access MUST NOT be granted!
        const hasAccess = await AccessService.hasCourseAccess(testUser.id, unboughtCourse.id);
        assert.equal(hasAccess, false, 'Access must NOT be granted when payment amounts mismatch');
    } finally {
        ZibalGateway.prototype._post = originalPost;
    }
});

test('Zibal Callback: Cancelled or failed callback sets status cancelled and denies access', async () => {
    const unboughtCourse = await createTestCourse({
        name: 'دوره انصراف درگاه',
        price: '300000',
        kind: 'regular'
    });

    const order = await Orders.create({
        userId: testUser.id,
        status: 'pending',
        totalAmount: '300000',
        discountAmount: '0',
        finalAmount: '300000'
    });

    await OrderItems.create({
        orderId: order.id,
        productId: unboughtCourse.id,
        productType: 'course',
        price: '300000',
        productName: unboughtCourse.name,
        quantity: 1
    });

    const cancelTrackId = `zbl-cancel-${Date.now()}`;
    const payment = await Payments.create({
        userId: testUser.id,
        orderId: order.id,
        amount: '300000',
        gateway: 'zibal',
        trackId: cancelTrackId,
        status: 'pending',
        type: 'pending'
    });

    // Callback received with success=0 and status=3 (cancelled by user)
    const callbackRes = await fetch(
        `${baseUrl}/payments/zibal/callback?trackId=${cancelTrackId}&success=0&status=3`,
        {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        }
    );

    assert.equal(callbackRes.status, 200);
    const data = await callbackRes.json();
    assert.equal(data.ok, false);
    assert.equal(data.data.status, 'cancelled');

    const cancelledPayment = await Payments.findByPk(payment.id);
    assert.equal(cancelledPayment.status, 'cancelled');

    const hasAccess = await AccessService.hasCourseAccess(testUser.id, unboughtCourse.id);
    assert.equal(hasAccess, false);
});

test('Payment Status Endpoint: Provides verified backend status for Result Page', async () => {
    const payment = await Payments.create({
        userId: testUser.id,
        amount: '200000',
        gateway: 'zibal',
        trackId: `track-${Date.now()}`,
        transactionId: 'TXN-STATUS-TEST',
        status: 'paid',
        type: 'paid',
        paidAt: new Date()
    });

    const res = await fetch(`${baseUrl}/payments/${payment.id}/status`, {
        headers: { 'Authorization': `Bearer ${testUserToken}` }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.data.id, payment.id);
    assert.equal(body.data.status, 'paid');
    assert.equal(body.data.gateway, 'zibal');
    assert.equal(body.data.transactionId, 'TXN-STATUS-TEST');
});
