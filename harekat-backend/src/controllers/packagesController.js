import { Courses, PackageCourses } from '../models/index.js';
import { AccessService } from '../services/accessService.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class PackagesController {
    /**
     * Public/Customer: List packages (courses with kind = 'skill')
     */
    static async listPackages(req, res) {
        try {
            const packages = await Courses.findAll({
                where: { kind: 'skill', isActive: true },
                include: [
                    {
                        model: Courses,
                        as: 'packageIncludedCourses',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'image', 'duration', 'level', 'typeOfAttendence']
                    }
                ],
                order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: packages });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: List my active packages
     */
    static async getMyPackages(req, res) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const activeCourseIds = await AccessService.getUserActiveCourseIds(userId);
            const packages = await Courses.findAll({
                where: {
                    id: activeCourseIds,
                    kind: 'skill'
                },
                include: [
                    {
                        model: Courses,
                        as: 'packageIncludedCourses',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'image', 'duration', 'level', 'typeOfAttendence']
                    }
                ]
            });

            return res.status(200).json({ ok: true, data: packages });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: List all packages (active and inactive)
     */
    static async listPackagesAdmin(req, res) {
        try {
            const packages = await Courses.findAll({
                where: { kind: 'skill' },
                include: [
                    {
                        model: Courses,
                        as: 'packageIncludedCourses',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'image', 'duration', 'level']
                    }
                ],
                order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: packages });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Create a new package
     */
    static async createPackage(req, res) {
        const {
            name,
            price,
            salePrice,
            description,
            image,
            duration,
            typeOfAttendence,
            statusOfRegistration,
            isActive,
            sortOrder,
            includedCourseIds
        } = req.body;

        if (!name?.trim() || !price) {
            return res.status(400).json({ ok: false, message: 'نام و قیمت پکیج الزامی است' });
        }

        try {
            const pkg = await Courses.create({
                name: name.trim(),
                price: String(price),
                salePrice: salePrice ? String(salePrice) : null,
                description: description?.trim() || null,
                image: image || '/favicon.svg',
                level: '',
                duration: duration || '۴۰ ساعت',
                typeOfAttendence: typeOfAttendence || 'آنلاین',
                kind: 'skill',
                statusOfRegistration: statusOfRegistration || 'در حال ثبت نام',
                isActive: isActive !== false,
                sortOrder: Number(sortOrder) || 0
            });

            if (Array.isArray(includedCourseIds) && includedCourseIds.length > 0) {
                for (const cId of includedCourseIds) {
                    await PackageCourses.create({ packageId: pkg.id, courseId: cId });
                }
            }

            const created = await Courses.findByPk(pkg.id, {
                include: [{ model: Courses, as: 'packageIncludedCourses', through: { attributes: [] } }]
            });

            logSecurityEvent('package_created', { packageId: pkg.id });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Update package
     */
    static async updatePackage(req, res) {
        const { id } = req.params;
        const {
            name,
            price,
            salePrice,
            description,
            image,
            duration,
            typeOfAttendence,
            statusOfRegistration,
            isActive,
            sortOrder,
            includedCourseIds
        } = req.body;

        try {
            const pkg = await Courses.findByPk(id);
            if (!pkg || pkg.kind !== 'skill') {
                return res.status(404).json({ ok: false, message: 'پکیج یافت نشد' });
            }

            if (name !== undefined) pkg.name = name.trim();
            if (price !== undefined) pkg.price = String(price);
            if (salePrice !== undefined) pkg.salePrice = salePrice ? String(salePrice) : null;
            if (description !== undefined) pkg.description = description?.trim() || null;
            if (image !== undefined) pkg.image = image;
            if (duration !== undefined) pkg.duration = duration;
            if (typeOfAttendence !== undefined) pkg.typeOfAttendence = typeOfAttendence;
            if (statusOfRegistration !== undefined) pkg.statusOfRegistration = statusOfRegistration;
            if (isActive !== undefined) pkg.isActive = !!isActive;
            if (sortOrder !== undefined) pkg.sortOrder = Number(sortOrder) || 0;

            await pkg.save();

            if (Array.isArray(includedCourseIds)) {
                await PackageCourses.destroy({ where: { packageId: id } });
                for (const cId of includedCourseIds) {
                    await PackageCourses.create({ packageId: id, courseId: cId });
                }
            }

            const updated = await Courses.findByPk(id, {
                include: [{ model: Courses, as: 'packageIncludedCourses', through: { attributes: [] } }]
            });

            logSecurityEvent('package_updated', { packageId: id });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Delete package
     */
    static async deletePackage(req, res) {
        const { id } = req.params;
        try {
            const pkg = await Courses.findByPk(id);
            if (!pkg || pkg.kind !== 'skill') {
                return res.status(404).json({ ok: false, message: 'پکیج یافت نشد' });
            }

            await PackageCourses.destroy({ where: { packageId: id } });
            await pkg.destroy();

            logSecurityEvent('package_deleted', { packageId: id });
            return res.status(200).json({ ok: true, message: 'پکیج با موفقیت حذف شد' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
