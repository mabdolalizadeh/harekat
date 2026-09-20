import Users from "./users.js";
import Courses from "./courses.js";
import Teachers from "./teachers.js";
import Payments from "./payments.js";
import Categories from "./categories.js";
import CourseCategories from "./courseCategories.js";
import CourseTeachers from "./courseTeachers.js";
import TeacherCategories from "./teacherCategories.js";
import Admins from "./admins.js";
import Coupon from "./coupon.js";
import HeaderMenuItem from "./headerMenuItem.js";
import SiteContent from "./siteContent.js";
import Subscriptions from "./subscriptions.js";
import { Cart, CartItem } from "./cart.js";
import { Orders, OrderItems } from "./orders.js";
import Banners from "./banners.js";
import Sessions from "./sessions.js";
import CourseAccess from "./courseAccess.js";
import PackageCourses from "./packageCourses.js";
import SubscriptionCourses from "./subscriptionCourses.js";
import UserSubscriptions from "./userSubscriptions.js";
import Exams from "./exams.js";
import ExamResults from "./examResults.js";
import Licenses from "./licenses.js";
import { Tickets, TicketMessages } from "./tickets.js";
import TACourses from "./taCourses.js";
import { Notifications, UserNotificationRead } from "./notifications.js";
import UserLessonProgress from "./userLessonProgress.js";
import { sequelize } from "./database.config.js";

// Users <-> Courses (many-to-many legacy compatibility)
Users.belongsToMany(Courses, {
    through: "UserCourses",
    as: "courses",
    foreignKey: "userId",
    otherKey: "courseId"
});
Courses.belongsToMany(Users, {
    through: "UserCourses",
    as: "users",
    foreignKey: "courseId",
    otherKey: "userId"
});

// Teachers -> Courses (one-to-many)
Teachers.hasMany(Courses, {
    foreignKey: "teacherId",
    as: "courses"
});
Courses.belongsTo(Teachers, {
    foreignKey: "teacherId",
    as: "teacher"
});

Courses.belongsToMany(Teachers, {
    through: CourseTeachers,
    as: "teachers",
    foreignKey: "courseId",
    otherKey: "teacherId"
});
Teachers.belongsToMany(Courses, {
    through: CourseTeachers,
    as: "assignedCourses",
    foreignKey: "teacherId",
    otherKey: "courseId"
});

// Users -> Payments (one-to-many)
Users.hasMany(Payments, {
    foreignKey: "userId",
    as: "payments"
});
Payments.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});

// Courses <-> Categories (many-to-many)
Courses.belongsToMany(Categories, {
    through: CourseCategories,
    as: "categories",
    foreignKey: "courseId",
    otherKey: "categoryId"
});
Categories.belongsToMany(Courses, {
    through: CourseCategories,
    as: "courses",
    foreignKey: "categoryId",
    otherKey: "courseId"
});

// Teachers <-> Categories (many-to-many)
Teachers.belongsToMany(Categories, {
    through: TeacherCategories,
    as: "categories",
    foreignKey: "teacherId",
    otherKey: "categoryId"
});
Categories.belongsToMany(Teachers, {
    through: TeacherCategories,
    as: "teachers",
    foreignKey: "categoryId",
    otherKey: "teacherId"
});

// Users -> Cart (one-to-many)
Users.hasMany(Cart, {
    foreignKey: "userId",
    as: "carts"
});
Cart.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});

// Users -> Orders (one-to-many)
Users.hasMany(Orders, {
    foreignKey: "userId",
    as: "orders"
});
Orders.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});

// Orders <-> Payments
Orders.hasOne(Payments, {
    foreignKey: "orderId",
    as: "payment"
});
Payments.belongsTo(Orders, {
    foreignKey: "orderId",
    as: "order"
});

// Course <-> Sessions
Courses.hasMany(Sessions, {
    foreignKey: "courseId",
    as: "sessions",
    onDelete: "CASCADE"
});
Sessions.belongsTo(Courses, {
    foreignKey: "courseId",
    as: "course"
});

// Central CourseAccess / Enrollment
Users.hasMany(CourseAccess, {
    foreignKey: "userId",
    as: "courseAccesses",
    onDelete: "CASCADE"
});
CourseAccess.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});
Courses.hasMany(CourseAccess, {
    foreignKey: "courseId",
    as: "courseAccesses",
    onDelete: "CASCADE"
});
CourseAccess.belongsTo(Courses, {
    foreignKey: "courseId",
    as: "course"
});

// Package <-> Included Courses
Courses.belongsToMany(Courses, {
    through: PackageCourses,
    as: "packageIncludedCourses",
    foreignKey: "packageId",
    otherKey: "courseId"
});
Courses.belongsToMany(Courses, {
    through: PackageCourses,
    as: "includedInPackages",
    foreignKey: "courseId",
    otherKey: "packageId"
});

// Subscription <-> Included Courses
Subscriptions.belongsToMany(Courses, {
    through: SubscriptionCourses,
    as: "includedCourses",
    foreignKey: "subscriptionId",
    otherKey: "courseId"
});
Courses.belongsToMany(Subscriptions, {
    through: SubscriptionCourses,
    as: "subscriptions",
    foreignKey: "courseId",
    otherKey: "subscriptionId"
});

// User <-> Subscriptions
Users.hasMany(UserSubscriptions, {
    foreignKey: "userId",
    as: "userSubscriptions",
    onDelete: "CASCADE"
});
UserSubscriptions.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});
Subscriptions.hasMany(UserSubscriptions, {
    foreignKey: "subscriptionId",
    as: "userSubscriptions",
    onDelete: "CASCADE"
});
UserSubscriptions.belongsTo(Subscriptions, {
    foreignKey: "subscriptionId",
    as: "subscription"
});

// Exams & ExamResults
Courses.hasMany(Exams, {
    foreignKey: "courseId",
    as: "exams",
    onDelete: "CASCADE"
});
Exams.belongsTo(Courses, {
    foreignKey: "courseId",
    as: "course"
});

Exams.hasMany(ExamResults, {
    foreignKey: "examId",
    as: "results",
    onDelete: "CASCADE"
});
ExamResults.belongsTo(Exams, {
    foreignKey: "examId",
    as: "exam"
});

Courses.hasMany(ExamResults, {
    foreignKey: "courseId",
    as: "examResults",
    onDelete: "CASCADE"
});
ExamResults.belongsTo(Courses, {
    foreignKey: "courseId",
    as: "course"
});

Users.hasMany(ExamResults, {
    foreignKey: "userId",
    as: "examResults",
    onDelete: "CASCADE"
});
ExamResults.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});

// Licenses
Users.hasMany(Licenses, {
    foreignKey: "userId",
    as: "licenses",
    onDelete: "CASCADE"
});
Licenses.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});

Courses.hasMany(Licenses, {
    foreignKey: "courseId",
    as: "licenses",
    onDelete: "CASCADE"
});
Licenses.belongsTo(Courses, {
    foreignKey: "courseId",
    as: "course"
});

Licenses.belongsTo(ExamResults, {
    foreignKey: "examResultId",
    as: "examResult"
});

// Tickets & Messages
Users.hasMany(Tickets, {
    foreignKey: "userId",
    as: "tickets",
    onDelete: "CASCADE"
});
Tickets.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});

Courses.hasMany(Tickets, {
    foreignKey: "courseId",
    as: "tickets",
    onDelete: "SET NULL"
});
Tickets.belongsTo(Courses, {
    foreignKey: "courseId",
    as: "course"
});

Admins.hasMany(Tickets, {
    foreignKey: "assignedToId",
    as: "assignedTickets",
    onDelete: "SET NULL"
});
Tickets.belongsTo(Admins, {
    foreignKey: "assignedToId",
    as: "assignedTo"
});

// TA <-> Courses
Admins.belongsToMany(Courses, {
    through: TACourses,
    as: "taAssignedCourses",
    foreignKey: "adminId",
    otherKey: "courseId"
});
Courses.belongsToMany(Admins, {
    through: TACourses,
    as: "assignedTAs",
    foreignKey: "courseId",
    otherKey: "adminId"
});

// Notifications associations
Admins.hasMany(Notifications, {
    foreignKey: "senderId",
    as: "sentNotifications"
});
Notifications.belongsTo(Admins, {
    foreignKey: "senderId",
    as: "sender"
});
Courses.hasMany(Notifications, {
    foreignKey: "courseId",
    as: "notifications"
});
Notifications.belongsTo(Courses, {
    foreignKey: "courseId",
    as: "course"
});
Notifications.hasMany(UserNotificationRead, {
    foreignKey: "notificationId",
    as: "reads",
    onDelete: "CASCADE"
});
UserNotificationRead.belongsTo(Notifications, {
    foreignKey: "notificationId",
    as: "notification"
});
Users.hasMany(UserNotificationRead, {
    foreignKey: "userId",
    as: "readNotifications",
    onDelete: "CASCADE"
});
UserNotificationRead.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});

// UserLessonProgress associations
Users.hasMany(UserLessonProgress, {
    foreignKey: "userId",
    as: "lessonProgresses",
    onDelete: "CASCADE"
});
UserLessonProgress.belongsTo(Users, {
    foreignKey: "userId",
    as: "user"
});
Sessions.hasMany(UserLessonProgress, {
    foreignKey: "sessionId",
    as: "progresses",
    onDelete: "CASCADE"
});
UserLessonProgress.belongsTo(Sessions, {
    foreignKey: "sessionId",
    as: "session"
});
Courses.hasMany(UserLessonProgress, {
    foreignKey: "courseId",
    as: "lessonProgresses",
    onDelete: "CASCADE"
});
UserLessonProgress.belongsTo(Courses, {
    foreignKey: "courseId",
    as: "course"
});

export {
    Users,
    Courses,
    Teachers,
    Payments,
    Categories,
    CourseCategories,
    CourseTeachers,
    TeacherCategories,
    Admins,
    Coupon,
    HeaderMenuItem,
    SiteContent,
    Subscriptions,
    Cart,
    CartItem,
    Orders,
    OrderItems,
    Banners,
    Sessions,
    CourseAccess,
    PackageCourses,
    SubscriptionCourses,
    UserSubscriptions,
    Exams,
    ExamResults,
    Licenses,
    Tickets,
    TicketMessages,
    TACourses,
    Notifications,
    UserNotificationRead,
    UserLessonProgress,
    sequelize
};
