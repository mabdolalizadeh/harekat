#!/usr/bin/env node
/**
 * CLI script to delete an Admin or Super Admin by username or ID.
 *
 * Usage:
 *   npm run delete-admin <username-or-uuid> [force]
 *   npm run delete-admin -- --username=<username> [--force]
 *   node scripts/delete-admin.js --username=<username>
 */

import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { Op } from 'sequelize';
import { sequelize } from '../src/models/database.config.js';
import { Admins } from '../src/models/index.js';

function printUsage() {
    console.log(`
Harekat LMS — Admin Deletion Tool

Usage:
  # Method 1: Positional argument (Recommended — avoids npm flag conflicts)
  npm run delete-admin <username-or-uuid> [force]
  node scripts/delete-admin.js <username-or-uuid> [force]

  # Method 2: Direct node with flags
  node scripts/delete-admin.js --username=<username> [--force]
  node scripts/delete-admin.js --id=<uuid> [--force]

  # Method 3: npm run with flags (Requires double-dash '--' before script flags)
  npm run delete-admin -- --username=<username> [--force]
  npm run delete-admin -- --id=<uuid> [--force]

  # Method 4: Interactive prompt (run with no arguments)
  npm run delete-admin

Important npm tip:
  When passing flags through npm run, npm requires an extra '--' separator:
    CORRECT:   npm run delete-admin -- --username=superadmin
    INCORRECT: npm run delete-admin --username=superadmin  (triggers npm EUNKNOWNCONFIG)
  Or simply use:
    SIMPLEST:  npm run delete-admin superadmin
`);
}

async function main() {
    const rawArgs = process.argv.slice(2);
    const flags = {};
    const positionals = [];

    for (const arg of rawArgs) {
        if (arg.startsWith('--')) {
            const [k, ...rest] = arg.replace(/^--/, '').split('=');
            flags[k] = rest.length > 0 ? rest.join('=') : true;
        } else if (arg.startsWith('-')) {
            const k = arg.replace(/^-+/, '');
            flags[k] = true;
        } else {
            positionals.push(arg);
        }
    }

    if (flags.help || flags.h) {
        printUsage();
        process.exit(0);
    }

    let target = flags.username || flags.id || positionals[0];
    let isForce = Boolean(flags.force) || positionals.includes('force');

    // Interactive fallback if no target provided on CLI
    if (!target && process.stdin.isTTY) {
        console.log('====================================================');
        console.log('Harekat LMS — Admin Deletion Tool (Interactive)');
        console.log('====================================================\n');
        const rl = readline.createInterface({ input, output });
        try {
            const answer = await rl.question('Enter Admin Username or UUID to delete (or press Enter to cancel): ');
            target = answer.trim();
        } finally {
            rl.close();
        }
    }

    if (!target) {
        printUsage();
        process.exit(1);
    }

    try {
        await sequelize.authenticate();

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
        const query = flags.id
            ? { id: flags.id }
            : flags.username
                ? { username: flags.username.trim() }
                : isUuid
                    ? { [Op.or]: [{ id: target }, { username: target }] }
                    : { username: target.trim() };

        const admin = await Admins.findOne({ where: query });

        if (!admin) {
            console.error(`\n[x] Error: Administrator not found with identifier "${target}".`);
            console.error('    Tip: Run "npm run list-admins" to see all existing administrators.\n');
            process.exit(1);
        }

        // Safety check for the last superadmin
        if (admin.role === 'superadmin') {
            const superadminCount = await Admins.count({ where: { role: 'superadmin' } });
            if (superadminCount <= 1 && !isForce) {
                if (process.stdin.isTTY) {
                    const rl = readline.createInterface({ input, output });
                    try {
                        console.log(`\n[!] CAUTION: "${admin.username}" is the ONLY Super Admin remaining in the database.`);
                        console.log('    Deleting this account will leave the system without any Super Admin.');
                        const confirm = await rl.question('    Are you sure you want to proceed? Type YES to delete: ');
                        if (confirm.trim() !== 'YES') {
                            console.log('\n[i] Deletion cancelled by user.\n');
                            process.exit(0);
                        }
                    } finally {
                        rl.close();
                    }
                } else {
                    console.error(`\n[!] SAFETY ERROR: "${admin.username}" is the ONLY Super Admin remaining.`);
                    console.error('    Deleting this account will leave the system without any Super Admin.');
                    console.error('    If you truly intend to do this, pass the "force" option:\n');
                    console.error(`    npm run delete-admin ${admin.username} force\n`);
                    process.exit(1);
                }
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

        console.log('\n[✔] Administrator successfully deleted!');
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
