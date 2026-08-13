import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(path.join(__dirname, "../..", ".env"));

export const configs = {
    jwtKey: process.env.JWT_KEY,
    jwtExpiry: process.env.JWT_EXPIRY
};