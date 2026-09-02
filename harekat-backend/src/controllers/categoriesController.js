import { Categories, Courses } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class CategoriesController {
    static async createCategory(req, res) {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ ok: false, message: 'name is required' });
        }

        try {
            const category = await Categories.create({ name });
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
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ ok: false, message: 'name is required' });
        }

        try {
            const category = await Categories.findByPk(id);
            if (!category) {
                return res.status(404).json({ ok: false, message: 'category not found' });
            }
            category.name = name;
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
            await category.destroy();
            logSecurityEvent('category_deleted', { categoryId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'category deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
