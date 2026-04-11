/**
 * MailForge Template: Editorial Pillar
 * Layer 4: Template renderer
 *
 * CONTRACT:
 * - Receives clean, validated data from prepareTemplateData()
 * - Never guesses, filters, or invents data
 * - If a field is null/empty → that section is not rendered
 * - Always produces the same output for the same input (deterministic)
 *
 * SECTIONS (each renders only if its data exists):
 * 1. Header — always rendered (brand name + optional logo)
 * 2. Nav bar — only if navLinks.length > 0
 * 3. Hero headline — always rendered
 * 4. Hero image — only if heroImageUrl is provided
 * 5. Discount code — only if offer exists and isWelcome
 * 6. Body copy — only if story_p1 exists
 * 7. Pillars — only if pillars array has items (text-only if no product image)
 * 8. Closing CTA band — only if cta_headline exists
 * 9. Trust badges — only if trustSignals has real data
 * 10. Footer — always rendered
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

function lightenColor(hex, factor = 0.88) {
  const h = (hex || '#ffffff').replace('#', '')
  if (h.length < 6) return '#f9f5e8'
  let r = parseInt(h.slice(0, 2), 16)
  let g = parseInt(h.slice(2, 4), 16)
  let b = parseInt(h.slice(4, 6), 16)
  r = Math.round(r + (255 - r) * factor)
  g = Math.round(g + (255 - g) * factor)
  b = Math.round(b + (255 - b) * factor)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function hexToRgb(hex) {
  const h = (hex || '#ffffff').replace('#', '')
  if (h.length < 6) return '255,255,255'
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ].join(',')
}

// ── Main renderer ──────────────────────────────────────────────────────────────

export function renderEditorialTemplate({
  brandData,   // raw brandData passed for font info
  copy,        // already sanitized by prepareTemplateData
  topProducts, // already sanitized by prepareTemplateData (as productImages)
  offer,
  isWelcome,
  isDiscountEmail,
  showProducts,
  font,
  // clean data from prepareTemplateData
  templateData,
}) {
  // Template only accepts clean data from prepareTemplateData.
  // If templateData is missing, throw — this should never happen in production.
  if (!templateData) throw new Error('renderEditorialTemplate requires templateData from prepareTemplateData()')
  const d = templateData

  const c = d.copy
  const primary     = d.primaryColor
  const accent      = d.accentColor
  const primaryText = isDark(primary) ? '#ffffff' : '#111111'
  const accentText  = isDark(accent)  ? '#ffffff' : '#111111'
  const darkAccent  = darkenColor(primary, 0.55)
  const lightBg     = lightenColor(accent, 0.88)

  const df = `'${font.display}',Georgia,'Times New Roman',serif`
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`

  // ── 1. HEADER ────────────────────────────────────────────────────────────────
  const logoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="60" style="display:block;height:60px;width:auto;margin:0 auto;border:0;" alt="${d.brandName}">`
    : `<span style="font-family:${df};font-size:24px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${primaryText};">${d.brandName.toUpperCase()}</span>`

  const header = `
<tr><td bgcolor="${primary}" style="padding:32px 40px 28px;text-align:center;">
  ${logoContent}
</td></tr>`

  // ── 2. NAV BAR — only if real links exist ────────────────────────────────────
  const navColors = [
    { bg: primary,    color: primaryText },
    { bg: accent,     color: accentText  },
    { bg: darkAccent, color: '#ffffff'   },
  ]

  const nav = d.navLinks.length > 0 ? `
<tr><td style="padding:0;font-size:0;line-height:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      ${d.navLinks.map((link, i) => {
        const c2 = navColors[i % navColors.length]
        const border = i > 0 ? 'border-left:1px solid #ffffff;' : ''
        return `<td width="${Math.floor(600 / d.navLinks.length)}" bgcolor="${c2.bg}" style="${border}padding:16px 8px;text-align:center;">
          <span style="font-family:${bf};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:capitalize;color:${c2.color};">${link}</span>
        </td>`
      }).join('')}
    </tr>
  </table>
</td></tr>` : ''

  // ── 3. HERO HEADLINE ─────────────────────────────────────────────────────────
  // Split at ' — ' to get the highlighted second line
  const headlineParts = (c.hero_headline || '').split(/\s*—\s*/)
  const line1 = headlineParts[0] ? headlineParts[0].trim() : c.hero_headline
  const line2 = headlineParts[1] ? headlineParts[1].trim() : ''

  const heroHeadline = `
<tr><td bgcolor="${lightBg}" style="padding:28px 28px 0;text-align:center;">
  <div style="font-family:${df};font-size:34px;font-weight:700;color:#000000;line-height:1.1;margin-bottom:${line2 ? '12px' : '20px'};">${line1}</div>
  ${line2 ? `<div style="display:inline-block;background:${accent};border-radius:10px;padding:6px 20px;margin-bottom:16px;">
    <span style="font-family:${df};font-size:34px;font-weight:700;color:${accentText};">${line2}</span>
  </div>` : ''}
</td></tr>`

  // ── 4. HERO IMAGE — only if heroImageUrl is provided ─────────────────────────
  // No gradient fallback. No placeholder. If null → section is skipped entirely.
  const heroImage = d.heroImageUrl ? `
<tr><td bgcolor="${lightBg}" style="padding:0 20px;font-size:0;line-height:0;">
  <div style="position:relative;overflow:hidden;border-radius:0 0 24px 24px;">
    <img src="${d.heroImageUrl}" width="560" style="display:block;width:560px;max-width:100%;height:380px;object-fit:cover;border-radius:0 0 24px 24px;border:0;" alt="${d.brandName}">
    <div style="position:absolute;bottom:0;left:0;right:0;height:160px;background:linear-gradient(to bottom,rgba(${hexToRgb(lightBg)},0) 0%,${lightBg} 100%);pointer-events:none;"></div>
  </div>
</td></tr>` : ''

  // ── 5. DISCOUNT CODE — only for welcome emails with an offer ─────────────────
  const discountCode = isWelcome && offer ? `
<tr><td bgcolor="${lightBg}" style="padding:28px 56px 16px;text-align:center;">
  <p style="font-family:${bf};font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:rgba(0,0,0,0.35);margin:0 0 14px;">Your exclusive welcome gift</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td style="border:2px dashed rgba(0,0,0,0.2);border-radius:10px;padding:14px 52px;">
      <span style="font-family:${df};font-size:26px;font-weight:700;letter-spacing:10px;text-transform:uppercase;color:#000000;">${offer.toUpperCase()}</span>
    </td></tr>
  </table>
  <p style="font-family:${bf};font-size:11px;color:rgba(0,0,0,0.35);margin:10px 0 0;letter-spacing:1px;">Apply at checkout · Expires in 48 hours</p>
</td></tr>` : ''

  // ── 6. BODY COPY — only if story_p1 exists ───────────────────────────────────
  const bodyCopy = c.story_p1 ? `
<tr><td bgcolor="${lightBg}" style="padding:36px 56px 8px;text-align:center;">
  ${c.story_p1 ? `<p style="font-family:${bf};font-size:18px;font-weight:400;line-height:1.75;color:#111111;margin:0 0 16px;">${c.story_p1}</p>` : ''}
  ${c.story_p2 ? `<p style="font-family:${bf};font-size:18px;font-weight:400;line-height:1.75;color:#111111;margin:0 0 16px;">${c.story_p2}</p>` : ''}
  ${c.story_p3 ? `<p style="font-family:${bf};font-size:18px;font-weight:400;line-height:1.75;color:#111111;margin:0;">${c.story_p3}</p>` : ''}
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:20px 56px 32px;text-align:center;">
  <a href="#" style="display:inline-block;background:#000000;color:#ffffff;font-family:${bf};font-size:16px;font-weight:600;text-transform:uppercase;text-decoration:none;letter-spacing:1.5px;padding:16px 52px;border-radius:12px;">${c.cta_button}</a>
  ${c.urgency_line ? `<p style="font-family:${bf};font-size:12px;color:rgba(0,0,0,0.4);margin:12px 0 0;">${c.urgency_line}</p>` : ''}
</td></tr>` : ''

  // ── 7. PILLARS ────────────────────────────────────────────────────────────────
  // Text-only if no product image — never hidden because of missing image.
  // Hidden only if pillars array is empty.
  const pillarsHeading = c.pillars_heading && c.pillars.length > 0 ? `
<tr><td bgcolor="${lightBg}" style="padding:44px 40px 8px;text-align:center;">
  <h2 style="font-family:${df};font-size:36px;font-weight:700;text-transform:uppercase;color:#000000;margin:0;line-height:1.0;">${c.pillars_heading}</h2>
</td></tr>` : ''

  const pillarRows = c.pillars.map((pillar, i) => {
    const isLeft     = i % 2 === 0
    const img        = d.productImages[i] || null
    const numCircle  = `<div style="width:68px;height:68px;border-radius:50%;background:${darkAccent};display:inline-flex;align-items:center;justify-content:center;font-family:${df};font-size:24px;font-weight:700;color:#ffffff;line-height:1;">${i + 1}</div>`

    if (img) {
      // WITH image: two-column layout alternating left/right
      const imgCell  = `<td width="244" style="vertical-align:top;padding-top:${isLeft ? '48' : '8'}px;${isLeft ? 'padding-right:20px;' : 'padding-left:20px;'}">
        <img src="${img.src}" width="244" style="display:block;width:244px;height:180px;object-fit:cover;border-radius:16px;border:0;" alt="${img.name}">
      </td>`
      const textCell = `<td style="vertical-align:top;padding-top:8px;">
        <div style="text-align:center;margin-bottom:12px;">${numCircle}</div>
        <h3 style="font-family:${df};font-size:22px;font-weight:700;text-transform:uppercase;color:#000000;margin:0 0 10px;line-height:1.2;">${pillar.title}</h3>
        <p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.75;color:#222222;margin:0;">${pillar.body}</p>
      </td>`

      return `
<tr><td bgcolor="${lightBg}" style="padding:20px 24px 8px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      ${isLeft ? imgCell + textCell : textCell + imgCell}
    </tr>
  </table>
</td></tr>`
    } else {
      // WITHOUT image: full-width text with number circle — still premium
      return `
<tr><td bgcolor="${lightBg}" style="padding:20px 40px 8px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="80" style="vertical-align:top;padding-top:4px;padding-right:20px;text-align:center;">
        ${numCircle}
      </td>
      <td style="vertical-align:top;">
        <h3 style="font-family:${df};font-size:22px;font-weight:700;text-transform:uppercase;color:#000000;margin:0 0 10px;line-height:1.2;">${pillar.title}</h3>
        <p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.75;color:#222222;margin:0;">${pillar.body}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    }
  }).join('')

  const pillars = pillarsHeading + pillarRows

  // ── 8. CLOSING CTA BAND — only if cta_headline exists ───────────────────────
  const closingCta = c.cta_headline ? `
<tr><td bgcolor="${lightBg}" style="padding:24px 64px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="height:2px;background:${darkAccent};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:24px 56px 36px;text-align:center;">
  <p style="font-family:${bf};font-size:18px;font-weight:400;line-height:1.65;color:#111111;margin:0 0 24px;">${c.cta_headline}</p>
  <a href="#" style="display:inline-block;background:#000000;color:#ffffff;font-family:${bf};font-size:16px;font-weight:600;text-transform:uppercase;text-decoration:none;letter-spacing:1.5px;padding:16px 52px;border-radius:12px;">${c.cta_button}</a>
</td></tr>` : ''

  // ── 9. TRUST BADGES — only if real scraped data exists ──────────────────────
  const badges = []
  const ts = d.trustSignals
  if (ts.freeShipping) badges.push({ icon: '&#128666;', label: ts.freeShipping })
  if (ts.returns)      badges.push({ icon: '&#9989;',   label: ts.returns })
  if (ts.reviews)      badges.push({ icon: '&#11088;',  label: ts.reviews })
  if (ts.rating)       badges.push({ icon: '&#9733;',   label: ts.rating })
  if (ts.quality)      badges.push({ icon: '&#10003;',  label: ts.quality })

  const trustBadges = badges.length > 0 ? `
<tr><td bgcolor="${accent}" style="padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      ${badges.map((b, i) => {
        const sep = i < badges.length - 1
          ? `<td style="width:1px;background:${isDark(accent) ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'};padding:0;font-size:0;">&nbsp;</td>`
          : ''
        const textColor = isDark(accent) ? '#ffffff' : darkenColor(accent, 0.35)
        return `<td style="text-align:center;padding:18px 16px;vertical-align:middle;">
          <div style="font-size:26px;line-height:1;margin-bottom:6px;">${b.icon}</div>
          <div style="font-family:${bf};font-size:12px;font-weight:500;line-height:1.4;color:${textColor};">${b.label}</div>
        </td>${sep}`
      }).join('')}
    </tr>
  </table>
</td></tr>` : ''

  // ── 10. FOOTER — always rendered ─────────────────────────────────────────────
  // Footer nav: only real scraped links. No fake defaults.
  const footerNavLinks = d.navLinks

  const footerNav = footerNavLinks.length > 0 ? `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:0 100px;">
    ${footerNavLinks.map(link => `
    <tr><td style="border-top:1px solid rgba(255,255,255,0.15);padding:18px 0;text-align:center;">
      <a href="#" style="font-family:${df};font-size:20px;font-weight:700;text-transform:uppercase;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">${link.toUpperCase()}</a>
    </td></tr>`).join('')}
    <tr><td style="border-top:1px solid rgba(255,255,255,0.12);padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>` : ''

  const footerLogoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="44" style="display:block;height:44px;width:auto;margin:0 auto 12px;border:0;opacity:0.6;" alt="${d.brandName}">`
    : `<span style="font-family:${df};font-size:16px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${accent};">${d.brandName.toUpperCase()}</span>`

  const footer = `
<tr><td bgcolor="${primary}" style="padding:12px 0 0;">
  ${footerNav}
</td></tr>
<tr><td bgcolor="${primary}" style="padding:28px 40px 12px;text-align:center;">
  ${footerLogoContent}
  ${d.tagline ? `<p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.5;color:rgba(255,255,255,0.7);margin:8px 0 0;">${d.tagline}</p>` : ''}
</td></tr>
<tr><td bgcolor="${primary}" style="padding:16px 40px 32px;text-align:center;">
  <p style="font-family:${bf};font-size:11px;color:rgba(255,255,255,0.3);margin:0;line-height:1.8;">
    <a href="{{ unsubscribe_url }}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Unsubscribe</a>
    &nbsp;·&nbsp;
    <a href="{{ manage_preferences_url }}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`

  // ── ASSEMBLE ──────────────────────────────────────────────────────────────────
  const sections = [
    header,
    nav,
    heroHeadline,
    heroImage,
    discountCode,
    bodyCopy,
    pillars,
    closingCta,
    trustBadges,
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
<body style="margin:0;padding:20px 0;background:#d8d5d0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">
    ${sections}
  </table>
</body>
</html>`
}
