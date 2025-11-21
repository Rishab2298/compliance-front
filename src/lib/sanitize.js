import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The unsanitized HTML string
 * @param {Object} config - Optional DOMPurify configuration
 * @returns {string} - Sanitized HTML string safe for rendering
 */
export const sanitizeHTML = (dirty, config = {}) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Default configuration for HTML content
  const defaultConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    // Prevent javascript: and data: URLs
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  // Merge default config with custom config
  const finalConfig = { ...defaultConfig, ...config };

  return DOMPurify.sanitize(dirty, finalConfig);
};

/**
 * Sanitize CSS content for style tags
 * @param {string} css - The unsanitized CSS string
 * @returns {string} - Sanitized CSS string
 */
export const sanitizeCSS = (css) => {
  if (!css || typeof css !== 'string') {
    return '';
  }

  // Remove any potential XSS vectors in CSS
  // Remove javascript: urls, expression(), behavior, -moz-binding
  let sanitized = css
    .replace(/javascript:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/-moz-binding\s*:/gi, '')
    .replace(/import\s+/gi, '')
    .replace(/@import/gi, '');

  return sanitized;
};

/**
 * Create a sanitized object for dangerouslySetInnerHTML
 * @param {string} html - The HTML string to sanitize
 * @param {Object} config - Optional DOMPurify configuration
 * @returns {Object} - Object with __html property containing sanitized HTML
 */
export const createSafeMarkup = (html, config = {}) => {
  return {
    __html: sanitizeHTML(html, config)
  };
};
