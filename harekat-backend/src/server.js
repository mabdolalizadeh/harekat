import dotenv from 'dotenv';
import { sequelize } from './models/database.config.js';
import app from './app.js';
import { configs } from './config/config.js';
import { migrateLmsSchema } from './models/migrateLms.js';

async function repairCourseCategoryJoinTable() {
    const [rows] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'CourseCategories'");
    const schema = rows[0]?.sql || '';
    if (!/courseId[\s`"]+UUID NOT NULL UNIQUE/i.test(schema)) return;

    console.log('repairing CourseCategories join table constraints');
    await sequelize.transaction(async (transaction) => {
        await sequelize.query('ALTER TABLE CourseCategories RENAME TO CourseCategories_legacy', { transaction });
        await sequelize.query(`
            CREATE TABLE CourseCategories (
                courseId UUID NOT NULL REFERENCES Courses (id),
                categoryId INTEGER NOT NULL REFERENCES Categories (id),
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

async function addBannerResponsiveImageColumns() {
    const [columns] = await sequelize.query("PRAGMA table_info('Banners')");
    if (!columns.length) return;
    const existing = new Set(columns.map((column) => column.name));
    for (const column of ['tabletImageUrl', 'mobileImageUrl']) {
        if (!existing.has(column)) await sequelize.query(`ALTER TABLE Banners ADD COLUMN ${column} VARCHAR(255)`);
    }
}

dotenv.config({ path: '.env' });

const PORT = process.env.PORT || 3000;

let server;

const gracefulShutdown = (signal) => {
    console.log(`${signal} received, closing server gracefully...`);
    server.close(() => {
        sequelize.close().then(() => {
            console.log('database connection closed');
            process.exit(0);
        }).catch((err) => {
            console.error('error closing database:', err);
            process.exit(1);
        });
    });
    setTimeout(() => {
        console.error('forced shutdown due to timeout');
        process.exit(1);
    }, 10000);
};

repairCourseCategoryJoinTable()
    .then(() => sequelize.sync())
    .then(() => addBannerResponsiveImageColumns())
    .then(() => migrateLmsSchema())
    .then(() => {
        console.log('database synced');
        server = app.listen(PORT, () => {
            console.log(`server running on port ${PORT}`);
            console.log(`environment: ${configs.nodeEnv}`);
        });

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    })
    .catch((err) => {
        console.error('database sync failed:', err);
        process.exit(1);
    });
