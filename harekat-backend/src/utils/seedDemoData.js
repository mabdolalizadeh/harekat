import { sequelize } from '../models/database.config.js';
import { Admins, Users, Teachers, Categories, Courses, Payments, Coupon, HeaderMenuItem, SiteContent, Subscriptions, Cart, CartItem, Orders, OrderItems } from '../models/index.js';

async function clearData() {
    await OrderItems.destroy({ where: {} });
    await Orders.destroy({ where: {} });
    await CartItem.destroy({ where: {} });
    await Cart.destroy({ where: {} });
    await Subscriptions.destroy({ where: {} });
    await Payments.destroy({ where: {} });
    await Courses.destroy({ where: {} });
    await Categories.destroy({ where: {} });
    await Teachers.destroy({ where: {} });
    await Users.destroy({ where: {} });
    await Admins.destroy({ where: {} });
}

async function seedAdmins() {
    await Admins.create({ username: 'admin', password: 'admin123' });
    await Admins.create({ username: 'superadmin', password: 'super123' });
}

async function seedUsers() {
    const users = [
        { phoneNumber: '09123456789', firstName: 'علی', lastName: 'محمدی', avatar: 'https://i.pravatar.cc/150?u=1' },
        { phoneNumber: '09351234567', firstName: 'مریم', lastName: 'رضایی', avatar: 'https://i.pravatar.cc/150?u=2' },
        { phoneNumber: '09987654321', firstName: 'رضا', lastName: 'کریمی', avatar: 'https://i.pravatar.cc/150?u=3' },
        { phoneNumber: '09187654321', firstName: 'سارا', lastName: 'احمدی', avatar: 'https://i.pravatar.cc/150?u=4' },
        { phoneNumber: '09351239876', firstName: 'محمد', lastName: 'حسینی', avatar: 'https://i.pravatar.cc/150?u=5' },
    ];
    for (const u of users) {
        await Users.create(u);
    }
}

async function seedTeachers() {
    const teachers = [
        { firstName: 'دکتر', lastName: 'احمدی', avatar: 'https://i.pravatar.cc/150?u=11', resume: 'PhD in Computer Science, 10 years teaching experience', email: 'ahmadi@example.com' },
        { firstName: 'استاد', lastName: 'محمدی', avatar: 'https://i.pravatar.cc/150?u=12', resume: 'Senior Software Engineer at TechCorp', email: 'mohammadi@example.com' },
        { firstName: 'مهندس', lastName: 'رضایی', avatar: 'https://i.pravatar.cc/150?u=13', resume: 'Full-stack developer and UI/UX designer', email: 'rezaei@example.com' },
        { firstName: 'دکتر', lastName: 'کریمی', avatar: 'https://i.pravatar.cc/150?u=14', resume: 'Data Scientist and ML researcher', email: 'karimi@example.com' },
    ];
    for (const t of teachers) {
        await Teachers.create(t);
    }
    return await Teachers.findAll();
}

async function seedCategories() {
    const categories = [
        // Canonical product/content sections (managed from Admin Panel)
        { name: 'آموزش کپسولی', slug: 'capsule-training', sortOrder: 1 },
        { name: 'دوره‌های مقدماتی', slug: 'beginner-courses', sortOrder: 2 },
        { name: 'پکیج‌های مهارتی', slug: 'skill-packages', sortOrder: 3 },
        { name: 'اشتراک‌ها', slug: 'subscriptions', sortOrder: 4 },
        // Legacy demo categories
        { name: 'برنامه نویسی', slug: 'programming', sortOrder: 5 },
        { name: 'طراحی UI/UX', slug: 'ui-ux', sortOrder: 6 },
        { name: 'تولید محتوا', slug: 'content-creation', sortOrder: 7 },
        { name: 'بازاریابی دیجیتال', slug: 'digital-marketing', sortOrder: 8 },
        { name: 'عکاسی', slug: 'photography', sortOrder: 9 },
    ];
    for (const c of categories) {
        await Categories.create(c);
    }
    return await Categories.findAll();
}

async function seedCourses(teachers) {
    const courses = [
        { name: 'آموزش کامل React.js', price: '450000', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', level: 'مبتدی', duration: '20 ساعت', typeOfAttendence: 'آنلاین', statusOfRegistration: 'open', teacherId: teachers[1].id },
        { name: 'طراحی رابط کاربری با Figma', price: '380000', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', level: 'متوسط', duration: '15 ساعت', typeOfAttendence: 'آنلاین', statusOfRegistration: 'open', teacherId: teachers[2].id },
        { name: 'دوره جامع Node.js', price: '520000', image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400', level: 'پیشرفته', duration: '25 ساعت', typeOfAttendence: 'حضوری', statusOfRegistration: 'open', teacherId: teachers[1].id },
        { name: 'بازاریابی اینستاگرام', price: '290000', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', level: 'مبتدی', duration: '8 ساعت', typeOfAttendence: 'آنلاین', statusOfRegistration: 'open', teacherId: teachers[0].id },
        { name: 'عکاسی حرفه‌ای', price: '410000', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', level: 'متوسط', duration: '12 ساعت', typeOfAttendence: 'حضوری', statusOfRegistration: 'closed', teacherId: teachers[3].id },
        { name: 'هوش مصنوعی برای مبتدیان', price: '600000', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400', level: 'پیشرفته', duration: '30 ساعت', typeOfAttendence: 'آنلاین', statusOfRegistration: 'open', teacherId: teachers[3].id },
    ];
    for (const c of courses) {
        await Courses.create(c);
    }
    return await Courses.findAll();
}

async function seedCourseCategories(courses, categories) {
    const courseCategories = [
        { courseId: courses[0].id, categoryId: categories[0].id },
        { courseId: courses[1].id, categoryId: categories[1].id },
        { courseId: courses[2].id, categoryId: categories[0].id },
        { courseId: courses[3].id, categoryId: categories[3].id },
        { courseId: courses[4].id, categoryId: categories[4].id },
        { courseId: courses[5].id, categoryId: categories[0].id },
    ];
    for (const cc of courseCategories) {
        await sequelize.query('INSERT INTO CourseCategories (courseId, categoryId, createdAt, updatedAt) VALUES (:courseId, :categoryId, :createdAt, :updatedAt)', {
            replacements: { ...cc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            type: sequelize.QueryTypes.INSERT
        });
    }
}

async function seedUserCourses() {
    const users = await Users.findAll();
    const courses = await Courses.findAll();

    const userCourses = [
        { userId: users[0].id, courseId: courses[0].id },
        { userId: users[0].id, courseId: courses[2].id },
        { userId: users[1].id, courseId: courses[0].id },
        { userId: users[1].id, courseId: courses[1].id },
        { userId: users[2].id, courseId: courses[3].id },
        { userId: users[3].id, courseId: courses[4].id },
        { userId: users[4].id, courseId: courses[5].id },
    ];
    for (const uc of userCourses) {
        await sequelize.query('INSERT INTO UserCourses (userId, courseId, createdAt, updatedAt) VALUES (:userId, :courseId, :createdAt, :updatedAt)', {
            replacements: { ...uc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            type: sequelize.QueryTypes.INSERT
        });
    }
}

async function seedPayments() {
    const users = await Users.findAll();
    const payments = [
        { type: 'paid', userId: users[0].id },
        { type: 'paid', userId: users[1].id },
        { type: 'pending', userId: users[2].id },
        { type: 'failed', userId: users[3].id },
        { type: 'refunded', userId: users[4].id },
    ];
    for (const p of payments) {
        await Payments.create(p);
    }
}

async function seedCoupons() {
    const coupons = [
        { code: 'HAREKAT10', discountType: 'percent', discountValue: 10, isActive: true, usageLimit: 100, usageCount: 0, minimumOrderAmount: null, expiresAt: null },
        { code: 'WELCOME50', discountType: 'fixed', discountValue: 50000, isActive: true, usageLimit: 200, usageCount: 0, minimumOrderAmount: 200000, expiresAt: null },
    ];
    for (const c of coupons) {
        await Coupon.create(c);
    }
}

async function seedHeaderMenu() {
    const items = [
        { label: 'خانه', link: '/#hero', scrollId: 'hero', sortOrder: 1 },
        { label: 'دوره‌ها', link: '/#courses', scrollId: 'courses', sortOrder: 2 },
        { label: 'تولیدات', link: '/products', scrollId: null, sortOrder: 3 },
        { label: 'درباره ما', link: '/about-us', scrollId: null, sortOrder: 4 },
        { label: 'تماس با ما', link: '/contact-us', scrollId: null, sortOrder: 5 },
    ];
    for (const item of items) {
        await HeaderMenuItem.create(item);
    }
}

async function seedSiteContent() {
    const blocks = [
        { key: 'hero-title', title: 'اینجا فقط یاد نمی‌گیری', body: 'مدرسه هنر و مهارت حرکت اسکول', sortOrder: 1 },
        { key: 'hero-cta', title: 'بریم شروع کنیم!', linkUrl: '/#courses', linkText: 'مشاهده دوره‌ها', sortOrder: 2 },
        { key: 'contact-email', title: 'ایمیل', body: 'info@harekatschool.com', sortOrder: 10 },
        { key: 'contact-phone', title: 'تلفن', body: '۰۲۱-۱۲۳۴۵۶۷۸', sortOrder: 11 },
        { key: 'contact-address', title: 'آدرس', body: 'تهران، ایران', sortOrder: 12 },
        { key: 'social-instagram', title: 'اینستاگرام', linkUrl: 'https://instagram.com', linkText: 'اینستاگرام', sortOrder: 20 },
        { key: 'social-telegram', title: 'تلگرام', linkUrl: 'https://t.me', linkText: 'تلگرام', sortOrder: 21 },
        { key: 'social-linkedin', title: 'لینکدین', linkUrl: 'https://linkedin.com', linkText: 'لینکدین', sortOrder: 22 },
        { key: 'footer-copyright', title: 'کپی‌رایت', body: '© ۱۴۰۵ حرکت اسکول', sortOrder: 30 },
        { key: 'announcement', title: 'اطلاعیه', body: '', isActive: false, sortOrder: 0 },
    ];
    for (const b of blocks) {
        await SiteContent.create(b);
    }
}

async function seedSubscriptions() {
    const subscriptions = [
        { name: 'اشتراک ماهانه اتاق فکر خلاق', price: '99000', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', buttonLink: '/products', buttonText: 'مشاهده جزئیات', description: 'دسترسی ماهانه به جلسات آنلاین اتاق فکر با اساتید برجسته. شامل بازخورد پروژه و شبکه‌سازی حرفه‌ای.', sortOrder: 1 },
        { name: 'اشتراک سالانه پریمیوم', price: '990000', salePrice: '790000', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', buttonLink: '/products', buttonText: 'مشاهده جزئیات', description: 'دسترسی کامل به تمام دوره‌ها، ورکشاپ‌ها و محتوای اختصاصی برای یک سال کامل.', sortOrder: 2 },
        { name: 'اشتراک دانشجویی', price: '49000', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400', buttonLink: '/products', buttonText: 'مشاهده جزئیات', description: 'اشتراک ویژه برای دانشجویان با تخفیف ۵۰٪، شامل دسترسی به دوره‌های مقدماتی.', sortOrder: 3 },
    ];
    for (const s of subscriptions) {
        await Subscriptions.create(s);
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        await sequelize.sync({ force: true });
        console.log('Database recreated.');

        console.log('Clearing existing data...');
        await clearData();

        console.log('Seeding Admins...');
        await seedAdmins();

        console.log('Seeding Users...');
        await seedUsers();

        console.log('Seeding Teachers...');
        const teachers = await seedTeachers();

        console.log('Seeding Categories...');
        const categories = await seedCategories();

        console.log('Seeding Courses...');
        const courses = await seedCourses(teachers);

        console.log('Seeding CourseCategories...');
        await seedCourseCategories(courses, categories);

        console.log('Seeding UserCourses...');
        await seedUserCourses();

        console.log('Seeding Payments...');
        await seedPayments();

        console.log('Seeding Coupons...');
        await seedCoupons();

        console.log('Seeding HeaderMenu...');
        await seedHeaderMenu();

        console.log('Seeding SiteContent...');
        await seedSiteContent();

        console.log('Seeding Subscriptions...');
        await seedSubscriptions();

        console.log('Demo data seeded successfully!');
    } catch (err) {
        console.error('Error seeding demo data:', err);
    } finally {
        await sequelize.close();
    }
}

main();
