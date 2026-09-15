# Harekat LMS Dashboard — API Map

All endpoints documented below are verified against the running Express/Sequelize backend at `http://localhost:3000/api/v1`.
Zero simulated or invented APIs.

---

## 1. Authentication & User

### 1.1 Request OTP (Login / Register)
- **Method:** `POST`
- **Endpoint:** `/api/v1/auth`
- **Auth:** None (Public)
- **Request Body:**
  ```json
  {
    "phoneNumber": "09123456789"
  }
  ```
- **Response (200):**
  ```json
  {
    "ok": true,
    "data": {
      "userId": "681252e1-34e1-485e-ad5d-cb4fc4b5b4b8",
      "otp": "123456"
    }
  }
  ```
- **Notes:** In development mode, `otp` is returned in response or defaults to `123456`.
- **Frontend Usage:** `LoginPage.jsx` (step 1)
- **Backend File:** `harekat-backend/src/controllers/authController.js`

### 1.2 Validate OTP
- **Method:** `POST`
- **Endpoint:** `/api/v1/auth/validate-otp`
- **Auth:** None (Public)
- **Request Body:**
  ```json
  {
    "phoneNumber": "09123456789",
    "otp": "123456"
  }
  ```
- **Response (200):**
  ```json
  {
    "ok": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "user": {
        "id": "681252e1-34e1-485e-ad5d-cb4fc4b5b4b8",
        "firstName": "علی",
        "lastName": "محمدی",
        "phoneNumber": "09123456789",
        "avatar": "https://i.pravatar.cc/150?u=1",
        "createdAt": "2026-09-13T15:26:31.852Z"
      }
    }
  }
  ```
- **Frontend Usage:** `LoginPage.jsx` (step 2), `AuthContext.jsx`
- **Backend File:** `harekat-backend/src/controllers/authController.js`

### 1.3 Change Phone Number
- **Method:** `POST`
- **Endpoint:** `/api/v1/auth/change-phone-number`
- **Auth:** `Bearer <token>`
- **Request Body:** `{ "phoneNumber": "09987654321" }`
- **Frontend Usage:** `ProfilePage.jsx`

### 1.4 Get Current User Profile & Enrollments
- **Method:** `GET`
- **Endpoint:** `/api/v1/users/:id`
- **Auth:** `Bearer <token>` (user can view self; admin can view all)
- **Response (200):**
  ```json
  {
    "ok": true,
    "data": {
      "id": "681252e1-34e1-485e-ad5d-cb4fc4b5b4b8",
      "firstName": "علی",
      "lastName": "محمدی",
      "phoneNumber": "09123456789",
      "avatar": "https://i.pravatar.cc/150?u=1",
      "courses": [
        {
          "id": "b72a92b8-73b9-4188-b946-a9d62d8a16d2",
          "name": "آموزش کامل React.js",
          "price": "450000",
          "salePrice": null,
          "description": "یادگیری عمیق React",
          "image": "https://images.unsplash.com/...",
          "level": "مبتدی",
          "duration": "20 ساعت",
          "typeOfAttendence": "آنلاین",
          "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
          "longDescription": "# دوره React\n\nمحتوای کامل و پروژه‌محور."
        }
      ],
      "payments": [
        {
          "id": "ef82a13b-ce05-44f6-854c-0afefbad9ab8",
          "type": "paid",
          "userId": "..."
        }
      ]
    }
  }
  ```
- **Frontend Usage:** `AuthContext.jsx`, `OverviewPage.jsx`, `MyCoursesPage.jsx`, `ProfilePage.jsx`
- **Backend File:** `harekat-backend/src/controllers/usersController.js`

### 1.5 Update User Profile
- **Method:** `PUT`
- **Endpoint:** `/api/v1/users/:id`
- **Auth:** `Bearer <token>` (owner or admin)
- **Request Body (all optional):**
  ```json
  {
    "firstName": "علی",
    "lastName": "محمدی",
    "avatar": "https://example.com/avatar.jpg",
    "phoneNumber": "09123456789"
  }
  ```
- **Response (200):** Updated user object with associated courses & payments.
- **Frontend Usage:** `ProfilePage.jsx`
- **Backend File:** `harekat-backend/src/controllers/usersController.js`

---

## 2. Courses (LMS Catalog & Details)

### 2.1 Get All Courses
- **Method:** `GET`
- **Endpoint:** `/api/v1/courses`
- **Auth:** None (Public)
- **Response (200):**
  ```json
  {
    "ok": true,
    "data": [
      {
        "id": "b72a92b8-73b9-4188-b946-a9d62d8a16d2",
        "name": "آموزش کامل React.js",
        "price": "450000",
        "salePrice": null,
        "description": "یادگیری عمیق React",
        "isActive": true,
        "sortOrder": 0,
        "image": "https://images.unsplash.com/...",
        "level": "مبتدی",
        "duration": "20 ساعت",
        "typeOfAttendence": "آنلاین",
        "kind": "regular",
        "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "longDescription": "# دوره React\n\nمحتوای کامل و پروژه‌محور.",
        "teacher": { "id": "...", "firstName": "...", "lastName": "...", "avatar": "..." },
        "teachers": [...],
        "categories": [{ "id": 1, "name": "...", "slug": "..." }]
      }
    ]
  }
  ```
- **Frontend Usage:** `CatalogPage.jsx`, `OverviewPage.jsx`
- **Backend File:** `harekat-backend/src/controllers/coursesController.js`

### 2.2 Get Course by ID
- **Method:** `GET`
- **Endpoint:** `/api/v1/courses/:id`
- **Auth:** None (Public)
- **Response (200):** Single course object with teacher, teachers, and categories included.
- **Frontend Usage:** `CourseDetailPage.jsx`
- **Backend File:** `harekat-backend/src/controllers/coursesController.js`

---

## 3. Categories

### 3.1 Get All Categories
- **Method:** `GET`
- **Endpoint:** `/api/v1/categories`
- **Auth:** None (Public)
- **Response (200):** Array of category objects (`id`, `name`, `slug`, `isActive`, `sortOrder`).
- **Frontend Usage:** Course filtering in `CatalogPage.jsx` and `OverviewPage.jsx`
- **Backend File:** `harekat-backend/src/controllers/categoriesController.js`

---

## 4. Subscriptions

### 4.1 Get Subscriptions
- **Method:** `GET`
- **Endpoint:** `/api/v1/subscriptions`
- **Auth:** None (Public)
- **Response (200):**
  ```json
  {
    "ok": true,
    "data": [
      {
        "id": "4297078c-3097-4a53-8602-caa55a35fafa",
        "name": "اشتراک ماهانه اتاق فکر خلاق",
        "price": "99000",
        "salePrice": null,
        "description": "دسترسی ماهانه به جلسات آنلاین...",
        "isActive": true,
        "image": "https://...",
        "buttonLink": null,
        "buttonText": null
      }
    ]
  }
  ```
- **Frontend Usage:** `SubscriptionsPage.jsx`
- **Backend File:** `harekat-backend/src/controllers/subscriptionsController.js`

---

## 5. Cart

**CRITICAL IMPLEMENTATION DETAIL:**
The backend `CartController.js` line 7 reads `req.headers['x-session-id'] || req.body.sessionId`.
On `GET /cart`, `req.body` is undefined unless parsed, so `x-session-id` header MUST ALWAYS be present in headers to prevent backend runtime error.

### 5.1 Get or Create Cart
- **Method:** `GET`
- **Endpoint:** `/api/v1/cart`
- **Auth:** Optional (`Bearer <token>` if logged in) + Header `x-session-id: <uuid>`
- **Response (200):** `{ "ok": true, "data": { "id": "...", "userId": "...", "items": [...] } }`
- **Frontend Usage:** `CartContext.jsx`, `CartDrawer.jsx`
- **Backend File:** `harekat-backend/src/controllers/cartController.js`

### 5.2 Add to Cart
- **Method:** `POST`
- **Endpoint:** `/api/v1/cart/add`
- **Auth:** Optional (`Bearer <token>`) + Header `x-session-id`
- **Request Body:**
  ```json
  {
    "productId": "course-or-sub-uuid",
    "productType": "course",
    "quantity": 1,
    "price": "450000"
  }
  ```
- **Backend File:** `harekat-backend/src/controllers/cartController.js`

### 5.3 Update Cart Item
- **Method:** `PUT`
- **Endpoint:** `/api/v1/cart/item/:itemId`
- **Request Body:** `{ "quantity": 2 }`
- **Backend File:** `harekat-backend/src/controllers/cartController.js`

### 5.4 Remove Cart Item
- **Method:** `DELETE`
- **Endpoint:** `/api/v1/cart/item/:itemId`
- **Backend File:** `harekat-backend/src/controllers/cartController.js`

### 5.5 Clear Cart
- **Method:** `DELETE`
- **Endpoint:** `/api/v1/cart/clear`
- **Backend File:** `harekat-backend/src/controllers/cartController.js`

---

## 6. Orders

### 6.1 Create Order
- **Method:** `POST`
- **Endpoint:** `/api/v1/orders`
- **Auth:** `Bearer <token>` (Required)
- **Request Body:**
  ```json
  {
    "couponCode": null
  }
  ```
- **Behavior:** Creates an order from current cart items, clears the cart, returns the new order with items.
- **Frontend Usage:** `CartDrawer.jsx` (Checkout)
- **Backend File:** `harekat-backend/src/controllers/ordersController.js`

### 6.2 Get User Orders
- **Method:** `GET`
- **Endpoint:** `/api/v1/orders`
- **Auth:** `Bearer <token>` (Required)
- **Response (200):** Array of order objects including `items` (`productName`, `productImage`, `price`, `quantity`, `productType`).
- **Frontend Usage:** `OrdersPage.jsx`, `OverviewPage.jsx`
- **Backend File:** `harekat-backend/src/controllers/ordersController.js`

### 6.3 Get Order by ID
- **Method:** `GET`
- **Endpoint:** `/api/v1/orders/:id`
- **Auth:** `Bearer <token>` (Required)
- **Backend File:** `harekat-backend/src/controllers/ordersController.js`

---

## 7. Banners & Notifications

### 7.1 Get Promotional Banners
- **Method:** `GET`
- **Endpoint:** `/api/v1/banners`
- **Auth:** None (Public)
- **Response (200):** Active promotional banners.
- **Frontend Usage:** `OverviewPage.jsx` announcement bar / carousel.
- **Backend File:** `harekat-backend/src/controllers/bannersController.js`

---

## 8. Coupons

### 8.1 Validate Coupon
- **Method:** `POST`
- **Endpoint:** `/api/v1/coupons/validate`
- **Auth:** None (Public)
- **Request Body:** `{ "code": "DISCOUNT10", "orderAmount": 500000 }`
- **Frontend Usage:** `CartDrawer.jsx` coupon input.
- **Backend File:** `harekat-backend/src/controllers/couponsController.js`
