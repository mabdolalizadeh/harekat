import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(path.join(__dirname, "..", ".env"));

const configs = {
    jwtKey: process.env.JWT_KEY,
    jwtExpiry: process.env.JWT_EXPIRY || '7d',
    userJwtExpiry: process.env.USER_JWT_EXPIRY || '7d',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    nodeEnv: String(process.env.NODE_ENV || 'production').toLowerCase()
};

const validateConfig = () => {
    const errors = [];
    if (!configs.jwtKey || configs.jwtKey.length < 32) {
        errors.push('JWT_KEY must be set and at least 32 characters long');
    }
    if (errors.length > 0) {
        throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }
};

validateConfig();

export { configs };
