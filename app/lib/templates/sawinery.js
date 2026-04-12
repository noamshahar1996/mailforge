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
  // Header uses primary only when it's dark (good contrast for logo).
  // When primary is light (yellow, beige, white), use #111111 to keep logo visible.
  const headerBg = isDark(primary) ? primary : '#111111'
  const headerText = '#ffffff'

  const logoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="56" style="display:block;height:56px;width:auto;margin:0 auto;border:0;" alt="${d.brandName}">`
    : `<span style="font-family:${bf};font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${headerText};opacity:0.85;">${d.brandName.toUpperCase()}</span>`

  const header = `
<tr><td bgcolor="${headerBg}" style="padding:40px 40px 36px;text-align:center;">
  ${logoContent}
</td></tr>`

  // ── 2. NAV BAR — only if real links exist ────────────────────────────────────
  // Nav uses headerBg (safe dark) for first cell, not raw primary
  const navColors = [
    { bg: headerBg,   color: '#ffffff'   },
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

  // ── 3. HERO BLOCK — headline → offer → CTA → image ───────────────────────────
  // Conversion-optimised order: value proposition is clear above the fold.
  // Offer and CTA appear before the image so they're immediately visible.
  const heroBlock = `
<tr><td bgcolor="${lightBg}" style="padding:72px 56px 56px 64px;text-align:left;">

  <p style="font-family:${bf};font-size:13px;font-weight:400;color:rgba(0,0,0,0.45);margin:0 0 16px;letter-spacing:0.3px;">Welcome, {{ first_name | default: 'there' }}</p>
  <div style="font-family:${df};font-size:50px;font-weight:800;color:#0a0a0a;line-height:0.92;letter-spacing:-2.5px;margin-bottom:${c.hero_subline ? '20px' : '48px'};">${c.hero_headline || ''}</div>
  ${c.hero_subline ? `<p style="font-family:${bf};font-size:16px;font-weight:400;color:rgba(0,0,0,0.5);margin:0 0 44px;line-height:1.5;">${c.hero_subline}</p>` : ''}

  ${isWelcome && offer ? `
  <p style="font-family:${bf};font-size:14px;font-weight:400;color:rgba(0,0,0,0.5);margin:0 0 6px;">Use code at checkout</p>
  <p style="font-family:${bf};font-size:24px;font-weight:800;color:#0a0a0a;letter-spacing:2px;margin:0 0 36px;line-height:1;">${offer.toUpperCase()}</p>
  ` : ''}

  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr><td bgcolor="${headerBg}" style="padding:21px 72px;border-radius:3px;box-shadow:0 6px 20px rgba(0,0,0,0.22);">
      <a href="#" style="font-family:${bf};font-size:11px;font-weight:700;text-transform:uppercase;text-decoration:none;letter-spacing:3px;color:#ffffff;">${c.cta_button || 'SHOP NOW'}</a>
    </td></tr>
  </table>

  ${c.urgency_line && !isWelcome ? `<p style="font-family:${bf};font-size:11px;color:rgba(0,0,0,0.35);margin:20px 0 0;letter-spacing:0.5px;">${c.urgency_line}</p>` : ''}

</td></tr>`

  // ── 4. HERO IMAGE — only if heroImageUrl is provided ─────────────────────────
  // Appears below the offer/CTA — image supports the headline, not competes with it.
  const heroImage = d.heroImageUrl ? `
<tr><td bgcolor="${lightBg}" style="padding:8px 0 0;font-size:0;line-height:0;">
  <div style="position:relative;overflow:hidden;">
    <img src="${d.heroImageUrl}" width="600" style="display:block;width:100%;height:auto;border:0;" alt="${d.brandName}">
    <div style="position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(to bottom,rgba(${hexToRgb(lightBg)},0) 0%,rgba(${hexToRgb(lightBg)},0.55) 100%);pointer-events:none;"></div>
  </div>
</td></tr>` : ''

  // Discount code is now rendered inside heroBlock above — not separately.

  // ── 6. BODY COPY — only if story_p1 exists ───────────────────────────────────
  // CTA is already in the hero block. Body copy here is supporting content only.
  const bodyCopy = c.story_p1 ? `
<tr><td bgcolor="${lightBg}" style="padding:52px 68px 56px;text-align:center;">
  ${c.story_p1 ? `<p style="font-family:${bf};font-size:16px;font-weight:400;line-height:1.95;color:#4a4a4a;margin:0 0 22px;">${c.story_p1}</p>` : ''}
  ${c.story_p2 ? `<p style="font-family:${bf};font-size:16px;font-weight:400;line-height:1.95;color:#4a4a4a;margin:0 0 22px;">${c.story_p2}</p>` : ''}
  ${c.story_p3 ? `<p style="font-family:${bf};font-size:16px;font-weight:400;line-height:1.95;color:#4a4a4a;margin:0;">${c.story_p3}</p>` : ''}
</td></tr>` : ''

  // ── 7. PILLARS ────────────────────────────────────────────────────────────────
  // Text-only if no product image — never hidden because of missing image.
  // Hidden only if pillars array is empty.
  // Pillar count is driven by how many pillars the copy generated.
  // Images are matched by index — if no image at that slot, renders text-only.
  const pillarCount = c.pillars.length

  const pillarsHeading = c.pillars_heading && pillarCount > 0 ? `
<tr><td bgcolor="${lightBg}" style="padding:0 64px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="height:1px;background:rgba(0,0,0,0.06);font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:64px 48px 8px;text-align:center;">
  <p style="font-family:${bf};font-size:9px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${darkenColor(accent, 0.4)};margin:0 0 16px;">Featured</p>
  <h2 style="font-family:${df};font-size:36px;font-weight:800;text-transform:uppercase;color:#111111;margin:0;line-height:1.0;letter-spacing:-0.5px;">${c.pillars_heading}</h2>
</td></tr>` : ''

  const pillarRows = c.pillars.map((pillar, i) => {
    const isLeft = i % 2 === 0
    const img    = d.productImages[i] || null  // null → text-only row
    const numCircle = `<div style="width:64px;height:64px;border-radius:50%;background:${darkAccent};display:inline-flex;align-items:center;justify-content:center;font-family:${bf};font-size:20px;font-weight:700;color:#ffffff;line-height:1;">${i + 1}</div>`

    if (img) {
      const imgCell  = `<td width="240" style="vertical-align:top;padding-top:${isLeft ? '48' : '8'}px;${isLeft ? 'padding-right:28px;' : 'padding-left:28px;'}">
        <img src="${img.src}" width="240" style="display:block;width:240px;height:auto;border-radius:8px;border:0;" alt="${img.name}">
      </td>`
      const textCell = `<td style="vertical-align:top;padding-top:8px;">
        <div style="margin-bottom:18px;">${numCircle}</div>
        <h3 style="font-family:${df};font-size:19px;font-weight:800;text-transform:uppercase;color:#111111;margin:0 0 14px;line-height:1.2;letter-spacing:0.5px;">${pillar.title}</h3>
        <p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.9;color:#555555;margin:0;">${pillar.body}</p>
      </td>`

      return `
<tr><td bgcolor="${lightBg}" style="padding:36px 36px 20px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>${isLeft ? imgCell + textCell : textCell + imgCell}</tr>
  </table>
</td></tr>`
    } else {
      return `
<tr><td bgcolor="${lightBg}" style="padding:36px 56px 20px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="84" style="vertical-align:top;padding-top:2px;padding-right:28px;">
        ${numCircle}
      </td>
      <td style="vertical-align:top;">
        <h3 style="font-family:${df};font-size:19px;font-weight:800;text-transform:uppercase;color:#111111;margin:0 0 14px;line-height:1.2;letter-spacing:0.5px;">${pillar.title}</h3>
        <p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.9;color:#555555;margin:0;">${pillar.body}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    }
  }).join('')

  const pillars = pillarsHeading + pillarRows

  // ── 8. CLOSING CTA BAND — only if cta_headline exists ───────────────────────
  const closingCta = c.cta_headline ? `
<tr><td bgcolor="${lightBg}" style="padding:0 64px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="height:1px;background:rgba(0,0,0,0.06);font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
</td></tr>
<tr><td bgcolor="${lightBg}" style="padding:60px 72px 68px;text-align:center;">
  <p style="font-family:${bf};font-size:16px;font-weight:400;line-height:1.95;color:#4a4a4a;margin:0 0 36px;">${c.cta_headline}</p>
  <a href="#" style="display:inline-block;background:#111111;color:#ffffff;font-family:${bf};font-size:10px;font-weight:700;text-transform:uppercase;text-decoration:none;letter-spacing:3.5px;padding:19px 64px;border-radius:0;">${c.cta_button}</a>
</td></tr>` : ''

  // ── 9. TRUST BADGES — only if real scraped data exists ──────────────────────
  const badges = []
  const ts = d.trustSignals
  if (ts.freeShipping) badges.push({ label: ts.freeShipping })
  if (ts.returns)      badges.push({ label: ts.returns })
  if (ts.reviews)      badges.push({ label: ts.reviews })
  if (ts.rating)       badges.push({ label: ts.rating })
  if (ts.quality)      badges.push({ label: ts.quality })

  const trustBadges = badges.length > 0 ? `
<tr><td bgcolor="${accent}" style="padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      ${badges.map((b, i) => {
        const sep = i < badges.length - 1
          ? `<td style="width:1px;background:${isDark(accent) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};padding:0;font-size:0;">&nbsp;</td>`
          : ''
        const textColor = isDark(accent) ? '#ffffff' : darkenColor(accent, 0.38)
        return `<td style="text-align:center;padding:24px 16px;vertical-align:middle;">
          <div style="font-family:${bf};font-size:12px;font-weight:700;line-height:1.4;color:${textColor};letter-spacing:0.5px;">${b.label}</div>
        </td>${sep}`
      }).join('')}
    </tr>
  </table>
</td></tr>` : ''

  // ── 10. FOOTER — always rendered ─────────────────────────────────────────────
  // Footer nav: only real scraped links. No fake defaults.
  const footerNavLinks = d.navLinks

  const footerNav = footerNavLinks.length > 0 ? `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:0 80px;">
    ${footerNavLinks.map(link => `
    <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:22px 0;text-align:center;">
      <a href="#" style="font-family:${bf};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:rgba(255,255,255,0.75);text-decoration:none;">${link.toUpperCase()}</a>
    </td></tr>`).join('')}
    <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>` : ''

  const footerLogoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="40" style="display:block;height:40px;width:auto;margin:0 auto 14px;border:0;opacity:0.85;" alt="${d.brandName}">`
    : `<span style="font-family:${bf};font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${accent};">${d.brandName.toUpperCase()}</span>`

  // Footer always uses a fixed dark background — never brand primary.
  // Brand primary can be any color (yellow, beige, white) — using it in the footer
  // causes invisible text and logos. Dark background guarantees readability.
  const footerBg = '#111111'

  const footer = `
<tr><td bgcolor="${footerBg}" style="padding:20px 0 0;">
  ${footerNav}
</td></tr>
<tr><td bgcolor="${footerBg}" style="padding:40px 48px 20px;text-align:center;">
  ${footerLogoContent}
  ${d.tagline ? `<p style="font-family:${bf};font-size:13px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.5);margin:10px 0 0;">${d.tagline}</p>` : ''}
</td></tr>
<tr><td bgcolor="${footerBg}" style="padding:20px 48px 40px;text-align:center;">
  <p style="font-family:${bf};font-size:10px;color:rgba(255,255,255,0.3);margin:0;line-height:2;letter-spacing:0.5px;">
    <a href="{{ unsubscribe_url }}" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Unsubscribe</a>
    &nbsp;&nbsp;·&nbsp;&nbsp;
    <a href="{{ manage_preferences_url }}" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`

  // ── ASSEMBLE ──────────────────────────────────────────────────────────────────
  const sections = [
    header,
    nav,
    heroBlock,    // headline + offer + CTA (above the fold)
    heroImage,    // image below — supports the headline
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
