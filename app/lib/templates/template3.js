/**
 * MailForge Template 3: Campaign / Promo
 * Layer 4: Template renderer
 *
 * CONTRACT:
 * - Receives clean, validated data from prepareTemplateData()
 * - No fallbacks, no invented data, deterministic rendering
 * - Each section renders only if its data exists
 *
 * SECTIONS:
 * 1. Hero          — image-first with headline overlay (if heroImageUrl exists)
 *                    or headline-only block (if no image)
 * 2. Intro         — greeting + story_p1
 * 3. Offer block   — discount code + CTA (only if offer exists)
 * 4. Products      — first 2 pillars in a 2-column grid (only if pillars exist)
 * 5. Social proof  — trustSignals (only if real data exists)
 * 6. Footer        — always
 */

// ── Color utilities ────────────────────────────────────────────────────────────

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

function hexToRgb(hex) {
  const h = (hex || '#000000').replace('#', '')
  if (h.length < 6) return '0,0,0'
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ].join(',')
}

// ── Main renderer ──────────────────────────────────────────────────────────────

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

  const accent     = d.accentColor
  const primary    = d.primaryColor
  const accentText = isDark(accent)  ? '#ffffff' : '#111111'
  const headerBg   = isDark(primary) ? primary   : '#111111'
  const darkAccent = darkenColor(accent, 0.45)

  const df = `'${font.display}',Georgia,'Times New Roman',serif`
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`

  // ── 1. HERO ───────────────────────────────────────────────────────────────────
  // If hero image exists: full-bleed image with dark gradient overlay + headline on top.
  // If no image: strong accent-colored headline block.

  // Hero: image stacked above text — no absolute positioning (email-safe)
  const hero = d.heroImageUrl ? `
<tr><td style="padding:0;font-size:0;line-height:0;">
  <img src="${d.heroImageUrl}" width="600" style="display:block;width:100%;height:auto;border:0;" alt="${d.brandName}">
</td></tr>
<tr><td bgcolor="${headerBg}" style="padding:48px 52px 52px;text-align:left;">
  ${c.hero_headline ? `<h1 style="font-family:${df};font-size:50px;font-weight:800;color:#ffffff;line-height:0.95;letter-spacing:-2px;margin:0 0 ${c.hero_subline ? '18px' : '0'};">${c.hero_headline}</h1>` : ''}
  ${c.hero_subline ? `<p style="font-family:${bf};font-size:17px;font-weight:400;color:rgba(255,255,255,0.7);margin:0;line-height:1.6;">${c.hero_subline}</p>` : ''}
</td></tr>` : `
<tr><td bgcolor="${headerBg}" style="padding:72px 52px;text-align:left;">
  ${c.hero_headline ? `<h1 style="font-family:${df};font-size:50px;font-weight:800;color:#ffffff;line-height:0.95;letter-spacing:-2px;margin:0 0 ${c.hero_subline ? '18px' : '0'};">${c.hero_headline}</h1>` : ''}
  ${c.hero_subline ? `<p style="font-family:${bf};font-size:17px;font-weight:400;color:rgba(255,255,255,0.7);margin:0;line-height:1.6;">${c.hero_subline}</p>` : ''}
</td></tr>`

  // ── 2. INTRO ──────────────────────────────────────────────────────────────────
  // Greeting line + story paragraph. Renders only if story_p1 exists.

  const intro = c.story_p1 ? `
<tr><td bgcolor="#ffffff" style="padding:56px 56px 52px;">
  <p style="font-family:${bf};font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${darkAccent};margin:0 0 24px;">Welcome, {{ first_name | default: 'there' }}</p>
  <p style="font-family:${bf};font-size:18px;font-weight:400;line-height:1.9;color:#2a2a2a;margin:0 0 ${c.story_p2 ? '20px' : '0'};">${c.story_p1}</p>
  ${c.story_p2 ? `<p style="font-family:${bf};font-size:18px;font-weight:400;line-height:1.9;color:#2a2a2a;margin:0;">${c.story_p2}</p>` : ''}
</td></tr>
<tr><td bgcolor="rgba(0,0,0,0.06)" style="height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>` : ''

  // ── 3. OFFER BLOCK ────────────────────────────────────────────────────────────
  // Full-width accent-colored band with discount code + CTA.
  // Renders only if offer exists.

  const offerBlock = offer ? `
<tr><td bgcolor="${accent}" style="padding:56px 56px 52px;text-align:center;">
  <p style="font-family:${bf};font-size:9px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${isDark(accent) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)'};margin:0 0 18px;">Your exclusive code</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:32px;">
    <tr><td style="border:1px solid ${isDark(accent) ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)'};padding:20px 60px;">
      <span style="font-family:${bf};font-size:26px;font-weight:800;letter-spacing:10px;text-transform:uppercase;color:${accentText};">${offer.toUpperCase()}</span>
    </td></tr>
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td bgcolor="${headerBg}" style="padding:20px 72px;border-radius:3px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
      <a href="#" style="font-family:${bf};font-size:12px;font-weight:700;text-transform:uppercase;text-decoration:none;letter-spacing:3px;color:#ffffff;">${c.cta_button || 'SHOP NOW'}</a>
    </td></tr>
  </table>
  <p style="font-family:${bf};font-size:10px;color:${isDark(accent) ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.28)'};margin:20px 0 0;letter-spacing:2px;text-transform:uppercase;">Apply at checkout &nbsp;·&nbsp; Expires in 48 hours</p>
</td></tr>` : ''

  // If no offer but CTA is needed (non-welcome emails)
  const ctaOnly = !offer && c.cta_button ? `
<tr><td bgcolor="#f5f5f3" style="padding:44px 56px;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td bgcolor="${headerBg}" style="padding:20px 72px;border-radius:3px;">
      <a href="#" style="font-family:${bf};font-size:11px;font-weight:700;text-transform:uppercase;text-decoration:none;letter-spacing:3px;color:#ffffff;">${c.cta_button}</a>
    </td></tr>
  </table>
  ${c.urgency_line ? `<p style="font-family:${bf};font-size:11px;color:rgba(0,0,0,0.3);margin:16px 0 0;letter-spacing:0.5px;">${c.urgency_line}</p>` : ''}
</td></tr>` : ''

  // ── 4. PRODUCT GRID ───────────────────────────────────────────────────────────
  // 2-column grid using the first 2 pillars + their matching product images.
  // Renders only if at least 1 pillar exists.

  const gridPillars = c.pillars.slice(0, 2)

  const productGrid = gridPillars.length > 0 ? `
<tr><td bgcolor="rgba(0,0,0,0.04)" style="height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td bgcolor="#f7f7f5" style="padding:56px 32px 20px;text-align:center;">
  <p style="font-family:${bf};font-size:9px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${darkAccent};margin:0 0 10px;">${c.product_label || 'Selected for you'}</p>
  <h2 style="font-family:${df};font-size:32px;font-weight:800;color:#111111;margin:0 0 40px;line-height:1.1;letter-spacing:-0.5px;">${c.product_headline || c.pillars_heading || ''}</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      ${gridPillars.map((pillar, i) => {
        const img = d.productImages[i] || null
        const isLast = i === gridPillars.length - 1
        return `<td width="${Math.floor(100 / gridPillars.length)}%" style="vertical-align:top;padding:0 ${isLast ? '0' : '10px'} 0 ${i === 0 ? '0' : '10px'};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid rgba(0,0,0,0.08);border-radius:10px;overflow:hidden;">
            ${img ? `<tr><td bgcolor="#efefed" style="padding:28px;text-align:center;">
              <img src="${img.src}" width="200" style="display:block;width:100%;max-width:200px;height:auto;margin:0 auto;border:0;" alt="${img.name}">
            </td></tr>` : ''}
            <tr><td bgcolor="#ffffff" style="padding:20px 18px 24px;text-align:left;">
              <p style="font-family:${df};font-size:17px;font-weight:800;color:#111111;margin:0 0 8px;line-height:1.2;">${pillar.title}</p>
              <p style="font-family:${bf};font-size:13px;font-weight:400;color:#666666;line-height:1.65;margin:0 0 18px;">${pillar.body.slice(0, 80)}${pillar.body.length > 80 ? '...' : ''}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr><td bgcolor="${headerBg}" style="padding:12px 28px;border-radius:3px;">
                  <a href="#" style="font-family:${bf};font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#ffffff;text-decoration:none;">Shop Now</a>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td>`
      }).join('')}
    </tr>
  </table>
</td></tr>
<tr><td bgcolor="#f7f7f5" style="padding:0 32px 56px;font-size:0;line-height:0;">&nbsp;</td></tr>` : ''

  // ── 5. SOCIAL PROOF ───────────────────────────────────────────────────────────
  // Horizontal trust signal strip. Renders only if real scraped data exists.

  const trustEntries = Object.entries(d.trustSignals || {}).filter(([, v]) => v)

  const socialProof = trustEntries.length > 0 ? `
<tr><td bgcolor="#111111" style="padding:44px 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      ${trustEntries.map(([key, val], i) => {
        const sep = i < trustEntries.length - 1
          ? `<td style="width:1px;background:rgba(255,255,255,0.12);padding:0;font-size:0;">&nbsp;</td>`
          : ''
        const labels = {
          freeShipping: 'Free Shipping',
          returns: 'Returns Policy',
          reviews: 'Customer Reviews',
          rating: 'Average Rating',
          quality: 'Quality Promise',
        }
        const label = labels[key] || key
        return `<td style="text-align:center;padding:0 16px;vertical-align:middle;">
          <p style="font-family:${bf};font-size:9px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0 0 6px;">${label}</p>
          <p style="font-family:${bf};font-size:14px;font-weight:700;color:#ffffff;margin:0;letter-spacing:0.3px;">${val}</p>
        </td>${sep}`
      }).join('')}
    </tr>
  </table>
</td></tr>` : ''

  // ── 6. FOOTER ─────────────────────────────────────────────────────────────────

  const footerNavLinks = d.navLinks

  const footerNav = footerNavLinks.length > 0 ? `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:0 80px;">
    ${footerNavLinks.map(link => `
    <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:18px 0;text-align:center;">
      <a href="#" style="font-family:${bf};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:rgba(255,255,255,0.6);text-decoration:none;">${link.toUpperCase()}</a>
    </td></tr>`).join('')}
    <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>` : ''

  const footerLogoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="36" style="display:block;height:36px;width:auto;margin:0 auto 12px;border:0;opacity:0.75;" alt="${d.brandName}">`
    : `<span style="font-family:${bf};font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${accent};">${d.brandName.toUpperCase()}</span>`

  const footer = `
<tr><td bgcolor="#111111" style="padding:20px 0 0;">
  ${footerNav}
</td></tr>
<tr><td bgcolor="#111111" style="padding:36px 48px 16px;text-align:center;">
  ${footerLogoContent}
  ${d.tagline ? `<p style="font-family:${bf};font-size:13px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.4);margin:8px 0 0;">${d.tagline}</p>` : ''}
</td></tr>
<tr><td bgcolor="#111111" style="padding:16px 48px 36px;text-align:center;">
  <p style="font-family:${bf};font-size:10px;color:rgba(255,255,255,0.22);margin:0;line-height:2;letter-spacing:0.5px;">
    <a href="{{ unsubscribe_url }}" style="color:rgba(255,255,255,0.32);text-decoration:underline;">Unsubscribe</a>
    &nbsp;&nbsp;·&nbsp;&nbsp;
    <a href="{{ manage_preferences_url }}" style="color:rgba(255,255,255,0.32);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`

  // ── ASSEMBLE ──────────────────────────────────────────────────────────────────

  const sections = [
    hero,
    intro,
    offer ? offerBlock : ctaOnly,
    productGrid,
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
<body style="margin:0;padding:20px 0;background:#dcdad6;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">
    ${sections}
  </table>
</body>
</html>`
}
