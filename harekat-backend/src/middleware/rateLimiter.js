import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 2000 : 30,
    message: { ok: false, message: 'too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const strictAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 2000 : 20,
    message: { ok: false, message: 'too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 50000 : 1000,
    message: { ok: false, message: 'too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

