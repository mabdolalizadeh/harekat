// Idempotent seeder: safe to run on an existing database (no force/sync-destroy).
// Usage: node src/utils/seedCmsData.js
import { sequelize } from '../models/database.config.js';
import '../models/index.js';
import { Op } from 'sequelize';
import { Categories, Courses, Coupon, HeaderMenuItem, SiteContent } from '../models/index.js';

async function main() {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // adds new tables/columns without dropping data
    // SQLite can't ADD a UNIQUE column via ALTER, so enforce slug uniqueness with an index.
    await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique ON Categories (slug)').catch(() => {});

    const canonical = [
        { name: 'آموزش کپسولی', slug: 'capsule-training', sortOrder: 1 },
        { name: 'دوره‌های مقدماتی', slug: 'beginner-courses', sortOrder: 2 },
        { name: 'پکیج‌های مهارتی', slug: 'skill-packages', sortOrder: 3 },
        { name: 'اشتراک‌ها', slug: 'subscriptions', sortOrder: 4 },
    ];
    for (const c of canonical) {
        await Categories.findOrCreate({ where: { slug: c.slug }, defaults: c });
    }

    // Backfill slug for legacy rows missing it
    const legacy = await Categories.findAll({ where: { slug: null } });
    let i = 0;
    for (const row of legacy) {
        i += 1;
        row.slug = `legacy-${row.id}-${i}`;
        await row.save();
    }

    // Demo sale price on first course if none set (preserves existing content)
    const first = await Courses.findOne({ order: [['createdAt', 'ASC']] });
    if (first && !first.salePrice) {
        const p = Number(String(first.price).replace(/[,٬]/g, ''));
        if (Number.isFinite(p) && p > 0) {
            first.salePrice = String(Math.round(p * 0.8));
            await first.save();
            console.log(`salePrice backfilled on course ${first.id}`);
        }
    }

    await Coupon.findOrCreate({
        where: { code: 'HAREKAT10' },
        defaults: { code: 'HAREKAT10', discountType: 'percent', discountValue: 10, isActive: true, usageLimit: 100, usageCount: 0 }
    });

    const menu = [
        { label: 'خانه', link: '/#hero', scrollId: 'hero', sortOrder: 1 },
        { label: 'دوره‌ها', link: '/#courses', scrollId: 'courses', sortOrder: 2 },
        { label: 'تولیدات', link: '/products', scrollId: null, sortOrder: 3 },
        { label: 'درباره ما', link: '/about-us', scrollId: null, sortOrder: 4 },
        { label: 'تماس با ما', link: '/contact-us', scrollId: null, sortOrder: 5 },
    ];
    const existingMenu = await HeaderMenuItem.count();
    if (existingMenu === 0) {
        for (const m of menu) await HeaderMenuItem.create(m);
    }

    const blocks = [
        { key: 'hero-title', title: 'اینجا فقط یاد نمی‌گیری', body: 'مدرسه هنر و مهارت حرکت مدیا' },
        { key: 'hero-cta', title: 'بریم شروع کنیم!', linkUrl: '/#courses', linkText: 'مشاهده دوره‌ها' },
        { key: 'contact-email', title: 'ایمیل', body: 'info@harekatmedia.com' },
        { key: 'contact-phone', title: 'تلفن', body: '۰۲۱-۱۲۳۴۵۶۷۸' },
        { key: 'contact-address', title: 'آدرس', body: 'تهران، ایران' },
        { key: 'social-instagram', title: 'اینستاگرام', linkUrl: 'https://instagram.com', linkText: 'اینستاگرام' },
        { key: 'social-telegram', title: 'تلگرام', linkUrl: 'https://t.me', linkText: 'تلگرام' },
        { key: 'social-linkedin', title: 'لینکدین', linkUrl: 'https://linkedin.com', linkText: 'لینکدین' },
        { key: 'footer-copyright', title: 'کپی‌رایت', body: '© ۱۴۰۵ حرکت مدیا' },
    ];
    for (const b of blocks) {
        await SiteContent.findOrCreate({ where: { key: b.key }, defaults: b });
    }

    // Marquee slides (managed from admin > نوار متحرک) — only when none exist yet.
    const existingMarquee = await SiteContent.count({ where: { key: { [Op.startsWith]: 'marquee-' } } });
    if (existingMarquee === 0) {
        const slides = [
            { key: 'marquee-1', title: 'کارگاه خلاقیت', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', sortOrder: 1, isActive: true },
            { key: 'marquee-2', title: 'آتلیه‌ی هنر و فناوری', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400', sortOrder: 2, isActive: true },
            { key: 'marquee-3', title: 'یادگیری تیمی', imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400', sortOrder: 3, isActive: true },
            { key: 'marquee-4', title: 'تجربه‌های پروژه‌محور', imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', sortOrder: 4, isActive: true },
        ];
        for (const s of slides) await SiteContent.create(s);
    }

    console.log('CMS seed complete (idempotent).');
    await sequelize.close();
}

main().catch(async (e) => { console.error(e); try { await sequelize.close(); } catch { /* noop */ } process.exit(1); });
