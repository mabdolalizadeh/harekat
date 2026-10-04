import { sequelize } from './database.config.js';

export async function repairCourseCategoryJoinTable() {
    const [rows] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'CourseCategories'");
    const schema = rows[0]?.sql || '';
    if (!schema) return;
    if (!/[`"]?(?:courseId|categoryId)[`"]?\s+[^,]*\bUNIQUE\b/i.test(schema)) return;

    console.log('repairing CourseCategories join table constraints');
    await sequelize.transaction(async (transaction) => {
        await sequelize.query('DROP TABLE IF EXISTS CourseCategories_legacy', { transaction });
        await sequelize.query('ALTER TABLE CourseCategories RENAME TO CourseCategories_legacy', { transaction });
        await sequelize.query(`
            CREATE TABLE CourseCategories (
                courseId UUID NOT NULL REFERENCES Courses (id) ON DELETE CASCADE ON UPDATE CASCADE,
                categoryId INTEGER NOT NULL REFERENCES Categories (id) ON DELETE CASCADE ON UPDATE CASCADE,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                PRIMARY KEY (courseId, categoryId)
            )
        `, { transaction });
        await sequelize.query(`
            INSERT OR IGNORE INTO CourseCategories (courseId, categoryId, createdAt, updatedAt)
            SELECT courseId, categoryId, createdAt, updatedAt FROM CourseCategories_legacy
        `, { transaction });
        await sequelize.query('DROP TABLE CourseCategories_legacy', { transaction });
    });
}

export async function repairUserCoursesJoinTable() {
    const [rows] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'UserCourses'");
    const schema = rows[0]?.sql || '';
    if (!schema) return;

    const hasInlineUnique = /[`"]?(?:userId|courseId)[`"]?\s+[^,]*\bUNIQUE\b/i.test(schema);
    let hasUniqueSingleIndex = false;
    try {
        const [indexes] = await sequelize.query("PRAGMA index_list('UserCourses')");
        for (const idx of indexes) {
            if (idx.unique && idx.origin !== 'pk') {
                const [info] = await sequelize.query(`PRAGMA index_info('${idx.name}')`);
                if (info.length === 1 && (info[0].name === 'userId' || info[0].name === 'courseId')) {
                    hasUniqueSingleIndex = true;
                    break;
                }
            }
        }
    } catch (_) {}

    if (!hasInlineUnique && !hasUniqueSingleIndex) return;

    console.log('repairing UserCourses join table constraints');
    await sequelize.transaction(async (transaction) => {
        await sequelize.query('DROP TABLE IF EXISTS UserCourses_legacy', { transaction });
        await sequelize.query('ALTER TABLE UserCourses RENAME TO UserCourses_legacy', { transaction });
        await sequelize.query(`
            CREATE TABLE UserCourses (
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                userId UUID NOT NULL REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE,
                courseId UUID NOT NULL REFERENCES Courses (id) ON DELETE CASCADE ON UPDATE CASCADE,
                PRIMARY KEY (userId, courseId)
            )
        `, { transaction });
        await sequelize.query(`
            INSERT OR IGNORE INTO UserCourses (createdAt, updatedAt, userId, courseId)
            SELECT createdAt, updatedAt, userId, courseId FROM UserCourses_legacy
        `, { transaction });
        await sequelize.query('DROP TABLE UserCourses_legacy', { transaction });
    });
}

export async function repairCourseTeachersJoinTable() {
    const [rows] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'CourseTeachers'");
    const schema = rows[0]?.sql || '';
    if (!schema) return;
    if (!/[`"]?(?:courseId|teacherId)[`"]?\s+[^,]*\bUNIQUE\b/i.test(schema)) return;

    console.log('repairing CourseTeachers join table constraints');
    await sequelize.transaction(async (transaction) => {
        await sequelize.query('DROP TABLE IF EXISTS CourseTeachers_legacy', { transaction });
        await sequelize.query('ALTER TABLE CourseTeachers RENAME TO CourseTeachers_legacy', { transaction });
        await sequelize.query(`
            CREATE TABLE CourseTeachers (
                courseId UUID NOT NULL REFERENCES Courses (id) ON DELETE CASCADE ON UPDATE CASCADE,
                teacherId UUID NOT NULL REFERENCES Teachers (id) ON DELETE CASCADE ON UPDATE CASCADE,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                PRIMARY KEY (courseId, teacherId)
            )
        `, { transaction });
        await sequelize.query(`
            INSERT OR IGNORE INTO CourseTeachers (courseId, teacherId, createdAt, updatedAt)
            SELECT courseId, teacherId, createdAt, updatedAt FROM CourseTeachers_legacy
        `, { transaction });
        await sequelize.query('DROP TABLE CourseTeachers_legacy', { transaction });
    });
}

export async function repairTeacherCategoriesJoinTable() {
    const [rows] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'TeacherCategories'");
    const schema = rows[0]?.sql || '';
    if (!schema) return;
    if (!/[`"]?(?:teacherId|categoryId)[`"]?\s+[^,]*\bUNIQUE\b/i.test(schema)) return;

    console.log('repairing TeacherCategories join table constraints');
    await sequelize.transaction(async (transaction) => {
        await sequelize.query('DROP TABLE IF EXISTS TeacherCategories_legacy', { transaction });
        await sequelize.query('ALTER TABLE TeacherCategories RENAME TO TeacherCategories_legacy', { transaction });
        await sequelize.query(`
            CREATE TABLE TeacherCategories (
                teacherId UUID NOT NULL REFERENCES Teachers (id) ON DELETE CASCADE ON UPDATE CASCADE,
                categoryId INTEGER NOT NULL REFERENCES Categories (id) ON DELETE CASCADE ON UPDATE CASCADE,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                PRIMARY KEY (teacherId, categoryId)
            )
        `, { transaction });
        await sequelize.query(`
            INSERT OR IGNORE INTO TeacherCategories (teacherId, categoryId, createdAt, updatedAt)
            SELECT teacherId, categoryId, createdAt, updatedAt FROM TeacherCategories_legacy
        `, { transaction });
        await sequelize.query('DROP TABLE TeacherCategories_legacy', { transaction });
    });
}

export async function repairJoinTables() {
    await repairCourseCategoryJoinTable();
    await repairUserCoursesJoinTable();
    await repairCourseTeachersJoinTable();
    await repairTeacherCategoriesJoinTable();
}
