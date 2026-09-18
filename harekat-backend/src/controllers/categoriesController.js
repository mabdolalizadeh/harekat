import { Categories, Courses, CourseCategories, TeacherCategories } from '../models/index.js';
import { sequelize } from '../models/database.config.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class CategoriesController {
    static async createCategory(req, res) {
        const { name, slug, isActive, sortOrder } = req.body;
        if (!name) {
            return res.status(400).json({ ok: false, message: 'name is required' });
        }

        try {
            const category = await Categories.create({ name, slug: slug ?? null, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 });
            logSecurityEvent('category_created', { categoryId: category.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: category });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getCategories(req, res) {
        try {
            const categories = await Categories.findAll({
                include: { model: Courses, as: 'courses', through: { attributes: [] } }
            });
            return res.status(200).json({ ok: true, data: categories });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getCategoryById(req, res) {
        const { id } = req.params;
        try {
            const category = await Categories.findByPk(id, {
                include: { model: Courses, as: 'courses', through: { attributes: [] } }
            });
            if (!category) {
                return res.status(404).json({ ok: false, message: 'category not found' });
            }
            return res.status(200).json({ ok: true, data: category });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updateCategory(req, res) {
        const { id } = req.params;
        const { name, slug, isActive, sortOrder } = req.body;
        if (!name) {
            return res.status(400).json({ ok: false, message: 'name is required' });
        }

        try {
            const category = await Categories.findByPk(id);
            if (!category) {
                return res.status(404).json({ ok: false, message: 'category not found' });
            }
            category.name = name;
            if (slug !== undefined) category.slug = slug;
            if (isActive !== undefined) category.isActive = isActive;
            if (sortOrder !== undefined) category.sortOrder = sortOrder;
            await category.save();
            logSecurityEvent('category_updated', { categoryId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: category });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async deleteCategory(req, res) {
        const { id } = req.params;
        try {
            const category = await Categories.findByPk(id);
            if (!category) {
                return res.status(404).json({ ok: false, message: 'category not found' });
            }
            await sequelize.transaction(async (t) => {
                await CourseCategories.destroy({ where: { categoryId: id }, transaction: t });
                await TeacherCategories.destroy({ where: { categoryId: id }, transaction: t });
                await category.destroy({ transaction: t });
            });
            logSecurityEvent('category_deleted', { categoryId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'category deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
