#!/usr/bin/env node
/**
 * CLI script to generate static sitemap.xml for harekat-landing.
 *
 * Usage:
 *   node scripts/generate-sitemap.js
 *   npm run sitemap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../src/models/database.config.js';
import { Courses, Articles } from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log('====================================================');
    console.log('Harekat LMS — Sitemap Generator');
    console.log('====================================================\n');

    try {
        await sequelize.authenticate();

        const baseUrl = 'https://schoolharekat.ir';
        const staticRoutes = [
            { path: '/', priority: '1.0', changefreq: 'daily' },
            { path: '/courses', priority: '0.9', changefreq: 'weekly' },
            { path: '/packages', priority: '0.9', changefreq: 'weekly' },
            { path: '/capsules', priority: '0.8', changefreq: 'weekly' },
            { path: '/blog', priority: '0.9', changefreq: 'daily' },
            { path: '/about-us', priority: '0.7', changefreq: 'monthly' },
            { path: '/contact-us', priority: '0.7', changefreq: 'monthly' },
        ];

        const [courses, articles] = await Promise.all([
            Courses.findAll({
                where: { isActive: true },
                attributes: ['id', 'kind', 'updatedAt']
            }).catch(() => []),
            Articles.findAll({
                where: { status: 'published' },
                attributes: ['slug', 'updatedAt', 'publishedAt']
            }).catch(() => [])
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        for (const route of staticRoutes) {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
            xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
            xml += `    <priority>${route.priority}</priority>\n`;
            xml += '  </url>\n';
        }

        for (const course of courses) {
            const prefix = course.kind === 'skill' ? '/packages' : course.kind === 'capsule' ? '/capsules' : '/courses';
            const lastmod = course.updatedAt ? new Date(course.updatedAt).toISOString().split('T')[0] : '';
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${prefix}/${course.id}</loc>\n`;
            if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        }

        for (const article of articles) {
            const lastmod = (article.updatedAt || article.publishedAt)
                ? new Date(article.updatedAt || article.publishedAt).toISOString().split('T')[0]
                : '';
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/blog/${encodeURIComponent(article.slug)}</loc>\n`;
            if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        }

        xml += '</urlset>\n';

        // Write to both harekat-landing/public/sitemap.xml and harekat-landing/dist/sitemap.xml if dist exists
        const publicPath = path.resolve(__dirname, '../../harekat-landing/public/sitemap.xml');
        fs.writeFileSync(publicPath, xml, 'utf8');
        console.log(`[✔] Written to public: ${publicPath}`);

        const distDir = path.resolve(__dirname, '../../harekat-landing/dist');
        if (fs.existsSync(distDir)) {
            const distPath = path.join(distDir, 'sitemap.xml');
            fs.writeFileSync(distPath, xml, 'utf8');
            console.log(`[✔] Written to dist:   ${distPath}`);
        }

        const totalUrls = staticRoutes.length + courses.length + articles.length;
        console.log(`\n[✔] Sitemap generated successfully with ${totalUrls} URLs.`);
        process.exit(0);
    } catch (err) {
        console.error('\n[x] Error generating sitemap:', err.message);
        process.exit(1);
    }
}

main();
