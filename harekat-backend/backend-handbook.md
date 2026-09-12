# Harekat Media Backend Handbook

## Overview

This handbook guides developers on how to work with the Harekat Media backend API, covering development setup, API structure, authentication patterns, and integration with the frontend.

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
| `POST` | `/courses` | User token | Admin only |
| `GET` | `/courses` | User token | Any authenticated user |
| `GET` | `/courses/:id` | User token | Any authenticated user |
| `PUT` | `/courses/:id` | User token | Admin only |
| `DELETE` | `/courses/:id` | User token | Admin only |

### Teachers

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| `POST` | `/teachers` | User token | Admin only |
| `GET` | `/teachers` | User token | Any authenticated user |
| `GET` | `/teachers/:id` | User token | Any authenticated user |
| `PUT` | `/teachers/:id` | User token | Admin only |
| `DELETE` | `/teachers/:id` | User token | Admin only |

### Categories

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| `POST` | `/categories` | User token | Admin only |
| `GET` | `/categories` | User token | Any authenticated user |
| `GET` | `/categories/:id` | User token | Any authenticated user |
| `PUT` | `/categories/:id` | User token | Admin only |
| `DELETE` | `/categories/:id` | User token | Admin only |

### Payments

| Method | Endpoint | Auth | Access |
|--------|----------|------|--------|
| `POST` | `/payments` | User token | Admin only |
| `GET` | `/payments` | User token | Admin only |
| `GET` | `/payments/:id` | User token | Admin only |
| `PUT` | `/payments/:id` | User token | Admin only |
| `DELETE` | `/payments/:id` | User token | Admin only |

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
  "name": "آموزش کامل React.js",
  "price": "450000",
  "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
  "level": "مبتدی",
  "duration": "20 ساعت",
  "typeOfAttendence": "آنلاین",
  "statusOfRegistration": "open",
  "teacherId": "teacher-uuid",
  "categoryIds": [1, 2]
}
```

### Fetching with Filters

```http
GET /courses?level=مبتدی&category=design
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
  level: String,           // "مبتدی", "متوسط", "پشتیبانی"
  duration: String,        // e.g. "20 ساعت"
  typeOfAttendence: String,// "آنلاین", "حضوری"
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
  name: String,           // e.g. "برنامه نویسی"
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
  -d '{"name": "طراحی"}' \
  http://localhost:3000/api/v1/categories
```