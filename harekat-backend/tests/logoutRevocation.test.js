import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { sequelize } from '../src/models/database.config.js';
import { Users, RevokedTokens } from '../src/models/index.js';
import { migrateLmsSchema } from '../src/models/migrateLms.js';
import { configs } from '../src/config/config.js';
import { tokenRevocationService } from '../src/services/tokenRevocationService.js';
import jwt from 'jsonwebtoken';

let server;
let baseUrl;

test.before(async () => {
    configs.smsirMock = true;
    configs.otpMode = 'mock';

    await sequelize.sync();
    await migrateLmsSchema();
    await tokenRevocationService.init();

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

test('JWT Revocation: logging out from one place invalidates tokens across all places', async () => {
    const phoneNumber = `0911${Math.floor(1000000 + Math.random() * 9000000)}`;

    // 1. Request OTP
    const reqRes = await fetch(`${baseUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
    });
    const reqData = await reqRes.json();
    assert.equal(reqRes.status, 200);
    assert.ok(reqData.ok);

    const user = await Users.findOne({ where: { phoneNumber } });
    assert.ok(user);
    const otp = user.otp;

    // 2. Validate OTP (First login - e.g. on Landing)
    const login1Res = await fetch(`${baseUrl}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
    });
    const login1Data = await login1Res.json();
    assert.equal(login1Res.status, 200);
    const tokenLanding = login1Data.data.token;
    assert.ok(tokenLanding);

    // 3. Create a second token for the same user (e.g. on Dashboard / second device)
    // using jwt.sign matching user's current tokenVersion
    await user.reload();
    const tokenDashboard = jwt.sign(
        { id: user.id, role: 'user', tokenVersion: user.tokenVersion || 1 },
        configs.jwtKey,
        { expiresIn: '1h' }
    );

    // 4. Verify both tokens work for /auth/me
    const meLanding = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenLanding}` }
    });
    assert.equal(meLanding.status, 200);

    const meDashboard = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenDashboard}` }
    });
    assert.equal(meDashboard.status, 200);

    // 5. User logs out from one place (e.g. Dashboard)
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenDashboard}`
        }
    });
    const logoutData = await logoutRes.json();
    assert.equal(logoutRes.status, 200);
    assert.ok(logoutData.ok);

    // Verify Set-Cookie header cleared cookies
    const cookieHeader = logoutRes.headers.get('set-cookie');
    assert.ok(cookieHeader);
    assert.ok(cookieHeader.includes('auth_token=;'));

    // 6. Verify tokenDashboard (the token used to logout) is now completely invalid (401)
    const afterLogoutDash = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenDashboard}` }
    });
    assert.equal(afterLogoutDash.status, 401, 'Dashboard token must be rejected after logout');

    // 7. Verify tokenLanding (from the other place) is ALSO completely invalid (401)
    const afterLogoutLanding = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenLanding}` }
    });
    assert.equal(afterLogoutLanding.status, 401, 'Landing token must also be rejected after logout from another place');

    // 8. Verify token exists in RevokedTokens database table
    const tokenHash = tokenRevocationService.hashToken(tokenDashboard);
    const dbRecord = await RevokedTokens.findOne({ where: { tokenHash } });
    assert.ok(dbRecord, 'Revoked token must be recorded in RevokedTokens table');

    // 9. User logs in again -> New token should work
    user.otp = '99999';
    user.otpExpiresAt = new Date(Date.now() + 60000);
    user.otpAttempts = 0;
    await user.save();

    const login2Res = await fetch(`${baseUrl}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: '99999' })
    });
    const login2Data = await login2Res.json();
    assert.equal(login2Res.status, 200);
    const tokenNew = login2Data.data.token;
    assert.ok(tokenNew);

    const meNew = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenNew}` }
    });
    assert.equal(meNew.status, 200, 'Newly issued token must work');

    // 10. Old tokens (tokenLanding and tokenDashboard) MUST STILL FAIL
    const oldCheck1 = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenLanding}` }
    });
    assert.equal(oldCheck1.status, 401);

    const oldCheck2 = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenDashboard}` }
    });
    assert.equal(oldCheck2.status, 401);
});
