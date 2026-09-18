/**
 * Safe SVG Sanitizer for dynamic subscription badge icons and user uploads.
 * Strips scripts, event handlers, and dangerous tags to prevent XSS.
 */
export function sanitizeSvg(rawSvg) {
  if (!rawSvg || typeof rawSvg !== 'string') return '';

  let cleaned = rawSvg.trim();

  // Must look like an SVG element
  if (!/<svg[\s\S]*>[\s\S]*<\/svg>/i.test(cleaned)) {
    return '';
  }

  // Strip out script tags and content
  cleaned = cleaned.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  // Strip out dangerous elements
  cleaned = cleaned.replace(/<(foreignObject|iframe|object|embed|applet|meta|link)[\s\S]*?>[\s\S]*?<\/\1>/gi, '');
  cleaned = cleaned.replace(/<(foreignObject|iframe|object|embed|applet|meta|link)[\s\S]*?\/>/gi, '');

  // Strip out event handlers
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, '');
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '');

  // Strip out javascript: and vbscript: URIs
  cleaned = cleaned.replace(/href\s*=\s*(['"])\s*(javascript|vbscript|data):.*?\1/gi, '');
  cleaned = cleaned.replace(/xlink:href\s*=\s*(['"])\s*(javascript|vbscript|data):.*?\1/gi, '');

  if (!/<svg[\s\S]*>[\s\S]*<\/svg>/i.test(cleaned)) {
    return '';
  }

  return cleaned;
}

export default sanitizeSvg;
