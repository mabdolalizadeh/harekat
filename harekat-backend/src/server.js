import dotenv from 'dotenv';
import { sequelize } from './models/database.config.js';
import app from './app.js';
import { configs } from './config/config.js';

dotenv.config({ path: '.env' });

const PORT = process.env.PORT || 3000;

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

sequelize.sync({ alter: configs.nodeEnv === 'development' })
    .then(() => {
        console.log('database synced');
        const server = app.listen(PORT, () => {
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
