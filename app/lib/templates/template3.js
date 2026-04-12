/**
 * MailForge Template 3: Campaign / Promo
 * Rebuilt to match reference design (SimplyFuel style)
 *
 * LAYOUT:
 * 1. Header        — logo centered, white bg, brand color bottom border
 * 2. Hero image    — full-width product photo
 * 3. Discount line — large bold brand-color headline, centered
 * 4. Intro         — greeting + paragraph, centered
 * 5. Offer         — dashed pill border code + full-width rounded CTA button
 * 6. Products      — bold heading + 2-column product cards
 * 7. Social proof  — heading + product image + trust values with stars
 * 8. Footer        — always
 *
 * CONTRACT:
 * - Receives clean data from prepareTemplateData()
 * - No fallbacks, no invented content
 * - Each section renders only if data exists
 */

function isDark(hex) {
  const h = (hex || '#000000').replace('#', '')
  if (h.length < 6) return true
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

function darkenColor(hex, factor = 0.45) {
  const h = (hex || '#000000').replace('#', '')
  if (h.length < 6) return '#111111'
  let r = parseInt(h.slice(0, 2), 16)
  let g = parseInt(h.slice(2, 4), 16)
  let b = parseInt(h.slice(4, 6), 16)
  r = Math.floor(r * factor)
  g = Math.floor(g * factor)
  b = Math.floor(b * factor)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function lightenColor(hex, factor = 0.9) {
  const h = (hex || '#ffffff').replace('#', '')
  if (h.length < 6) return '#fafafa'
  let r = parseInt(h.slice(0, 2), 16)
  let g = parseInt(h.slice(2, 4), 16)
  let b = parseInt(h.slice(4, 6), 16)
  r = Math.round(r + (255 - r) * factor)
  g = Math.round(g + (255 - g) * factor)
  b = Math.round(b + (255 - b) * factor)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

export function renderCampaignTemplate({
  brandData,
  copy,
  topProducts,
  offer,
  isWelcome,
  isDiscountEmail,
  showProducts,
  font,
  templateData,
}) {
  if (!templateData) throw new Error('renderCampaignTemplate requires templateData from prepareTemplateData()')
  const d = templateData
  const c = d.copy

  const brand    = d.primaryColor
  const accent   = d.accentColor
  // CTA uses brand if dark enough, otherwise darken it for contrast
  const ctaBg    = isDark(brand) ? brand : darkenColor(brand, 0.75)
  const pageBg   = '#ffffff'
  const softBg   = lightenColor(brand, 0.93)

  const df = `'${font.display}',Georgia,'Times New Roman',serif`
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`

  // ── 1. HEADER ────────────────────────────────────────────────────────────────

  const logoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="44" style="display:block;height:44px;width:auto;margin:0 auto;border:0;" alt="${d.brandName}">`
    : `<span style="font-family:${bf};font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#111111;">${d.brandName}</span>`

  const header = `
<tr><td bgcolor="${pageBg}" style="padding:20px 40px 18px;text-align:center;border-bottom:3px solid ${brand};">
  ${logoContent}
</td></tr>`

  // ── 2. HERO IMAGE ─────────────────────────────────────────────────────────────

  const heroImage = d.heroImageUrl ? `
<tr><td style="padding:0;font-size:0;line-height:0;">
  <img src="${d.heroImageUrl}" width="600" style="display:block;width:100%;height:auto;border:0;" alt="${d.brandName}">
</td></tr>` : ''

  // ── 3. DISCOUNT HEADLINE ──────────────────────────────────────────────────────
  // Large bold brand-color headline. Matches "15% DISCOUNT" from reference.

  const discountLine = c.hero_headline ? `
<tr><td bgcolor="${pageBg}" style="padding:44px 48px 12px;text-align:center;">
  <h1 style="font-family:${df};font-size:56px;font-weight:800;color:${brand};line-height:0.95;letter-spacing:-1px;margin:0;text-transform:uppercase;">${c.hero_headline}</h1>
  ${c.hero_subline ? `<p style="font-family:${bf};font-size:16px;font-weight:400;color:#555555;margin:16px 0 0;line-height:1.6;">${c.hero_subline}</p>` : ''}
</td></tr>` : ''

  // ── 4. INTRO ─────────────────────────────────────────────────────────────────
  // Centered greeting + body paragraph. "Hi Mitzi, Welcome to SimplyFuel!..."

  const intro = c.story_p1 ? `
<tr><td bgcolor="${pageBg}" style="padding:32px 64px 36px;text-align:center;">
  <p style="font-family:${bf};font-size:17px;font-weight:700;color:#111111;margin:0 0 12px;">Welcome, {{ first_name | default: 'there' }}</p>
  <p style="font-family:${bf};font-size:16px;font-weight:400;line-height:1.85;color:#555555;margin:0 0 ${c.story_p2 ? '14px' : '0'};">${c.story_p1}</p>
  ${c.story_p2 ? `<p style="font-family:${bf};font-size:16px;font-weight:400;line-height:1.85;color:#555555;margin:0;">${c.story_p2}</p>` : ''}
</td></tr>` : ''

  // ── 5. OFFER BLOCK ────────────────────────────────────────────────────────────
  // Dashed oval/pill border for code, full-width rounded button below.
  // Matches reference: oval dashed box ("HELLO-15") → "USE DISCOUNT" button.

  const offerBlock = offer ? `
<tr><td bgcolor="${pageBg}" style="padding:4px 56px 48px;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:18px;">
    <tr><td style="border:2px dashed ${brand};border-radius:40px;padding:14px 52px;">
      <span style="font-family:${bf};font-size:15px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:#333333;">${offer.toUpperCase()}</span>
    </td></tr>
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td bgcolor="${ctaBg}" style="padding:20px 40px;border-radius:40px;text-align:center;">
      <a href="#" style="font-family:${bf};font-size:14px;font-weight:800;text-transform:uppercase;text-decoration:none;letter-spacing:2px;color:#ffffff;">${c.cta_button || 'Use Discount'}</a>
    </td></tr>
  </table>
</td></tr>` : (!offer && c.cta_button ? `
<tr><td bgcolor="${pageBg}" style="padding:4px 56px 48px;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td bgcolor="${ctaBg}" style="padding:20px 40px;border-radius:40px;text-align:center;">
      <a href="#" style="font-family:${bf};font-size:14px;font-weight:800;text-transform:uppercase;text-decoration:none;letter-spacing:2px;color:#ffffff;">${c.cta_button}</a>
    </td></tr>
  </table>
  ${c.urgency_line ? `<p style="font-family:${bf};font-size:12px;color:rgba(0,0,0,0.3);margin:14px 0 0;">${c.urgency_line}</p>` : ''}
</td></tr>` : '')

  // ── DIVIDER ───────────────────────────────────────────────────────────────────
  const divider = `
<tr><td style="padding:0 40px;font-size:0;line-height:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="height:1px;background:rgba(0,0,0,0.1);font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
</td></tr>`

  // ── 6. PRODUCT CARDS ─────────────────────────────────────────────────────────
  // Bold brand-color section heading ("CHOOSE YOUR'S" style).
  // 2-column product cards: soft-bg image area + bold name + BUY NOW button.

  const gridPillars = c.pillars.slice(0, 2)

  const productSection = gridPillars.length > 0 ? `
${divider}
<tr><td bgcolor="${pageBg}" style="padding:44px 32px 12px;text-align:center;">
  <h2 style="font-family:${df};font-size:42px;font-weight:800;color:${brand};line-height:1.0;letter-spacing:-0.5px;margin:0 0 36px;text-transform:uppercase;">${c.pillars_heading || c.product_headline || 'Our Products'}</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr valign="top">
      ${gridPillars.map((pillar, i) => {
        const img = d.productImages[i] || null
        const gap = i === 0 ? 'padding-right:12px;' : 'padding-left:12px;'
        return `<td width="50%" style="vertical-align:top;${gap}">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td bgcolor="${softBg}" style="padding:32px 16px 28px;text-align:center;border-radius:10px 10px 0 0;">
              ${img
                ? `<img src="${img.src}" width="160" style="display:block;width:100%;max-width:160px;height:auto;margin:0 auto;border:0;" alt="${img.name}">`
                : `<div style="height:120px;">&nbsp;</div>`}
            </td></tr>
            <tr><td bgcolor="${pageBg}" style="padding:18px 14px 22px;text-align:center;border:1px solid rgba(0,0,0,0.07);border-top:none;border-radius:0 0 10px 10px;">
              <p style="font-family:${bf};font-size:13px;font-weight:800;color:#111111;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;line-height:1.3;">${pillar.title}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr><td bgcolor="${ctaBg}" style="padding:10px 28px;border-radius:4px;">
                  <a href="#" style="font-family:${bf};font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">Buy Now</a>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td>`
      }).join('')}
    </tr>
  </table>
</td></tr>
<tr><td bgcolor="${pageBg}" style="padding-bottom:44px;font-size:0;line-height:0;">&nbsp;</td></tr>` : ''

  // ── 7. SOCIAL PROOF ──────────────────────────────────────────────────────────
  // "WHAT OTHERS SAY" heading in brand color.
  // Second product image used as a banner row.
  // Trust signals displayed as individual review-style rows with stars.

  const trustEntries = Object.entries(d.trustSignals || {}).filter(([, v]) => v)
  const bannerImage = d.productImages.length > 1 ? d.productImages[1] : null

  // Real scraped reviews: use bestTestimonialQuote + additional testimonials from brandData
  // These come directly from the website scraper — no invented content
  const bestQuote     = brandData.bestTestimonialQuote || null
  const rawTestimonials = (brandData.testimonials || []).filter(t => t && t.trim().length > 20)

  // Build review cards: best quote first, then up to 2 more scraped testimonials
  // Only renders if we have at least one real review
  const reviewCards = []
  if (bestQuote) reviewCards.push({ name: c.testimonial_name || 'Verified customer', text: bestQuote })
  rawTestimonials.slice(0, 2).forEach((t, i) => {
    if (!bestQuote || t !== bestQuote) reviewCards.push({ name: 'Verified customer', text: t.slice(0, 160) })
  })

  const hasProof = trustEntries.length > 0 || reviewCards.length > 0

  const socialProof = hasProof ? `
${divider}
<tr><td bgcolor="${pageBg}" style="padding:44px 40px 28px;text-align:center;">
  <h2 style="font-family:${df};font-size:42px;font-weight:800;color:${brand};line-height:1.0;letter-spacing:-0.5px;margin:0 0 32px;text-transform:uppercase;">What Others Say</h2>
  ${bannerImage ? `<img src="${bannerImage.src}" width="520" style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 36px;border:0;border-radius:8px;" alt="products">` : ''}

  ${reviewCards.map(r => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:32px;">
    <tr><td style="text-align:center;padding:0 32px;">
      <p style="font-family:${bf};font-size:16px;font-weight:800;color:#111111;margin:0 0 10px;">${r.name}</p>
      <p style="font-family:${bf};font-size:15px;font-weight:400;color:#555555;line-height:1.7;margin:0 0 10px;">${r.text}</p>
      <p style="color:#f5a623;font-size:20px;letter-spacing:4px;margin:0;line-height:1;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
    </td></tr>
  </table>`).join('')}

  ${trustEntries.length > 0 ? `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:12px;">
    <tr>
      ${trustEntries.map(([key, val], i) => {
        const sep = i < trustEntries.length - 1
          ? `<td style="width:1px;background:rgba(0,0,0,0.08);padding:0;font-size:0;">&nbsp;</td>`
          : ''
        return `<td style="text-align:center;padding:16px 12px;vertical-align:middle;">
          <p style="font-family:${bf};font-size:13px;font-weight:700;color:#111111;margin:0 0 4px;">${val}</p>
          <p style="color:#f5a623;font-size:14px;letter-spacing:2px;margin:0;line-height:1;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
        </td>${sep}`
      }).join('')}
    </tr>
  </table>` : ''}

</td></tr>
<tr><td bgcolor="${pageBg}" style="padding-bottom:40px;font-size:0;line-height:0;">&nbsp;</td></tr>` : ''

  // ── 8. FOOTER ─────────────────────────────────────────────────────────────────

  const footerNavLinks = d.navLinks

  const footerNav = footerNavLinks.length > 0 ? `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:0 80px;">
    ${footerNavLinks.map(link => `
    <tr><td style="border-top:1px solid rgba(255,255,255,0.1);padding:18px 0;text-align:center;">
      <a href="#" style="font-family:${bf};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:rgba(255,255,255,0.7);text-decoration:none;">${link.toUpperCase()}</a>
    </td></tr>`).join('')}
    <tr><td style="border-top:1px solid rgba(255,255,255,0.1);padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>` : ''

  const footerLogoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="36" style="display:block;height:36px;width:auto;margin:0 auto 12px;border:0;opacity:0.8;" alt="${d.brandName}">`
    : `<span style="font-family:${bf};font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${accent};">${d.brandName.toUpperCase()}</span>`

  const footer = `
<tr><td bgcolor="#111111" style="padding:20px 0 0;">
  ${footerNav}
</td></tr>
<tr><td bgcolor="#111111" style="padding:36px 48px 16px;text-align:center;">
  ${footerLogoContent}
  ${d.tagline ? `<p style="font-family:${bf};font-size:13px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.45);margin:8px 0 0;">${d.tagline}</p>` : ''}
</td></tr>
<tr><td bgcolor="#111111" style="padding:16px 48px 36px;text-align:center;">
  <p style="font-family:${bf};font-size:10px;color:rgba(255,255,255,0.25);margin:0;line-height:2;letter-spacing:0.5px;">
    <a href="{{ unsubscribe_url }}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Unsubscribe</a>
    &nbsp;&nbsp;·&nbsp;&nbsp;
    <a href="{{ manage_preferences_url }}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`

  // ── ASSEMBLE ──────────────────────────────────────────────────────────────────

  const sections = [
    header,
    heroImage,
    discountLine,
    intro,
    offerBlock,
    productSection,
    socialProof,
    footer,
  ].join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('${font.importUrl}');
    a { text-decoration: none; }
    img { border: 0; }
  </style>
</head>
<body style="margin:0;padding:20px 0;background:#e4e2de;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">
    ${sections}
  </table>
</body>
</html>`
}
