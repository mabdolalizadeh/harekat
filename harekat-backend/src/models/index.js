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

// Users <-> Courses (many-to-many)
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

export { Users, Courses, Teachers, Payments, Categories, CourseCategories, CourseTeachers, TeacherCategories, Admins, Coupon, HeaderMenuItem, SiteContent, Subscriptions, Cart, CartItem, Orders, OrderItems, Banners };
