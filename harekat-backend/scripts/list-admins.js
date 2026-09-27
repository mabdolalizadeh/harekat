#!/usr/bin/env node
/**
 * CLI script to list all Admins and Super Admins.
 *
 * Usage:
 *   node scripts/list-admins.js
 *   npm run list-admins
 */

import { sequelize } from '../src/models/database.config.js';
import { Admins } from '../src/models/index.js';

async function main() {
    console.log('====================================================');
    console.log('Harekat LMS — Administrators Directory');
    console.log('====================================================\n');

    try {
        await sequelize.authenticate();

        const admins = await Admins.findAll({
            attributes: ['id', 'username', 'role', 'name', 'email', 'status', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        if (admins.length === 0) {
            console.log('[!] No administrators found in the database.');
            process.exit(0);
        }

        console.table(admins.map(a => ({
            ID: a.id,
            Username: a.username,
            Name: a.name || '-',
            Role: a.role,
            Status: a.status,
            Email: a.email || '-'
        })));

        console.log(`\nTotal administrators: ${admins.length}\n`);
        process.exit(0);
    } catch (err) {
        console.error('\n[x] Error retrieving admins:', err.message);
        process.exit(1);
    }
}

main();
