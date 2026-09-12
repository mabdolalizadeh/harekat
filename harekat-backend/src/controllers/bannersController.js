import { Banners } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

function normalizeDuration(value) {
    const duration = Number(value);
    return Number.isFinite(duration) && duration >= 1 ? Math.round(duration) : null;
}

export default class BannersController {
    static async list(req, res) {
        try {
            const where = req.adminView ? {} : { isActive: true };
            const banners = await Banners.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] });
            return res.json({ ok: true, data: banners });
        } catch (error) { return res.status(500).json({ ok: false, message: error.message }); }
    }

    static async create(req, res) {
        const { imageUrl, tabletImageUrl = null, mobileImageUrl = null, linkUrl = null, duration = 3, sortOrder = 0, isActive = true } = req.body;
        const normalizedDuration = normalizeDuration(duration);
        if (!imageUrl || !normalizedDuration) return res.status(400).json({ ok: false, message: 'imageUrl and a duration of at least 1 second are required' });
        try {
            const banner = await Banners.create({ imageUrl, tabletImageUrl: tabletImageUrl || null, mobileImageUrl: mobileImageUrl || null, linkUrl: linkUrl || null, duration: normalizedDuration, sortOrder: Number(sortOrder) || 0, isActive });
            logSecurityEvent('banner_created', { bannerId: banner.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: banner });
        } catch (error) { return res.status(500).json({ ok: false, message: error.message }); }
    }

    static async update(req, res) {
        try {
            const banner = await Banners.findByPk(req.params.id);
            if (!banner) return res.status(404).json({ ok: false, message: 'banner not found' });
            const { imageUrl, tabletImageUrl, mobileImageUrl, linkUrl, duration, sortOrder, isActive } = req.body;
            if (imageUrl !== undefined) banner.imageUrl = imageUrl;
            if (tabletImageUrl !== undefined) banner.tabletImageUrl = tabletImageUrl || null;
            if (mobileImageUrl !== undefined) banner.mobileImageUrl = mobileImageUrl || null;
            if (linkUrl !== undefined) banner.linkUrl = linkUrl || null;
            if (duration !== undefined) {
                const normalizedDuration = normalizeDuration(duration);
                if (!normalizedDuration) return res.status(400).json({ ok: false, message: 'duration must be at least 1 second' });
                banner.duration = normalizedDuration;
            }
            if (sortOrder !== undefined) banner.sortOrder = Number(sortOrder) || 0;
            if (isActive !== undefined) banner.isActive = Boolean(isActive);
            await banner.save();
            logSecurityEvent('banner_updated', { bannerId: banner.id, requesterId: req.user?.id, ip: req.ip });
            return res.json({ ok: true, data: banner });
        } catch (error) { return res.status(500).json({ ok: false, message: error.message }); }
    }

    static async remove(req, res) {
        try {
            const banner = await Banners.findByPk(req.params.id);
            if (!banner) return res.status(404).json({ ok: false, message: 'banner not found' });
            await banner.destroy();
            logSecurityEvent('banner_deleted', { bannerId: req.params.id, requesterId: req.user?.id, ip: req.ip });
            return res.json({ ok: true, message: 'banner deleted' });
        } catch (error) { return res.status(500).json({ ok: false, message: error.message }); }
    }
}
