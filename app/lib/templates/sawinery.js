/**
 * MailForge Template: Editorial Pillar (Sawinery)
 * Agency-level design based on Sawinery Figma template.
 *
 * HERO IMAGE NOTE:
 * This template works best with a real lifestyle/workshop photo as the hero.
 * The app should ask the user to upload a hero image before generating.
 * Pass it as brandData.uploadedHeroImage — this takes priority over scraped images.
 *
 * Suitable for: education, how_to_use, social_proof, build_trust,
 *               browse_desire, checkout_trust, sub_habit, sub_expectations,
 *               Win-back, Product launch
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

function lightenColor(hex, factor = 0.85) {
  const h = (hex || '#ffffff').replace('#', '')
  if (h.length < 6) return '#f5f5f5'
  let r = parseInt(h.slice(0, 2), 16)
  let g = parseInt(h.slice(2, 4), 16)
  let b = parseInt(h.slice(4, 6), 16)
  r = Math.round(r + (255 - r) * factor)
  g = Math.round(g + (255 - g) * factor)
  b = Math.round(b + (255 - b) * factor)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

// Picks the best available hero image.
// Priority: user-uploaded → scraped non-logo image → null (show gradient)
function resolveHeroImage(brandData) {
  // 1. User-uploaded hero takes top priority
  if (brandData.uploadedHeroImage) return brandData.uploadedHeroImage

  // 2. Try scraped hero image — skip if it looks like a logo or icon
  const skipKeywords = ['logo', 'icon', 'favicon', 'badge', 'sprite', 'pixel', 'placeholder']
  const heroUrl = brandData.heroImageUrl || ''
  if (heroUrl && !skipKeywords.some(k => heroUrl.toLowerCase().includes(k))) {
    return heroUrl
  }

  // 3. Try scraped product images — first one that doesn't look like a logo
  const scrapedImages = brandData.scrapedImages || []
  const candidate = scrapedImages.find(img => {
    const src = (img.src || '').toLowerCase()
    const alt = (img.alt || '').toLowerCase()
    return !skipKeywords.some(k => src.includes(k) || alt.includes(k))
  })
  if (candidate) return candidate.src

  // 4. No usable image found — caller will show gradient fallback
  return null
}

// Builds trust badge row from real scraped data only — no fake badges ever
function buildTrustBadges(trustSignals, accentColor, lightBg, bf) {
  if (!trustSignals) return ''

  const badges = []
  if (trustSignals.freeShipping) badges.push({ icon: '&#128666;', label: trustSignals.freeShipping })
  if (trustSignals.returns)      badges.push({ icon: '&#9989;',   label: trustSignals.returns })
  if (trustSignals.reviews)      badges.push({ icon: '&#11088;',  label: trustSignals.reviews })
  if (trustSignals.rating)       badges.push({ icon: '&#9733;',   label: trustSignals.rating })
  if (trustSignals.quality)      badges.push({ icon: '&#10003;',  label: trustSignals.quality })

  if (badges.length === 0) return ''

  const textColor = isDark(accentColor) ? '#ffffff' : darkenColor(accentColor, 0.35)
  const sepColor  = isDark(accentColor) ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'

  const cells = badges.map((b, i) => {
    const sep = i < badges.length - 1
      ? `<td style="width:1px;background:${sepColor};padding:0;font-size:0;line-height:0;">&nbsp;</td>`
      : ''
    return `
    <td style="text-align:center;padding:18px 20px;vertical-align:middle;">
      <div style="font-size:28px;line-height:1;margin-bottom:7px;">${b.icon}</div>
      <div style="font-family:${bf};font-size:13px;font-weight:400;line-height:1.4;color:${textColor};">${b.label}</div>
    </td>${sep}`
  }).join('')

  return `
<tr><td bgcolor="${accentColor}" style="padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>${cells}</tr>
  </table>
</td></tr>`
}

// Builds alternating left/right pillar rows using copy.pillars array
function buildPillars(copy, topProducts, primary, accent, lightBg, bf, df) {
  const darkAccent = darkenColor(primary, 0.55)
  const pillars = copy.pillars || []

  const headingRow = copy.pillars_heading ? `
<tr><td bgcolor="${lightBg}" style="padding:48px 40px 8px;text-align:center;">
  <h2 style="font-family:${df};font-size:36px;font-weight:700;text-transform:uppercase;color:#000000;margin:0;line-height:1.0;">${copy.pillars_heading}</h2>
</td></tr>` : ''

  if (pillars.length === 0) return headingRow

  const rows = pillars.map((pillar, i) => {
    const isLeft = i % 2 === 0
    const product = topProducts && topProducts[i] ? topProducts[i] : null

    const imgContent = product
      ? `<img src="${product.src}" width="240" style="display:block;width:240px;height:180px;object-fit:cover;border-radius:16px;border:0;" alt="${product.name}">`
      : `<div style="width:240px;height:180px;border-radius:16px;background:linear-gradient(135deg,${darkAccent} 0%,${accent} 100%);"></div>`

    const numCircle = `
<div style="width:72px;height:72px;border-radius:50%;background:${darkAccent};display:inline-flex;align-items:center;justify-content:center;font-family:${df};font-size:26px;font-weight:700;color:#ffffff;margin-bottom:12px;line-height:1;">${i + 1}</div>`

    if (isLeft) {
      return `
<tr><td bgcolor="${lightBg}" style="padding:24px 20px 8px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="256" style="vertical-align:top;padding-top:48px;padding-right:16px;">${imgContent}</td>
      <td style="vertical-align:top;padding-top:8px;text-align:center;">
        ${numCircle}
        <h3 style="font-family:${df};font-size:22px;font-weight:700;text-transform:uppercase;color:#000000;margin:0 0 12px;line-height:1.2;text-align:left;">${pillar.title || ''}</h3>
        <p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.7;color:#111111;margin:0;text-align:left;">${pillar.body || ''}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    } else {
      return `
<tr><td bgcolor="${lightBg}" style="padding:24px 20px 8px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:top;padding-top:8px;text-align:center;padding-right:16px;">
        ${numCircle}
        <h3 style="font-family:${df};font-size:22px;font-weight:700;text-transform:uppercase;color:#000000;margin:0 0 12px;line-height:1.2;text-align:left;">${pillar.title || ''}</h3>
        <p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.7;color:#111111;margin:0;text-align:left;">${pillar.body || ''}</p>
      </td>
      <td width="256" style="vertical-align:top;padding-top:48px;">${imgContent}</td>
    </tr>
  </table>
</td></tr>`
    }
  }).join('')

  return headingRow + rows
}

export function renderEditorialTemplate({
  brandData,
  copy,
  topProducts,
  offer,
  isWelcome,
  isDiscountEmail,
  showProducts,
  font,
}) {
  // ── Colors ──────────────────────────────────────────────────────────────────
  const primary      = brandData.primaryColor    || '#1a1a1a'
  const accent       = brandData.accentColor     || '#f5c842'
  const primaryText  = isDark(primary) ? '#ffffff' : '#000000'
  const accentText   = isDark(accent)  ? '#ffffff' : '#000000'
  const lightBg      = lightenColor(accent, 0.88)
  const darkAccent   = darkenColor(primary, 0.55)
  const trustSignals = brandData.trustSignals || {}

  // ── Fonts ────────────────────────────────────────────────────────────────────
  const df = `'${font.display}',Georgia,'Times New Roman',serif`
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`

  // ── Brand assets ─────────────────────────────────────────────────────────────
  const logoUrl   = brandData.logoUrl || null
  const heroImage = resolveHeroImage(brandData)

  // ── Nav items — scraped from site, filtered to useful links ──────────────────
  const navItems = (brandData.navItems || [])
    .filter(n => n.length > 1 && n.length < 28
      && !n.toLowerCase().includes('menu')
      && !n.toLowerCase().includes('close')
      && !n.toLowerCase().includes('search'))
    .slice(0, 3)

  // ── HEADER ───────────────────────────────────────────────────────────────────
  const logoContent = logoUrl
    ? `<img src="${logoUrl}" height="64" style="display:block;height:64px;width:auto;margin:0 auto;border:0;" alt="${brandData.brandName}">`
    : `<span style="font-family:${df};font-size:26px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${primary};">${brandData.brandName.toUpperCase()}</span>`

  // Three-column nav using brand colors — only shown when real nav links exist
  const navColors = [
    { bg: primary,    color: primaryText },
    { bg: accent,     color: accentText  },
    { bg: darkAccent, color: '#ffffff'   },
  ]

  const navCells = navItems.length > 0
    ? navItems.map((n, i) => {
        const c = navColors[i % navColors.length]
        const border = i > 0 ? `border-left:1px solid #ffffff;` : ''
        return `<td width="${Math.floor(600 / navItems.length)}" bgcolor="${c.bg}" style="${border}padding:17px 8px;text-align:center;">
          <span style="font-family:${bf};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:capitalize;color:${c.color};">${n}</span>
        </td>`
      }).join('')
    : null

  const navRow = navCells
    ? `<tr><td style="padding:0;font-size:0;line-height:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${navCells}</tr></table>
      </td></tr>`
    : ''

  const header = `
<tr><td bgcolor="${lightBg}" style="padding:36px 40px 28px;text-align:center;">${logoContent}</td></tr>
${navRow}`

  // ── HERO ─────────────────────────────────────────────────────────────────────
  // Split the headline at ' — ' so the second part gets the accent highlight pill
  const headlineParts = (copy.hero_headline || '').split(/\s*—\s*/)
  const line1 = headlineParts[0] ? headlineParts[0].trim() : (copy.hero_headline || '')
  const line2 = headlineParts[1] ? headlineParts[1].trim() : ''

  // Hero photo with fog gradient fade at bottom (matches original Figma design)
  // If no real photo is available, show a brand-colored gradient block instead
  const heroPhotoSection = heroImage
    ? `
<tr><td bgcolor="${lightBg}" style="padding:0 20px;font-size:0;line-height:0;">
  <div style="position:relative;width:560px;overflow:hidden;border-radius:0 0 24px 24px;">
    <img src="${heroImage}" width="560" style="display:block;width:560px;height:380px;object-fit:cover;border-radius:0 0 24px 24px;border:0;" alt="${brandData.brandName}">
    <!-- Fog fade: transparent at top, fades to lightBg at bottom — matches original design -->
    <div style="position:absolute;bottom:0;left:0;right:0;height:180px;background:linear-gradient(to bottom, rgba(${hexToRgb(lightBg)},0) 0%, ${lightBg} 100%);pointer-events:none;"></div>
  </div>
</td></tr>`
    : `
<tr><td bgcolor="${lightBg}" style="padding:0 20px;font-size:0;line-height:0;">
  <div style="width:560px;height:320px;border-radius:0 0 24px 24px;background:linear-gradient(135deg,${primary} 0%,${accent} 100%);"></div>
</td></tr>`

  const hero = `
<tr><td bgcolor="${lightBg}" style="padding:24px 24px 0;text-align:center;">
  <div style="font-family:${df};font-size:34px;font-weight:700;color:#000000;line-height:1.1;margin-bottom:${line2 ? '12px' : '20px'};">${line1}</div>
  ${line2 ? `<div style="display:inline-block;background:${accent};border-radius:10px;padding:6px 20px;margin-bottom:16px;">
    <span style="font-family:${df};font-size:34px;font-weight:700;color:${accentText};">${line2}</span>
  </div>` : ''}
</td></tr>
${heroPhotoSection}`

  // ── DISCOUNT CODE (welcome emails only) ───────────────────────────────────────
  const discountSection = isWelcome && offer ? `
<tr><td bgcolor="${lightBg}" style="padding:32px 56px 16px;text-align:center;">
  <p style="font-family:${bf};font-size:10px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:rgba(0,0,0,0.35);margin:0 0 14px;">Your exclusive welcome gift</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td style="border:2px dashed rgba(0,0,0,0.2);border-radius:10px;padding:14px 52px;">
      <span style="font-family:${df};font-size:28px;font-weight:700;letter-spacing:10px;text-transform:uppercase;color:#000000;">${offer.toUpperCase()}</span>
    </td></tr>
  </table>
  <p style="font-family:${bf};font-size:11px;font-weight:300;color:rgba(0,0,0,0.35);margin:10px 0 0;letter-spacing:1px;">Apply at checkout · Expires in 48 hours</p>
</td></tr>` : ''

  // ── BODY TEXT ─────────────────────────────────────────────────────────────────
  const bodySection = `
<tr><td bgcolor="${lightBg}" style="padding:36px 56px 28px;text-align:center;">
  ${copy.story_p1 ? `<p style="font-family:${bf};font-size:19px;font-weight:400;line-height:1.7;color:#000000;margin:0 0 18px;">${copy.story_p1}</p>` : ''}
  ${copy.story_p2 ? `<p style="font-family:${bf};font-size:19px;font-weight:400;line-height:1.7;color:#000000;margin:0 0 18px;">${copy.story_p2}</p>` : ''}
  ${copy.story_p3 ? `<p style="font-family:${bf};font-size:19px;font-weight:400;line-height:1.7;color:#000000;margin:0;">${copy.story_p3}</p>` : ''}
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:0 56px 36px;text-align:center;">
  <a href="#" style="display:inline-block;background:#000000;color:#ffffff;font-family:${bf};font-size:17px;font-weight:400;text-transform:uppercase;text-decoration:none;letter-spacing:1px;padding:16px 52px;border-radius:12px;">${copy.cta_button || 'LEARN MORE'}</a>
  ${copy.urgency_line ? `<p style="font-family:${bf};font-size:13px;color:rgba(0,0,0,0.4);margin:12px 0 0;">${copy.urgency_line}</p>` : ''}
</td></tr>`

  // ── PILLARS ───────────────────────────────────────────────────────────────────
  const pillarsSection = buildPillars(copy, topProducts, primary, accent, lightBg, bf, df)

  // ── DIVIDER + CLOSING CTA ────────────────────────────────────────────────────
  const closingCta = copy.cta_headline ? `
<tr><td bgcolor="${lightBg}" style="padding:28px 64px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="height:2px;background:${darkAccent};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:24px 56px 12px;text-align:center;">
  <p style="font-family:${bf};font-size:19px;font-weight:400;line-height:1.65;color:#000000;margin:0 0 24px;">${copy.cta_headline}</p>
  <a href="#" style="display:inline-block;background:#000000;color:#ffffff;font-family:${bf};font-size:17px;font-weight:400;text-transform:uppercase;text-decoration:none;letter-spacing:1px;padding:16px 52px;border-radius:12px;">${copy.cta_button || 'SHOP NOW'}</a>
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:0 0 8px;"></td></tr>` : ''

  // ── TRUST BADGES (real data only) ─────────────────────────────────────────────
  const trustSection = buildTrustBadges(trustSignals, accent, lightBg, bf)

  // ── DARK FOOTER ───────────────────────────────────────────────────────────────
  // Footer nav: use scraped nav items, fall back to generic links
  const footerNavItems = navItems.length > 0
    ? navItems
    : ['Best Sellers', 'New Arrivals', 'About Us']

  const footerNavRows = footerNavItems.map(n => `
<tr>
  <td style="border-top:1px solid rgba(255,255,255,0.15);padding:20px 0;text-align:center;">
    <a href="#" style="font-family:${df};font-size:22px;font-weight:700;text-transform:uppercase;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">${n.toUpperCase()}</a>
  </td>
</tr>`).join('')

  const footerLogoContent = logoUrl
    ? `<img src="${logoUrl}" height="52" style="display:block;height:52px;width:auto;margin:0 auto 14px;border:0;opacity:0.75;" alt="${brandData.brandName}">`
    : `<span style="font-family:${df};font-size:18px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${accent};">${brandData.brandName.toUpperCase()}</span>`

  const footer = `
<tr><td bgcolor="${primary}" style="padding:12px 0 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:0 100px;">
    ${footerNavRows}
    <tr><td style="border-top:1px solid rgba(255,255,255,0.12);padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
</td></tr>
<tr><td bgcolor="${primary}" style="padding:32px 40px 12px;text-align:center;">
  ${footerLogoContent}
  ${brandData.tagline ? `<p style="font-family:${bf};font-size:17px;font-weight:400;line-height:1.5;color:rgba(255,255,255,0.75);margin:0;">${brandData.tagline}</p>` : ''}
</td></tr>
<tr><td bgcolor="${primary}" style="padding:20px 40px 36px;text-align:center;">
  <p style="font-family:${bf};font-size:11px;color:rgba(255,255,255,0.3);margin:0;line-height:1.8;">
    <a href="{{ unsubscribe_url }}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Unsubscribe</a>
    &nbsp;·&nbsp;
    <a href="{{ manage_preferences_url }}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`

  // ── FULL ASSEMBLY ─────────────────────────────────────────────────────────────
  const sections = header
    + hero
    + discountSection
    + bodySection
    + pillarsSection
    + closingCta
    + trustSection
    + footer

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
<body style="margin:0;padding:20px 0;background:#d8d5d0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">
    ${sections}
  </table>
</body>
</html>`
}

// Helper: converts hex color to "r,g,b" string for rgba() usage in gradients
function hexToRgb(hex) {
  const h = (hex || '#ffffff').replace('#', '')
  if (h.length < 6) return '255,255,255'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r},${g},${b}`
}
