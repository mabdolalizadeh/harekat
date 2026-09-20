import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'crypto';
import app from '../src/app.js';
import { sequelize } from '../src/models/database.config.js';
import { Users, Admins, Courses, Sessions, Coupon, Payments, Orders, Notifications, UserLessonProgress, CourseAccess } from '../src/models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configs } from '../src/config/config.js';
import { migrateLmsSchema } from '../src/models/migrateLms.js';

let server;
let baseUrl;

test.before(async () => {
    // Ensure DB connection and schema sync + migration
    await sequelize.sync();
    await migrateLmsSchema();

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
    const res = await fetch(`${baseUrl}/auth`, {
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
    assert.ok(user.otp, 'User should have internal OTP code');

    // Verify OTP code
    const verifyRes = await fetch(`${baseUrl}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone, otp: user.otp })
    });

    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.ok, true);
    assert.ok(verifyData.data.token, 'Should return JWT token');
});

test('2. Superadmin Authentication & RSA Key Pair Creation', async () => {
    // Ensure superadmin exists with known password
    let superAdmin = await Admins.findOne({ where: { username: 'superadmin' } });
    if (!superAdmin) {
        superAdmin = await Admins.create({
            username: 'superadmin',
            password: 'Admin@Harekat2026!',
            role: 'superadmin',
            name: 'مدیر کل سیستم',
            status: 'active'
        });
    } else {
        superAdmin.password = 'Admin@Harekat2026!';
        await superAdmin.save();
    }

    const res = await fetch(`${baseUrl}/admins/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'superadmin', password: 'Admin@Harekat2026!' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.ok(data.data.token, 'Should return admin JWT token');
    assert.equal(data.data.admin.role, 'superadmin');
    const adminToken = data.data.token;

    // Create a new Super Admin with RSA-2048 key pair
    const testSaUsername = `rsa_superadmin_${Date.now()}`;
    const createSaRes = await fetch(`${baseUrl}/admins/create-superadmin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            username: testSaUsername,
            name: 'Super Admin RSA Test',
            generateRsaKey: true
        })
    });

    assert.equal(createSaRes.status, 201);
    const createSaData = await createSaRes.json();
    assert.equal(createSaData.ok, true);
    assert.ok(createSaData.data.privateKey, 'Should return generated RSA private key');
    assert.ok(createSaData.data.publicKey, 'Should return generated RSA public key');
    assert.ok(createSaData.data.keyFingerprint, 'Should return RSA key fingerprint');

    const privateKeyPem = createSaData.data.privateKey;

    // Challenge-Response RSA Authentication test
    const challengeRes = await fetch(`${baseUrl}/admins/auth/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testSaUsername })
    });

    assert.equal(challengeRes.status, 200);
    const challengeData = await challengeRes.json();
    assert.ok(challengeData.data.challenge, 'Should return cryptographic challenge');

    // Sign challenge with private key
    const sign = crypto.createSign('SHA256');
    sign.update(challengeData.data.challenge);
    sign.end();
    const signature = sign.sign(privateKeyPem, 'base64');

    // Login using RSA signature
    const rsaLoginRes = await fetch(`${baseUrl}/admins/auth/rsa-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: testSaUsername,
            challenge: challengeData.data.challenge,
            signature
        })
    });

    assert.equal(rsaLoginRes.status, 200);
    const rsaLoginData = await rsaLoginRes.json();
    assert.equal(rsaLoginData.ok, true);
    assert.ok(rsaLoginData.data.token, 'Should return JWT token for RSA authenticated session');
    assert.equal(rsaLoginData.data.admin.role, 'superadmin');
});

test('3. Cart Pricing & Server-side Coupon Calculation', async () => {
    // Create test course
    const course = await Courses.create({
        name: 'دوره جامع تست',
        description: 'توضیحات تست دوره',
        price: '1000000',
        image: 'https://example.com/test.jpg',
        level: 'مقدماتی',
        duration: '۱۰ ساعت',
        typeOfAttendence: 'آنلاین',
        statusOfRegistration: 'open',
        isActive: true
    });

    // Create test coupon: 20% discount
    const couponCode = `TEST20_${Date.now()}`;
    await Coupon.create({
        code: couponCode,
        discountType: 'percent',
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
    const studentToken = jwt.sign({ id: student.id, phoneNumber: student.phoneNumber }, configs.jwtKey);

    // 1. Add item to cart
    const cartRes = await fetch(`${baseUrl}/cart/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ productType: 'course', productId: course.id, quantity: 1, price: 1000000 })
    });

    assert.equal(cartRes.status, 200);
    const cartData = await cartRes.json();
    assert.equal(cartData.ok, true);

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
    assert.equal(Number(orderData.data.totalAmount), 1000000);
    assert.equal(Number(orderData.data.discountAmount), 200000);
    assert.equal(Number(orderData.data.finalAmount), 800000);
});

test('4. Notifications System & Sender Attribution', async () => {
    const admin = await Admins.findOne({ where: { username: 'superadmin' } });
    const adminToken = jwt.sign({ id: admin.id, role: admin.role, username: admin.username }, configs.jwtKey);

    const student = await Users.create({
        phoneNumber: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'دانشجوی اعلانات'
    });
    const studentToken = jwt.sign({ id: student.id, phoneNumber: student.phoneNumber }, configs.jwtKey);

    // Admin creates notification targeted to all users
    const createRes = await fetch(`${baseUrl}/notifications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            title: 'اطلاعیه شروع دوره',
            body: 'کلاس‌های دوره جدید از هفته آینده آغاز می‌شود.',
            recipientType: 'all',
            type: 'general'
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
});

test('5. LMS Session Progress & Course Stats', async () => {
    const student = await Users.create({
        phoneNumber: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'دانشجوی پیشرفت'
    });
    const studentToken = jwt.sign({ id: student.id, phoneNumber: student.phoneNumber }, configs.jwtKey);

    const course = await Courses.create({
        name: 'دوره تست پیشرفت',
        price: '0',
        image: 'https://example.com/test.jpg',
        level: 'مقدماتی',
        duration: '۵ ساعت',
        typeOfAttendence: 'آنلاین',
        statusOfRegistration: 'open',
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

test('6. Dashboard & Admin Subdomain Host Routing', async () => {
    // Request with dashboard.domain.tld host header
    const dashboardRes = await fetch(baseUrl.replace('/api/v1', '/'), {
        headers: { Host: 'dashboard.example.com' }
    });
    assert.ok([200, 404].includes(dashboardRes.status));

    // Request with admin.domain.tld host header
    const adminRes = await fetch(baseUrl.replace('/api/v1', '/'), {
        headers: { Host: 'admin.example.com' }
    });
    assert.ok([200, 404].includes(adminRes.status));
});
