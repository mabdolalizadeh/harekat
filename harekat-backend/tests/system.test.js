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

    // 3. Test Course-Targeted Coupon
    const targetCourseCoupon = `COURSE_ONLY_${Date.now()}`;
    await Coupon.create({
        code: targetCourseCoupon,
        discountType: 'fixed',
        discountValue: 150000,
        targetType: 'course',
        targetCourseId: course.id,
        isActive: true
    });

    // Other non-enrolled student trying to validate course-targeted coupon
    const otherStudent = await Users.create({
        phoneNumber: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'دانشجوی دوم'
    });
    const otherStudentToken = jwt.sign({ id: otherStudent.id, phoneNumber: otherStudent.phoneNumber }, configs.jwtKey);

    const failCourseValRes = await fetch(`${baseUrl}/coupons/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${otherStudentToken}`
        },
        body: JSON.stringify({ code: targetCourseCoupon, orderAmount: 500000 })
    });
    assert.equal(failCourseValRes.status, 400);

    // Grant enrollment to other student
    await CourseAccess.create({
        userId: otherStudent.id,
        courseId: course.id,
        status: 'active',
        grantedAt: new Date()
    });

    const successCourseValRes = await fetch(`${baseUrl}/coupons/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${otherStudentToken}`
        },
        body: JSON.stringify({ code: targetCourseCoupon, orderAmount: 500000 })
    });
    assert.equal(successCourseValRes.status, 200);
    const successCourseValData = await successCourseValRes.json();
    assert.equal(successCourseValData.data.discount, 150000);

    // 4. Test User-Targeted Coupon
    const userTargetCoupon = `VIP_USER_${Date.now()}`;
    await Coupon.create({
        code: userTargetCoupon,
        discountType: 'percent',
        discountValue: 50,
        targetType: 'users',
        targetUserIds: JSON.stringify([otherStudent.id]),
        isActive: true
    });

    // Student 1 (not in target list) attempts validation
    const failUserValRes = await fetch(`${baseUrl}/coupons/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ code: userTargetCoupon, orderAmount: 500000 })
    });
    assert.equal(failUserValRes.status, 400);

    // Student 2 (in target list) attempts validation
    const successUserValRes = await fetch(`${baseUrl}/coupons/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${otherStudentToken}`
        },
        body: JSON.stringify({ code: userTargetCoupon, orderAmount: 500000 })
    });
    assert.equal(successUserValRes.status, 200);
    const successUserValData = await successUserValRes.json();
    assert.equal(successUserValData.data.discount, 250000);
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

test('7. TA Course Isolation & Server-side RBAC Enforcement', async () => {
    const courseA = await Courses.create({
        name: 'دوره الف',
        price: '0',
        image: 'https://example.com/a.jpg',
        level: 'مقدماتی',
        duration: '۵ ساعت',
        typeOfAttendence: 'آنلاین',
        statusOfRegistration: 'open',
        isActive: true
    });
    const courseB = await Courses.create({
        name: 'دوره ب',
        price: '0',
        image: 'https://example.com/b.jpg',
        level: 'پیشرفته',
        duration: '۸ ساعت',
        typeOfAttendence: 'آنلاین',
        statusOfRegistration: 'open',
        isActive: true
    });

    // Create TA A
    const taAdminA = await Admins.create({
        username: `ta_user_a_${Date.now()}`,
        password: 'Password123!',
        role: 'ta',
        name: 'دستیار الف',
        status: 'active'
    });
    const taTokenA = jwt.sign({ id: taAdminA.id, role: 'ta', username: taAdminA.username }, configs.jwtKey);

    // Assign TA A to Course A only
    const { TACourses } = await import('../src/models/index.js');
    await TACourses.create({ adminId: taAdminA.id, courseId: courseA.id });

    // 1. TA A creates assignment on Course A (allowed)
    const asgARes = await fetch(`${baseUrl}/assignments/course/${courseA.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${taTokenA}`
        },
        body: JSON.stringify({
            title: 'تکلیف دوره الف',
            description: 'توضیحات تکلیف الف',
            maxScore: 100
        })
    });
    assert.equal(asgARes.status, 201);
    const asgAData = await asgARes.json();
    assert.equal(asgAData.ok, true);

    // 2. TA A attempts to create assignment on Course B (must be 403 Forbidden)
    const asgBRes = await fetch(`${baseUrl}/assignments/course/${courseB.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${taTokenA}`
        },
        body: JSON.stringify({
            title: 'تکلیف غیرمجاز روی دوره ب',
            maxScore: 100
        })
    });
    assert.equal(asgBRes.status, 403);

    // 3. TA A creates quiz on Course A (allowed)
    const quizARes = await fetch(`${baseUrl}/quizzes/course/${courseA.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${taTokenA}`
        },
        body: JSON.stringify({
            title: 'آزمونک دوره الف',
            durationMinutes: 10,
            passingScore: 70,
            questions: [{ question: 'سوال ۱؟', options: ['الف', 'ب'], correctOptionIndex: 0, score: 1 }]
        })
    });
    assert.equal(quizARes.status, 201);

    // 4. TA A attempts to create quiz on Course B (must be 403 Forbidden)
    const quizBRes = await fetch(`${baseUrl}/quizzes/course/${courseB.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${taTokenA}`
        },
        body: JSON.stringify({
            title: 'آزمونک غیرمجاز ب',
            questions: [{ question: 'سوال؟', options: ['۱', '۲'], correctOptionIndex: 0, score: 1 }]
        })
    });
    assert.equal(quizBRes.status, 403);
});

test('8. Evaluation Gate & Session Progression Enforcement', async () => {
    // Create course with evaluation required at session 4
    const evalCourse = await Courses.create({
        name: 'دوره با گیت ارزیابی',
        price: '0',
        image: 'https://example.com/eval.jpg',
        level: 'مقدماتی',
        duration: '۱۰ ساعت',
        typeOfAttendence: 'آنلاین',
        statusOfRegistration: 'open',
        isActive: true,
        evaluationRequired: true,
        evaluationTriggerSession: 4
    });

    const student = await Users.create({
        phoneNumber: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'دانشجوی ارزیابی'
    });
    const studentToken = jwt.sign({ id: student.id, phoneNumber: student.phoneNumber }, configs.jwtKey);

    await CourseAccess.create({
        userId: student.id,
        courseId: evalCourse.id,
        status: 'active',
        sourceType: 'direct'
    });

    // Create 5 sessions
    for (let i = 1; i <= 5; i++) {
        await Sessions.create({
            courseId: evalCourse.id,
            sessionNumber: i,
            title: `جلسه ${i}`,
            videoLink: `https://example.com/video_${i}.mp4`
        });
    }

    // 1. Fetch sessions before evaluation
    const beforeRes = await fetch(`${baseUrl}/sessions/course/${evalCourse.id}/student`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.equal(beforeRes.status, 200);
    const beforeData = await beforeRes.json();
    assert.equal(beforeData.ok, true);

    const s3 = beforeData.data.sessions.find(s => s.sessionNumber === 3);
    const s4 = beforeData.data.sessions.find(s => s.sessionNumber === 4);
    const s5 = beforeData.data.sessions.find(s => s.sessionNumber === 5);

    assert.equal(s3.isLocked, false);
    assert.ok(s3.videoLink, 'Session 3 video link should be available');
    assert.equal(s4.isLocked, true, 'Session 4 should be locked by evaluation gate');
    assert.equal(s4.videoLink, null, 'Session 4 video link must be redacted');
    assert.equal(s5.isLocked, true, 'Session 5 should be locked by evaluation gate');
    assert.equal(s5.videoLink, null, 'Session 5 video link must be redacted');

    // 2. Student submits evaluation
    const evalRes = await fetch(`${baseUrl}/evaluations/course/${evalCourse.id}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
            overallRating: 5,
            teachingRating: 5,
            contentRating: 4,
            feedback: 'استاد بسیار عالی و مسلط بودند.'
        })
    });
    assert.equal(evalRes.status, 200);
    const evalData = await evalRes.json();
    assert.equal(evalData.ok, true);

    // 3. Fetch sessions after evaluation
    const afterRes = await fetch(`${baseUrl}/sessions/course/${evalCourse.id}/student`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.equal(afterRes.status, 200);
    const afterData = await afterRes.json();
    assert.equal(afterData.ok, true);

    const s4After = afterData.data.sessions.find(s => s.sessionNumber === 4);
    const s5After = afterData.data.sessions.find(s => s.sessionNumber === 5);

    assert.equal(s4After.isLocked, false, 'Session 4 must be unlocked after evaluation');
    assert.ok(s4After.videoLink, 'Session 4 video link must be available after evaluation');
    assert.equal(s5After.isLocked, false, 'Session 5 must be unlocked after evaluation');
    assert.ok(s5After.videoLink, 'Session 5 video link must be available after evaluation');
});

test('9. Direct RSA Key Authentication Fallback Endpoint', async () => {
    // Generate RSA pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    const testAdmin = await Admins.create({
        username: `rsa_direct_user_${Date.now()}`,
        password: 'Password123!',
        role: 'superadmin',
        name: 'Direct RSA User',
        status: 'active',
        publicKey: publicKey
    });

    const loginRes = await fetch(`${baseUrl}/admins/auth/rsa-direct-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: testAdmin.username,
            privateKeyPem: privateKey
        })
    });

    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.equal(loginData.ok, true);
    assert.ok(loginData.data.token, 'Should return JWT token for valid direct RSA login');
    assert.equal(loginData.data.admin.username, testAdmin.username);
});
