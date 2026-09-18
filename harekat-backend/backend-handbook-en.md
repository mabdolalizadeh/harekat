# Harekat School Backend Handbook

## Overview

This handbook guides developers on how to work with the Harekat School backend API, covering development setup, API structure, authentication patterns, and integration with the frontend.

---

## 1. Project Structure

```
harekat-backend/
├── src/
│   ├── app.js          # Main Express entry point
│   ├── routes/         # API routes
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── middleware/     # Express middleware (auth, rate limiter)
│   ├── services/       # API services (storeApi, adminApi, customerApi)
│   └── utils/          # Utility functions
├── database.db         # SQLite database
├── package.json
├── .env                # Environment variables
└── API.md              # Auto-generated API documentation
```

---

## 2. Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
cd harekat-backend
npm install
```

### Environment Variables

Copy `.env` and configure:

```env
JWT_KEY=your-secret-key
JWT_EXPIRY=1d          # default: 1d
PORT=3000              # default: 3000
```

### Running the Server

```bash
npm run dev
```

Server starts on `http://localhost:3000` by default. The API base URL is `http://localhost:3000/api/v1`.

### Seed Demo Data

```bash
npm run seed
```

This populates the database with demo users, teachers, courses, categories, and payments.

---

## 3. API Authentication

The API has two user roles:

### User Flow

1. **Request OTP**: `POST /auth` with `{ "phoneNumber": "09123456789" }`
2. **Validate OTP**: `POST /auth/validate-otp` with phone + OTP
3. **Receive token**: Get JWT token in response
4. **Use token**: Include `Authorization: Bearer <token>` in headers

### Admin Flow

1. **Admin login**: `POST /admins/auth` with `{ "username": "admin", "password": "admin123" }`
2. **Admin token**: Use admin token for write operations

### Token Usage

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- **User token**: For read operations and personal data access
- **Admin token**: For write operations (create/update/delete)

---

## 4. API Endpoints Summary

### Auth Endpoints (Public)

| Endpoint | Description |
|----------|-------------|
| `POST /auth` | Request OTP |
| `POST /auth/validate-otp` | Validate OTP and get token |
| `POST /auth/change-phone-number` | Change phone (user token required) |

### Admin Auth Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /admins/auth` | Admin login |
| `POST /admins/register` | Register new admin |

### Courses

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| `POST` | `/courses` | Admin token | Admin only |
| `GET` | `/courses` | None | Public storefront |
| `GET` | `/courses/:id` | None | Public storefront |
| `PUT` | `/courses/:id` | Admin token | Admin only |
| `DELETE` | `/courses/:id` | Admin token | Admin only |

### Teachers

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| `POST` | `/teachers` | Admin token | Admin only |
| `GET` | `/teachers` | None | Public storefront |
| `GET` | `/teachers/:id` | None | Public storefront |
| `PUT` | `/teachers/:id` | Admin token | Admin only |
| `DELETE` | `/teachers/:id` | Admin token | Admin only |

### Categories

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| `POST` | `/categories` | Admin token | Admin only |
| `GET` | `/categories` | None | Public storefront |
| `GET` | `/categories/:id` | None | Public storefront |
| `PUT` | `/categories/:id` | Admin token | Admin only |
| `DELETE` | `/categories/:id` | Admin token | Admin only |

### Payments

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| `POST` | `/payments` | Admin token | Admin only |
| `GET` | `/payments` | Admin token | Admin only |
| `GET` | `/payments/:id` | Admin token | Admin only |
| `PUT` | `/payments/:id` | Admin token | Admin only |
| `DELETE` | `/payments/:id` | Admin token | Admin only |

### CMS Endpoints

#### Public (storefront, no auth)

| Endpoint | Description |
|----------|-------------|
| `GET /cms/header-menu` | Active header menu items |
| `GET /cms/content` | Active site content blocks |
| `GET /cms/content/:key` | Specific content block by key |

#### Admin (admin token required)

| Endpoint | Description |
|----------|-------------|
| `GET /cms/admin/header-menu` | All header menu items (including inactive) |
| `POST /cms/admin/header-menu` | Create menu item |
| `PUT /cms/admin/header-menu/:id` | Update menu item |
| `DELETE /cms/admin/header-menu/:id` | Delete menu item |
| `GET /cms/admin/content` | All content blocks (including inactive) |
| `POST /cms/admin/content` | Upsert content block by key |
| `DELETE /cms/admin/content/:key` | Delete content block by key |

### Storefront Public Reads (No Auth Required)

These endpoints are intentionally public for the landing page:

- `GET /courses`
- `GET /courses/:id`
- `GET /categories`
- `GET /categories/:id`
- `GET /teachers`
- `GET /teachers/:id`
- `GET /cms/header-menu`
- `GET /cms/content`

---

## 5. Request/Response Format

### Success Response

```json
{
  "ok": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "ok": false,
  "message": "error description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request — missing/invalid parameters |
| 401 | Unauthorized — missing/invalid token |
| 403 | Forbidden — admin access required |
| 404 | Not Found |
| 409 | Conflict — duplicate entry |
| 500 | Internal Server Error |

---

## 6. Common Patterns

### Creating a Course

```http
POST /courses
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Complete React.js Course",
  "price": "450000",
  "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
  "level": "Beginner",
  "duration": "20 hours",
  "typeOfAttendence": "Online",
  "statusOfRegistration": "open",
  "teacherId": "teacher-uuid",
  "categoryIds": [1, 2]
}
```

### Fetching with Filters

```http
GET /courses?level=Beginner&category=design
```

### Pagination (for lists)

Some list endpoints support pagination via query parameters. Check individual endpoint documentation.

---

## 7. Frontend Integration

### Getting User Token (React)

```javascript
import { customerApi } from '../services/api';

// Request OTP
const requestOtp = async (phoneNumber) => {
  const res = await customerApi.requestOtp(phoneNumber);
  return res.data; // { userId, otp }
};

// Validate OTP and get token
const validateOtp = async (phoneNumber, otp) => {
  const res = await customerApi.validateOtp(phoneNumber, otp);
  return res.data; // { token, user }
};

// Use in headers
const api = {
  headers: {
    'Authorization': `Bearer ${token}`
  }
};
```

### Admin Operations

```javascript
import { adminApi } from '../services/adminApi';

// Create course
const createCourse = async (courseData) => {
  const res = await adminApi.createCourse(courseData);
  return res.data;
};

// Get all courses
const getCourses = async () => {
  const res = await adminApi.listCourses();
  return res.data;
};
```

### CMS Content

```javascript
// Public - no auth needed
const getHeaderMenu = async () => {
  const res = await storeApi.getHeaderMenu();
  return res.data;
};

const getSiteContent = async () => {
  const res = await storeApi.getSiteContent();
  return res.data;
};
```

---

## 8. Database Models

### Course

```javascript
{
  id: UUID,
  name: String,
  price: String,           // e.g. "450000"
  salePrice: String | null, // discounted price
  image: String,           // URL
  level: String,           // "Beginner", "Intermediate", "Support"
  duration: String,        // e.g. "20 hours"
  typeOfAttendence: String,// "Online", "On-site"
  statusOfRegistration: String, // "open", "closed"
  teacherId: UUID,
  categoryIds: [UUID],
  isActive: Boolean,       // default true
  sortOrder: Number,       // default 0
  createdAt: Date,
  updatedAt: Date
}
```

### User

```javascript
{
  id: UUID,
  phoneNumber: String,
  firstName: String | null,
  lastName: String | null,
  avatar: String | null,
  otp: String | null,
  otpExpiresAt: Date | null,
  courseIds: [UUID],
  paymentIds: [UUID],
  createdAt: Date,
  updatedAt: Date
}
```

### Category

```javascript
{
  id: Number,
  name: String,           // e.g. "Programming"
  slug: String | null,    // latin, e.g. "skill-packages"
  isActive: Boolean,      // default true
  sortOrder: Number,      // default 0
  createdAt: Date,
  updatedAt: Date
}
```

---

## 9. Error Handling

### Common Error Patterns

| Error | Cause | Solution |
|-------|-------|----------|
| 400 | Missing or invalid body parameters | Check required fields and format |
| 401 | Missing/invalid token | Re-authenticate |
| 403 | Admin access required or not resource owner | Use correct token or own resource |
| 404 | Resource not found | Check ID exists |
| 409 | Duplicate entry (phone, username) | Use unique values |
| 500 | Server error | Check console logs, retry |

### Validation Errors

- Non-numeric prices → 400
- `salePrice > price` → 400 with message "salePrice must not exceed price"
- Duplicate phone/username → 409

---

## 10. Tips & Best Practices

1. **Always seed demo data** before demos: `npm run seed`
2. **Use admin token** for create/update/delete operations
3. **Use user token** for read operations and personal data
4. **Public endpoints** (no auth) are for storefront display only
5. **Handle 409 conflicts** gracefully in frontend (phone/username already exists)
6. **Token expiry**: Admin token default 1 day, user token from OTP flow
7. **Always check `ok` field** in response before using `data`
8. **Backend uses SQLite** - suitable for demo/development, consider PostgreSQL for production
9. **CMS blocks** use unique keys (e.g., `hero-title`, `contact-email`) for content management
10. **Category slugs** are latin (e.g., `skill-packages`, `capsule-training`)

---

## 11. Running & Debugging

### Server Logs

The server logs all requests and errors to console. Watch for:

- Route matching
- Authentication middleware
- Database queries
- Response formatting

### Common Issues

| Issue | Fix |
|-------|-----|
| "Cannot POST /endpoint" | Check route method (GET vs POST) |
| 401 Unauthorized | Re-obtain token, check Authorization header |
| 403 Forbidden | Ensure admin token has proper permissions |
| CORS error | Ensure frontend origin is allowed (default port 5173 for Vite) |
| Data not loading | Check if `npm run seed` was run |

### API Testing

Use Postman or curl:

```bash
# Get all courses (user token required)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/courses

# Create category (admin token required)
curl -X POST -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Design"}' \
  http://localhost:3000/api/v1/categories
```

---

## 13. Sample Requests & Responses

### 13.1 Create Course (POST /courses)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete React.js Course",
    "price": "450000",
    "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    "level": "Beginner",
    "duration": "20 hours",
    "typeOfAttendence": "Online",
    "statusOfRegistration": "open",
    "teacherId": "teacher-uuid",
    "categoryIds": [1, 2]
  }'
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "Complete React.js Course",
    "price": "450000",
    "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    "level": "Beginner",
    "duration": "20 hours",
    "typeOfAttendence": "Online",
    "statusOfRegistration": "open",
    "teacher": {
      "id": "teacher-uuid",
      "firstName": "Dr.",
      "lastName": "Ahmadi",
      "email": "ahmadi@example.com"
    },
    "categories": [
      { "id": 1, "name": "Programming" },
      { "id": 2, "name": "Web Development" }
    ],
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2026-09-10T00:00:00.000Z",
    "updatedAt": "2026-09-10T00:00:00.000Z"
  }
}
```

---

### 13.2 Get All Courses (GET /courses)

**Request:**
```bash
curl -H "Authorization: Bearer <user-token>" http://localhost:3000/api/v1/courses
```

**Response (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Complete React.js Course",
      "price": "450000",
      "image": "https://example.com/react-course.jpg",
      "level": "Beginner",
      "duration": "20 hours",
      "typeOfAttendence": "Online",
      "statusOfRegistration": "open",
      "teacher": {
        "id": "teacher-uuid-1",
        "firstName": "Dr.",
        "lastName": "Ahmadi"
      },
      "categories": ["Programming", "Web Development"]
    }
  ]
}
```

---

### 13.3 Create Category (POST /categories)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Web Development"}'
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": 1,
    "name": "Web Development",
    "slug": "web-development",
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2026-09-10T00:00:00.000Z"
  }
}
```

---

### 13.4 Create Teacher (POST /teachers)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/teachers \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Dr.",
    "lastName": "Ahmadi",
    "email": "ahmadi@example.com",
    "avatar": "https://i.pravatar.cc/150?u=11",
    "resume": "https://example.com/resume.pdf"
  }'
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "firstName": "Dr.",
    "lastName": "Ahmadi",
    "email": "ahmadi@example.com",
    "avatar": "https://i.pravatar.cc/150?u=11",
    "resume": "https://example.com/resume.pdf"
  }
}
```

---

### 13.5 Create Payment (POST /payments)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "type": "paid"
  }'
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "type": "paid",
    "userId": "user-uuid",
    "user": {
      "id": "user-uuid",
      "phoneNumber": "09123456789",
      "firstName": "علی",
      "lastName": "محمدی"
    },
    "createdAt": "2026-09-10T00:00:00.000Z"
  }
}
```

---

### 13.6 Create Subscription (POST /subscriptions)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Package",
    "price": "99000",
    "image": "https://example.com/subscription.jpg",
    "buttonText": "View Details",
    "buttonLink": "/products"
  }'
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "Basic Package",
    "price": "99000",
    "image": "https://example.com/subscription.jpg",
    "buttonText": "View Details",
    "buttonLink": "/products",
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2026-09-10T00:00:00.000Z"
  }
}
```

---

### 13.7 Create Content Block (POST /cms/admin/content)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/cms/admin/content \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "hero-title",
    "title": "Welcome to Harekat School",
    "body": "Learn design, development, and creativity",
    "imageUrl": "https://example.com/hero-bg.jpg",
    "linkUrl": "/products",
    "linkText": "View Courses",
    "sortOrder": 1,
    "isActive": true
  }'
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "key": "hero-title",
    "title": "Welcome to Harekat School",
    "body": "Learn design, development, and creativity",
    "imageUrl": "https://example.com/hero-bg.jpg",
    "linkUrl": "/products",
    "linkText": "View Courses",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2026-09-10T00:00:00.000Z"
  }
}
```

---

### 13.8 Admin Login (POST /admins/auth)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/admins/auth \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "admin-uuid",
      "username": "admin"
    }
  }
}
```

---

### 13.9 User OTP Flow

**Step 1: Request OTP**
```bash
curl -X POST http://localhost:3000/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09123456789"}'
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "userId": "uuid",
    "otp": "299510"
  }
}
```

**Step 2: Validate OTP**
```bash
curl -X POST http://localhost:3000/api/v1/auth/validate-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09123456789", "otp": "299510"}'
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "phoneNumber": "09123456789",
      "firstName": "علی",
      "lastName": "محمدی"
    }
  }
}
```

---

### 13.9 Error Responses

**400 Bad Request:**
```json
{
  "ok": false,
  "message": "price must be a non-negative number"
}
```

**401 Unauthorized:**
```json
{
  "ok": false,
  "message": "Unauthorized — missing or invalid token"
}
```

**403 Forbidden:**
```json
{
  "ok": false,
  "message": "Forbidden — admin access required"
}
```

**404 Not Found:**
```json
{
  "ok": false,
  "message": "course not found"
}
```

**409 Conflict (duplicate):**
```json
{
  "ok": false,
  "message": "Conflict — duplicate entry (phone number, username)"
}
```

**500 Internal Server Error:**
```json
{
  "ok": false,
  "message": "Internal server error"
}
```

## 14. Complete Endpoint Examples

The examples in this section use the current routes in `src/routes`. Replace
`<base-url>` with `http://localhost:3000/api/v1`, `<user-token>` with a user
JWT, and `<admin-token>` with an admin JWT. Response bodies below are
representative; database-generated IDs and timestamps differ on every request.

### 14.1 Image Upload

Images are uploaded separately from JSON. The response URL can then be sent in
the `image` or `imageUrl` field of a later POST or PUT request.

```bash
curl -X POST <base-url>/uploads/image \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @course.jpg
```

```json
{
  "ok": true,
  "data": { "imageUrl": "/uploads/image-1720000000000-ab12cd.jpg" }
}
```

### 14.2 Authentication

#### `POST /auth` — request OTP

```json
{ "phoneNumber": "09123456789" }
```

```json
{ "ok": true, "data": { "userId": "user-uuid", "otp": "123456" } }
```

#### `POST /auth/validate-otp` — validate OTP

```json
{ "phoneNumber": "09123456789", "otp": "123456" }
```

```json
{
  "ok": true,
  "data": {
    "token": "<user-token>",
    "user": { "id": "user-uuid", "phoneNumber": "09123456789", "role": "user" }
  }
}
```

#### `POST /auth/change-phone-number`

```json
{ "phoneNumber": "09987654321" }
```

```json
{ "ok": true, "data": { "userId": "user-uuid", "otp": "654321" } }
```

### 14.3 Admin Authentication and Accounts

#### `POST /admins/auth`

```json
{ "username": "admin", "password": "admin123" }
```

```json
{
  "ok": true,
  "data": { "token": "<admin-token>", "admin": { "id": "admin-uuid", "username": "admin" } }
}
```

#### `POST /admins/register`

```json
{ "username": "editor", "password": "strong-password" }
```

```json
{ "ok": true, "data": { "id": "admin-uuid", "username": "editor" } }
```

#### `GET /admins/:id`

```json
{ "ok": true, "data": { "id": "admin-uuid", "username": "admin" } }
```

#### `PUT /admins/:id`

```json
{ "username": "content-admin", "password": "new-strong-password" }
```

```json
{ "ok": true, "data": { "id": "admin-uuid", "username": "content-admin" } }
```

#### `DELETE /admins/:id`

```json
{ "ok": true, "message": "admin deleted" }
```

### 14.4 Users

#### `POST /users`

```json
{ "phoneNumber": "09123456789" }
```

```json
{
  "ok": true,
  "data": { "id": "user-uuid", "phoneNumber": "09123456789", "firstName": null, "lastName": null }
}
```

#### `GET /users`

```json
{ "ok": true, "data": [{ "id": "user-uuid", "phoneNumber": "09123456789" }] }
```

#### `GET /users/:id`

```json
{ "ok": true, "data": { "id": "user-uuid", "phoneNumber": "09123456789", "courseIds": [], "paymentIds": [] } }
```

#### `PUT /users/:id`

```json
{
  "firstName": "Ali",
  "lastName": "Ahmadi",
  "avatar": "https://example.com/avatar.jpg",
  "courseIds": ["course-uuid"]
}
```

```json
{ "ok": true, "data": { "id": "user-uuid", "firstName": "Ali", "lastName": "Ahmadi" } }
```

#### `DELETE /users/:id`

```json
{ "ok": true, "message": "user deleted" }
```

### 14.5 Courses

#### `POST /courses`

```json
{
  "name": "Complete React.js Course",
  "price": "450000",
  "salePrice": "360000",
  "image": "/uploads/course.jpg",
  "level": "Beginner",
  "duration": "20 hours",
  "typeOfAttendence": "Online",
  "statusOfRegistration": "open",
  "description": "A project-based React course.",
  "longDescription": "Full course details.",
  "videoUrl": "https://example.com/intro.mp4",
  "isActive": true,
  "sortOrder": 1,
  "teacherId": "teacher-uuid",
  "categoryIds": [1, 2]
}
```

```json
{ "ok": true, "data": { "id": "course-uuid", "name": "Complete React.js Course", "price": "450000", "salePrice": "360000", "image": "/uploads/course.jpg", "categories": [], "teacher": null } }
```

#### `GET /courses`

```json
{ "ok": true, "data": [{ "id": "course-uuid", "name": "Complete React.js Course", "price": "450000", "isActive": true, "categories": [], "teacher": null }] }
```

#### `GET /courses/:id`

```json
{ "ok": true, "data": { "id": "course-uuid", "name": "Complete React.js Course", "price": "450000", "categories": [], "teacher": null } }
```

#### `PUT /courses/:id`

```json
{ "price": "400000", "salePrice": "320000", "description": "Updated description", "isActive": true, "categoryIds": [2] }
```

```json
{ "ok": true, "data": { "id": "course-uuid", "price": "400000", "salePrice": "320000", "description": "Updated description", "categories": [] } }
```

#### `DELETE /courses/:id`

```json
{ "ok": true, "message": "course deleted" }
```

### 14.6 Teachers

#### `POST /teachers`

```json
{ "firstName": "Dr.", "lastName": "Ahmadi", "email": "ahmadi@example.com", "avatar": "https://example.com/avatar.jpg", "resume": "https://example.com/resume.pdf" }
```

```json
{ "ok": true, "data": { "id": "teacher-uuid", "firstName": "Dr.", "lastName": "Ahmadi", "email": "ahmadi@example.com", "avatar": "https://example.com/avatar.jpg", "resume": "https://example.com/resume.pdf" } }
```

#### `GET /teachers`

```json
{ "ok": true, "data": [{ "id": "teacher-uuid", "firstName": "Dr.", "lastName": "Ahmadi", "email": "ahmadi@example.com" }] }
```

#### `GET /teachers/:id`

```json
{ "ok": true, "data": { "id": "teacher-uuid", "firstName": "Dr.", "lastName": "Ahmadi", "email": "ahmadi@example.com" } }
```

#### `PUT /teachers/:id`

```json
{ "lastName": "Karimi", "email": "karimi@example.com", "avatar": "/uploads/teacher.jpg" }
```

```json
{ "ok": true, "data": { "id": "teacher-uuid", "firstName": "Dr.", "lastName": "Karimi", "email": "karimi@example.com" } }
```

#### `DELETE /teachers/:id`

```json
{ "ok": true, "message": "teacher deleted" }
```

### 14.7 Categories

#### `POST /categories`

```json
{ "name": "Web Development", "slug": "web-development", "isActive": true, "sortOrder": 1 }
```

```json
{ "ok": true, "data": { "id": 1, "name": "Web Development", "slug": "web-development", "isActive": true, "sortOrder": 1 } }
```

#### `GET /categories`

```json
{ "ok": true, "data": [{ "id": 1, "name": "Web Development", "slug": "web-development", "isActive": true }] }
```

#### `GET /categories/:id`

```json
{ "ok": true, "data": { "id": 1, "name": "Web Development", "slug": "web-development", "isActive": true } }
```

#### `PUT /categories/:id`

```json
{ "name": "Frontend Development", "slug": "frontend-development", "sortOrder": 2 }
```

```json
{ "ok": true, "data": { "id": 1, "name": "Frontend Development", "slug": "frontend-development", "sortOrder": 2 } }
```

#### `DELETE /categories/:id`

```json
{ "ok": true, "message": "category deleted" }
```

### 14.8 Subscriptions

#### `POST /subscriptions`

```json
{ "name": "Basic Package", "price": "99000", "salePrice": "79000", "image": "/uploads/subscription.jpg", "description": "One year access", "buttonLink": "/products", "buttonText": "View Details", "isActive": true, "sortOrder": 1 }
```

```json
{ "ok": true, "data": { "id": "subscription-uuid", "name": "Basic Package", "price": "99000", "salePrice": "79000", "image": "/uploads/subscription.jpg", "isActive": true } }
```

#### `GET /subscriptions`

```json
{ "ok": true, "data": [{ "id": "subscription-uuid", "name": "Basic Package", "price": "99000", "isActive": true }] }
```

#### `GET /subscriptions/:id`

```json
{ "ok": true, "data": { "id": "subscription-uuid", "name": "Basic Package", "price": "99000", "isActive": true } }
```

#### `PUT /subscriptions/:id`

```json
{ "price": "109000", "salePrice": "89000", "description": "Updated package description" }
```

```json
{ "ok": true, "data": { "id": "subscription-uuid", "price": "109000", "salePrice": "89000", "description": "Updated package description" } }
```

#### `DELETE /subscriptions/:id`

```json
{ "ok": true, "message": "subscription deleted" }
```

### 14.9 Payments

#### `POST /payments`

```json
{ "userId": "user-uuid", "type": "paid" }
```

```json
{ "ok": true, "data": { "id": "payment-uuid", "userId": "user-uuid", "type": "paid", "user": { "id": "user-uuid", "phoneNumber": "09123456789" } } }
```

#### `GET /payments`

```json
{ "ok": true, "data": [{ "id": "payment-uuid", "userId": "user-uuid", "type": "paid" }] }
```

#### `GET /payments/:id`

```json
{ "ok": true, "data": { "id": "payment-uuid", "userId": "user-uuid", "type": "paid" } }
```

#### `PUT /payments/:id`

```json
{ "type": "refunded" }
```

```json
{ "ok": true, "data": { "id": "payment-uuid", "userId": "user-uuid", "type": "refunded" } }
```

#### `DELETE /payments/:id`

```json
{ "ok": true, "message": "payment deleted" }
```

### 14.10 Coupons

#### `POST /coupons/validate` — public

```json
{ "code": "HAREKAT10", "orderAmount": 450000 }
```

```json
{ "ok": true, "data": { "valid": true, "discount": 45000, "finalAmount": 405000, "coupon": { "code": "HAREKAT10", "discountType": "percent", "discountValue": 10 } } }
```

#### `POST /coupons/redeem`

```json
{ "code": "HAREKAT10", "orderAmount": 450000 }
```

```json
{ "ok": true, "data": { "valid": true, "discount": 45000, "finalAmount": 405000, "coupon": { "code": "HAREKAT10", "usageCount": 1 } } }
```

#### `POST /coupons`

```json
{ "code": "WELCOME20", "discountType": "percent", "discountValue": 20, "isActive": true, "usageLimit": 100 }
```

```json
{ "ok": true, "data": { "id": "coupon-uuid", "code": "WELCOME20", "discountType": "percent", "discountValue": 20, "isActive": true, "usageLimit": 100, "usageCount": 0 } }
```

#### `GET /coupons`

```json
{ "ok": true, "data": [{ "id": "coupon-uuid", "code": "WELCOME20", "discountType": "percent", "discountValue": 20, "usageCount": 0 }] }
```

#### `GET /coupons/:id`

```json
{ "ok": true, "data": { "id": "coupon-uuid", "code": "WELCOME20", "discountType": "percent", "discountValue": 20 } }
```

#### `PUT /coupons/:id`

```json
{ "discountValue": 25, "isActive": false, "usageLimit": 200 }
```

```json
{ "ok": true, "data": { "id": "coupon-uuid", "code": "WELCOME20", "discountValue": 25, "isActive": false, "usageLimit": 200 } }
```

#### `DELETE /coupons/:id`

```json
{ "ok": true, "message": "coupon deleted" }
```

### 14.11 CMS

#### `GET /cms/header-menu`

```json
{ "ok": true, "data": [{ "id": "menu-uuid", "label": "Courses", "link": "/products", "sortOrder": 1, "isActive": true }] }
```

#### `GET /cms/content`

```json
{ "ok": true, "data": [{ "key": "hero-title", "title": "Welcome", "body": "Learn with Harekat", "imageUrl": "/uploads/hero.jpg", "isActive": true }] }
```

#### `GET /cms/content/:key`

```json
{ "ok": true, "data": { "key": "hero-title", "title": "Welcome", "body": "Learn with Harekat", "imageUrl": "/uploads/hero.jpg", "isActive": true } }
```

#### `GET /cms/admin/header-menu`

```json
{ "ok": true, "data": [{ "id": "menu-uuid", "label": "Courses", "link": "/products", "isActive": false }] }
```

#### `POST /cms/admin/header-menu`

```json
{ "label": "About Us", "link": "/about", "sortOrder": 2, "isActive": true }
```

```json
{ "ok": true, "data": { "id": "menu-uuid", "label": "About Us", "link": "/about", "sortOrder": 2, "isActive": true } }
```

#### `PUT /cms/admin/header-menu/:id`

```json
{ "label": "About Harekat", "isActive": false }
```

```json
{ "ok": true, "data": { "id": "menu-uuid", "label": "About Harekat", "link": "/about", "isActive": false } }
```

#### `DELETE /cms/admin/header-menu/:id`

```json
{ "ok": true, "message": "menu item deleted" }
```

#### `GET /cms/admin/content`

```json
{ "ok": true, "data": [{ "key": "hero-title", "title": "Welcome", "body": "Learn with Harekat", "isActive": false }] }
```

#### `POST /cms/admin/content`

```json
{ "key": "hero-title", "title": "Welcome", "body": "Learn with Harekat", "imageUrl": "/uploads/hero.jpg", "linkUrl": "/products", "linkText": "View Courses", "sortOrder": 1, "isActive": true }
```

```json
{ "ok": true, "data": { "key": "hero-title", "title": "Welcome", "body": "Learn with Harekat", "imageUrl": "/uploads/hero.jpg", "isActive": true } }
```

#### `DELETE /cms/admin/content/:key`

```json
{ "ok": true, "message": "content deleted" }
```

### 14.12 Cart

Anonymous cart requests use the `x-session-id` header. Authenticated requests
use `Authorization: Bearer <user-token>`.

#### `GET /cart`

```json
{ "ok": true, "data": { "id": "cart-uuid", "sessionId": "session-uuid", "items": [] } }
```

#### `POST /cart/add`

```json
{ "productId": "course-uuid", "productType": "course", "quantity": 1, "price": "450000" }
```

```json
{ "ok": true, "data": { "id": "cart-uuid", "items": [{ "productId": "course-uuid", "productType": "course", "quantity": 1, "price": "450000" }] } }
```

#### `PUT /cart/item/:itemId`

```json
{ "quantity": 2 }
```

```json
{ "ok": true, "data": { "id": "cart-uuid", "items": [{ "id": "item-uuid", "quantity": 2 }] } }
```

#### `DELETE /cart/item/:itemId`

```json
{ "ok": true, "data": { "id": "cart-uuid", "items": [] } }
```

#### `DELETE /cart/clear`

```json
{ "ok": true, "data": { "id": "cart-uuid", "items": [] } }
```

### 14.13 Orders

#### `POST /orders`

```json
{ "couponCode": "HAREKAT10" }
```

```json
{ "ok": true, "data": { "id": "order-uuid", "userId": "user-uuid", "status": "pending", "totalAmount": "450000", "discountAmount": "0", "finalAmount": "450000", "items": [] } }
```

#### `GET /orders`

```json
{ "ok": true, "data": [{ "id": "order-uuid", "userId": "user-uuid", "status": "pending", "totalAmount": "450000", "discountAmount": "0", "finalAmount": "450000", "items": [] }] }
```

#### `GET /orders/:id`

```json
{ "ok": true, "data": { "id": "order-uuid", "userId": "user-uuid", "status": "pending", "totalAmount": "450000", "discountAmount": "0", "finalAmount": "450000", "items": [] } }
```

#### `PUT /orders/:id/status`

```json
{ "status": "paid" }
```

```json
{ "ok": true, "data": { "id": "order-uuid", "status": "paid", "userId": "user-uuid" } }
```

### 14.14 Common Errors for Any Endpoint

```json
{ "ok": false, "message": "missing or invalid authorization header" }
```

```json
{ "ok": false, "message": "admin access required" }
```

```json
{ "ok": false, "message": "resource not found" }
```
