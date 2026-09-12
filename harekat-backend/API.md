# Harekat Media API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

The API uses JWT Bearer tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### User Token
- Obtained via `POST /auth/validate-otp` after OTP verification
- Role: `user`

### Admin Token
- Obtained via `POST /admins/auth`
- Role: `admin`

---

## Response Format

All responses follow this structure:

```json
{
  "ok": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "ok": false,
  "message": "error description"
}
```

---

## Auth Endpoints

### Request OTP
```http
POST /auth
```

**Body:**
```json
{
  "phoneNumber": "09123456789"
}
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "userId": "uuid",
    "otp": "123456"
  }
}
```

### Validate OTP
```http
POST /auth/validate-otp
```

**Body:**
```json
{
  "phoneNumber": "09123456789",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "token": "jwt-token",
    "user": { ... }
  }
}
```

### Change Phone Number (Protected)
```http
POST /auth/change-phone-number
Authorization: Bearer <user-token>
```

**Body:**
```json
{
  "phoneNumber": "09987654321"
}
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "userId": "uuid",
    "otp": "654321"
  }
}
```

---

## Admin Auth Endpoints

### Admin Login
```http
POST /admins/auth
```

**Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "token": "jwt-token",
    "admin": {
      "id": "uuid",
      "username": "admin"
    }
  }
}
```

### Register Admin
```http
POST /admins/register
```

**Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "username": "admin"
  }
}
```

---

## Users

### Create User (Public)
```http
POST /users
```

**Body:**
```json
{
  "phoneNumber": "09123456789"
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "phoneNumber": "09123456789",
    "firstName": null,
    "lastName": null,
    "avatar": null,
    "otp": "123456",
    "otpExpiresAt": "2026-08-23T16:24:55.928Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Get All Users (Protected)
```http
GET /users
Authorization: Bearer <user-token>
```

### Get User by ID (Protected)
```http
GET /users/:id
Authorization: Bearer <user-token>
```

### Update User (Protected)
```http
PUT /users/:id
Authorization: Bearer <user-token>
```

**Body (all optional):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "09987654321",
  "avatar": "https://example.com/avatar.jpg",
  "courseIds": ["uuid1", "uuid2"],
  "paymentIds": ["uuid1"]
}
```

### Delete User (Protected)
```http
DELETE /users/:id
Authorization: Bearer <user-token>
```

---

## Courses

### Create Course (Protected)
```http
POST /courses
Authorization: Bearer <user-token>
```

**Body:**
```json
{
  "name": "React Course",
  "price": "500000",
  "image": "https://example.com/image.jpg",
  "level": "Beginner",
  "duration": "10 hours",
  "typeOfAttendence": "Online",
  "statusOfRegistration": "Open",
  "teacherId": "uuid",
  "categoryIds": [1, 2]
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "React Course",
    "teacher": { ... },
    "categories": [ ... ]
  }
}
```

### Get All Courses (Protected)
```http
GET /courses
Authorization: Bearer <user-token>
```

### Get Course by ID (Protected)
```http
GET /courses/:id
Authorization: Bearer <user-token>
```

### Update Course (Protected)
```http
PUT /courses/:id
Authorization: Bearer <user-token>
```

**Body (all optional):**
```json
{
  "name": "Advanced React",
  "price": "750000",
  "teacherId": "uuid",
  "categoryIds": [1, 3]
}
```

### Delete Course (Protected)
```http
DELETE /courses/:id
Authorization: Bearer <user-token>
```

---

## Teachers

### Create Teacher (Protected)
```http
POST /teachers
Authorization: Bearer <user-token>
```

**Body:**
```json
{
  "firstName": "Ali",
  "lastName": "Ahmadi",
  "email": "ali@example.com",
  "resume": "https://example.com/resume.pdf",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Get All Teachers (Protected)
```http
GET /teachers
Authorization: Bearer <user-token>
```

### Get Teacher by ID (Protected)
```http
GET /teachers/:id
Authorization: Bearer <user-token>
```

### Update Teacher (Protected)
```http
PUT /teachers/:id
Authorization: Bearer <user-token>
```

**Body (all optional):**
```json
{
  "firstName": "Ali",
  "lastName": "Ahmadi",
  "email": "ali.new@example.com",
  "resume": "https://example.com/new-resume.pdf",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### Delete Teacher (Protected)
```http
DELETE /teachers/:id
Authorization: Bearer <user-token>
```

---

## Payments

### Create Payment (Protected)
```http
POST /payments
Authorization: Bearer <user-token>
```

**Body:**
```json
{
  "userId": "uuid",
  "type": "paid"
}
```

**Valid `type` values:** `paid`, `pending`, `failed`, `refunded`

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "type": "paid",
    "userId": "uuid",
    "user": { ... },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Get All Payments (Protected)
```http
GET /payments
Authorization: Bearer <user-token>
```

### Get Payment by ID (Protected)
```http
GET /payments/:id
Authorization: Bearer <user-token>
```

### Update Payment (Protected)
```http
PUT /payments/:id
Authorization: Bearer <user-token>
```

**Body (all optional):**
```json
{
  "userId": "uuid",
  "type": "failed"
}
```

### Delete Payment (Protected)
```http
DELETE /payments/:id
Authorization: Bearer <user-token>
```

---

## Categories

### Create Category (Protected)
```http
POST /categories
Authorization: Bearer <user-token>
```

**Body:**
```json
{
  "name": "Programming"
}
```

### Get All Categories (Protected)
```http
GET /categories
Authorization: Bearer <user-token>
```

### Get Category by ID (Protected)
```http
GET /categories/:id
Authorization: Bearer <user-token>
```

### Update Category (Protected)
```http
PUT /categories/:id
Authorization: Bearer <user-token>
```

**Body:**
```json
{
  "name": "Web Development"
}
```

### Delete Category (Protected)
```http
DELETE /categories/:id
Authorization: Bearer <user-token>
```

---

## Admins

### Get Admin by ID (Admin Only)
```http
GET /admins/:id
Authorization: Bearer <admin-token>
```

### Update Admin (Admin Only)
```http
PUT /admins/:id
Authorization: Bearer <admin-token>
```

**Body (all optional):**
```json
{
  "username": "newadmin",
  "password": "newpassword"
}
```

### Delete Admin (Admin Only)
```http
DELETE /admins/:id
Authorization: Bearer <admin-token>
```

---

## Storefront Public Reads (No Auth)

These endpoints are intentionally public so the landing/products pages load without login.
Writes on the same resources remain admin-only.

```http
GET /courses
GET /courses/:id
GET /categories
GET /categories/:id
GET /teachers
GET /teachers/:id
GET /cms/header-menu
GET /cms/content
GET /cms/content/:key
```

---

## Product Pricing (Courses)

`Courses` is the sellable product model. New fields (all optional except `price`):

| Field | Type | Description |
|-------|------|-------------|
| `price` | STRING | Original price (numeric string, e.g. `"450000"`) |
| `salePrice` | STRING \| null | Discounted price. Must be numeric and `<= price`. `null`/omitted = no discount |
| `description` | TEXT \| null | Long description |
| `isActive` | BOOLEAN | Hidden from storefront filters when `false` (default `true`) |
| `sortOrder` | INTEGER | Display ordering (default `0`) |

Validation: non-numeric prices → `400`; `salePrice > price` → `400 "salePrice must not exceed price"`.

`Categories` gained `slug` (latin, e.g. `skill-packages`), `isActive`, `sortOrder`.
Canonical categories: `capsule-training` (آموزش کپسولی), `beginner-courses` (دوره‌های مقدماتی),
`skill-packages` (پکیج‌های مهارتی), `subscriptions` (اشتراک‌ها).

---

## Coupon Endpoints

### Validate Coupon (Public — server-side calculation, never trust frontend math)
```http
POST /coupons/validate
```

**Body:**
```json
{ "code": "HAREKAT10", "orderAmount": 1000000 }
```

**Success:**
```json
{ "ok": true, "data": { "valid": true, "coupon": { ... }, "discount": 100000, "finalAmount": 900000 } }
```

Validation checks: exists → active → not expired → usage limit → `minimumOrderAmount`.
`discountType` is `percent` (1–100) or `fixed` (تومان, capped at order total).

### Redeem Coupon (Authenticated — increments `usageCount`)
```http
POST /coupons/redeem
Authorization: Bearer <user-or-admin-token>
```

### Admin Coupon CRUD (Admin Only)
```http
POST   /coupons
GET    /coupons                    # ?active=true&page=1&limit=50&search=CODE
GET    /coupons/:id
PUT    /coupons/:id                # incl. { "isActive": false } to deactivate
DELETE /coupons/:id
Authorization: Bearer <admin-token>
```

Coupon fields: `code` (unique, uppercased), `discountType` (`percent`|`fixed`),
`discountValue`, `isActive`, `expiresAt`, `usageLimit`, `usageCount`,
`minimumOrderAmount`, timestamps.

---

## CMS Endpoints (Header Menu + Site Content)

### Public (storefront)
```http
GET /cms/header-menu     # active items, sorted by sortOrder
GET /cms/content         # active blocks (?key=hero-title to filter)
GET /cms/content/:key
```

`HeaderMenuItem`: `label`, `link`, `scrollId` (nullable, for `/#section` scroll),
`sortOrder`, `isActive`.

`SiteContent` block: `key` (unique, e.g. `hero-title`, `contact-email`,
`social-instagram`, `footer-copyright`), `title`, `body`, `imageUrl`,
`linkUrl`, `linkText`, `sortOrder`, `isActive`.

### Admin (Admin Only)
```http
GET    /cms/admin/header-menu
POST   /cms/admin/header-menu
PUT    /cms/admin/header-menu/:id
DELETE /cms/admin/header-menu/:id
GET    /cms/admin/content          # includes inactive blocks
POST   /cms/admin/content          # upsert by { "key": ... }
DELETE /cms/admin/content/:key
Authorization: Bearer <admin-token>
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request — missing or invalid body parameters |
| 401 | Unauthorized — missing/invalid token or invalid credentials |
| 403 | Forbidden — admin access required |
| 404 | Not Found — resource not found |
| 409 | Conflict — duplicate entry (phone number, username) |
| 500 | Internal Server Error |

---

## Running the Server

```bash
cd harekat-backend
npm install
npm run dev
```

Server starts on `http://localhost:3000` by default. Set `PORT` in `.env` to change it.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_KEY` | Secret key for JWT signing |
| `JWT_EXPIRY` | JWT expiration time (default: `1d`) |
| `PORT` | Server port (default: `3000`) |
