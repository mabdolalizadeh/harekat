import { sequelize } from '../src/models/database.config.js';
import { repairJoinTables } from '../src/models/repairJoinTables.js';

async function run() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Checking and repairing join tables...');
        await repairJoinTables();
        console.log('Database repair completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Repair failed:', err);
        process.exit(1);
    }
}

run();
