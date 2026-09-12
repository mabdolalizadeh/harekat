import { HeaderMenuItem, SiteContent } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class CmsController {
    // ---- Header menu ----
    static async getMenu(req, res) {
        try {
            const where = req.adminView ? {} : { isActive: true };
            const items = await HeaderMenuItem.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] });
            return res.status(200).json({ ok: true, data: items });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async createMenuItem(req, res) {
        const { label, link, scrollId = null, sortOrder = 0, isActive = true } = req.body;
        if (!label || !link) return res.status(400).json({ ok: false, message: 'label and link are required' });
        try {
            const item = await HeaderMenuItem.create({ label, link, scrollId, sortOrder, isActive });
            logSecurityEvent('menu_created', { menuId: item.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: item });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async updateMenuItem(req, res) {
        try {
            const item = await HeaderMenuItem.findByPk(req.params.id);
            if (!item) return res.status(404).json({ ok: false, message: 'menu item not found' });
            const { label, link, scrollId, sortOrder, isActive } = req.body;
            if (label !== undefined) item.label = label;
            if (link !== undefined) item.link = link;
            if (scrollId !== undefined) item.scrollId = scrollId;
            if (sortOrder !== undefined) item.sortOrder = sortOrder;
            if (isActive !== undefined) item.isActive = isActive;
            await item.save();
            logSecurityEvent('menu_updated', { menuId: item.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: item });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async deleteMenuItem(req, res) {
        try {
            const item = await HeaderMenuItem.findByPk(req.params.id);
            if (!item) return res.status(404).json({ ok: false, message: 'menu item not found' });
            await item.destroy();
            logSecurityEvent('menu_deleted', { menuId: req.params.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'menu item deleted' });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    // ---- Site content blocks ----
    static async getContent(req, res) {
        try {
            const where = req.adminView ? {} : { isActive: true };
            if (req.query.key) where.key = req.query.key;
            const blocks = await SiteContent.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] });
            return res.status(200).json({ ok: true, data: blocks });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async getContentByKey(req, res) {
        try {
            const block = await SiteContent.findOne({ where: { key: req.params.key } });
            if (!block || (!block.isActive && !req.adminView)) {
                return res.status(404).json({ ok: false, message: 'content not found' });
            }
            return res.status(200).json({ ok: true, data: block });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async upsertContent(req, res) {
        const { key, title = null, body = null, imageUrl = null, linkUrl = null, linkText = null, sortOrder = 0, isActive = true } = req.body;
        if (!key) return res.status(400).json({ ok: false, message: 'key is required' });
        try {
            const [block] = await SiteContent.findOrCreate({ where: { key }, defaults: { key, title, body, imageUrl, linkUrl, linkText, sortOrder, isActive } });
            if (title !== undefined) block.title = title;
            if (body !== undefined) block.body = body;
            if (imageUrl !== undefined) block.imageUrl = imageUrl;
            if (linkUrl !== undefined) block.linkUrl = linkUrl;
            if (linkText !== undefined) block.linkText = linkText;
            if (sortOrder !== undefined) block.sortOrder = sortOrder;
            if (isActive !== undefined) block.isActive = isActive;
            await block.save();
            logSecurityEvent('content_upserted', { key, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: block });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async deleteContent(req, res) {
        try {
            const block = await SiteContent.findOne({ where: { key: req.params.key } });
            if (!block) return res.status(404).json({ ok: false, message: 'content not found' });
            await block.destroy();
            logSecurityEvent('content_deleted', { key: req.params.key, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'content deleted' });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }
}
