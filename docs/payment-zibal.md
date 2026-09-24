# Zibal IPG Payment Gateway Integration & Architecture

## Overview

Harekat LMS provides an enterprise-grade, extensible payment gateway architecture supporting both the **official Zibal IPG** (for staging & production) and a **Fake/Mock Gateway** (for local development, CI pipelines, and automated end-to-end testing).

The integration follows strict financial and security guidelines:
- **Zero Frontend Price Trust:** The frontend never decides payment amounts. Authoritative amounts are computed solely from the database (courses, packages, subscriptions, and server-side coupon validation).
- **Atomic Entitlement Granting:** Payments and course/package/subscription unlocks are executed inside database transactions.
- **Strict Idempotency:** Callbacks can be received multiple times without granting duplicate accesses, duplicating subscriptions, or corrupting accounting records.
- **Amount & Identity Guard:** The callback strictly verifies that the amount confirmed by Zibal matches the database order amount before any entitlement is activated.

---

## 1. Architecture

```text
PaymentGateway (Factory & Orchestrator)
   │
   ├── BaseGateway (Interface Contract)
   │     ├── createPayment({ amountRials, orderId, callbackUrl, mobile, description })
   │     ├── verifyPayment({ payment, trackId, callbackParams })
   │     └── inquiryPayment({ trackId })
   │
   ├── FakeGateway (Local development & CI mock adapter)
   └── ZibalGateway (Official Zibal IPG adapter)
```

### Components:
- **`BaseGateway` (`src/services/gateways/BaseGateway.js`)**: Base interface defining required gateway operations.
- **`FakeGateway` (`src/services/gateways/FakeGateway.js`)**: In-memory and test-friendly adapter simulating payment screens, success, cancellation, and failure scenarios.
- **`ZibalGateway` (`src/services/gateways/ZibalGateway.js`)**: Production adapter adhering to the official Zibal IPG documentation:
  - Request: `POST https://gateway.zibal.ir/v1/request`
  - Payment Page Redirect: `https://gateway.zibal.ir/start/{trackId}`
  - Verify: `POST https://gateway.zibal.ir/v1/verify`
  - Inquiry: `POST https://gateway.zibal.ir/v1/inquiry`
  - Currency conversion: Toman to Rial (`1 Toman = 10 Rials`).
- **`PaymentGateway` (`src/services/paymentGateway.js`)**: Core business orchestration service managing pending payments, order locking, callback validation, idempotency, atomic access granting via `AccessService`, and security audit logging.

---

## 2. Environment Variables

Configure the following variables in `harekat-backend/.env`:

| Variable | Required | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `PAYMENT_GATEWAY` | No | `mock` (or `zibal`) | Active default payment gateway (`mock` or `zibal`). |
| `ZIBAL_MERCHANT` | In Prod | `zibal` (sandbox) | Zibal Merchant ID (`zibal` for testing). |
| `ZIBAL_CALLBACK_URL` | Yes | `https://schoolharekat.ir/api/v1/payments/zibal/callback` | Full public callback URL (API hosted on domain without `api.` subdomain). |
| `ZIBAL_BASE_URL` | No | `https://gateway.zibal.ir` | Zibal gateway base URL. |
| `DASHBOARD_URL` | No | `https://dashboard.schoolharekat.ir` | User dashboard URL for browser redirects. |
| `BACKEND_BASE_URL`| No | `https://schoolharekat.ir` | Backend host origin for webhooks and callbacks. |

> [!NOTE]
> For `schoolharekat.ir`, there is **no `api.` subdomain**; the API is mounted directly at `https://schoolharekat.ir/api` and `https://schoolharekat.ir/api/v1`. The callback URL is `https://schoolharekat.ir/api/v1/payments/zibal/callback`.

> [!IMPORTANT]
> Never commit real merchant credentials to version control. Keep `.env.example` scrubbed of secrets.

---

## 3. End-to-End Payment Flow

```text
User Dashboard                     Backend API                       Zibal IPG
     │                                  │                                │
     │── 1. Select item & Checkout ────>│                                │
     │      (cart / package / sub)      │                                │
     │                                  │── 2. Calculate real price      │
     │                                  │      from database             │
     │                                  │── 3. Create PENDING Payment    │
     │                                  │── 4. Call Zibal /v1/request ──>│
     │                                  │<── 5. Returns trackId ─────────│
     │<── 6. Return redirectUrl ────────│                                │
     │       (https://gateway.zibal.ir/start/{trackId})                  │
     │                                                                   │
     │── 7. Redirect to Gateway ────────────────────────────────────────>│
     │                                                                   │
     │                                  │<── 8. Browser GET Callback ────│
     │                                  │       (trackId, status, ...)   │
     │                                  │── 9. Verify with /v1/verify ──>│
     │                                  │<── 10. result=100 (or 201) ────│
     │                                  │── 11. Amount match check       │
     │                                  │── 12. Atomic Transaction:      │
     │                                  │       - Payment -> 'paid'      │
     │                                  │       - Order -> 'paid'        │
     │                                  │       - Grant accesses         │
     │<── 13. Redirect to Dashboard ────│                                │
     │        (/payments/result?...)    │                                │
     │                                  │                                │
     │── 14. GET /payments/:id/status ─>│                                │
     │<── 15. Verified status response ─│                                │
```

---

## 4. Database Schema & Migrations

The `Payments` table has been extended with the following columns:

| Column | Type | Description |
| :--- | :--- | :--- |
| `trackId` | `VARCHAR(255)` | Unique gateway tracking identifier returned by Zibal. Indexed. |
| `cardNumber` | `VARCHAR(32)` | Masked PAN of the paying bank card (e.g. `603799******1234`). |
| `paidAt` | `DATETIME` | Authoritative timestamp when payment was confirmed. |
| `description` | `TEXT` | Human-readable description or invoice summary. |
| `failureReason` | `TEXT` | Reason for cancellation or verification failure. |
| `callbackData` | `TEXT` | Serialized JSON response from gateway callback/verification. |

### Indexes:
- `idx_payments_track_id` (`trackId`)
- `idx_payments_order_id` (`orderId`)
- `idx_payments_user_id` (`userId`)
- `idx_payments_status` (`status`)

All columns and indexes are created automatically on server startup via `migrateLmsSchema()` in `harekat-backend/src/models/migrateLms.js`.

---

## 5. API Endpoints

### 1. Initiate Payment
- **Method / Path:** `POST /api/v1/payments/initiate`
- **Auth:** Required (`Bearer <JWT>`)
- **Request Body:**
```json
{
  "orderId": "UUID-of-order",
  "gateway": "zibal", // or "mock" (defaults to config.paymentGateway)
  "description": "Purchase of Web Development Package"
}
```
- **Response (200 OK):**
```json
{
  "payment": {
    "id": "UUID-of-payment",
    "orderId": "UUID-of-order",
    "amount": 500000,
    "status": "pending",
    "gateway": "zibal",
    "trackId": "12345678"
  },
  "redirectUrl": "https://gateway.zibal.ir/start/12345678",
  "isExternal": true
}
```

### 2. Zibal Callback Endpoint
- **Method / Path:** `GET /api/v1/payments/zibal/callback` or `POST /api/v1/payments/zibal/callback`
- **Auth:** Public (invoked by Zibal / user browser)
- **Parameters:**
  - `trackId`: Gateway track ID
  - `success`: `"1"` for successful user authorization, `"0"` for cancelled/failed
  - `status`: Zibal status code
  - `orderId`: LMS Order ID
- **Behavior:**
  - If requested from a browser (Accept: `text/html`): Verifies payment and performs 302 redirect to `${DASHBOARD_URL}/payments/result?paymentId=...&status=SUCCESS&trackId=...&refNumber=...`.
  - If requested via API (Accept: `application/json`): Returns JSON payload with verification status.

### 3. Payment Status Endpoint
- **Method / Path:** `GET /api/v1/payments/:id/status`
- **Auth:** Required (Admin or Payment Owner)
- **Response (200 OK):**
```json
{
  "payment": {
    "id": "UUID",
    "orderId": "UUID",
    "amount": 500000,
    "status": "paid",
    "gateway": "zibal",
    "trackId": "12345678",
    "transactionId": "987654321",
    "cardNumber": "603799******1234",
    "paidAt": "2026-09-24T20:13:00.000Z",
    "order": { ... }
  },
  "verifiedStatus": "SUCCESS"
}
```

### 4. Fake Gateway Process Endpoint (Dev / Test)
- **Method / Path:** `POST /api/v1/payments/fake/process`
- **Auth:** Required (`Bearer <JWT>`)
- **Request Body:**
```json
{
  "paymentId": "UUID-of-payment",
  "action": "pay" // or "cancel" or "fail"
}
```

---

## 6. Zibal Gateway Result & Status Codes

### Result Codes (Request & Verify):
| Code | Meaning | Integration Handling |
| :--- | :--- | :--- |
| `100` | Operation successful | Proceeds to payment or entitlement activation. |
| `102` | Merchant not found | Returns configuration error. |
| `103` | Merchant inactive | Returns configuration error. |
| `104` | Merchant invalid | Returns configuration error. |
| `105` | Amount must be greater than 1,000 Rials | Validates order amount. |
| `106` | Callback URL invalid | Uses configured callback URL. |
| `113` | Amount exceeds limit | Notifies user. |
| `201` | Already verified | Idempotent handling: treats as paid without double-granting. |
| `202` | Payment not confirmed or cancelled | Marks payment as cancelled/failed. |
| `203` | Invalid trackId | Rejects callback. |

### Status Codes (Callback & Inquiry):
| Status | Meaning |
| :--- | :--- |
| `-1` | Waiting for gateway redirection |
| `-2` | Internal error |
| `1` | Paid - Not verified |
| `2` | Paid - Verified |
| `3` | Cancelled by user |
| `4` | Card number mismatch |
| `5` | Insufficient funds |
| `6` | Wrong password or PIN |
| `7` | Transaction limit exceeded |
| `8` | Exceeded daily transactions |
| `9` | Exceeded daily amount |
| `10` | Invalid card issuer |
| `11` | Switch error |
| `12` | Gateway unreachable |

---

## 7. Testing & Verification

### Running Automated Tests
Run the comprehensive test suite directly via `npm test` inside `harekat-backend`:

```bash
cd harekat-backend
npm test
```

To run specifically the payment suite:
```bash
npm run test:payment
```

The test suite covers:
1. Gateway adapter factory and configuration resolution.
2. Fake Gateway end-to-end checkout, payment verification, and automated entitlement granting.
3. Fake Gateway cancellation flows and access denial.
4. Zibal gateway request parameter formatting and Toman-to-Rial price conversion.
5. Zibal callback verification, amount matching, and package course unlocking.
6. Callback idempotency (replaying the callback does not grant duplicates).
7. Security guard: Blocked amount tampering (mismatch between gateway amount and database order amount).
8. Dedicated payment status inquiry endpoint.

### Testing with Zibal Sandbox
1. In `harekat-backend/.env`, set:
   ```env
   PAYMENT_GATEWAY=zibal
   ZIBAL_MERCHANT=zibal
   ```
2. Initiate a checkout from the User Dashboard.
3. You will be redirected to `https://gateway.zibal.ir/start/{trackId}`.
4. Complete the sandbox payment.
5. Zibal will redirect back to the callback URL, verifying the transaction and unlocking your courses automatically.
