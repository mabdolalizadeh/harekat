#!/usr/bin/env node
/**
 * CLI script to create or bootstrap a Super Admin with an RSA-2048 key pair.
 *
 * Usage:
 *   node scripts/create-superadmin.js --username=admin --name="Super Admin" --output=./superadmin_private_key.pem
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../src/models/database.config.js';
import { Admins } from '../src/models/index.js';
import { generateRsaKeyPair } from '../src/controllers/adminsController.js';
import { migrateLmsSchema } from '../src/models/migrateLms.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // Parse arguments
    const args = process.argv.slice(2).reduce((acc, curr) => {
        if (curr.startsWith('--')) {
            const [k, v] = curr.replace(/^--/, '').split('=');
            acc[k] = v || true;
        }
        return acc;
    }, {});

    if (args.help) {
        console.log(`
Harekat LMS — Super Admin Provisioning Tool

Usage:
  node scripts/create-superadmin.js [options]
  npm run create-superadmin -- [options]

Options:
  --username=<name>    Admin username (default: superadmin)
  --name=<name>        Display name (default: "مدیر ارشد سامانه")
  --password=<pass>    Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
  --email=<email>      Admin email address
  --phone=<phone>      Admin phone/mobile number
  --role=<role>        Role: 'superadmin' or 'ta' (default: superadmin)
  --output=<path>      File path to save the generated private RSA key (.pem)
  --help               Show this help message

Examples:
  npm run create-superadmin -- --username=admin --password="MySecurePass123!" --output=./admin.pem
`);
        process.exit(0);
    }

    const username = (args.username || 'superadmin').trim();
    const name = args.name || 'مدیر ارشد سامانه';
    const email = args.email || null;
    const phone = args.phone || null;
    const password = args.password || 'Admin@Harekat2026!';
    const role = args.role && ['superadmin', 'ta'].includes(args.role) ? args.role : 'superadmin';
    const outputPath = args.output ? path.resolve(process.cwd(), args.output) : null;

    // Validate password complexity
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        console.error('[x] Password validation error: Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        process.exit(1);
    }

    console.log('====================================================');
    console.log('Harekat LMS — Super Admin RSA Provisioning Tool');
    console.log('====================================================\n');

    try {
        await sequelize.authenticate();
        await migrateLmsSchema();

        const existing = await Admins.findOne({ where: { username } });
        if (existing) {
            console.log(`[!] Admin with username "${username}" already exists (ID: ${existing.id}).`);
            console.log('[*] Regenerating RSA-2048 keypair for existing admin...');

            const { publicKey, privateKey, fingerprint } = generateRsaKeyPair();
            if (args.password) {
                existing.password = password;
            }
            existing.publicKey = publicKey;
            existing.keyFingerprint = fingerprint;
            existing.role = role;
            existing.status = 'active';
            await existing.save();

            console.log('\n[✔] RSA Key Pair regenerated and assigned successfully!');
            console.log(`- Username: ${existing.username}`);
            console.log(`- Role: ${existing.role}`);
            console.log(`- Public Key Fingerprint (SHA-256): ${fingerprint}`);

            if (outputPath) {
                fs.writeFileSync(outputPath, privateKey, { mode: 0o600 });
                console.log(`\n[✔] Private key saved to: ${outputPath}`);
            } else {
                console.log('\n================ BEGIN RSA PRIVATE KEY (PEM) ================');
                console.log(privateKey);
                console.log('================= END RSA PRIVATE KEY (PEM) =================\n');
                console.log('[!] IMPORTANT: Store this private key securely! It will not be shown again.');
            }
            process.exit(0);
        }

        console.log(`[*] Generating RSA-2048 keypair for new Super Admin "${username}"...`);
        const { publicKey, privateKey, fingerprint } = generateRsaKeyPair();

        const admin = await Admins.create({
            username,
            password,
            role,
            name,
            email,
            phoneNumber: phone,
            status: 'active',
            publicKey,
            keyFingerprint: fingerprint
        });

        console.log('\n[✔] Super Admin created successfully!');
        console.log(`- ID: ${admin.id}`);
        console.log(`- Username: ${admin.username}`);
        console.log(`- Name: ${admin.name}`);
        console.log(`- Password: ${password}`);
        console.log(`- Role: ${admin.role}`);
        console.log(`- Public Key Fingerprint: ${fingerprint}`);

        if (outputPath) {
            fs.writeFileSync(outputPath, privateKey, { mode: 0o600 });
            console.log(`\n[✔] Private key saved to: ${outputPath}`);
        } else {
            console.log('\n================ BEGIN RSA PRIVATE KEY (PEM) ================');
            console.log(privateKey);
            console.log('================= END RSA PRIVATE KEY (PEM) =================\n');
            console.log('[!] IMPORTANT: Store this private key securely! It will not be shown again.');
        }

        process.exit(0);
    } catch (err) {
        console.error('\n[x] Error provisioning super admin:', err.message);
        process.exit(1);
    }
}

main();
