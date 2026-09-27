#!/usr/bin/env node
/**
 * CLI script to delete an Admin or Super Admin by username or ID.
 *
 * Usage:
 *   node scripts/delete-admin.js --username=admin
 *   node scripts/delete-admin.js --id=UUID-OF-ADMIN
 *   npm run delete-admin -- --username=admin
 */

import { sequelize } from '../src/models/database.config.js';
import { Admins } from '../src/models/index.js';

async function main() {
    // Parse arguments
    const args = process.argv.slice(2).reduce((acc, curr) => {
        if (curr.startsWith('--')) {
            const [k, v] = curr.replace(/^--/, '').split('=');
            acc[k] = v || true;
        }
        return acc;
    }, {});

    if (args.help || (!args.username && !args.id)) {
        console.log(`
Harekat LMS — Admin Deletion Tool

Usage:
  node scripts/delete-admin.js --username=<username>
  node scripts/delete-admin.js --id=<admin-id>

Options:
  --username=<name>    Username of the admin to delete
  --id=<uuid>          Unique ID of the admin to delete
  --force              Force deletion even if it is the last Super Admin
  --help               Show this help message

Examples:
  npm run delete-admin -- --username=testadmin
  npm run delete-admin -- --id=3c829e01-1234-5678-90ab-cdef12345678
`);
        process.exit(args.help ? 0 : 1);
    }

    console.log('====================================================');
    console.log('Harekat LMS — Admin Deletion CLI');
    console.log('====================================================\n');

    try {
        await sequelize.authenticate();

        const query = args.id ? { id: args.id } : { username: args.username.trim() };
        const admin = await Admins.findOne({ where: query });

        if (!admin) {
            console.error(`[x] Error: Admin not found with ${args.id ? `ID: ${args.id}` : `username: "${args.username}"`}`);
            process.exit(1);
        }

        // Check if deleting the last superadmin
        if (admin.role === 'superadmin') {
            const superadminCount = await Admins.count({ where: { role: 'superadmin' } });
            if (superadminCount <= 1 && !args.force) {
                console.error(`[!] SAFETY ERROR: "${admin.username}" is the ONLY Super Admin remaining.`);
                console.error('    Deleting this account will leave the system without any Super Admin.');
                console.error('    If you truly intend to do this, pass the --force flag.\n');
                process.exit(1);
            }
        }

        const deletedInfo = {
            id: admin.id,
            username: admin.username,
            name: admin.name || '(none)',
            role: admin.role,
            email: admin.email || '(none)'
        };

        await admin.destroy();

        console.log('[✔] Administrator successfully deleted!');
        console.log(`- ID:       ${deletedInfo.id}`);
        console.log(`- Username: ${deletedInfo.username}`);
        console.log(`- Name:     ${deletedInfo.name}`);
        console.log(`- Role:     ${deletedInfo.role}`);
        console.log(`- Email:    ${deletedInfo.email}\n`);

        process.exit(0);
    } catch (err) {
        console.error('\n[x] Database error while deleting admin:', err.message);
        process.exit(1);
    }
}

main();
