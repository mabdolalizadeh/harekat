import Users from "./users.js";
import Courses from "./courses.js";
import Teachers from "./teachers.js";
import Payments from "./payments.js";
import Categories from "./categories.js";

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
    through: "CourseCategories",
    as: "categories",
    foreignKey: "courseId",
    otherKey: "categoryId"
});
Categories.belongsToMany(Courses, {
    through: "CourseCategories",
    as: "courses",
    foreignKey: "categoryId",
    otherKey: "courseId"
});

export { Users, Courses, Teachers, Payments, Categories };