import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { ok: false, message: 'too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const strictAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { ok: false, message: 'too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { ok: false, message: 'too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
