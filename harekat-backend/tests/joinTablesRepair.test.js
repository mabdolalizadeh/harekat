import test from 'node:test';
import assert from 'node:assert/strict';
import { sequelize } from '../src/models/database.config.js';
import { Users, Courses } from '../src/models/index.js';
import { repairJoinTables, repairUserCoursesJoinTable } from '../src/models/repairJoinTables.js';
import { AccessService } from '../src/services/accessService.js';

test('repairUserCoursesJoinTable: detects and fixes single-column UNIQUE constraint on userId', async () => {
    // 1. Create test user and two courses
    const user = await Users.create({
        phoneNumber: `0999${Math.floor(1000000 + Math.random() * 9000000)}`,
        firstName: 'Unique',
        lastName: 'TestUser'
    });
    const course1 = await Courses.create({
        name: 'دوره تست یک',
        price: '100000',
        image: '/img1.jpg',
        level: 'مبتدی',
        duration: '10 ساعت',
        typeOfAttendence: 'آنلاین',
        statusOfRegistration: 'open'
    });
    const course2 = await Courses.create({
        name: 'دوره تست دو',
        price: '200000',
        image: '/img2.jpg',
        level: 'پیشرفته',
        duration: '15 ساعت',
        typeOfAttendence: 'آنلاین',
        statusOfRegistration: 'open'
    });

    // 2. Deliberately corrupt UserCourses to have the bug (userId UNIQUE)
    await sequelize.transaction(async (t) => {
        await sequelize.query('DROP TABLE IF EXISTS UserCourses_legacy', { transaction: t });
        await sequelize.query('ALTER TABLE UserCourses RENAME TO UserCourses_legacy', { transaction: t });
        await sequelize.query(`
            CREATE TABLE UserCourses (
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                userId UUID NOT NULL UNIQUE REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE,
                courseId UUID NOT NULL UNIQUE REFERENCES Courses (id) ON DELETE CASCADE ON UPDATE CASCADE,
                PRIMARY KEY (userId, courseId)
            )
        `, { transaction: t });
        await sequelize.query(`
            INSERT OR IGNORE INTO UserCourses (createdAt, updatedAt, userId, courseId)
            SELECT createdAt, updatedAt, userId, courseId FROM UserCourses_legacy
        `, { transaction: t });
        await sequelize.query('DROP TABLE UserCourses_legacy', { transaction: t });
    });

    // 3. Confirm that inserting two courses for this user fails with the exact bug
    await assert.rejects(
        async () => {
            await user.setCourses([course1, course2]);
        },
        (err) => {
            return err.name === 'SequelizeUniqueConstraintError';
        },
        'Expected SequelizeUniqueConstraintError when UserCourses is corrupted'
    );

    // 4. Run repairJoinTables
    await repairJoinTables();

    // 5. Verify that setCourses now succeeds cleanly with multiple courses!
    await user.setCourses([course1, course2]);
    const enrolled = await user.getCourses();
    assert.equal(enrolled.length, 2, 'User should now be successfully enrolled in both courses');

    // 6. Verify AccessService grantCourseAccess works without error
    await AccessService.grantCourseAccess({
        userId: user.id,
        courseId: course1.id,
        sourceType: 'direct'
    });
    await AccessService.grantCourseAccess({
        userId: user.id,
        courseId: course2.id,
        sourceType: 'direct'
    });

    const activeIds = await AccessService.getUserActiveCourseIds(user.id);
    assert.ok(activeIds.includes(course1.id));
    assert.ok(activeIds.includes(course2.id));
});
