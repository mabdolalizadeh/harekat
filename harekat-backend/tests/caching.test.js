import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
let origin;

test.before(async () => {
    const { default: app } = await import('../src/app.js');
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    origin = `http://127.0.0.1:${port}`;
});

test.after(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
});

test('Static Asset Optimization & Cloudflare Caching Headers', async (t) => {
    await t.test('SPA index.html revalidation headers', async () => {
        const res = await fetch(`${origin}/`);
        const contentType = res.headers.get('content-type') || '';
        if (res.status === 200 && contentType.includes('text/html')) {
            const cacheControl = res.headers.get('cache-control') || '';
            assert.match(
                cacheControl,
                /public,\s*max-age=0,\s*must-revalidate/,
                'index.html must have Cache-Control: public, max-age=0, must-revalidate'
            );
        }
    });

    await t.test('Hashed static assets long-term immutable caching', async () => {
        const landingAssetsDir = path.resolve(__dirname, '../../harekat-landing/dist/assets');
        if (fs.existsSync(landingAssetsDir)) {
            const assetFiles = fs.readdirSync(landingAssetsDir);
            const jsOrCssAsset = assetFiles.find((f) => /-[a-zA-Z0-9_-]{8,}\.(js|css)$/.test(f));
            if (jsOrCssAsset) {
                const res = await fetch(`${origin}/assets/${jsOrCssAsset}`);
                assert.equal(res.status, 200);
                const cacheControl = res.headers.get('cache-control') || '';
                assert.match(
                    cacheControl,
                    /public,\s*max-age=31536000,\s*immutable/,
                    'Fingerprinted asset must have Cache-Control: public, max-age=31536000, immutable'
                );
            }
        }
    });

    await t.test('Uploads directory caching with stale-while-revalidate', async () => {
        const uploadsDir = path.resolve(__dirname, '../uploads');
        fs.mkdirSync(uploadsDir, { recursive: true });
        const testFile = path.join(uploadsDir, 'cache-test-image.webp');
        fs.writeFileSync(testFile, 'dummy-image-bytes');

        try {
            const res = await fetch(`${origin}/uploads/cache-test-image.webp`);
            assert.equal(res.status, 200);
            const cacheControl = res.headers.get('cache-control') || '';
            assert.match(
                cacheControl,
                /public,\s*max-age=2592000,\s*stale-while-revalidate=86400/,
                '/uploads/ assets must have Cache-Control: public, max-age=2592000, stale-while-revalidate=86400'
            );
        } finally {
            try { fs.unlinkSync(testFile); } catch {}
        }
    });
});
