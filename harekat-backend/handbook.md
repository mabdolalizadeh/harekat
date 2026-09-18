# Harekat School API Handbook

## Overview

This handbook explains how to use the Harekat School backend API for demos and integration.

**Base URL:** `http://localhost:3000/api/v1`

All responses follow this structure:

```json
{ "ok": true, "data": { ... } }
```

Errors return:

```json
{ "ok": false, "message": "error description" }
```

---

## 1. Setup

```bash
cd harekat-backend
npm install
npm run dev
```

Load demo data before your demo:

```bash
npm run seed
```

Demo users:
- Phone: `09123456789`, OTP: `299510`
- Phone: `09351234567`, OTP: `178701`

Demo admin:
- Username: `admin`
- Password: `admin123`

---

## 2. Authentication

The API has two roles: **user** and **admin**.

### 2.1 User Flow

#### Step 1: Request OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"09123456789"}'
```

Response:

```json
{
  "ok": true,
  "data": {
    "userId": "uuid",
    "otp": "299510"
  }
}
```

#### Step 2: Validate OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth/validate-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"09123456789","otp":"299510"}'
```

Response:

```json
{
  "ok": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "uuid",
      "phoneNumber": "09123456789",
      "firstName": "علی",
      "lastName": "محمدی"
    }
  }
}
```

Save the `token`. Use it in subsequent requests:

```
Authorization: Bearer eyJhbG...
```

#### Change Phone Number

```bash
curl -X POST http://localhost:3000/api/v1/auth/change-phone-number \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"09987654321"}'
```

### 2.2 Admin Flow

#### Admin Login

```bash
curl -X POST http://localhost:3000/api/v1/admins/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Response:

```json
{
  "ok": true,
  "data": {
    "token": "eyJhbG...",
    "admin": {
      "id": "uuid",
      "username": "admin"
    }
  }
}
```

#### Register Admin

```bash
curl -X POST http://localhost:3000/api/v1/admins/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newadmin","password":"Admin@123"}'
```

Admin password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## 3. Users

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| POST | `/users` | None | Public |
| GET | `/users` | Admin token | Admin only |
| GET | `/users/:id` | User token | Self or admin |
| PUT | `/users/:id` | User token | Self or admin |
| DELETE | `/users/:id` | User token | Self or admin |

### Create User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"09123456789"}'
```

### Update User

```bash
curl -X PUT http://localhost:3000/api/v1/users/:id \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "علی",
    "lastName": "محمدی",
    "avatar": "https://i.pravatar.cc/150?u=1",
    "courseIds": ["uuid1"],
    "paymentIds": ["uuid1"]
  }'
```

---

## 4. Courses

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| POST | `/courses` | User token | Admin only |
| GET | `/courses` | User token | Any authenticated user |
| GET | `/courses/:id` | User token | Any authenticated user |
| PUT | `/courses/:id` | User token | Admin only |
| DELETE | `/courses/:id` | User token | Admin only |

### Create Course

```bash
curl -X POST http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "آموزش کامل React.js",
    "price": "450000",
    "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    "level": "مبتدی",
    "duration": "20 ساعت",
    "typeOfAttendence": "آنلاین",
    "statusOfRegistration": "open",
    "teacherId": "teacher-uuid",
    "categoryIds": [1, 2]
  }'
```

### Get All Courses

```bash
curl -X GET http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer <user-token>"
```

Response includes teacher and categories data.

---

## 5. Teachers

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| POST | `/teachers` | User token | Admin only |
| GET | `/teachers` | User token | Any authenticated user |
| GET | `/teachers/:id` | User token | Any authenticated user |
| PUT | `/teachers/:id` | User token | Admin only |
| DELETE | `/teachers/:id` | User token | Admin only |

### Create Teacher

```bash
curl -X POST http://localhost:3000/api/v1/teachers \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "دکتر",
    "lastName": "احمدی",
    "email": "ahmadi@example.com",
    "resume": "https://example.com/resume.pdf",
    "avatar": "https://i.pravatar.cc/150?u=11"
  }'
```

---

## 6. Payments

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| POST | `/payments` | User token | Admin only |
| GET | `/payments` | User token | Admin only |
| GET | `/payments/:id` | User token | Admin only |
| PUT | `/payments/:id` | User token | Admin only |
| DELETE | `/payments/:id` | User token | Admin only |

Valid `type` values: `paid`, `pending`, `failed`, `refunded`

### Create Payment

```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "type": "paid"
  }'
```

---

## 7. Categories

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| POST | `/categories` | User token | Admin only |
| GET | `/categories` | User token | Any authenticated user |
| GET | `/categories/:id` | User token | Any authenticated user |
| PUT | `/categories/:id` | User token | Admin only |
| DELETE | `/categories/:id` | User token | Admin only |

### Create Category

```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "برنامه نویسی"}'
```

---

## 8. Admin Management

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| GET | `/admins/:id` | Admin token | Admin only |
| PUT | `/admins/:id` | Admin token | Admin only |
| DELETE | `/admins/:id` | Admin token | Admin only |

### Update Admin

```bash
curl -X PUT http://localhost:3000/api/v1/admins/:id \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newadmin","password":"NewPass@123"}'
```

---

## 9. Demo Data

After running `npm run seed`, the following demo data is available:

### Users
| Phone | Name |
|-------|------|
| 09123456789 | علی محمدی |
| 09351234567 | مریم رضایی |
| 09987654321 | رضا کریمی |
| 09187654321 | سارا احمدی |
| 09351239876 | محمد حسینی |

### Teachers
| Name | Email |
|------|-------|
| دکتر احمدی | ahmadi@example.com |
| استاد محمدی | mohammadi@example.com |
| مهندس رضایی | rezaei@example.com |
| دکتر کریمی | karimi@example.com |

### Categories
1. برنامه نویسی
2. طراحی UI/UX
3. تولید محتوا
4. بازاریابی دیجیتال
5. عکاسی

### Courses
| Name | Price | Level | Type |
|------|-------|-------|------|
| آموزش کامل React.js | 450000 | مبتدی | آنلاین |
| طراحی رابط کاربری با Figma | 380000 | متوسط | آنلاین |
| دوره جامع Node.js | 520000 | پیشرفته | حضوری |
| بازاریابی اینستاگرام | 290000 | مبتدی | آنلاین |
| عکاسی حرفه‌ای | 410000 | متوسط | حضوری |
| هوش مصنوعی برای مبتدیان | 600000 | پیشرفته | آنلاین |

### Payments
| Type | User |
|------|------|
| paid | علی محمدی |
| paid | مریم رضایی |
| pending | رضا کریمی |
| failed | سارا احمدی |
| refunded | محمد حسینی |

---

## 10. Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request — missing or invalid body parameters |
| 401 | Unauthorized — missing/invalid token or invalid credentials |
| 403 | Forbidden — admin access required or not the resource owner |
| 404 | Not Found — resource not found |
| 409 | Conflict — duplicate entry (phone number, username) |
| 500 | Internal Server Error |

---

## 11. Tips for Demo

1. Start the server: `npm run dev`
2. Seed demo data: `npm run seed`
3. Get admin token from `/admins/auth` with `admin` / `admin123`
4. Get user token from `/auth` then `/auth/validate-otp` using the OTP from the first call
5. Use admin token for write operations (create/update/delete courses, teachers, payments, categories)
6. Use user token for read operations and personal data access

---

## 12. Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_KEY` | Secret key for JWT signing |
| `JWT_EXPIRY` | Admin JWT expiration (default: `1d`) |
| `PORT` | Server port (default: `3000`) |
