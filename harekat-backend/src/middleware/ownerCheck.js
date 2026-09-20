export function ownerOnly(req, res, next) {
    if (req.user?.id === req.params.id) {
        return next();
    }
    return res.status(403).json({ ok: false, message: 'forbidden' });
}

export function ownerOrAdmin(req, res, next) {
    if (req.user?.role === 'admin' || req.user?.role === 'superadmin' || req.user?.id === req.params.id) {
        return next();
    }
    return res.status(403).json({ ok: false, message: 'forbidden' });
}

export function adminOnly(req, res, next) {
    if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
        return next();
    }
    return res.status(403).json({ ok: false, message: 'admin access required' });
}
