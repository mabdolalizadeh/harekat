// Pricing + formatting helpers (Persian storefront).

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFaDigits(value) {
    return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function parsePrice(value) {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(String(value).replace(/[,٬\s]/g, ''));
    return Number.isFinite(n) ? n : null;
}

export function formatToman(value) {
    const n = parsePrice(value);
    if (n === null) return '';
    return `${toFaDigits(n.toLocaleString('en-US').replace(/,/g, '٬'))} تومان`;
}

export function getEffectivePrice(course) {
    const price = parsePrice(course?.price);
    const sale = parsePrice(course?.salePrice);
    if (price === null) return { price: null, sale: null, hasDiscount: false, percent: 0 };
    const hasDiscount = sale !== null && sale < price;
    const percent = hasDiscount ? Math.round(((price - sale) / price) * 100) : 0;
    return { price, sale: hasDiscount ? sale : null, hasDiscount, percent };
}
