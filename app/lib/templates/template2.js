/**
 * MailForge Template 2: Product Showcase
 * Layer 4: Template renderer
 *
 * CONTRACT:
 * - Receives clean, validated data from prepareTemplateData()
 * - No fallbacks, no guessing, no invented content
 * - Each section renders only if its data exists
 * - Deterministic: same input always produces same output
 *
 * SECTIONS:
 * 1. Header        — always
 * 2. Hero          — always (headline + subline + CTA)
 * 3. Products      — only if pillars array has items
 * 4. Social proof  — only if trustSignals has real data
 * 5. Secondary CTA — only if cta_headline exists
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

// ── Main renderer ──────────────────────────────────────────────────────────────

export function renderProductShowcaseTemplate({
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
  if (!templateData) throw new Error('renderProductShowcaseTemplate requires templateData from prepareTemplateData()')
  const d = templateData
  const c = d.copy

  const accent    = d.accentColor
  const accentText = isDark(accent) ? '#ffffff' : '#111111'
  const headerBg  = isDark(d.primaryColor) ? d.primaryColor : '#111111'
  const pageBg    = '#ffffff'
  const sectionBg = '#f7f7f5'
  const dividerColor = 'rgba(0,0,0,0.08)'

  const df = `'${font.display}',Georgia,'Times New Roman',serif`
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`

  // ── 1. HEADER ────────────────────────────────────────────────────────────────

  const logoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="52" style="display:block;height:52px;width:auto;margin:0 auto;border:0;" alt="${d.brandName}">`
    : `<span style="font-family:${bf};font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:#ffffff;">${d.brandName.toUpperCase()}</span>`

  const header = `
<tr><td bgcolor="${headerBg}" style="padding:32px 40px;text-align:center;">
  ${logoContent}
</td></tr>`

  // ── 2. HERO ───────────────────────────────────────────────────────────────────
  // Clean, centered layout. No offer block here — this template is product-focused.

  const hero = `
<tr><td bgcolor="${pageBg}" style="padding:64px 56px 52px;text-align:center;">
  <h1 style="font-family:${df};font-size:42px;font-weight:800;color:#111111;line-height:1.05;letter-spacing:-1px;margin:0 0 ${c.hero_subline ? '20px' : '36px'};">${c.hero_headline || ''}</h1>
  ${c.hero_subline ? `<p style="font-family:${bf};font-size:17px;font-weight:400;color:rgba(0,0,0,0.5);margin:0 0 36px;line-height:1.6;max-width:440px;margin-left:auto;margin-right:auto;">${c.hero_subline}</p>` : ''}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td bgcolor="${headerBg}" style="padding:18px 64px;border-radius:3px;">
      <a href="#" style="font-family:${bf};font-size:11px;font-weight:700;text-transform:uppercase;text-decoration:none;letter-spacing:3px;color:#ffffff;">${c.cta_button || 'SHOP NOW'}</a>
    </td></tr>
  </table>
</td></tr>
<tr><td bgcolor="${dividerColor}" style="height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>`

  // ── 3. PRODUCT SHOWCASE ───────────────────────────────────────────────────────
  // Renders only if pillars array has items.
  // Each pillar = one product row: image left + content right, alternating.
  // If no image for a slot → full-width text row.

  const pillarCount = c.pillars.length

  const productHeading = pillarCount > 0 && c.pillars_heading ? `
<tr><td bgcolor="${sectionBg}" style="padding:52px 48px 8px;text-align:center;">
  <p style="font-family:${bf};font-size:9px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${darkenColor(accent, 0.4)};margin:0 0 12px;">Featured</p>
  <h2 style="font-family:${df};font-size:32px;font-weight:800;color:#111111;margin:0;line-height:1.1;letter-spacing:-0.5px;">${c.pillars_heading}</h2>
</td></tr>` : (pillarCount > 0 ? `
<tr><td bgcolor="${sectionBg}" style="padding:52px 48px 8px;text-align:center;">
  <p style="font-family:${bf};font-size:9px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${darkenColor(accent, 0.4)};margin:0;">Featured</p>
</td></tr>` : '')

  const productRows = c.pillars.map((pillar, i) => {
    const isLeft = i % 2 === 0
    const img    = d.productImages[i] || null

    if (img) {
      const imgCell = `<td width="220" style="vertical-align:middle;${isLeft ? 'padding-right:28px;' : 'padding-left:28px;'}">
        <img src="${img.src}" width="220" style="display:block;width:220px;height:auto;border-radius:8px;border:0;" alt="${img.name}">
      </td>`
      const textCell = `<td style="vertical-align:middle;">
        <p style="font-family:${bf};font-size:9px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${darkenColor(accent, 0.4)};margin:0 0 10px;">${String(i + 1).padStart(2, '0')}</p>
        <h3 style="font-family:${df};font-size:22px;font-weight:800;color:#111111;margin:0 0 12px;line-height:1.2;">${pillar.title}</h3>
        <p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.85;color:#555555;margin:0;">${pillar.body}</p>
      </td>`

      return `
<tr><td bgcolor="${sectionBg}" style="padding:32px 40px 16px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>${isLeft ? imgCell + textCell : textCell + imgCell}</tr>
  </table>
</td></tr>`
    } else {
      return `
<tr><td bgcolor="${sectionBg}" style="padding:32px 48px 16px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="48" style="vertical-align:top;padding-top:4px;padding-right:20px;">
        <div style="width:36px;height:36px;border-radius:50%;background:${headerBg};display:inline-flex;align-items:center;justify-content:center;font-family:${bf};font-size:13px;font-weight:700;color:#ffffff;line-height:1;">${i + 1}</div>
      </td>
      <td style="vertical-align:top;">
        <h3 style="font-family:${df};font-size:22px;font-weight:800;color:#111111;margin:0 0 12px;line-height:1.2;">${pillar.title}</h3>
        <p style="font-family:${bf};font-size:15px;font-weight:400;line-height:1.85;color:#555555;margin:0;">${pillar.body}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    }
  }).join('')

  const productSpacer = pillarCount > 0 ? `
<tr><td bgcolor="${sectionBg}" style="padding-bottom:48px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td bgcolor="${dividerColor}" style="height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>` : ''

  const products = pillarCount > 0
    ? productHeading + productRows + productSpacer
    : ''

  // ── 4. SOCIAL PROOF ───────────────────────────────────────────────────────────
  // Renders only if trustSignals has real scraped data.

  const trustEntries = Object.entries(d.trustSignals || {}).filter(([, v]) => v)
  const sepColor = 'rgba(0,0,0,0.08)'

  const socialProof = trustEntries.length > 0 ? `
<tr><td bgcolor="${pageBg}" style="padding:52px 48px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      ${trustEntries.map(([key, val], i) => {
        const sep = i < trustEntries.length - 1
          ? `<td style="width:1px;background:${sepColor};padding:0;font-size:0;">&nbsp;</td>`
          : ''
        return `<td style="text-align:center;padding:0 16px;vertical-align:middle;">
          <p style="font-family:${df};font-size:18px;font-weight:700;color:#111111;margin:0 0 4px;letter-spacing:-0.3px;">${val}</p>
        </td>${sep}`
      }).join('')}
    </tr>
  </table>
</td></tr>
<tr><td bgcolor="${dividerColor}" style="height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>` : ''

  // ── 5. SECONDARY CTA ─────────────────────────────────────────────────────────
  // Renders only if cta_headline exists.

  const secondaryCta = c.cta_headline ? `
<tr><td bgcolor="${sectionBg}" style="padding:56px 64px;text-align:center;">
  <h2 style="font-family:${df};font-size:30px;font-weight:800;color:#111111;margin:0 0 12px;line-height:1.2;letter-spacing:-0.3px;">${c.cta_headline}</h2>
  ${c.story_p1 ? `<p style="font-family:${bf};font-size:16px;font-weight:400;color:rgba(0,0,0,0.5);line-height:1.8;margin:0 0 32px;max-width:420px;margin-left:auto;margin-right:auto;">${c.story_p1}</p>` : '<div style="height:28px;"></div>'}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td bgcolor="${accent}" style="padding:18px 60px;border-radius:3px;">
      <a href="#" style="font-family:${bf};font-size:11px;font-weight:700;text-transform:uppercase;text-decoration:none;letter-spacing:3px;color:${accentText};">${c.cta_button || 'SHOP NOW'}</a>
    </td></tr>
  </table>
  ${c.urgency_line ? `<p style="font-family:${bf};font-size:11px;color:rgba(0,0,0,0.3);margin:16px 0 0;letter-spacing:0.5px;">${c.urgency_line}</p>` : ''}
</td></tr>` : ''

  // ── 6. FOOTER ─────────────────────────────────────────────────────────────────

  const footerNavLinks = d.navLinks

  const footerNav = footerNavLinks.length > 0 ? `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:0 80px;">
    ${footerNavLinks.map(link => `
    <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:20px 0;text-align:center;">
      <a href="#" style="font-family:${bf};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:rgba(255,255,255,0.7);text-decoration:none;">${link.toUpperCase()}</a>
    </td></tr>`).join('')}
    <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>` : ''

  const footerLogoContent = d.logoUrl
    ? `<img src="${d.logoUrl}" height="36" style="display:block;height:36px;width:auto;margin:0 auto 12px;border:0;opacity:0.8;" alt="${d.brandName}">`
    : `<span style="font-family:${bf};font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${accent};">${d.brandName.toUpperCase()}</span>`

  const footer = `
<tr><td bgcolor="#111111" style="padding:16px 0 0;">
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
    hero,
    products,
    socialProof,
    secondaryCta,
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
<body style="margin:0;padding:20px 0;background:#e8e8e6;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">
    ${sections}
  </table>
</body>
</html>`
}
