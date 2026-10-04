import dotenv from 'dotenv';
import { sequelize } from './models/database.config.js';
import app from './app.js';
import { configs } from './config/config.js';
import { migrateLmsSchema } from './models/migrateLms.js';
import { repairJoinTables } from './models/repairJoinTables.js';
import { tokenRevocationService } from './services/tokenRevocationService.js';

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

repairJoinTables()
    .then(() => sequelize.sync())
    .then(() => addBannerResponsiveImageColumns())
    .then(() => migrateLmsSchema())
    .then(() => tokenRevocationService.init())
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
