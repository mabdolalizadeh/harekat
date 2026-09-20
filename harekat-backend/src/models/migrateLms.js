import { sequelize } from './database.config.js';

export async function migrateLmsSchema() {
    // 1. Users new columns
    const [userCols] = await sequelize.query("PRAGMA table_info('Users')");
    if (userCols?.length) {
        const existing = new Set(userCols.map((c) => c.name));
        if (!existing.has('nationalId')) await sequelize.query("ALTER TABLE Users ADD COLUMN nationalId VARCHAR(255)");
        if (!existing.has('bio')) await sequelize.query("ALTER TABLE Users ADD COLUMN bio TEXT");
        if (!existing.has('jobTitle')) await sequelize.query("ALTER TABLE Users ADD COLUMN jobTitle VARCHAR(255)");
        if (!existing.has('education')) await sequelize.query("ALTER TABLE Users ADD COLUMN education VARCHAR(255)");
        if (!existing.has('rubies')) await sequelize.query("ALTER TABLE Users ADD COLUMN rubies INTEGER DEFAULT 0");
    }

    // 2. Admins new columns
    const [adminCols] = await sequelize.query("PRAGMA table_info('Admins')");
    if (adminCols?.length) {
        const existing = new Set(adminCols.map((c) => c.name));
        if (!existing.has('role')) await sequelize.query("ALTER TABLE Admins ADD COLUMN role VARCHAR(50) DEFAULT 'superadmin'");
        if (!existing.has('name')) await sequelize.query("ALTER TABLE Admins ADD COLUMN name VARCHAR(255)");
        if (!existing.has('email')) await sequelize.query("ALTER TABLE Admins ADD COLUMN email VARCHAR(255)");
        if (!existing.has('phoneNumber')) await sequelize.query("ALTER TABLE Admins ADD COLUMN phoneNumber VARCHAR(255)");
        if (!existing.has('status')) await sequelize.query("ALTER TABLE Admins ADD COLUMN status VARCHAR(50) DEFAULT 'active'");
        if (!existing.has('permissions')) await sequelize.query("ALTER TABLE Admins ADD COLUMN permissions TEXT");
        if (!existing.has('publicKey')) await sequelize.query("ALTER TABLE Admins ADD COLUMN publicKey TEXT");
        if (!existing.has('keyFingerprint')) await sequelize.query("ALTER TABLE Admins ADD COLUMN keyFingerprint VARCHAR(255)");
    }

    // 3. Subscriptions new columns
    const [subCols] = await sequelize.query("PRAGMA table_info('Subscriptions')");
    if (subCols?.length) {
        const existing = new Set(subCols.map((c) => c.name));
        if (!existing.has('durationMonths')) await sequelize.query("ALTER TABLE Subscriptions ADD COLUMN durationMonths INTEGER DEFAULT 1");
        if (!existing.has('durationDays')) await sequelize.query("ALTER TABLE Subscriptions ADD COLUMN durationDays INTEGER DEFAULT 30");
        if (!existing.has('badgeLabel')) await sequelize.query("ALTER TABLE Subscriptions ADD COLUMN badgeLabel VARCHAR(255)");
        if (!existing.has('badgeIconSvg')) await sequelize.query("ALTER TABLE Subscriptions ADD COLUMN badgeIconSvg TEXT");
    }

    // 4. Payments new columns
    const [payCols] = await sequelize.query("PRAGMA table_info('Payments')");
    if (payCols?.length) {
        const existing = new Set(payCols.map((c) => c.name));
        if (!existing.has('orderId')) await sequelize.query("ALTER TABLE Payments ADD COLUMN orderId UUID");
        if (!existing.has('amount')) await sequelize.query("ALTER TABLE Payments ADD COLUMN amount VARCHAR(255)");
        if (!existing.has('gateway')) await sequelize.query("ALTER TABLE Payments ADD COLUMN gateway VARCHAR(50) DEFAULT 'mock'");
        if (!existing.has('transactionId')) await sequelize.query("ALTER TABLE Payments ADD COLUMN transactionId VARCHAR(255)");
        if (!existing.has('status')) await sequelize.query("ALTER TABLE Payments ADD COLUMN status VARCHAR(50) DEFAULT 'pending'");
        if (!existing.has('metadata')) await sequelize.query("ALTER TABLE Payments ADD COLUMN metadata TEXT");
    }

    // 5. Courses evaluation columns
    const [courseCols] = await sequelize.query("PRAGMA table_info('Courses')");
    if (courseCols?.length) {
        const existing = new Set(courseCols.map((c) => c.name));
        if (!existing.has('evaluationRequired')) await sequelize.query("ALTER TABLE Courses ADD COLUMN evaluationRequired BOOLEAN DEFAULT 0");
        if (!existing.has('evaluationTriggerSession')) await sequelize.query("ALTER TABLE Courses ADD COLUMN evaluationTriggerSession INTEGER DEFAULT 4");
    }

    // 6. Coupons targeting columns
    const [couponCols] = await sequelize.query("PRAGMA table_info('Coupons')");
    if (couponCols?.length) {
        const existing = new Set(couponCols.map((c) => c.name));
        if (!existing.has('targetType')) await sequelize.query("ALTER TABLE Coupons ADD COLUMN targetType VARCHAR(50) DEFAULT 'all'");
        if (!existing.has('targetCourseId')) await sequelize.query("ALTER TABLE Coupons ADD COLUMN targetCourseId UUID");
        if (!existing.has('targetUserIds')) await sequelize.query("ALTER TABLE Coupons ADD COLUMN targetUserIds TEXT");
    }
}
