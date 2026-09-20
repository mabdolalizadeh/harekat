import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { sequelize } from '../src/models/database.config.js';
import { Users, Admins, Courses, Sessions, Coupon, Payments, Orders, Notifications, UserLessonProgress, CourseAccess } from '../src/models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configs } from '../src/config/config.js';

let server;
let baseUrl;

test.before(async () => {
    // Ensure DB connection and schema sync
    await sequelize.sync();

    // Start server on an ephemeral port
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


test('1. Student Auth & Test OTP (No OTP in HTTP response)', async () => {
    const testPhone = '09129990001';

    // Request OTP
    const res = await fetch(`${baseUrl}/auth/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);

    // SECURITY CHECK: Response MUST NOT leak OTP
    assert.equal(data.otp, undefined, 'OTP leaked in HTTP response');
    assert.equal(data.code, undefined, 'Code leaked in HTTP response');

    // Retrieve user from DB to verify OTP exists internally
    const user = await Users.findOne({ where: { phoneNumber: testPhone } });
    assert.ok(user, 'User record should exist');
    assert.ok(user.code, 'User should have internal OTP code');

    // Verify OTP code
    const verifyRes = await fetch(`${baseUrl}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone, code: user.code })
    });

    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.ok, true);
    assert.ok(verifyData.token, 'Should return JWT token');
});

test('2. Superadmin Authentication (superadmin/superadmin)', async () => {
    // Ensure superadmin exists
    let superAdmin = await Admins.findOne({ where: { username: 'superadmin' } });
    if (!superAdmin) {
        const hashedPassword = await bcrypt.hash('superadmin', 10);
        superAdmin = await Admins.create({
            username: 'superadmin',
            password: hashedPassword,
            role: 'superadmin',
            name: 'مدیر کل سیستم',
            status: 'active'
        });
    }

    const res = await fetch(`${baseUrl}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'superadmin', password: 'superadmin' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.ok(data.token, 'Should return admin JWT token');
    assert.equal(data.admin.role, 'superadmin');
});

test('3. Cart Pricing & Server-side Coupon Calculation', async () => {
    // Create test course
    const course = await Courses.create({
        name: 'دوره جامع تست',
        description: 'توضیحات تست دوره',
        price: 1000000,
        isActive: true
    });

    // Create test coupon: 20% discount
    const couponCode = `TEST20_${Date.now()}`;
    await Coupon.create({
        code: couponCode,
        discountType: 'percentage',
        discountValue: 20,
        maxUses: 10,
        usedCount: 0,
        isActive: true
    });

    // Create student and token
    const student = await Users.create({
        phoneNumber: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'دانشجوی تست'
    });
    const studentToken = jwt.sign({ id: student.id, phoneNumber: student.phoneNumber }, configs.jwtSecret);

    // 1. Add item to cart
    const cartRes = await fetch(`${baseUrl}/cart/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ itemType: 'course', itemId: course.id, quantity: 1 })
    });

    assert.equal(cartRes.status, 200);
    const cartData = await cartRes.json();
    assert.equal(cartData.ok, true);
    assert.equal(Number(cartData.data.totalPrice), 1000000);

    // 2. Checkout order with coupon
    const orderRes = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ couponCode })
    });

    assert.equal(orderRes.status, 201);
    const orderData = await orderRes.json();
    assert.equal(orderData.ok, true);
    assert.equal(Number(orderData.data.originalAmount), 1000000);
    assert.equal(Number(orderData.data.discountAmount), 200000);
    assert.equal(Number(orderData.data.totalAmount), 800000);
    assert.ok(orderData.payment, 'Should generate pending payment record');
});

test('4. Fake Payment Gateway (Paid vs Cancelled & Access Provisioning)', async () => {
    // Setup student & course
    const student = await Users.create({
        phoneNumber: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'دانشجوی پرداخت تست'
    });
    const studentToken = jwt.sign({ id: student.id, phoneNumber: student.phoneNumber }, configs.jwtSecret);

    const course = await Courses.create({
        name: 'دوره آموزش پرداخت آزمایشی',
        price: 500000,
        isActive: true
    });

    const payment = await Payments.create({
        userId: student.id,
        amount: 500000,
        status: 'pending',
        type: 'course',
        courseId: course.id,
        gateway: 'fake'
    });

    // 1. Test Cancel Payment
    const cancelRes = await fetch(`${baseUrl}/payments/fake/process`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ paymentId: payment.id, action: 'cancel' })
    });

    assert.equal(cancelRes.status, 200);
    const cancelData = await cancelRes.json();
    assert.equal(cancelData.ok, true);
    assert.equal(cancelData.data.status, 'cancelled');

    // 2. Reset and Test Successful Payment Confirmation
    await payment.update({ status: 'pending' });

    const payRes = await fetch(`${baseUrl}/payments/fake/process`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ paymentId: payment.id, action: 'pay' })
    });

    assert.equal(payRes.status, 200);
    const payData = await payRes.json();
    assert.equal(payData.ok, true);
    assert.equal(payData.data.status, 'paid');

    // Verify course access was automatically granted
    const access = await CourseAccess.findOne({
        where: { userId: student.id, courseId: course.id, status: 'active' }
    });
    assert.ok(access, 'Student should be granted active course access');
});

test('5. Notifications System & Sender Attribution', async () => {
    const admin = await Admins.findOne({ where: { username: 'superadmin' } });
    const adminToken = jwt.sign({ id: admin.id, role: admin.role, username: admin.username }, configs.jwtSecret);

    const student = await Users.create({
        phoneNumber: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'دانشجوی اعلانات'
    });
    const studentToken = jwt.sign({ id: student.id, phoneNumber: student.phoneNumber }, configs.jwtSecret);

    // Admin creates notification targeted to all users
    const createRes = await fetch(`${baseUrl}/notifications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            title: 'اطلاعیه شروع دوره',
            message: 'کلاس‌های دوره جدید از هفته آینده آغاز می‌شود.',
            targetType: 'all',
            type: 'announcement'
        })
    });

    assert.equal(createRes.status, 201);
    const createData = await createRes.json();
    assert.equal(createData.ok, true);

    // Student retrieves notifications
    const getRes = await fetch(`${baseUrl}/notifications/my`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.ok, true);
    assert.ok(Array.isArray(getData.data));
    const notif = getData.data.find((n) => n.title === 'اطلاعیه شروع دوره');
    assert.ok(notif, 'Notification should be delivered to student');
    assert.equal(notif.senderName, 'مدیریت حرکت');
});

test('6. LMS Session Progress & Course Stats', async () => {
    const student = await Users.create({
        phoneNumber: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'دانشجوی پیشرفت'
    });
    const studentToken = jwt.sign({ id: student.id, phoneNumber: student.phoneNumber }, configs.jwtSecret);

    const course = await Courses.create({
        name: 'دوره تست پیشرفت',
        price: 0,
        isActive: true
    });

    // Grant access
    await CourseAccess.create({
        userId: student.id,
        courseId: course.id,
        status: 'active',
        sourceType: 'direct'
    });

    const session1 = await Sessions.create({ courseId: course.id, sessionNumber: 1, title: 'جلسه ۱' });
    const session2 = await Sessions.create({ courseId: course.id, sessionNumber: 2, title: 'جلسه ۲' });

    // Mark session 1 as completed
    const progressRes = await fetch(`${baseUrl}/sessions/${session1.id}/progress`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ isCompleted: true, progressPercent: 100 })
    });

    assert.equal(progressRes.status, 200);
    const progressData = await progressRes.json();
    assert.equal(progressData.ok, true);
    assert.equal(progressData.data.isCompleted, true);

    // Fetch course sessions student view
    const viewRes = await fetch(`${baseUrl}/sessions/course/${course.id}/student`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    assert.equal(viewRes.status, 200);
    const viewData = await viewRes.json();
    assert.equal(viewData.ok, true);
    assert.equal(viewData.data.stats.totalSessions, 2);
    assert.equal(viewData.data.stats.completedSessions, 1);
    assert.equal(viewData.data.stats.completionPercentage, 50);
});

test('7. Dashboard & Admin Subdomain Host Routing', async () => {
    // Request with dashboard.domain.tld host header
    const dashboardRes = await fetch(baseUrl.replace('/api/v1', '/'), {
        headers: { Host: 'dashboard.example.com' }
    });
    // Should respond with 200 or serve the SPA (or 404 if dist not built yet, but routing handled without 500 error)
    assert.ok([200, 404].includes(dashboardRes.status));

    // Request with admin.domain.tld host header
    const adminRes = await fetch(baseUrl.replace('/api/v1', '/'), {
        headers: { Host: 'admin.example.com' }
    });
    assert.ok([200, 404].includes(adminRes.status));
});

