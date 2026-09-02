import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { apiLimiter, authLimiter, strictAuthLimiter } from './middleware/rateLimiter.js';
import { logSecurityEvent } from './utils/logger.js';
import { configs } from './config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

app.use(morgan('dev'));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'same-site' },
}));

const corsOrigin = configs.corsOrigin === '*' ? '*' : configs.corsOrigin.split(',');
app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/v1', apiLimiter);

app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/auth/validate-otp', strictAuthLimiter);
app.use('/api/v1/admins/auth', strictAuthLimiter);
app.use('/api/v1/admins/register', strictAuthLimiter);

app.use('/api/v1', routes);

const frontendDist = path.resolve(__dirname, '../../harekat-landing/dist');
app.use(express.static(frontendDist));

app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/v1')) {
        res.sendFile(path.join(frontendDist, 'index.html'));
    } else {
        next();
    }
});

app.use((req, res) => {
    logSecurityEvent('route_not_found', { path: req.path, method: req.method, ip: req.ip });
    res.status(404).json({ ok: false, message: 'not found' });
});

app.use((err, req, res, next) => {
    logSecurityEvent('internal_error', { path: req.path, method: req.method, ip: req.ip, error: err.message });
    if (configs.nodeEnv === 'production') {
        res.status(500).json({ ok: false, message: 'internal server error' });
    } else {
        console.error(err.stack);
        res.status(500).json({ ok: false, message: err.message || 'internal server error' });
    }
});

export default app;
