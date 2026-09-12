import { Subscriptions } from '../models/index.js';
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
        const { name, price, salePrice, description, isActive, sortOrder, image, buttonLink, buttonText } = req.body;
        if (!name || !price) {
            return res.status(400).json({ ok: false, message: 'name and price are required' });
        }
        const pricingError = validatePricing(price, salePrice);
        if (pricingError) return res.status(400).json({ ok: false, message: pricingError });

        try {
            const subscription = await Subscriptions.create({
                name,
                price,
                salePrice: normalizePrice(salePrice),
                description: description ?? null,
                isActive: isActive ?? true,
                sortOrder: sortOrder ?? 0,
                image: image ?? null,
                buttonLink: buttonLink ?? null,
                buttonText: buttonText ?? null
            });

            logSecurityEvent('subscription_created', { subscriptionId: subscription.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: subscription });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getSubscriptions(req, res) {
        try {
            const subscriptions = await Subscriptions.findAll({ order: [['sortOrder', 'ASC']] });
            return res.status(200).json({ ok: true, data: subscriptions });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getSubscriptionById(req, res) {
        const { id } = req.params;
        try {
            const subscription = await Subscriptions.findByPk(id);
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
        const { name, price, salePrice, description, isActive, sortOrder, image, buttonLink, buttonText } = req.body;

        try {
            const subscription = await Subscriptions.findByPk(id);
            if (!subscription) {
                return res.status(404).json({ ok: false, message: 'subscription not found' });
            }

            const effectivePrice = price !== undefined ? price : subscription.price;
            const effectiveSale = salePrice !== undefined ? salePrice : subscription.salePrice;
            const pricingError = validatePricing(effectivePrice, effectiveSale);
            if (pricingError) return res.status(400).json({ ok: false, message: pricingError });

            if (name !== undefined) subscription.name = name;
            if (price !== undefined) subscription.price = price;
            if (salePrice !== undefined) subscription.salePrice = normalizePrice(salePrice);
            if (description !== undefined) subscription.description = description;
            if (isActive !== undefined) subscription.isActive = isActive;
            if (sortOrder !== undefined) subscription.sortOrder = sortOrder;
            if (image !== undefined) subscription.image = image;
            if (buttonLink !== undefined) subscription.buttonLink = buttonLink;
            if (buttonText !== undefined) subscription.buttonText = buttonText;

            await subscription.save();
            logSecurityEvent('subscription_updated', { subscriptionId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: subscription });
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
            await subscription.destroy();
            logSecurityEvent('subscription_deleted', { subscriptionId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'subscription deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}