/**
 * MailForge Template: Editorial Pillar
 * Based on Sawinery agency-level design.
 * Suitable for: education, social_proof, how_to_use, browse_desire, build_trust, checkout_trust
 * Injects: brand colors, fonts, logo, copy, products, trust signals
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

// Builds trust badge row from real scraped data only — no fake badges
function buildTrustBadges(trustSignals, accentColor, bf) {
  if (!trustSignals) return ''
  const badges = []
  if (trustSignals.freeShipping) badges.push({ icon: '&#128666;', label: trustSignals.freeShipping })
  if (trustSignals.returns)      badges.push({ icon: '&#9989;',  label: trustSignals.returns })
  if (trustSignals.reviews)      badges.push({ icon: '&#11088;', label: trustSignals.reviews })
  if (trustSignals.rating)       badges.push({ icon: '&#9733;',  label: trustSignals.rating })
  if (trustSignals.quality)      badges.push({ icon: '&#10003;', label: trustSignals.quality })
  if (badges.length === 0) return ''

  const textColor = isDark(accentColor) ? '#ffffff' : darkenColor(accentColor, 0.3)
  const cells = badges.map((b, i) => {
    const sep = i < badges.length - 1
      ? `<td style="width:1px;background:rgba(0,0,0,0.12);margin:0;padding:0 0;font-size:0;line-height:0;">&nbsp;</td>`
      : ''
    return `<td style="text-align:center;padding:16px 20px;vertical-align:middle;">
      <div style="font-size:26px;line-height:1;margin-bottom:6px;">${b.icon}</div>
      <div style="font-family:${bf};font-size:13px;font-weight:400;line-height:1.35;color:${textColor};">${b.label}</div>
    </td>${sep}`
  }).join('')

  return `
<tr><td bgcolor="${accentColor}" style="padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>${cells}</tr>
  </table>
</td></tr>`
}

// Builds the 4-pillars content section using story copy and product images
function buildPillars(copy, topProducts, primaryColor, accentColor, bf, df) {
  const pillarsRaw = copy.pillars || []
  const darkBrown = isDark(primaryColor) ? primaryColor : darkenColor(primaryColor, 0.55)
  const pillarsHtml = copy.pillars_heading
    ? `<tr><td bgcolor="#FAE6B1" style="padding:48px 40px 12px;text-align:center;">
        <h2 style="font-family:${df};font-size:38px;font-weight:700;text-transform:uppercase;color:#000000;margin:0;line-height:1.0;">${copy.pillars_heading}</h2>
      </td></tr>`
    : ''

  if (!pillarsRaw || pillarsRaw.length === 0) return pillarsHtml

  const rows = pillarsRaw.map((pillar, i) => {
    const isLeft = i % 2 === 0
    const product = topProducts[i] || null
    const imgCell = product
      ? `<img src="${product.src}" width="240" style="display:block;width:240px;height:180px;object-fit:cover;border-radius:16px;border:0;" alt="${product.name}">`
      : `<div style="width:240px;height:180px;border-radius:16px;background:linear-gradient(135deg,${darkBrown},${accentColor});display:flex;align-items:center;justify-content:center;"></div>`

    const numCircle = `<div style="width:72px;height:72px;border-radius:50%;background:${darkBrown};display:inline-flex;align-items:center;justify-content:center;font-family:${df};font-size:26px;font-weight:700;color:#ffffff;margin-bottom:12px;">${i + 1}</div>`

    if (isLeft) {
      return `
<tr><td bgcolor="#FAE6B1" style="padding:28px 24px 12px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="260" style="vertical-align:top;padding-top:44px;padding-right:16px;">
        ${imgCell}
      </td>
      <td style="vertical-align:top;padding-top:8px;">
        <div style="text-align:center;">${numCircle}</div>
        <h3 style="font-family:${df};font-size:24px;font-weight:700;text-transform:uppercase;color:#000000;margin:0 0 12px;line-height:1.2;">${pillar.title}</h3>
        <p style="font-family:${bf};font-size:16px;font-weight:400;line-height:1.65;color:#111111;margin:0;">${pillar.body}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    } else {
      return `
<tr><td bgcolor="#FAE6B1" style="padding:28px 24px 12px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:top;padding-top:8px;padding-right:16px;">
        <div style="text-align:center;">${numCircle}</div>
        <h3 style="font-family:${df};font-size:24px;font-weight:700;text-transform:uppercase;color:#000000;margin:0 0 12px;line-height:1.2;">${pillar.title}</h3>
        <p style="font-family:${bf};font-size:16px;font-weight:400;line-height:1.65;color:#111111;margin:0;">${pillar.body}</p>
      </td>
      <td width="260" style="vertical-align:top;padding-top:44px;">
        ${imgCell}
      </td>
    </tr>
  </table>
</td></tr>`
    }
  }).join('')

  return pillarsHtml + rows
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
  const primary   = brandData.primaryColor   || '#1a1a1a'
  const accent    = brandData.accentColor    || '#c9a227'
  const bg        = brandData.backgroundColor || '#FAE6B1'
  const primaryText = isDark(primary) ? '#ffffff' : '#000000'
  const accentText  = isDark(accent)  ? '#ffffff' : '#000000'
  const lightBg   = lightenColor(accent, 0.85)
  const darkBrown = darkenColor(primary, 0.55)
  const trustSignals = brandData.trustSignals || {}

  const df = `'${font.display}',Georgia,'Times New Roman',serif`
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`

  const logoUrl  = brandData.logoUrl || null
  const navItems = (brandData.navItems || [])
    .filter(n => n.length > 1 && n.length < 24 && !n.toLowerCase().includes('menu'))
    .slice(0, 3)

  // ── HEADER ──────────────────────────────────────────────────────────────────
  const logoContent = logoUrl
    ? `<img src="${logoUrl}" height="64" style="display:block;height:64px;width:auto;margin:0 auto;border:0;" alt="${brandData.brandName}">`
    : `<span style="font-family:${df};font-size:26px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${primaryText};">${brandData.brandName.toUpperCase()}</span>`

  // Build 3-column nav using brand primary + accent colors
  const navColors = [
    { bg: primary,      color: primaryText },
    { bg: accent,       color: accentText  },
    { bg: darkBrown,    color: '#ffffff'   },
  ]
  const navCells = navItems.length > 0
    ? navItems.map((n, i) => {
        const c = navColors[i % navColors.length]
        const border = i > 0 ? `border-left:1px solid #ffffff;` : ''
        return `<td width="${Math.floor(600 / navItems.length)}" bgcolor="${c.bg}" style="${border}padding:16px 8px;text-align:center;">
          <span style="font-family:${bf};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:capitalize;color:${c.color};">${n}</span>
        </td>`
      }).join('')
    : `<td bgcolor="${primary}" style="padding:16px 8px;text-align:center;">
        <span style="font-family:${bf};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${primaryText};">${brandData.brandName}</span>
      </td>`

  const header = `
<tr><td bgcolor="${lightBg}" style="padding:36px 40px 28px;text-align:center;">${logoContent}</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${navCells}</tr></table>
</td></tr>`

  // ── HERO ─────────────────────────────────────────────────────────────────────
  const heroImageUrl = brandData.heroImageUrl || ''
  const heroImage = heroImageUrl
    ? `<img src="${heroImageUrl}" width="600" style="display:block;width:100%;height:auto;max-height:420px;object-fit:cover;border-radius:0 0 24px 24px;border:0;" alt="${brandData.brandName}">`
    : `<div style="width:100%;height:320px;background:linear-gradient(135deg,${primary} 0%,${accent} 100%);border-radius:0 0 24px 24px;"></div>`

  const headlineParts = (copy.hero_headline || '').split('—')
  const line1 = headlineParts[0] ? headlineParts[0].trim() : (copy.hero_headline || '')
  const line2 = headlineParts[1] ? headlineParts[1].trim() : ''

  const hero = `
<tr><td bgcolor="${lightBg}" style="padding:24px 24px 0;text-align:center;">
  <div style="font-family:${df};font-size:34px;font-weight:700;text-transform:uppercase;color:#000000;line-height:1.1;margin-bottom:${line2 ? '10px' : '20px'};">${line1}</div>
  ${line2 ? `<div style="display:inline-block;background:${accent};border-radius:8px;padding:4px 18px;margin-bottom:18px;">
    <span style="font-family:${df};font-size:34px;font-weight:700;text-transform:uppercase;color:${accentText};">${line2}</span>
  </div>` : ''}
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:0 24px 0;font-size:0;line-height:0;">
  ${heroImage}
</td></tr>`

  // ── BODY TEXT + MAIN CTA ───────────────────────────────────────────────────
  const bodySection = `
<tr><td bgcolor="${lightBg}" style="padding:40px 56px 32px;text-align:center;">
  <p style="font-family:${bf};font-size:19px;font-weight:400;line-height:1.65;color:#000000;margin:0 0 16px;">${copy.story_p1 || ''}</p>
  ${copy.story_p2 ? `<p style="font-family:${bf};font-size:19px;font-weight:400;line-height:1.65;color:#000000;margin:0 0 16px;">${copy.story_p2}</p>` : ''}
  ${copy.story_p3 ? `<p style="font-family:${bf};font-size:19px;font-weight:400;line-height:1.65;color:#000000;margin:0;">${copy.story_p3}</p>` : ''}
  <a href="#" style="display:inline-block;background:#000000;color:#ffffff;font-family:${bf};font-size:17px;font-weight:400;text-transform:uppercase;text-decoration:none;letter-spacing:1px;padding:16px 48px;border-radius:10px;margin-top:28px;">${copy.cta_button || 'LEARN MORE'}</a>
</td></tr>`

  // ── DISCOUNT CODE (welcome emails only) ────────────────────────────────────
  const discountSection = isWelcome && offer ? `
<tr><td bgcolor="${lightBg}" style="padding:0 56px 32px;text-align:center;">
  <p style="font-family:${bf};font-size:11px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:#000000;opacity:0.4;margin:0 0 14px;">Your exclusive welcome gift</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td style="border:2px dashed rgba(0,0,0,0.25);border-radius:8px;padding:14px 48px;">
      <span style="font-family:${df};font-size:28px;font-weight:700;letter-spacing:10px;text-transform:uppercase;color:#000000;">${offer.toUpperCase()}</span>
    </td></tr>
  </table>
  <p style="font-family:${bf};font-size:12px;color:#000000;opacity:0.4;margin:10px 0 0;letter-spacing:1px;">Apply at checkout · Expires in 48 hours</p>
</td></tr>` : ''

  // ── PILLARS SECTION ────────────────────────────────────────────────────────
  const pillarsSection = buildPillars(copy, topProducts, primary, accent, bf, df)

  // ── DIVIDER + SUMMARY ──────────────────────────────────────────────────────
  const dividerSection = copy.cta_headline ? `
<tr><td bgcolor="${lightBg}" style="padding:28px 64px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="height:2px;background:${darkBrown};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:24px 56px 8px;text-align:center;">
  <p style="font-family:${bf};font-size:19px;font-weight:400;line-height:1.6;color:#000000;margin:0 0 24px;">${copy.cta_headline}</p>
  <a href="#" style="display:inline-block;background:#000000;color:#ffffff;font-family:${bf};font-size:17px;font-weight:400;text-transform:uppercase;text-decoration:none;letter-spacing:1px;padding:16px 48px;border-radius:10px;">${copy.cta_button || 'SHOP NOW'}</a>
  ${copy.urgency_line ? `<p style="font-family:${bf};font-size:13px;color:#000000;opacity:0.45;margin:14px 0 0;">${copy.urgency_line}</p>` : ''}
</td></tr>` : ''

  // ── TRUST BADGES ──────────────────────────────────────────────────────────
  const trustSection = buildTrustBadges(trustSignals, accent, bf)

  // ── DARK FOOTER ───────────────────────────────────────────────────────────
  const footerNavItems = navItems.length > 0 ? navItems : ['Best Sellers', 'New Arrivals', 'About Us']
  const footerNavRows = footerNavItems.map((n, i) => `
    <tr>
      <td style="border-top:1px solid rgba(255,255,255,0.15);padding:20px 0;text-align:center;">
        <a href="#" style="font-family:${df};font-size:22px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">${n.toUpperCase()}</a>
      </td>
    </tr>`).join('')

  const footerLogoContent = logoUrl
    ? `<img src="${logoUrl}" height="52" style="display:block;height:52px;width:auto;margin:0 auto 12px;border:0;opacity:0.7;" alt="${brandData.brandName}">`
    : `<span style="font-family:${df};font-size:18px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${accent};">${brandData.brandName.toUpperCase()}</span>`

  const footer = `
<tr><td bgcolor="${primary}" style="padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:0 100px;">
    ${footerNavRows}
    <tr><td style="border-top:1px solid rgba(255,255,255,0.15);padding:0;"></td></tr>
  </table>
</td></tr>
<tr><td bgcolor="${primary}" style="padding:32px 40px 16px;text-align:center;">
  ${footerLogoContent}
  ${brandData.tagline ? `<p style="font-family:${bf};font-size:18px;font-weight:400;line-height:1.4;color:rgba(255,255,255,0.8);margin:8px 0 0;">${brandData.tagline}</p>` : ''}
</td></tr>
<tr><td bgcolor="${primary}" style="padding:16px 40px 32px;text-align:center;">
  <p style="font-family:${bf};font-size:12px;color:rgba(255,255,255,0.4);margin:0;">
    <a href="{{ unsubscribe_url }}" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Unsubscribe</a>
    &nbsp;·&nbsp;
    <a href="{{ manage_preferences_url }}" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`

  // ── ASSEMBLE FULL EMAIL ────────────────────────────────────────────────────
  const sections = header
    + hero
    + discountSection
    + bodySection
    + pillarsSection
    + dividerSection
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
