import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { apiLimiter, authLimiter, strictAuthLimiter } from './middleware/rateLimiter.js';
import { logSecurityEvent } from './utils/logger.js';
import { configs } from './config/config.js';
import { auth } from './middleware/auth.js';
import { adminOnly } from './middleware/ownerCheck.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

app.use(morgan('dev'));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://static.cloudflareinsights.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://images.unsplash.com", "https://static.cloudflareinsights.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://www.aparat.com"], 
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
}));
const corsOrigin = configs.corsOrigin === '*' ? '*' : configs.corsOrigin.split(',');
app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({
    limit: '1mb',
    verify: (req, _res, buffer) => {
        req.rawBody = buffer.toString('utf8');
    }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.text({ type: ['text/markdown', 'text/plain', 'application/markdown'], limit: '1mb' }));

app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed' && typeof req.rawBody === 'string' && /^\s*#/.test(req.rawBody)) {
        // Some clients incorrectly label a raw Markdown document as JSON.
        // For an existing course, treat that document as longDescription.
        if (['PUT', 'PATCH'].includes(req.method) && /^\/api\/v1\/courses\/[^/]+$/.test(req.path)) {
            req.body = { longDescription: req.rawBody };
            return next();
        }
        return res.status(400).json({ ok: false, message: 'send Markdown in the longDescription field' });
    }
    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({ ok: false, message: 'invalid JSON request body' });
    }
    next(err);
});

const frontendDist = path.resolve(__dirname, '../../harekat-landing/dist');
const adminDist = path.resolve(__dirname, '../../harekat-admin/dist');
const configuredAdminHost = String(process.env.ADMIN_HOSTNAME || process.env.ADMIN_HOST || '').trim().toLowerCase();

function isAdminHost(req) {
    const hostname = String(req.hostname || '').toLowerCase();
    return (configuredAdminHost && hostname === configuredAdminHost) || hostname.startsWith('admin.');
}

function isLegacyAdminPath(req) {
    return req.path === '/admin' || req.path.startsWith('/admin/');
}

// Persistent upload directory — MUST be outside `dist`.
// `dist` is gitignored and wiped on every `vite build` (emptyOutDir:true),
// so storing uploads there causes silent data loss after each frontend rebuild
// or fresh deploy. Use `UPLOADS_DIR` env or `harekat-backend/uploads`.
const UPLOADS_DIR = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(__dirname, '../uploads');
try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch { /* noop */ }

// Best-effort migration: if legacy files still exist in the old
// `harekat-landing/dist/uploads` location, copy them to the new persistent dir
// so existing DB imageUrls (`/uploads/image-...`) keep working after upgrade.
try {
    const legacyUploadDir = path.join(frontendDist, 'uploads');
    if (fs.existsSync(legacyUploadDir)) {
        for (const fname of fs.readdirSync(legacyUploadDir)) {
            const src = path.join(legacyUploadDir, fname);
            const dst = path.join(UPLOADS_DIR, fname);
            if (!fs.existsSync(dst) && fs.statSync(src).isFile()) {
                fs.copyFileSync(src, dst);
            }
        }
        // keep legacy files in place as fallback — do NOT delete
    }
} catch { /* migration is best-effort */ }

// Serve persistent uploads at `/uploads` BEFORE the frontend static handler
// so `/uploads/image-xxx.jpg` resolves even when `frontendDist` is missing
// or has been rebuilt. Also keep legacy dir as fallback for unmigrated files.
app.use('/uploads', express.static(UPLOADS_DIR));
try {
    const legacyUploadDir = path.join(frontendDist, 'uploads');
    if (fs.existsSync(legacyUploadDir)) {
        app.use('/uploads', express.static(legacyUploadDir));
    }
} catch { /* noop */ }

app.use('/api/v1', apiLimiter);

// Images are uploaded separately from JSON payloads so large binary data does
// not count against the JSON request limit.
app.use('/api/v1/uploads/image', auth, adminOnly, express.raw({ type: ['image/*'], limit: '10mb' }), async (req, res) => {
    try {
        if (!req.body || req.body.length === 0) {
            return res.status(400).json({ ok: false, message: 'No image data' });
        }

        const extension = req.headers['content-type'].split('/')[1].split(';')[0].replace(/[^a-z0-9]/gi, '') || 'bin';
        const filename = `image-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, req.body);

        const imageUrl = `/uploads/${filename}`;
        return res.status(201).json({ ok: true, data: { imageUrl } });
    } catch (err) {
        console.error('Image upload error:', err);
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// Generic file upload for resume / PDFs (uses same persistent dir)
app.use('/api/v1/uploads/file', auth, adminOnly, express.raw({ type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/*'], limit: '10mb' }), async (req, res) => {
    try {
        if (!req.body || req.body.length === 0) {
            return res.status(400).json({ ok: false, message: 'No file data' });
        }
        const ct = req.headers['content-type'] || 'application/octet-stream';
        let ext = ct.split('/')[1]?.split(';')[0]?.replace(/[^a-z0-9]/gi, '') || 'bin';
        if (ct.includes('pdf')) ext = 'pdf';
        if (ct.includes('wordprocessingml')) ext = 'docx';
        if (ct.includes('msword')) ext = 'doc';
        const filename = `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, req.body);
        const fileUrl = `/uploads/${filename}`;
        return res.status(201).json({ ok: true, data: { fileUrl } });
    } catch (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// All JSON write endpoints receive objects. Without this guard, a raw
// Markdown string (or an array) can reach a controller and become a generic
// TypeError/Sequelize error reported as HTTP 500.
app.use('/api/v1', (req, res, next) => {
    // A course detail can also be updated directly with a text/markdown
    // request. Convert it to the same shape used by the admin panel.
    if (typeof req.body === 'string' &&
        ['PUT', 'PATCH'].includes(req.method) &&
        /^\/courses\/[^/]+$/.test(req.path)) {
        req.body = { longDescription: req.body };
        return next();
    }

    if (['POST', 'PUT', 'PATCH'].includes(req.method) &&
        (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body))) {
        return res.status(400).json({
            ok: false,
            message: 'request body must be a JSON object; use { "body": "..." } or { "longDescription": "..." }'
        });
    }
    next();
});

app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/auth/validate-otp', strictAuthLimiter);
app.use('/api/v1/admins/auth', strictAuthLimiter);
app.use('/api/v1/admins/register', strictAuthLimiter);

app.use('/api/v1', routes);

// Serve the admin SPA from the admin hostname at its root. The hostname is
// configured with ADMIN_HOSTNAME (for example admin.domain.tld); the
// admin.* fallback also makes local subdomain testing straightforward.
if (fs.existsSync(path.join(adminDist, 'index.html'))) {
    app.use((req, res, next) => {
        if (!isAdminHost(req) || req.path.startsWith('/api/v1') || isLegacyAdminPath(req)) return next();
        express.static(adminDist)(req, res, (err) => {
            if (err) return next(err);
            if (req.method === 'GET') return res.sendFile(path.join(adminDist, 'index.html'));
            next();
        });
    });
}

// The public landing SPA is served from the root hostname. Do not let an
// admin-host request fall through to the public app.
app.use((req, res, next) => {
    if (isAdminHost(req)) return next();
    express.static(frontendDist)(req, res, next);
});

app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/v1') && !isLegacyAdminPath(req)) {
        if (isAdminHost(req) && fs.existsSync(path.join(adminDist, 'index.html'))) {
            return res.sendFile(path.join(adminDist, 'index.html'));
        }
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
