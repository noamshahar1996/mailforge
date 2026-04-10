/**
 * MailForge Design Engine v1
 * Modular block-based email design system.
 * All blocks consume shared design tokens.
 * assembleEmail() builds emails from block selections.
 */

// ─── DESIGN SYSTEM (global tokens) ──────────────────────────────────────────

export function getDesignSystem(brandTone) {
  const base = {
    spacing: { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 },
    typography: { h1: 48, h2: 32, h3: 22, body: 15, small: 12, label: 10 },
    button: { paddingV: 14, paddingH: 40 },
    maxWidth: 600,
  }

  const toneTokens = {
    'Luxury & refined': {
      ...base,
      typography: { ...base.typography, h1: 52, h2: 34, body: 14 },
      button: { paddingV: 14, paddingH: 48 },
      buttonRadius: '0px',
      labelSpacing: '6px',
      sectionDivider: true,
      heroStyle: 'editorial',
    },
    'Bold & direct': {
      ...base,
      typography: { ...base.typography, h1: 44, h2: 30, body: 15 },
      button: { paddingV: 16, paddingH: 40 },
      buttonRadius: '2px',
      labelSpacing: '4px',
      sectionDivider: false,
      heroStyle: 'impact',
    },
    'Warm & friendly': {
      ...base,
      typography: { ...base.typography, h1: 42, h2: 28, body: 16 },
      button: { paddingV: 14, paddingH: 36 },
      buttonRadius: '4px',
      labelSpacing: '3px',
      sectionDivider: false,
      heroStyle: 'warm',
    },
    'Playful & fun': {
      ...base,
      typography: { ...base.typography, h1: 40, h2: 26, body: 16 },
      button: { paddingV: 14, paddingH: 32 },
      buttonRadius: '30px',
      labelSpacing: '2px',
      sectionDivider: false,
      heroStyle: 'playful',
    },
    'Scientific & trusted': {
      ...base,
      typography: { ...base.typography, h1: 40, h2: 28, body: 15 },
      button: { paddingV: 14, paddingH: 36 },
      buttonRadius: '4px',
      labelSpacing: '4px',
      sectionDivider: true,
      heroStyle: 'clean',
    },
    'Minimalist': {
      ...base,
      typography: { ...base.typography, h1: 36, h2: 26, body: 15 },
      button: { paddingV: 12, paddingH: 32 },
      buttonRadius: '0px',
      labelSpacing: '5px',
      sectionDivider: true,
      heroStyle: 'minimal',
    },
  }

  return toneTokens[brandTone] || toneTokens['Warm & friendly']
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────

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
  let r = parseInt(h.slice(0,2),16)
  let g = parseInt(h.slice(2,4),16)
  let b = parseInt(h.slice(4,6),16)
  r = Math.floor(r * factor)
  g = Math.floor(g * factor)
  b = Math.floor(b * factor)
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')
}

function lightenColor(hex, factor = 0.92) {
  const h = (hex || '#ffffff').replace('#', '')
  if (h.length < 6) return '#ffffff'
  let r = parseInt(h.slice(0,2),16)
  let g = parseInt(h.slice(2,4),16)
  let b = parseInt(h.slice(4,6),16)
  r = Math.round(r + (255 - r) * factor)
  g = Math.round(g + (255 - g) * factor)
  b = Math.round(b + (255 - b) * factor)
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')
}

// ─── FONT PAIRINGS ────────────────────────────────────────────────────────────

export function getFontPairing(tone) {
  const pairings = {
    'Luxury & refined': {
      display: 'Cormorant Garamond',
      body: 'Raleway',
      importUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Raleway:wght@300;400;500;600&display=swap'
    },
    'Bold & direct': {
      display: 'Oswald',
      body: 'Source Sans 3',
      importUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap'
    },
    'Warm & friendly': {
      display: 'Playfair Display',
      body: 'Lato',
      importUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400&family=Lato:wght@300;400;700&display=swap'
    },
    'Playful & fun': {
      display: 'Nunito',
      body: 'Nunito',
      importUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'
    },
    'Scientific & trusted': {
      display: 'DM Serif Display',
      body: 'DM Sans',
      importUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap'
    },
    'Minimalist': {
      display: 'Libre Baskerville',
      body: 'Jost',
      importUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500&display=swap'
    },
  }
  return pairings[tone] || pairings['Warm & friendly']
}

// ─── BLOCK LIBRARY ────────────────────────────────────────────────────────────

// HEADER BLOCKS
// ─────────────

export function headerBlock_logo({ brandName, logoUrl, primaryColor, primaryTextColor, df }) {
  const content = logoUrl
    ? `<img src="${logoUrl}" height="52" style="display:block;height:52px;width:auto;margin:0 auto;border:0;" alt="${brandName}">`
    : `<span style="font-family:${df};font-size:13px;font-weight:400;letter-spacing:8px;text-transform:uppercase;color:${primaryTextColor};">${brandName.toUpperCase()}</span>`
  return `<tr><td bgcolor="${primaryColor}" style="padding:32px 60px 28px;text-align:center;">${content}</td></tr>`
}

export function headerBlock_minimal({ brandName, logoUrl, df }) {
  const content = logoUrl
    ? `<img src="${logoUrl}" height="44" style="display:block;height:44px;width:auto;margin:0 auto;border:0;" alt="${brandName}">`
    : `<span style="font-family:${df};font-size:12px;font-weight:400;letter-spacing:7px;text-transform:uppercase;color:#1a1a1a;">${brandName.toUpperCase()}</span>`
  return `<tr><td bgcolor="#faf9f7" style="padding:36px 60px 28px;text-align:center;border-bottom:1px solid #e8e4de;">${content}</td></tr>`
}

// DISCOUNT BLOCKS
// ───────────────

export function discountBlock_luxury({ offer, primaryColor, primaryTextColor, df, bf }) {
  if (!offer) return ''
  const offerUpper = offer.toUpperCase()
  return `
<tr><td bgcolor="${primaryColor}" style="padding:36px 60px 32px;text-align:center;">
  <p style="margin:0 0 18px;font-family:${bf};font-size:10px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:${primaryTextColor};opacity:0.6;">A Gift for You</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td style="border:1px solid ${primaryTextColor};opacity:0.7;padding:16px 56px;">
      <span style="font-family:${df};font-size:28px;font-weight:300;letter-spacing:10px;text-transform:uppercase;color:${primaryTextColor};opacity:1;">${offerUpper}</span>
    </td></tr>
  </table>
  <p style="margin:14px 0 0;font-family:${bf};font-size:11px;font-weight:300;letter-spacing:2px;color:${primaryTextColor};opacity:0.55;">Apply at checkout</p>
</td></tr>`
}

export function discountBlock_bold({ offer, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf }) {
  if (!offer) return ''
  const offerUpper = offer.toUpperCase()
  return `
<tr><td bgcolor="${primaryColor}" style="padding:28px 48px;text-align:center;">
  <p style="margin:0 0 12px;font-family:${bf};font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${primaryTextColor};opacity:0.7;">YOUR WELCOME GIFT</p>
  <div style="display:inline-block;background:rgba(255,255,255,0.15);border:2px dashed rgba(255,255,255,0.4);padding:14px 48px;margin:0 auto;">
    <span style="font-family:${df};font-size:32px;font-weight:600;letter-spacing:8px;text-transform:uppercase;color:${primaryTextColor};">${offerUpper}</span>
  </div>
  <p style="margin:10px 0 0;font-family:${bf};font-size:12px;color:${primaryTextColor};opacity:0.65;">Apply this code at checkout</p>
</td></tr>`
}

// HERO BLOCKS
// ───────────

export function heroBlock_editorial({ copy, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf, ds }) {
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  const h1 = ds.typography.h1
  const bodySize = ds.typography.body
  return `
<tr><td bgcolor="${primaryColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px ${ds.spacing.xl}px;text-align:center;">
  <h1 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${h1}px;font-weight:300;line-height:1.15;letter-spacing:1px;color:${primaryTextColor};">${copy.hero_headline || ''}</h1>
  <p style="margin:0 auto ${ds.spacing.lg}px;max-width:420px;font-family:${bf};font-size:${bodySize}px;font-weight:300;line-height:1.9;letter-spacing:0.3px;color:${primaryTextColor};opacity:0.75;">${copy.hero_subline || ''}</p>
  <a href="#" style="display:inline-block;background:transparent;border:1px solid ${primaryTextColor};color:${primaryTextColor};font-family:${bf};font-size:10px;font-weight:600;letter-spacing:${ds.labelSpacing || '4px'};text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'DISCOVER'}</a>
</td></tr>`
}

export function heroBlock_impact({ copy, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf, ds }) {
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  const h1 = ds.typography.h1
  const bodySize = ds.typography.body
  return `
<tr><td bgcolor="${primaryColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <h1 style="margin:0 0 ${ds.spacing.sm}px;font-family:${df};font-size:${h1}px;font-weight:700;line-height:1.05;color:${primaryTextColor};text-transform:uppercase;letter-spacing:2px;">${copy.hero_headline || ''}</h1>
  <p style="margin:0 auto ${ds.spacing.lg}px;max-width:440px;font-family:${bf};font-size:${bodySize + 1}px;font-weight:400;line-height:1.7;color:${primaryTextColor};opacity:0.85;">${copy.hero_subline || ''}</p>
  <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
</td></tr>`
}

export function heroBlock_warm({ copy, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf, ds }) {
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  const h1 = ds.typography.h1
  const bodySize = ds.typography.body
  return `
<tr><td bgcolor="${primaryColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <h1 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${h1}px;font-weight:700;line-height:1.2;color:${primaryTextColor};">${copy.hero_headline || ''}</h1>
  <p style="margin:0 auto ${ds.spacing.lg}px;max-width:440px;font-family:${bf};font-size:${bodySize + 1}px;font-weight:400;line-height:1.75;color:${primaryTextColor};opacity:0.88;">${copy.hero_subline || ''}</p>
  <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
</td></tr>`
}

// STORY / CONTENT BLOCKS
// ──────────────────────

export function storyBlock_editorial({ copy, bgColor, accentForLightBg, df, bf, ds }) {
  const h2 = ds.typography.h2
  const bodySize = ds.typography.body
  const labelSize = ds.typography.label
  return `
<tr><td bgcolor="${bgColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.xl}px;">
  <p style="margin:0 0 ${ds.spacing.sm}px;font-family:${bf};font-size:${labelSize}px;font-weight:500;letter-spacing:${ds.labelSpacing || '5px'};text-transform:uppercase;color:${accentForLightBg};">${copy.story_label || 'Our Story'}</p>
  <h2 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${h2}px;font-weight:300;line-height:1.25;color:#1a1a1a;letter-spacing:0.5px;">${copy.story_headline || ''}</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40"><tr><td style="height:1px;background:${accentForLightBg};font-size:0;line-height:0;margin-bottom:${ds.spacing.md}px;">&nbsp;</td></tr></table>
  <p style="margin:${ds.spacing.sm}px 0 ${ds.spacing.sm}px;font-family:${bf};font-size:${bodySize}px;font-weight:300;line-height:1.95;color:#5a504a;">${copy.story_p1 || ''}</p>
  <p style="margin:0 0 ${copy.story_p3 ? ds.spacing.sm + 'px' : '0'};font-family:${bf};font-size:${bodySize}px;font-weight:300;line-height:1.95;color:#5a504a;">${copy.story_p2 || ''}</p>
  ${copy.story_p3 ? `<p style="margin:0;font-family:${bf};font-size:${bodySize}px;font-weight:300;line-height:1.95;color:#5a504a;">${copy.story_p3}</p>` : ''}
</td></tr>`
}

export function storyBlock_standard({ copy, bgColor, accentForLightBg, df, bf, ds }) {
  const h2 = ds.typography.h2
  const bodySize = ds.typography.body
  const labelSize = ds.typography.label
  return `
<tr><td bgcolor="${bgColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;">
  <p style="margin:0 0 ${ds.spacing.xs}px;font-family:${bf};font-size:${labelSize}px;font-weight:600;letter-spacing:${ds.labelSpacing || '4px'};text-transform:uppercase;color:${accentForLightBg};">${copy.story_label || 'Our Story'}</p>
  <h2 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${h2}px;font-weight:700;line-height:1.2;color:#111111;">${copy.story_headline || ''}</h2>
  <p style="margin:0 0 ${ds.spacing.sm}px;font-family:${bf};font-size:${bodySize}px;line-height:1.8;color:#555555;">${copy.story_p1 || ''}</p>
  <p style="margin:0 0 ${copy.story_p3 ? ds.spacing.sm + 'px' : '0'};font-family:${bf};font-size:${bodySize}px;line-height:1.8;color:#555555;">${copy.story_p2 || ''}</p>
  ${copy.story_p3 ? `<p style="margin:0;font-family:${bf};font-size:${bodySize}px;line-height:1.8;color:#555555;">${copy.story_p3}</p>` : ''}
</td></tr>`
}

// PRODUCT BLOCKS
// ──────────────

export function productBlock_grid3({ products, copy, bgColor, accentForLightBg, df, bf, ds, ctaLabel = 'SHOP NOW' }) {
  if (!products || products.length === 0) return ''
  const colWidth = products.length === 1 ? 480 : products.length === 2 ? 260 : 170
  const cells = products.map(p => `
    <td width="${colWidth}" style="padding:${ds.spacing.xs}px;text-align:center;vertical-align:top;">
      <img src="${p.src}" width="${colWidth - 16}" style="display:block;margin:0 auto ${ds.spacing.sm}px;max-width:100%;border:0;" alt="${p.name}">
      <p style="margin:0 0 6px;font-family:${bf};font-size:13px;font-weight:500;color:#111111;letter-spacing:0.3px;">${p.name}</p>
      <a href="#" style="font-family:${bf};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${accentForLightBg};text-decoration:none;">${ctaLabel}</a>
    </td>`).join('')
  return `
<tr><td bgcolor="${bgColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.md}px;">
  <p style="margin:0 0 ${ds.spacing.xs}px;font-family:${bf};font-size:${ds.typography.label}px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};text-align:center;">${copy.product_label || 'Featured'}</p>
  <h2 style="margin:0 0 ${ds.spacing.lg}px;font-family:${df};font-size:${ds.typography.h3}px;font-weight:${ds.typography.h2 > 30 ? '300' : '700'};color:#111111;text-align:center;">${copy.product_headline || ''}</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${cells}</tr></table>
</td></tr>`
}

export function productBlock_featured({ products, copy, bgColor, accentForLightBg, accentColor, accentTextColor, df, bf, ds }) {
  if (!products || products.length === 0) return ''
  const p = products[0]
  return `
<tr><td bgcolor="${bgColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="260" style="vertical-align:middle;padding-right:${ds.spacing.md}px;">
        <img src="${p.src}" width="244" style="display:block;max-width:100%;border:0;" alt="${p.name}">
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0 0 ${ds.spacing.xs}px;font-family:${bf};font-size:${ds.typography.label}px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};">${copy.product_label || 'Featured'}</p>
        <h2 style="margin:0 0 ${ds.spacing.sm}px;font-family:${df};font-size:${ds.typography.h3}px;font-weight:${ds.typography.h2 > 30 ? '400' : '700'};line-height:1.3;color:#111111;">${p.name}</h2>
        <p style="margin:0 0 ${ds.spacing.md}px;font-family:${bf};font-size:13px;line-height:1.75;color:#777777;">${copy.story_p1 || ''}</p>
        <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:${ds.buttonRadius};">SHOP NOW</a>
      </td>
    </tr>
  </table>
</td></tr>`
}

export function productBlock_minimal({ products, copy, bgColor, accentForLightBg, df, bf, ds }) {
  if (!products || products.length === 0) return ''
  const rows = products.map(p => `
    <tr>
      <td style="padding:${ds.spacing.sm}px 0;border-bottom:1px solid #eeeeee;vertical-align:middle;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="64"><img src="${p.src}" width="56" height="56" style="display:block;border:0;object-fit:cover;" alt="${p.name}"></td>
            <td style="padding-left:${ds.spacing.sm}px;">
              <p style="margin:0 0 4px;font-family:${bf};font-size:13px;font-weight:500;color:#111111;">${p.name}</p>
            </td>
            <td style="text-align:right;">
              <a href="#" style="font-family:${bf};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${accentForLightBg};text-decoration:none;">VIEW</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')
  return `
<tr><td bgcolor="${bgColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;">
  <p style="margin:0 0 ${ds.spacing.md}px;font-family:${bf};font-size:${ds.typography.label}px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};">${copy.product_label || 'You Might Also Love'}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table>
</td></tr>`
}

// TESTIMONIAL BLOCKS
// ──────────────────

export function testimonialBlock_editorial({ quote, attribution, accentColor, df, bf, ds }) {
  return `
<tr><td bgcolor="#f5f3ef" style="padding:${ds.spacing.xl}px ${ds.spacing.xl}px;text-align:center;">
  <p style="margin:0 auto ${ds.spacing.md}px;max-width:440px;font-family:${df};font-size:22px;font-weight:300;font-style:italic;line-height:1.7;color:#3a3028;">"${quote}"</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:${ds.spacing.sm}px;">
    <tr><td style="height:1px;width:40px;background:${accentColor};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
  <p style="margin:0;font-family:${bf};font-size:10px;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:#9a8c7e;">— ${attribution}, Verified Customer</p>
  <p style="margin:${ds.spacing.xs}px 0 0;font-size:15px;color:${accentColor};letter-spacing:2px;">★ ★ ★ ★ ★</p>
</td></tr>`
}

export function testimonialBlock_dark({ quote, attribution, primaryColor, accentColor, primaryTextColor, df, bf, ds }) {
  return `
<tr><td bgcolor="#111111" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <p style="margin:0 0 ${ds.spacing.sm}px;font-family:${df};font-size:52px;font-weight:300;line-height:0.6;color:${accentColor};">"</p>
  <p style="margin:0 auto ${ds.spacing.md}px;max-width:460px;font-family:${df};font-size:21px;font-weight:300;font-style:italic;line-height:1.65;color:#ffffff;">${quote}</p>
  <p style="margin:0 0 ${ds.spacing.xs}px;font-family:${bf};font-size:10px;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.45);">— ${attribution}, Verified Customer</p>
  <p style="margin:0;font-size:16px;color:${accentColor};letter-spacing:3px;">★ ★ ★ ★ ★</p>
</td></tr>`
}

// CTA BAND BLOCKS
// ───────────────

export function ctaBlock_outline({ copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }) {
  const offerUpper = offer ? offer.toUpperCase() : ''
  const hasDiscount = offer && isDiscountEmail
  const urgency = isWelcome && offer
    ? `Code ${offerUpper} expires in 48 hours`
    : copy.urgency_line || ''
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  return `
<tr><td bgcolor="${accentColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <h2 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${ds.typography.h2}px;font-weight:300;line-height:1.25;letter-spacing:0.5px;color:${accentTextColor};">${copy.cta_headline || ''}</h2>
  ${hasDiscount ? `<p style="margin:0 0 ${ds.spacing.sm}px;font-family:${df};font-size:22px;font-weight:300;letter-spacing:8px;color:${accentTextColor};">${offerUpper}</p>` : ''}
  <a href="#" style="display:inline-block;background:transparent;border:1px solid ${accentTextColor};color:${accentTextColor};font-family:${bf};font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
  ${urgency ? `<p style="margin:${ds.spacing.sm}px 0 0;font-family:${bf};font-size:11px;font-weight:300;letter-spacing:1px;color:${accentTextColor};opacity:0.7;">${urgency}</p>` : ''}
</td></tr>`
}

export function ctaBlock_filled({ copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }) {
  const offerUpper = offer ? offer.toUpperCase() : ''
  const hasDiscount = offer && isDiscountEmail
  const urgency = isWelcome && offer
    ? `Code ${offerUpper} expires in 48 hours`
    : copy.urgency_line || ''
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  return `
<tr><td bgcolor="${accentColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <h2 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${ds.typography.h2}px;font-weight:700;line-height:1.2;color:${accentTextColor};">${copy.cta_headline || ''}</h2>
  ${hasDiscount ? `<div style="display:inline-block;background:rgba(255,255,255,0.2);border:2px dashed rgba(255,255,255,0.5);padding:12px 40px;margin:0 0 ${ds.spacing.md}px;"><span style="font-family:${df};font-size:26px;font-weight:600;letter-spacing:6px;color:${accentTextColor};">${offerUpper}</span></div><br>` : ''}
  <a href="#" style="display:inline-block;background:#ffffff;color:${primaryColor};font-family:${bf};font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
  ${urgency ? `<p style="margin:${ds.spacing.sm}px 0 0;font-family:${bf};font-size:12px;color:${accentTextColor};opacity:0.8;">${urgency}</p>` : ''}
</td></tr>`
}

export function ctaBlock_minimal({ copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }) {
  const offerUpper = offer ? offer.toUpperCase() : ''
  const urgency = isWelcome && offer
    ? `Code ${offerUpper} expires in 48 hours`
    : copy.urgency_line || ''
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  return `
<tr><td bgcolor="#faf9f7" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;border-top:1px solid #e8e4de;">
  <h2 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${ds.typography.h2}px;font-weight:300;line-height:1.25;color:#1a1a1a;">${copy.cta_headline || ''}</h2>
  <a href="#" style="display:inline-block;background:transparent;border:1px solid #1a1a1a;color:#1a1a1a;font-family:${bf};font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
  ${urgency ? `<p style="margin:${ds.spacing.sm}px 0 0;font-family:${bf};font-size:11px;color:#9a8c7e;">${urgency}</p>` : ''}
</td></tr>`
}

// DIVIDER BLOCK
// ─────────────

export function dividerBlock_accent({ accentColor, bgColor = '#faf9f7' }) {
  return `<tr><td bgcolor="${bgColor}" style="padding:0 ${60}px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background:${accentColor};opacity:0.4;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>`
}

export function dividerBlock_subtle({ bgColor = '#ffffff' }) {
  return `<tr><td bgcolor="${bgColor}" style="padding:0 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background:#e8e4de;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>`
}

// FOOTER BLOCK
// ────────────

export function footerBlock({ brandName, logoUrl, tagline, df, bf }) {
  const logoContent = logoUrl
    ? `<img src="${logoUrl}" height="36" style="display:block;height:36px;width:auto;margin:0 auto 10px;border:0;" alt="${brandName}">`
    : `<p style="margin:0 0 8px;font-family:${df};font-size:11px;font-weight:300;letter-spacing:7px;text-transform:uppercase;color:rgba(255,255,255,0.6);">${brandName.toUpperCase()}</p>`
  return `
<tr><td bgcolor="#111111" style="padding:36px 48px;text-align:center;">
  ${logoContent}
  ${tagline ? `<p style="margin:0 0 ${16}px;font-family:${bf};font-size:11px;font-weight:300;letter-spacing:1px;color:rgba(255,255,255,0.35);">${tagline}</p>` : ''}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="height:1px;background:rgba(255,255,255,0.08);font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
  <p style="margin:16px 0 0;font-family:${bf};font-size:10px;font-weight:400;letter-spacing:1px;color:rgba(255,255,255,0.25);">
    <a href="#" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp;
    <a href="#" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`
}

// ─── BLOCK SELECTOR ──────────────────────────────────────────────────────────
// Picks the right block variation based on brand tone and email role.

export function selectBlocks(emailRole, brandTone, hasOffer) {
  const selections = {

    // WELCOME FLOW
    discount_delivery: {
      hero: 'editorial',
      discount: 'luxury',
      story: 'editorial',
      products: 'grid3',
      testimonial: 'editorial',
      cta: 'outline',
    },
    education: {
      hero: 'editorial',
      story: 'editorial',
      products: 'grid3',
      testimonial: 'editorial',
      cta: 'outline',
    },
    urgency: {
      hero: 'impact',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },

    // POST-PURCHASE FLOW
    thank_you: {
      hero: 'warm',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },
    how_to_use: {
      hero: 'editorial',
      story: 'editorial',
      testimonial: 'editorial',
      cta: 'outline',
    },
    social_proof: {
      hero: 'editorial',
      story: 'standard',
      products: 'minimal',
      testimonial: 'editorial',
      cta: 'outline',
    },

    // ABANDONED CART FLOW
    remind: {
      hero: 'impact',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },
    build_trust: {
      hero: 'editorial',
      story: 'editorial',
      testimonial: 'editorial',
      cta: 'outline',
    },
    push: {
      hero: 'impact',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },

    // BROWSE ABANDON
    browse_remind: {
      hero: 'warm',
      story: 'standard',
      products: 'featured',
      testimonial: 'dark',
      cta: 'filled',
    },
    browse_desire: {
      hero: 'editorial',
      story: 'editorial',
      products: 'grid3',
      testimonial: 'editorial',
      cta: 'outline',
    },
    browse_push: {
      hero: 'impact',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },

    // CHECKOUT ABANDON
    checkout_remind: {
      hero: 'impact',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },
    checkout_trust: {
      hero: 'editorial',
      story: 'editorial',
      testimonial: 'editorial',
      cta: 'outline',
    },
    checkout_push: {
      hero: 'impact',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },

    // SUBSCRIPTION
    sub_welcome: {
      hero: 'warm',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },
    sub_habit: {
      hero: 'editorial',
      story: 'editorial',
      testimonial: 'editorial',
      cta: 'outline',
    },
    sub_expectations: {
      hero: 'editorial',
      story: 'editorial',
      testimonial: 'editorial',
      cta: 'outline',
    },

    // SINGLE EMAILS
    'Welcome email': {
      hero: 'warm',
      discount: 'bold',
      story: 'standard',
      products: 'grid3',
      testimonial: 'dark',
      cta: 'filled',
    },
    'Abandoned cart': {
      hero: 'impact',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },
    'Post-purchase': {
      hero: 'warm',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },
    'Flash sale': {
      hero: 'impact',
      story: 'standard',
      testimonial: 'dark',
      cta: 'filled',
    },
    'Win-back': {
      hero: 'warm',
      story: 'editorial',
      testimonial: 'editorial',
      cta: 'outline',
    },
    'Product launch': {
      hero: 'impact',
      story: 'editorial',
      products: 'featured',
      testimonial: 'editorial',
      cta: 'outline',
    },
  }

  // Override hero/cta based on brand tone for consistency
  const toneOverrides = {
    'Luxury & refined': { hero: 'editorial', cta: 'outline', testimonial: 'editorial' },
    'Bold & direct': { hero: 'impact', cta: 'filled', testimonial: 'dark' },
    'Warm & friendly': { hero: 'warm', cta: 'filled', testimonial: 'dark' },
    'Playful & fun': { hero: 'warm', cta: 'filled', testimonial: 'dark' },
    'Scientific & trusted': { hero: 'editorial', cta: 'filled', testimonial: 'dark' },
    'Minimalist': { hero: 'editorial', cta: 'minimal', testimonial: 'editorial' },
  }

  const base = selections[emailRole] || selections['Welcome email']
  const overrides = toneOverrides[brandTone] || {}

  return { ...base, ...overrides }
}

// ─── MAIN ASSEMBLY FUNCTION ───────────────────────────────────────────────────

export function assembleEmail({
  brandData,
  emailType,
  offer,
  copy,
  topProducts,
  showProducts,
  isWelcome,
  isPostPurchase,
  isDiscountEmail,
  realQuote,
}) {
  const primaryColor = brandData.primaryColor || '#111111'
  const accentColor = brandData.accentColor || '#c9b99a'
  const bgColor = brandData.backgroundColor || '#ffffff'
  const primaryTextColor = isDark(primaryColor) ? '#ffffff' : '#111111'
  const accentTextColor = isDark(accentColor) ? '#ffffff' : '#111111'
  const accentForLightBg = isDark(accentColor) ? accentColor : darkenColor(accentColor, 0.45)
  const logoUrl = brandData.logoUrl || null
  const brandTone = brandData.brandTone || 'Warm & friendly'

  const font = getFontPairing(brandTone)
  const df = `'${font.display}',Georgia,'Times New Roman',serif`
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`
  const ds = getDesignSystem(brandTone)

  const blockSelection = selectBlocks(emailType, brandTone, !!offer)

  const quote = realQuote && realQuote.length > 10
    ? realQuote
    : `The ${(brandData.productNames || [])[0] || brandData.productType} completely changed my routine. Unlike anything I've tried before.`

  const rawName = copy.testimonial_name || 'James R.'
  const brandLower = brandData.brandName.toLowerCase()
  const attribution = rawName.toLowerCase().includes(brandLower) ? 'James R.' : rawName

  const sharedProps = {
    copy, df, bf, ds,
    primaryColor, primaryTextColor,
    accentColor, accentTextColor, accentForLightBg,
    bgColor, brandData,
  }

  // HEADER
  const isLuxury = brandTone === 'Luxury & refined' || brandTone === 'Minimalist'
  const header = isLuxury
    ? headerBlock_minimal({ brandName: brandData.brandName, logoUrl, df })
    : headerBlock_logo({ brandName: brandData.brandName, logoUrl, primaryColor, primaryTextColor, df })

  // DISCOUNT
  const discount = isWelcome && offer
    ? (isLuxury
        ? discountBlock_luxury({ offer, primaryColor, primaryTextColor, df, bf })
        : discountBlock_bold({ offer, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf }))
    : ''

  // HERO
  const heroProps = { copy, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf, ds }
  const hero = blockSelection.hero === 'impact'
    ? heroBlock_impact(heroProps)
    : blockSelection.hero === 'warm'
    ? heroBlock_warm(heroProps)
    : heroBlock_editorial(heroProps)

  // STORY
  const storyProps = { copy, bgColor, accentForLightBg, df, bf, ds }
  const story = blockSelection.story === 'editorial'
    ? storyBlock_editorial(storyProps)
    : storyBlock_standard(storyProps)

  // PRODUCTS
  let products = ''
  if (showProducts && topProducts && topProducts.length > 0) {
    const productProps = { products: topProducts, copy, bgColor, accentForLightBg, accentColor, accentTextColor, df, bf, ds }
    if (blockSelection.products === 'featured') {
      products = productBlock_featured(productProps)
    } else if (blockSelection.products === 'minimal' || isPostPurchase) {
      products = productBlock_minimal({ ...productProps, ctaLabel: 'LEARN MORE' })
    } else {
      products = productBlock_grid3(productProps)
    }
  }

  // TESTIMONIAL
  const testimonialProps = { quote, attribution, accentColor, primaryColor, primaryTextColor, df, bf, ds }
  const testimonial = blockSelection.testimonial === 'dark'
    ? testimonialBlock_dark(testimonialProps)
    : testimonialBlock_editorial(testimonialProps)

  // CTA
  const ctaProps = { copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }
  const cta = blockSelection.cta === 'minimal'
    ? ctaBlock_minimal(ctaProps)
    : blockSelection.cta === 'outline'
    ? ctaBlock_outline(ctaProps)
    : ctaBlock_filled(ctaProps)

  // FOOTER
  const footer = footerBlock({ brandName: brandData.brandName, logoUrl, tagline: brandData.tagline, df, bf })

  // DIVIDERS (luxury tone only)
  const dividerTop = isLuxury ? dividerBlock_accent({ accentColor, bgColor: primaryColor }) : ''
  const dividerMid = isLuxury ? dividerBlock_subtle({ bgColor }) : ''

  // ASSEMBLY ORDER
  let sections = header
  if (isWelcome) {
    sections += dividerTop
    sections += discount
    sections += hero
    sections += dividerMid
    sections += products
    sections += story
    sections += testimonial
    sections += cta
  } else if (isPostPurchase) {
    sections += hero
    sections += story
    sections += products
    sections += testimonial
    sections += cta
  } else {
    sections += hero
    sections += story
    sections += products
    sections += testimonial
    sections += cta
  }
  sections += footer

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@import url('${font.importUrl}');a{text-decoration:none;}img{border:0;}</style></head><body style="margin:0;padding:20px 0;background:#e8e8e8;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">${sections}</table></body></html>`
}
