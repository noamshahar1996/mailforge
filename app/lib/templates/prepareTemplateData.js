/**
 * prepareTemplateData.js — Layer 2: Input Normalization
 *
 * This function sits between raw data (scraper + user inputs + AI copy)
 * and the template renderer. It ensures the template always receives
 * clean, predictable, validated data.
 *
 * RULES:
 * - No guessing. If data is missing, pass null or empty array.
 * - No image scraping or filtering here. That belongs in scraper.js.
 * - No fallbacks that generate fake content.
 * - Template decides what to render based on what is present.
 */

export function prepareTemplateData(brandData, copy, productImages) {
  return {
    // ── Brand identity ──────────────────────────────────────────────────────
    brandName:    sanitizeText(brandData.brandName) || '',
    tagline:      sanitizeText(brandData.tagline)   || null,
    logoUrl:      sanitizeUrl(brandData.logoUrl)    || null,

    // ── Colors ──────────────────────────────────────────────────────────────
    primaryColor: sanitizeHex(brandData.primaryColor) || '#111111',
    accentColor:  sanitizeHex(brandData.accentColor)  || '#f5c842',

    // ── Navigation ──────────────────────────────────────────────────────────
    // Only pass nav links that are real, short, and useful.
    // Template will skip the nav bar entirely if this is empty.
    navLinks: sanitizeNavLinks(brandData.navItems),

    // ── Hero image ──────────────────────────────────────────────────────────
    // User-uploaded image takes priority.
    // If neither exists: null → template skips hero image entirely.
    // No gradient fallbacks. No fake placeholders.
    heroImageUrl: sanitizeUrl(brandData.uploadedHeroImage) || null,

    // ── Product images ──────────────────────────────────────────────────────
    // Only user-selected images passed from page.js via selectedImages.
    // Max 3. If empty: pillar sections render text-only.
    productImages: sanitizeProductImages(productImages),

    // ── Trust signals ────────────────────────────────────────────────────────
    // Only signals that were actually found on the website. Never invented.
    trustSignals: sanitizeTrustSignals(brandData.trustSignals),

    // ── Copy ─────────────────────────────────────────────────────────────────
    // All copy fields are AI-generated strings. Sanitize to prevent
    // empty or broken content from reaching the template.
    copy: sanitizeCopy(copy),
  }
}

// ── Sanitizers ────────────────────────────────────────────────────────────────

function sanitizeText(val) {
  if (!val || typeof val !== 'string') return null
  return val.trim().slice(0, 500) || null
}

function sanitizeUrl(val) {
  if (!val || typeof val !== 'string') return null
  const trimmed = val.trim()
  if (!trimmed.startsWith('http')) return null
  return trimmed
}

function sanitizeHex(val) {
  if (!val || typeof val !== 'string') return null
  const match = val.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  return match ? val.trim() : null
}

function sanitizeNavLinks(navItems) {
  if (!Array.isArray(navItems)) return []
  return navItems
    .map(n => (typeof n === 'string' ? n.trim() : ''))
    .filter(n =>
      n.length > 1 &&
      n.length < 28 &&
      !n.toLowerCase().includes('menu') &&
      !n.toLowerCase().includes('close') &&
      !n.toLowerCase().includes('search') &&
      !n.toLowerCase().includes('cart') &&
      !n.toLowerCase().includes('account')
    )
    .slice(0, 3)
}

function sanitizeProductImages(productImages) {
  if (!Array.isArray(productImages)) return []
  return productImages
    .filter(img => img && sanitizeUrl(img.src))
    .map(img => ({
      src:  sanitizeUrl(img.src),
      name: sanitizeText(img.alt || img.name) || 'Product',
    }))
    .slice(0, 3)
}

function sanitizeTrustSignals(signals) {
  if (!signals || typeof signals !== 'object') return {}
  const clean = {}
  const fields = ['freeShipping', 'returns', 'reviews', 'rating', 'quality']
  for (const f of fields) {
    const val = sanitizeText(signals[f])
    if (val) clean[f] = val
  }
  return clean
}

function sanitizeCopy(copy) {
  if (!copy || typeof copy !== 'object') return getEmptyCopy()
  return {
    subject_line:    sanitizeText(copy.subject_line)   || '',
    preview_text:    sanitizeText(copy.preview_text)   || '',
    hero_headline:   sanitizeText(copy.hero_headline)  || '',
    hero_subline:    sanitizeText(copy.hero_subline)   || null,
    story_label:     sanitizeText(copy.story_label)    || null,
    story_headline:  sanitizeText(copy.story_headline) || null,
    story_p1:        sanitizeText(copy.story_p1)       || null,
    story_p2:        sanitizeText(copy.story_p2)       || null,
    story_p3:        sanitizeText(copy.story_p3)       || null,
    pillars_heading: sanitizeText(copy.pillars_heading)|| null,
    pillars:         sanitizePillars(copy.pillars),
    cta_button:      sanitizeText(copy.cta_button)     || 'Shop Now',
    cta_headline:    sanitizeText(copy.cta_headline)   || null,
    urgency_line:    sanitizeText(copy.urgency_line)   || null,
  }
}

function sanitizePillars(pillars) {
  if (!Array.isArray(pillars)) return []
  return pillars
    .filter(p => p && (p.title || p.body))
    .map(p => ({
      title: sanitizeText(p.title) || '',
      body:  sanitizeText(p.body)  || '',
    }))
    .slice(0, 4)
}

function getEmptyCopy() {
  return {
    subject_line: '', preview_text: '', hero_headline: '',
    hero_subline: null, story_label: null, story_headline: null,
    story_p1: null, story_p2: null, story_p3: null,
    pillars_heading: null, pillars: [], cta_button: 'Shop Now',
    cta_headline: null, urgency_line: null,
  }
}
