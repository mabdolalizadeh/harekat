import { Coupon } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';
import { Op } from 'sequelize';

function validateCouponInput({ code, discountType, discountValue, usageLimit, minimumOrderAmount, expiresAt }) {
    if (discountType !== undefined && !['percent', 'fixed'].includes(discountType)) {
        return 'discountType must be percent or fixed';
    }
    if (discountValue !== undefined) {
        const v = Number(discountValue);
        if (!Number.isFinite(v) || v <= 0) return 'discountValue must be a positive number';
        if ((discountType === 'percent') && (v <= 0 || v > 100)) return 'percent discountValue must be between 1 and 100';
    }
    if (usageLimit !== undefined && usageLimit !== null && (!Number.isInteger(Number(usageLimit)) || Number(usageLimit) < 1)) {
        return 'usageLimit must be a positive integer';
    }
    if (minimumOrderAmount !== undefined && minimumOrderAmount !== null && (Number.isNaN(Number(minimumOrderAmount)) || Number(minimumOrderAmount) < 0)) {
        return 'minimumOrderAmount must be a non-negative number';
    }
    if (expiresAt !== undefined && expiresAt !== null && Number.isNaN(Date.parse(expiresAt))) {
        return 'expiresAt must be a valid date';
    }
    if (code !== undefined && (typeof code !== 'string' || !code.trim())) {
        return 'code must be a non-empty string';
    }
    return null;
}

export function computeDiscount(coupon, orderAmount) {
    const amount = Number(orderAmount);
    const value = Number(coupon.discountValue);
    let discount = 0;
    if (coupon.discountType === 'percent') {
        discount = Math.round((amount * value) / 100);
    } else {
        discount = Math.round(value);
    }
    discount = Math.min(discount, amount);
    return { discount, finalAmount: amount - discount };
}

function checkUsable(coupon, orderAmount) {
    if (!coupon || !coupon.isActive) return 'coupon is inactive';
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 'coupon has expired';
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && Number(coupon.usageCount) >= Number(coupon.usageLimit)) {
        return 'coupon usage limit exceeded';
    }
    if (coupon.minimumOrderAmount !== null && coupon.minimumOrderAmount !== undefined && orderAmount !== undefined) {
        if (Number(orderAmount) < Number(coupon.minimumOrderAmount)) return 'order amount below coupon minimum';
    }
    return null;
}

export default class CouponsController {
    static async createCoupon(req, res) {
        const { code, discountType = 'percent', discountValue, isActive = true, expiresAt = null, usageLimit = null, minimumOrderAmount = null } = req.body;
        if (!code || discountValue === undefined) {
            return res.status(400).json({ ok: false, message: 'code and discountValue are required' });
        }
        const err = validateCouponInput({ code, discountType, discountValue, usageLimit, minimumOrderAmount, expiresAt });
        if (err) return res.status(400).json({ ok: false, message: err });
        try {
            const existing = await Coupon.findOne({ where: { code: String(code).trim().toUpperCase() } });
            if (existing) return res.status(409).json({ ok: false, message: 'coupon code already exists' });
            const coupon = await Coupon.create({
                code: String(code).trim().toUpperCase(),
                discountType, discountValue,
                isActive: isActive ?? true,
                expiresAt: expiresAt || null,
                usageLimit: usageLimit ?? null,
                minimumOrderAmount: minimumOrderAmount ?? null
            });
            logSecurityEvent('coupon_created', { couponId: coupon.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: coupon });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async getCoupons(req, res) {
        try {
            const { active, page = 1, limit = 50, search = '' } = req.query;
            const where = {};
            if (active !== undefined) where.isActive = active === 'true';
            if (search) where.code = { [Op.like]: `%${search}%` };
            const offset = (Number(page) - 1) * Number(limit);
            const { rows, count } = await Coupon.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: Number(limit), offset });
            return res.status(200).json({ ok: true, data: rows, pagination: { total: count, page: Number(page), limit: Number(limit) } });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async getCouponById(req, res) {
        try {
            const coupon = await Coupon.findByPk(req.params.id);
            if (!coupon) return res.status(404).json({ ok: false, message: 'coupon not found' });
            return res.status(200).json({ ok: true, data: coupon });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async updateCoupon(req, res) {
        try {
            const coupon = await Coupon.findByPk(req.params.id);
            if (!coupon) return res.status(404).json({ ok: false, message: 'coupon not found' });
            const { code, discountType, discountValue, isActive, expiresAt, usageLimit, minimumOrderAmount } = req.body;
            const err = validateCouponInput({ code, discountType, discountValue, usageLimit, minimumOrderAmount, expiresAt });
            if (err) return res.status(400).json({ ok: false, message: err });
            if (code !== undefined) {
                const normalized = String(code).trim().toUpperCase();
                const dup = await Coupon.findOne({ where: { code: normalized } });
                if (dup && dup.id !== coupon.id) return res.status(409).json({ ok: false, message: 'coupon code already exists' });
                coupon.code = normalized;
            }
            const effectiveType = discountType ?? coupon.discountType;
            const effectiveValue = discountValue ?? coupon.discountValue;
            if (effectiveType === 'percent' && (Number(effectiveValue) <= 0 || Number(effectiveValue) > 100)) {
                return res.status(400).json({ ok: false, message: 'percent discountValue must be between 1 and 100' });
            }
            if (discountType !== undefined) coupon.discountType = discountType;
            if (discountValue !== undefined) coupon.discountValue = discountValue;
            if (isActive !== undefined) coupon.isActive = isActive;
            if (expiresAt !== undefined) coupon.expiresAt = expiresAt || null;
            if (usageLimit !== undefined) coupon.usageLimit = usageLimit ?? null;
            if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = minimumOrderAmount ?? null;
            await coupon.save();
            logSecurityEvent('coupon_updated', { couponId: coupon.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: coupon });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async deleteCoupon(req, res) {
        try {
            const coupon = await Coupon.findByPk(req.params.id);
            if (!coupon) return res.status(404).json({ ok: false, message: 'coupon not found' });
            await coupon.destroy();
            logSecurityEvent('coupon_deleted', { couponId: req.params.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'coupon deleted' });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    // Customer-facing: backend-trusted validation + discount calculation. Never trust frontend math.
    static async validateCoupon(req, res) {
        try {
            const { code, orderAmount } = req.body;
            if (!code) return res.status(400).json({ ok: false, message: 'code is required' });
            const coupon = await Coupon.findOne({ where: { code: String(code).trim().toUpperCase() } });
            if (!coupon) return res.status(404).json({ ok: false, message: 'coupon not found', data: { valid: false } });
            const problem = checkUsable(coupon, orderAmount);
            if (problem) return res.status(400).json({ ok: false, message: problem, data: { valid: false } });
            let discount = 0, finalAmount = orderAmount !== undefined ? Number(orderAmount) : null;
            if (orderAmount !== undefined) {
                const calc = computeDiscount(coupon, orderAmount);
                discount = calc.discount; finalAmount = calc.finalAmount;
            }
            return res.status(200).json({ ok: true, data: { valid: true, coupon, discount, finalAmount } });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    // Increment usage after a successful order (admin or authenticated user)
    static async redeemCoupon(req, res) {
        try {
            const { code, orderAmount } = req.body;
            if (!code) return res.status(400).json({ ok: false, message: 'code is required' });
            const coupon = await Coupon.findOne({ where: { code: String(code).trim().toUpperCase() } });
            if (!coupon) return res.status(404).json({ ok: false, message: 'coupon not found' });
            const problem = checkUsable(coupon, orderAmount);
            if (problem) return res.status(400).json({ ok: false, message: problem });
            coupon.usageCount = Number(coupon.usageCount) + 1;
            await coupon.save();
            let result = { valid: true, coupon };
            if (orderAmount !== undefined) Object.assign(result, computeDiscount(coupon, orderAmount));
            logSecurityEvent('coupon_redeemed', { couponId: coupon.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: result });
        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }
}
