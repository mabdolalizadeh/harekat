import { Subscriptions, SubscriptionCourses, Courses } from '../models/index.js';
import { AccessService } from '../services/accessService.js';
import { sanitizeSvg } from '../utils/sanitizeSvg.js';
import { logSecurityEvent } from '../utils/logger.js';

function validatePricing(price, salePrice) {
    if (price !== undefined && price !== null && price !== '') {
        const p = Number(String(price).replace(/[,٬]/g, ''));
        if (!Number.isFinite(p) || p < 0) return 'price must be a non-negative number';
    }
    if (salePrice !== undefined && salePrice !== null && salePrice !== '') {
        const s = Number(String(salePrice).replace(/[,٬]/g, ''));
        if (!Number.isFinite(s) || s < 0) return 'salePrice must be a non-negative number';
        if (price !== undefined && price !== null && price !== '') {
            const p = Number(String(price).replace(/[,٬]/g, ''));
            if (Number.isFinite(p) && s > p) return 'salePrice must not exceed price';
        }
    }
    return null;
}

function normalizePrice(v) {
    if (v === undefined) return undefined;
    if (v === null || v === '') return null;
    return String(v);
}

export default class SubscriptionsController {
    static async createSubscription(req, res) {
        const {
            name,
            price,
            salePrice,
            description,
            isActive,
            sortOrder,
            image,
            buttonLink,
            buttonText,
            durationMonths,
            durationDays,
            badgeLabel,
            badgeIconSvg,
            includedCourseIds
        } = req.body;

        if (!name || !price) {
            return res.status(400).json({ ok: false, message: 'name and price are required' });
        }
        const pricingError = validatePricing(price, salePrice);
        if (pricingError) return res.status(400).json({ ok: false, message: pricingError });

        try {
            const sanitizedSvg = badgeIconSvg ? sanitizeSvg(badgeIconSvg) : null;
            const dMonths = Number(durationMonths) || 1;
            const dDays = Number(durationDays) || (dMonths * 30);

            const subscription = await Subscriptions.create({
                name: name.trim(),
                price: String(price),
                salePrice: normalizePrice(salePrice),
                description: description ?? null,
                isActive: isActive ?? true,
                sortOrder: sortOrder ?? 0,
                image: image ?? null,
                buttonLink: buttonLink ?? null,
                buttonText: buttonText ?? null,
                durationMonths: dMonths,
                durationDays: dDays,
                badgeLabel: badgeLabel?.trim() || name.trim(),
                badgeIconSvg: sanitizedSvg
            });

            if (Array.isArray(includedCourseIds) && includedCourseIds.length > 0) {
                for (const cId of includedCourseIds) {
                    await SubscriptionCourses.create({ subscriptionId: subscription.id, courseId: cId });
                }
            }

            const created = await Subscriptions.findByPk(subscription.id, {
                include: [{ model: Courses, as: 'includedCourses', through: { attributes: [] } }]
            });

            logSecurityEvent('subscription_created', { subscriptionId: subscription.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getSubscriptions(req, res) {
        try {
            const subscriptions = await Subscriptions.findAll({
                include: [
                    {
                        model: Courses,
                        as: 'includedCourses',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'duration', 'image', 'level']
                    }
                ],
                order: [['sortOrder', 'ASC']]
            });
            return res.status(200).json({ ok: true, data: subscriptions });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getSubscriptionById(req, res) {
        const { id } = req.params;
        try {
            const subscription = await Subscriptions.findByPk(id, {
                include: [{ model: Courses, as: 'includedCourses', through: { attributes: [] } }]
            });
            if (!subscription) {
                return res.status(404).json({ ok: false, message: 'subscription not found' });
            }
            return res.status(200).json({ ok: true, data: subscription });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updateSubscription(req, res) {
        const { id } = req.params;
        const {
            name,
            price,
            salePrice,
            description,
            isActive,
            sortOrder,
            image,
            buttonLink,
            buttonText,
            durationMonths,
            durationDays,
            badgeLabel,
            badgeIconSvg,
            includedCourseIds
        } = req.body;

        try {
            const subscription = await Subscriptions.findByPk(id);
            if (!subscription) {
                return res.status(404).json({ ok: false, message: 'subscription not found' });
            }

            const effectivePrice = price !== undefined ? price : subscription.price;
            const effectiveSale = salePrice !== undefined ? salePrice : subscription.salePrice;
            const pricingError = validatePricing(effectivePrice, effectiveSale);
            if (pricingError) return res.status(400).json({ ok: false, message: pricingError });

            if (name !== undefined) subscription.name = name.trim();
            if (price !== undefined) subscription.price = String(price);
            if (salePrice !== undefined) subscription.salePrice = normalizePrice(salePrice);
            if (description !== undefined) subscription.description = description;
            if (isActive !== undefined) subscription.isActive = isActive;
            if (sortOrder !== undefined) subscription.sortOrder = sortOrder;
            if (image !== undefined) subscription.image = image;
            if (buttonLink !== undefined) subscription.buttonLink = buttonLink;
            if (buttonText !== undefined) subscription.buttonText = buttonText;

            if (durationMonths !== undefined) subscription.durationMonths = Number(durationMonths) || 1;
            if (durationDays !== undefined) {
                subscription.durationDays = Number(durationDays) || (subscription.durationMonths * 30);
            }
            if (badgeLabel !== undefined) subscription.badgeLabel = badgeLabel?.trim() || null;
            if (badgeIconSvg !== undefined) subscription.badgeIconSvg = badgeIconSvg ? sanitizeSvg(badgeIconSvg) : null;

            await subscription.save();

            if (Array.isArray(includedCourseIds)) {
                await SubscriptionCourses.destroy({ where: { subscriptionId: id } });
                for (const cId of includedCourseIds) {
                    await SubscriptionCourses.create({ subscriptionId: id, courseId: cId });
                }
            }

            const updated = await Subscriptions.findByPk(id, {
                include: [{ model: Courses, as: 'includedCourses', through: { attributes: [] } }]
            });

            logSecurityEvent('subscription_updated', { subscriptionId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async deleteSubscription(req, res) {
        const { id } = req.params;
        try {
            const subscription = await Subscriptions.findByPk(id);
            if (!subscription) {
                return res.status(404).json({ ok: false, message: 'subscription not found' });
            }

            await SubscriptionCourses.destroy({ where: { subscriptionId: id } });
            await subscription.destroy();

            logSecurityEvent('subscription_deleted', { subscriptionId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'subscription deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Get my active subscription and dynamic badge metadata
     */
    static async getMySubscription(req, res) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const activeSub = await AccessService.getUserActiveSubscription(userId);
            return res.status(200).json({ ok: true, data: activeSub });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}