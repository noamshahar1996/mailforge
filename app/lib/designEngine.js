/**
 * MailForge Design Engine v3.0 — Agency Level
 *
 * Major upgrades in v3.0:
 * - Trust badge row using real scraped data only (no fake badges)
 * - Split section: image left / story right
 * - Pull-quote block with accent border
 * - Premium product cards: tag + name + description + price + CTA
 * - Nav links in header
 * - Elegant discount code box
 * - Larger, bolder typography throughout
 * - Brand's actual website fonts via scraper detection
 * - 3 rotating layout variants for visual variety
 */

// ─── LAYOUT VARIANT SYSTEM ────────────────────────────────────────────────────
export function getLayoutVariant() {
  const roll = Math.random()
  let variant
  if (roll < 0.33) variant = 'A'
  else if (roll < 0.66) variant = 'B'
  else variant = 'C'

  const subRoll1 = Math.random() > 0.5
  const subRoll2 = Math.random() > 0.5

  const configs = {
    // Variant A — Dark Anchor: minimal header, story before products, accent CTA
    A: {
      name: 'Dark Anchor',
      headerStyle: 'minimal',
      storyBeforeProducts: true,
      testimonialBeforeCta: true,
      storyBgLight: true,
      ctaBgStyle: 'accent',
      pullQuote: subRoll1,
      dividers: true,
      productCardBg: '#f0ede8',
      useImageHero: false,
      showStatement: false,
      splitSection: true,
    },
    // Variant B — Bold Flow: logo header, products first, statement block
    B: {
      name: 'Bold Flow',
      headerStyle: 'logo',
      storyBeforeProducts: false,
      testimonialBeforeCta: true,
      storyBgLight: false,
      ctaBgStyle: 'primary',
      pullQuote: false,
      dividers: false,
      productCardBg: '#ffffff',
      useImageHero: false,
      showStatement: true,
      splitSection: subRoll1,
    },
    // Variant C — Contrast Editorial: logo header, dark CTA, pull-quote
    C: {
      name: 'Contrast Editorial',
      headerStyle: 'logo',
      storyBeforeProducts: false,
      testimonialBeforeCta: false,
      storyBgLight: subRoll2,
      ctaBgStyle: 'dark',
      pullQuote: subRoll1,
      dividers: false,
      productCardBg: '#f5f3ef',
      useImageHero: false,
      showStatement: true,
      splitSection: true,
    },
  }

  return { variant, config: configs[variant] }
}

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
export function getDesignSystem(brandTone) {
  const base = {
    spacing: { xs: 8, sm: 16, md: 28, lg: 48, xl: 72 },
    typography: { h1: 52, h2: 34, h3: 24, body: 16, small: 12, label: 10 },
    button: { paddingV: 15, paddingH: 44 },
    maxWidth: 600,
  }
  const toneTokens = {
    'Luxury & refined': {
      ...base,
      typography: { ...base.typography, h1: 56, h2: 36, body: 15 },
      button: { paddingV: 16, paddingH: 52 },
      buttonRadius: '0px',
      labelSpacing: '6px',
      sectionDivider: true,
    },
    'Bold & direct': {
      ...base,
      typography: { ...base.typography, h1: 52, h2: 32, body: 16 },
      button: { paddingV: 17, paddingH: 44 },
      buttonRadius: '2px',
      labelSpacing: '4px',
      sectionDivider: false,
    },
    'Warm & friendly': {
      ...base,
      typography: { ...base.typography, h1: 48, h2: 30, body: 17 },
      button: { paddingV: 15, paddingH: 40 },
      buttonRadius: '4px',
      labelSpacing: '3px',
      sectionDivider: false,
    },
    'Playful & fun': {
      ...base,
      typography: { ...base.typography, h1: 46, h2: 28, body: 17 },
      button: { paddingV: 15, paddingH: 36 },
      buttonRadius: '30px',
      labelSpacing: '2px',
      sectionDivider: false,
    },
    'Scientific & trusted': {
      ...base,
      typography: { ...base.typography, h1: 46, h2: 30, body: 16 },
      button: { paddingV: 15, paddingH: 40 },
      buttonRadius: '4px',
      labelSpacing: '4px',
      sectionDivider: true,
    },
    'Minimalist': {
      ...base,
      typography: { ...base.typography, h1: 42, h2: 28, body: 16 },
      button: { paddingV: 14, paddingH: 36 },
      buttonRadius: '0px',
      labelSpacing: '5px',
      sectionDivider: true,
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
  let r = parseInt(h.slice(0, 2), 16)
  let g = parseInt(h.slice(2, 4), 16)
  let b = parseInt(h.slice(4, 6), 16)
  r = Math.floor(r * factor)
  g = Math.floor(g * factor)
  b = Math.floor(b * factor)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

// ─── FONT SYSTEM ──────────────────────────────────────────────────────────────
const TONE_FONT_FALLBACKS = {
  'Luxury & refined': {
    display: 'Cormorant Garamond',
    body: 'Raleway',
    importUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Raleway:wght@300;400;500;600&display=swap',
  },
  'Bold & direct': {
    display: 'Oswald',
    body: 'Source Sans 3',
    importUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap',
  },
  'Warm & friendly': {
    display: 'Playfair Display',
    body: 'Lato',
    importUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400&family=Lato:wght@300;400;700&display=swap',
  },
  'Playful & fun': {
    display: 'Nunito',
    body: 'Nunito',
    importUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap',
  },
  'Scientific & trusted': {
    display: 'DM Serif Display',
    body: 'DM Sans',
    importUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap',
  },
  'Minimalist': {
    display: 'Libre Baskerville',
    body: 'Jost',
    importUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500&display=swap',
  },
}

function buildGoogleFontsUrl(displayFont, bodyFont) {
  const encode = name => name.replace(/ /g, '+')
  if (displayFont === bodyFont) {
    return `https://fonts.googleapis.com/css2?family=${encode(displayFont)}:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap`
  }
  return `https://fonts.googleapis.com/css2?family=${encode(displayFont)}:ital,wght@0,300;0,400;0,600;0,700;1,400&family=${encode(bodyFont)}:wght@300;400;500;600&display=swap`
}

export function getFontPairing(tone, brandData = {}) {
  const fallback = TONE_FONT_FALLBACKS[tone] || TONE_FONT_FALLBACKS['Warm & friendly']
  if (brandData.displayFont && brandData.bodyFont) {
    return {
      display: brandData.displayFont,
      body: brandData.bodyFont,
      importUrl: buildGoogleFontsUrl(brandData.displayFont, brandData.bodyFont),
    }
  }
  if (brandData.displayFont) {
    return {
      display: brandData.displayFont,
      body: fallback.body,
      importUrl: buildGoogleFontsUrl(brandData.displayFont, fallback.body),
    }
  }
  return fallback
}

// ─── BLOCK LIBRARY ────────────────────────────────────────────────────────────

// ── HEADER BLOCKS ─────────────────────────────────────────────────────────────

// Premium header with eyebrow line, logo, and optional nav links
export function headerBlock_premium({ brandName, logoUrl, primaryColor, primaryTextColor, accentColor, navItems, df, bf }) {
  const logoContent = logoUrl
    ? `<img src="${logoUrl}" height="44" style="display:block;height:44px;width:auto;margin:0 auto;border:0;" alt="${brandName}">`
    : `<span style="font-family:${df};font-size:20px;font-weight:300;letter-spacing:10px;text-transform:uppercase;color:${primaryTextColor};">${brandName.toUpperCase()}</span>`

  // Build nav from scraped navItems — take 4 most useful ones
  const usefulNav = (navItems || [])
    .filter(n => n.length > 1 && n.length < 20 && !n.toLowerCase().includes('menu') && !n.toLowerCase().includes('close'))
    .slice(0, 4)

  const navHtml = usefulNav.length > 0
    ? `<tr><td bgcolor="${primaryColor}" style="padding:0 40px 14px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
        ${usefulNav.map(n => `<a href="#" style="font-family:${bf};font-size:9px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:${primaryTextColor};opacity:0.45;text-decoration:none;margin:0 12px;">${n}</a>`).join('')}
      </td></tr>`
    : ''

  return `
<tr><td bgcolor="${primaryColor}" style="padding:10px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
  <span style="font-family:${bf};font-size:9px;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:${primaryTextColor};opacity:0.35;">${brandName}</span>
</td></tr>
<tr><td bgcolor="${primaryColor}" style="padding:22px 40px 20px;text-align:center;">
  ${logoContent}
</td></tr>
${navHtml}`
}

// Minimal header — just logo on primary color, no nav
export function headerBlock_minimal({ brandName, logoUrl, primaryColor, primaryTextColor, df }) {
  const content = logoUrl
    ? `<img src="${logoUrl}" height="44" style="display:block;height:44px;width:auto;margin:0 auto;border:0;" alt="${brandName}">`
    : `<span style="font-family:${df};font-size:20px;font-weight:300;letter-spacing:10px;text-transform:uppercase;color:${primaryTextColor};">${brandName.toUpperCase()}</span>`
  return `<tr><td bgcolor="${primaryColor}" style="padding:28px 60px 24px;text-align:center;">${content}</td></tr>`
}

// ── DISCOUNT BLOCKS ───────────────────────────────────────────────────────────

// Elegant bordered box — premium agency style
export function discountBlock_elegant({ offer, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf }) {
  if (!offer) return ''
  const offerUpper = offer.toUpperCase()
  const boxBorderColor = isDark(primaryColor) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'
  const accentTextOnPrimary = isDark(primaryColor) ? accentColor : darkenColor(accentColor, 0.5)
  return `
<tr><td bgcolor="${primaryColor}" style="padding:32px 52px 28px;text-align:center;border-top:1px solid ${boxBorderColor};">
  <p style="margin:0 0 14px;font-family:${bf};font-size:9px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:${primaryTextColor};opacity:0.4;">Your exclusive welcome gift</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr><td style="border:1px solid ${boxBorderColor};padding:14px 52px;">
      <span style="font-family:${df};font-size:28px;font-weight:300;letter-spacing:12px;text-transform:uppercase;color:${primaryTextColor};">${offerUpper}</span>
    </td></tr>
  </table>
  <p style="margin:12px 0 0;font-family:${bf};font-size:10px;font-weight:300;letter-spacing:2px;color:${primaryTextColor};opacity:0.4;">Apply at checkout · Expires in 48 hours</p>
</td></tr>`
}

// Bold dashed box
export function discountBlock_bold({ offer, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf }) {
  if (!offer) return ''
  const offerUpper = offer.toUpperCase()
  return `
<tr><td bgcolor="${primaryColor}" style="padding:28px 48px;text-align:center;">
  <p style="margin:0 0 12px;font-family:${bf};font-size:10px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${primaryTextColor};opacity:0.6;">YOUR WELCOME GIFT</p>
  <div style="display:inline-block;background:rgba(255,255,255,0.1);border:2px dashed rgba(255,255,255,0.3);padding:14px 48px;margin:0 auto;">
    <span style="font-family:${df};font-size:32px;font-weight:600;letter-spacing:8px;text-transform:uppercase;color:${primaryTextColor};">${offerUpper}</span>
  </div>
  <p style="margin:10px 0 0;font-family:${bf};font-size:11px;color:${primaryTextColor};opacity:0.5;">Apply this code at checkout</p>
</td></tr>`
}

// ── HERO BLOCKS ───────────────────────────────────────────────────────────────

export function heroBlock_editorial({ copy, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf, ds }) {
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  const h1 = ds.typography.h1
  const bodySize = ds.typography.body
  const ruleColor = isDark(primaryColor) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  return `
<tr><td bgcolor="${primaryColor}" style="padding:80px 56px;text-align:center;">
  <span style="display:block;font-family:${bf};font-size:9px;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:${primaryTextColor};opacity:0.5;margin-bottom:20px;">${copy.hero_eyebrow || ''}</span>
  <h1 style="margin:0 0 0;font-family:${df};font-size:${h1}px;font-weight:300;line-height:1.08;letter-spacing:-0.5px;color:${primaryTextColor};">${copy.hero_headline || ''}</h1>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto;">
    <tr><td style="height:1px;width:40px;background:${ruleColor};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
  <p style="margin:0 auto 40px;max-width:400px;font-family:${bf};font-size:${bodySize}px;font-weight:300;line-height:1.9;color:${primaryTextColor};opacity:0.65;">${copy.hero_subline || ''}</p>
  <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:10px;font-weight:600;letter-spacing:${ds.labelSpacing || '4px'};text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
</td></tr>`
}

export function heroBlock_impact({ copy, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf, ds }) {
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  const h1 = ds.typography.h1
  const bodySize = ds.typography.body
  return `
<tr><td bgcolor="${primaryColor}" style="padding:80px 56px;text-align:center;">
  <h1 style="margin:0 0 20px;font-family:${df};font-size:${h1}px;font-weight:800;line-height:1.0;color:${primaryTextColor};text-transform:uppercase;letter-spacing:1px;">${copy.hero_headline || ''}</h1>
  <p style="margin:0 auto 40px;max-width:460px;font-family:${bf};font-size:${bodySize}px;font-weight:400;line-height:1.8;color:${primaryTextColor};opacity:0.8;">${copy.hero_subline || ''}</p>
  <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
</td></tr>`
}

export function heroBlock_warm({ copy, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf, ds }) {
  const bpv = ds.button.paddingV
  const bph = ds.button.paddingH
  const br = ds.buttonRadius
  const h1 = ds.typography.h1
  const bodySize = ds.typography.body
  return `
<tr><td bgcolor="${primaryColor}" style="padding:80px 56px;text-align:center;">
  <h1 style="margin:0 0 24px;font-family:${df};font-size:${h1}px;font-weight:700;line-height:1.1;color:${primaryTextColor};">${copy.hero_headline || ''}</h1>
  <p style="margin:0 auto 40px;max-width:460px;font-family:${bf};font-size:${bodySize}px;font-weight:400;line-height:1.85;color:${primaryTextColor};opacity:0.82;">${copy.hero_subline || ''}</p>
  <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
</td></tr>`
}

// ── TRUST BADGE ROW ───────────────────────────────────────────────────────────
// Only renders badges that have real data. Never shows fake/placeholder content.
// Returns empty string if no trust signals are available.
export function trustBadgeBlock({ trustSignals, accentColor, accentTextColor, bf }) {
  if (!trustSignals) return ''

  // Collect only the signals that actually have values
  const badges = []
  if (trustSignals.freeShipping) {
    const parts = trustSignals.freeShipping.split(/\s*\$/)
    badges.push({ val: parts[0], key: parts[1] ? `$${parts[1]}` : '' })
  }
  if (trustSignals.returns) {
    const parts = trustSignals.returns.match(/^(\d+[\w-]+)\s+(.+)$/)
    if (parts) {
      badges.push({ val: parts[1], key: parts[2] })
    } else {
      badges.push({ val: trustSignals.returns, key: '' })
    }
  }
  if (trustSignals.reviews) {
    const parts = trustSignals.reviews.match(/^([\d,K+]+)\s+(.+)$/)
    if (parts) {
      badges.push({ val: parts[1], key: parts[2] })
    } else {
      badges.push({ val: trustSignals.reviews, key: '' })
    }
  }
  if (trustSignals.rating) {
    const parts = trustSignals.rating.match(/^([\d.]+)\s*(.+)$/)
    if (parts) {
      badges.push({ val: parts[1], key: parts[2] })
    } else {
      badges.push({ val: trustSignals.rating, key: '' })
    }
  }
  if (trustSignals.quality) {
    badges.push({ val: trustSignals.quality, key: '' })
  }

  // If no badges found, return nothing — no fake data
  if (badges.length === 0) return ''

  const textColor = isDark(accentColor) ? accentTextColor : darkenColor(accentColor, 0.3)
  const separatorColor = isDark(accentColor) ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'

  const cells = badges.map((b, i) => {
    const sep = i < badges.length - 1
      ? `<td style="width:1px;background:${separatorColor};padding:0;">&nbsp;</td>`
      : ''
    return `<td style="text-align:center;padding:14px 16px;vertical-align:middle;">
      <span style="display:block;font-family:${bf};font-size:13px;font-weight:600;color:${textColor};letter-spacing:0.3px;">${b.val}</span>
      ${b.key ? `<span style="display:block;font-family:${bf};font-size:8px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:${textColor};opacity:0.6;margin-top:2px;">${b.key}</span>` : ''}
    </td>${sep}`
  }).join('')

  return `
<tr><td bgcolor="${accentColor}" style="padding:0 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>${cells}</tr>
  </table>
</td></tr>`
}

// ── SPLIT SECTION — image left, story right ───────────────────────────────────
// NEW: Breaks single-column monotony. Left cell is a product image (or placeholder),
// right cell has the brand story copy and CTA.
export function splitBlock({ copy, productImage, bgColor, accentForLightBg, accentColor, accentTextColor, df, bf, ds }) {
  const imgCellBg = isDark(bgColor) ? '#1a1815' : '#f0ede8'
  const imgContent = productImage
    ? `<img src="${productImage}" width="244" style="display:block;width:100%;max-width:244px;height:auto;border:0;" alt="${copy.story_label || 'Product'}">`
    : `<div style="width:100%;height:220px;display:flex;align-items:center;justify-content:center;">
        <span style="font-family:${bf};font-size:8px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.2);">Product Image</span>
      </div>`

  return `
<tr><td bgcolor="${bgColor}" style="padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="46%" bgcolor="${imgCellBg}" style="vertical-align:middle;text-align:center;padding:32px 20px;">
        ${imgContent}
      </td>
      <td style="vertical-align:middle;padding:44px 36px;background-color:${bgColor};">
        <span style="display:block;font-family:${bf};font-size:9px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};margin-bottom:14px;">${copy.story_label || 'Our Story'}</span>
        <h2 style="margin:0 0 14px;font-family:${df};font-size:${ds.typography.h2 - 4}px;font-weight:300;line-height:1.2;color:#0f0f0f;">${copy.story_headline || ''}</h2>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="28" style="margin-bottom:14px;"><tr><td style="height:2px;background:${accentForLightBg};font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <p style="margin:0 0 24px;font-family:${bf};font-size:13px;font-weight:300;line-height:1.9;color:#5a5048;">${copy.story_p1 || ''}</p>
        <a href="#" style="display:inline-block;background:transparent;border:1px solid rgba(15,15,15,0.55);color:#0f0f0f;font-family:${bf};font-size:9px;font-weight:600;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:${ds.buttonRadius};">Read Our Story</a>
      </td>
    </tr>
  </table>
</td></tr>`
}

// ── PULL-QUOTE BLOCK ──────────────────────────────────────────────────────────
// NEW: A standout italic sentence from the story, with accent left border.
// Creates editorial depth between sections.
export function pullQuoteBlock({ copy, accentForLightBg, df, ds }) {
  const raw = copy.story_p2 || copy.hero_subline || ''
  const sentence = raw.split('.')[0].trim()
  if (!sentence || sentence.length < 20) return ''
  return `
<tr><td bgcolor="#f5f2ed" style="padding:${ds.spacing.lg}px ${ds.spacing.xl}px;border-left:4px solid ${accentForLightBg};">
  <p style="margin:0;font-family:${df};font-size:21px;font-weight:300;font-style:italic;line-height:1.65;color:#2a2218;">${sentence}.</p>
</td></tr>`
}

// ── STATEMENT BLOCK ───────────────────────────────────────────────────────────
export function statementBlock({ copy, accentColor, df, ds }) {
  const raw = copy.story_p2 || copy.hero_subline || ''
  const sentence = raw.split('.')[0].trim()
  if (!sentence || sentence.length < 20) return ''
  return `
<tr><td bgcolor="#fafaf8" style="padding:${ds.spacing.xl}px 72px;text-align:center;border-top:1px solid #e8e4de;border-bottom:1px solid #e8e4de;">
  <p style="margin:0 0 16px;font-size:13px;color:${accentColor};letter-spacing:5px;">&#9733; &#9733; &#9733; &#9733; &#9733;</p>
  <p style="margin:0;font-family:${df};font-size:24px;font-weight:300;font-style:italic;line-height:1.55;color:#1a1a1a;">${sentence}.</p>
</td></tr>`
}

// ── STORY / CONTENT BLOCKS ────────────────────────────────────────────────────

export function storyBlock_editorial({ copy, bgColor, accentForLightBg, df, bf, ds }) {
  const h2 = ds.typography.h2
  const bodySize = ds.typography.body
  const labelSize = ds.typography.label
  return `
<tr><td bgcolor="${bgColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.xl}px;">
  <p style="margin:0 0 ${ds.spacing.sm}px;font-family:${bf};font-size:${labelSize}px;font-weight:600;letter-spacing:${ds.labelSpacing || '5px'};text-transform:uppercase;color:${accentForLightBg};">${copy.story_label || 'Our Story'}</p>
  <h2 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${h2}px;font-weight:300;line-height:1.2;color:#1a1a1a;">${copy.story_headline || ''}</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="32" style="margin-bottom:${ds.spacing.md}px;"><tr><td style="height:2px;background:${accentForLightBg};font-size:0;line-height:0;">&nbsp;</td></tr></table>
  <p style="margin:0 0 ${ds.spacing.sm}px;font-family:${bf};font-size:${bodySize}px;font-weight:300;line-height:1.95;color:#5a504a;">${copy.story_p1 || ''}</p>
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
  <p style="margin:0 0 ${ds.spacing.sm}px;font-family:${bf};font-size:${bodySize}px;line-height:1.9;color:#555555;">${copy.story_p1 || ''}</p>
  <p style="margin:0 0 ${copy.story_p3 ? ds.spacing.sm + 'px' : '0'};font-family:${bf};font-size:${bodySize}px;line-height:1.9;color:#555555;">${copy.story_p2 || ''}</p>
  ${copy.story_p3 ? `<p style="margin:0;font-family:${bf};font-size:${bodySize}px;line-height:1.9;color:#555555;">${copy.story_p3}</p>` : ''}
</td></tr>`
}

// ── PRODUCT BLOCKS ────────────────────────────────────────────────────────────

// Premium product grid — tag badge + name + description + price + CTA
export function productBlock_grid3({ products, copy, bgColor, accentForLightBg, accentColor, df, bf, ds, ctaLabel = 'SHOP NOW', productCardBg = '#f0ede8' }) {
  if (!products || products.length === 0) return ''
  const colWidth = products.length === 1 ? 480 : products.length === 2 ? 256 : 168
  const productTags = ['Bestseller', 'New Arrival', 'Top Rated', 'Staff Pick', 'Fan Favorite']
  const cells = products.map((p, i) => {
    const tag = productTags[i % productTags.length]
    const price = p.price || ''
    return `
    <td width="${colWidth}" style="padding:6px;text-align:center;vertical-align:top;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e8e4de;">
        <tr><td bgcolor="${productCardBg}" style="padding:20px;text-align:center;border-bottom:1px solid #e8e4de;">
          <img src="${p.src}" width="${colWidth - 44}" style="display:block;margin:0 auto;max-width:100%;border:0;" alt="${p.name}">
        </td></tr>
        <tr><td bgcolor="#ffffff" style="padding:14px 14px 16px;">
          <span style="display:inline-block;font-family:${bf};font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accentForLightBg};margin-bottom:6px;">${tag}</span>
          <p style="margin:0 0 4px;font-family:${df};font-size:14px;font-weight:400;color:#111111;line-height:1.2;">${p.name}</p>
          ${p.description ? `<p style="margin:0 0 8px;font-family:${bf};font-size:11px;font-weight:300;color:#9a8c7e;line-height:1.4;">${p.description.slice(0, 60)}</p>` : ''}
          ${price ? `<p style="margin:0 0 10px;font-family:${bf};font-size:12px;font-weight:500;color:#111111;letter-spacing:0.5px;">${price}</p>` : ''}
          <a href="#" style="display:block;font-family:${bf};font-size:8px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${accentForLightBg};text-decoration:none;border-top:1px solid #e8e4de;padding-top:10px;">${ctaLabel}</a>
        </td></tr>
      </table>
    </td>`
  }).join('')

  return `
<tr><td bgcolor="${bgColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.md}px;">
  <p style="margin:0 0 8px;font-family:${bf};font-size:${ds.typography.label}px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};text-align:center;">${copy.product_label || 'Featured'}</p>
  <h2 style="margin:0 0 ${ds.spacing.lg}px;font-family:${df};font-size:${ds.typography.h3}px;font-weight:300;color:#111111;text-align:center;">${copy.product_headline || ''}</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${cells}</tr></table>
</td></tr>`
}

export function productBlock_featured({ products, copy, bgColor, accentForLightBg, accentColor, accentTextColor, df, bf, ds, productCardBg = '#f0ede8' }) {
  if (!products || products.length === 0) return ''
  const p = products[0]
  return `
<tr><td bgcolor="${bgColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td width="252" style="vertical-align:middle;padding-right:${ds.spacing.md}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="252" style="border:1px solid #e8e4de;">
          <tr><td bgcolor="${productCardBg}" style="padding:20px;text-align:center;">
            <img src="${p.src}" width="212" style="display:block;margin:0 auto;max-width:100%;border:0;" alt="${p.name}">
          </td></tr>
        </table>
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0 0 ${ds.spacing.xs}px;font-family:${bf};font-size:${ds.typography.label}px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};">${copy.product_label || 'Featured'}</p>
        <h2 style="margin:0 0 ${ds.spacing.sm}px;font-family:${df};font-size:${ds.typography.h3}px;font-weight:400;line-height:1.2;color:#111111;">${p.name}</h2>
        ${p.price ? `<p style="margin:0 0 ${ds.spacing.sm}px;font-family:${bf};font-size:14px;font-weight:500;color:#111111;">${p.price}</p>` : ''}
        <p style="margin:0 0 ${ds.spacing.md}px;font-family:${bf};font-size:13px;line-height:1.8;color:#777777;">${copy.story_p1 || ''}</p>
        <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:13px 28px;border-radius:${ds.buttonRadius};">SHOP NOW</a>
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
              <p style="margin:0 0 3px;font-family:${bf};font-size:14px;font-weight:600;color:#111111;">${p.name}</p>
              ${p.price ? `<p style="margin:0;font-family:${bf};font-size:12px;font-weight:400;color:#9a8c7e;">${p.price}</p>` : ''}
            </td>
            <td style="text-align:right;">
              <a href="#" style="font-family:${bf};font-size:9px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${accentForLightBg};text-decoration:none;">VIEW</a>
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

// ── TESTIMONIAL BLOCKS ────────────────────────────────────────────────────────

export function testimonialBlock_dark({ quote, attribution, accentColor, df, bf, ds }) {
  return `
<tr><td bgcolor="#0f0f0f" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <p style="margin:0 0 20px;font-family:${df};font-size:64px;font-weight:700;line-height:0.5;color:${accentColor};">"</p>
  <p style="margin:0 auto ${ds.spacing.md}px;max-width:460px;font-family:${df};font-size:24px;font-weight:300;font-style:italic;line-height:1.65;color:#ffffff;">${quote}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:16px;">
    <tr><td style="height:1px;width:32px;background:${accentColor};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
  <p style="margin:0 0 10px;font-family:${bf};font-size:9px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.35);">— ${attribution}, Verified Customer</p>
  <p style="margin:0;font-size:16px;color:${accentColor};letter-spacing:5px;">&#9733; &#9733; &#9733; &#9733; &#9733;</p>
</td></tr>`
}

export function testimonialBlock_editorial({ quote, attribution, accentColor, df, bf, ds }) {
  return `
<tr><td bgcolor="#f5f2ed" style="padding:${ds.spacing.xl}px ${ds.spacing.xl}px;text-align:center;">
  <p style="margin:0 0 6px;font-family:${df};font-size:56px;font-weight:700;line-height:0.6;color:${accentColor};">"</p>
  <p style="margin:0 auto ${ds.spacing.md}px;max-width:440px;font-family:${df};font-size:23px;font-weight:300;font-style:italic;line-height:1.7;color:#3a3028;">${quote}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:14px;">
    <tr><td style="height:1px;width:32px;background:${accentColor};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
  <p style="margin:0 0 8px;font-family:${bf};font-size:9px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#9a8c7e;">— ${attribution}, Verified Customer</p>
  <p style="margin:0;font-size:15px;color:${accentColor};letter-spacing:4px;">&#9733; &#9733; &#9733; &#9733; &#9733;</p>
</td></tr>`
}

// ── CTA BAND BLOCKS ───────────────────────────────────────────────────────────

export function ctaBlock_accent({ copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }) {
  const offerUpper = offer ? offer.toUpperCase() : ''
  const hasDiscount = offer && isDiscountEmail
  const urgency = isWelcome && offer ? `Code ${offerUpper} expires in 48 hours` : copy.urgency_line || ''
  const bpv = ds.button.paddingV, bph = ds.button.paddingH, br = ds.buttonRadius
  const borderColor = isDark(accentColor) ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
  return `
<tr><td bgcolor="${accentColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <span style="display:block;font-family:${bf};font-size:9px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:${accentTextColor};opacity:0.5;margin-bottom:18px;">${copy.cta_label || 'Limited Time'}</span>
  <h2 style="margin:0 0 12px;font-family:${df};font-size:${ds.typography.h2}px;font-weight:300;line-height:1.2;color:${accentTextColor};">${copy.cta_headline || ''}</h2>
  <p style="margin:0 0 28px;font-family:${bf};font-size:13px;font-weight:300;color:${accentTextColor};opacity:0.65;">${copy.cta_sub || ''}</p>
  ${hasDiscount ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:24px;"><tr><td style="border:1px solid ${borderColor};padding:10px 32px;"><span style="font-family:${bf};font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${accentTextColor};">${offerUpper}</span></td></tr></table>` : ''}
  <a href="#" style="display:inline-block;background:transparent;border:1px solid ${accentTextColor};color:${accentTextColor};font-family:${bf};font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
  ${urgency ? `<p style="margin:16px 0 0;font-family:${bf};font-size:11px;font-weight:300;letter-spacing:1px;color:${accentTextColor};opacity:0.5;">${urgency}</p>` : ''}
</td></tr>`
}

export function ctaBlock_dark({ copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }) {
  const offerUpper = offer ? offer.toUpperCase() : ''
  const hasDiscount = offer && isDiscountEmail
  const urgency = isWelcome && offer ? `Code ${offerUpper} expires in 48 hours` : copy.urgency_line || ''
  const bpv = ds.button.paddingV, bph = ds.button.paddingH, br = ds.buttonRadius
  return `
<tr><td bgcolor="#0f0f0f" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <span style="display:block;font-family:${bf};font-size:9px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:18px;">${copy.cta_label || 'Limited Time'}</span>
  <h2 style="margin:0 0 12px;font-family:${df};font-size:${ds.typography.h2}px;font-weight:300;line-height:1.2;color:#ffffff;">${copy.cta_headline || ''}</h2>
  <p style="margin:0 0 28px;font-family:${bf};font-size:13px;font-weight:300;color:rgba(255,255,255,0.5);">${copy.cta_sub || ''}</p>
  ${hasDiscount ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:24px;"><tr><td style="border:1px solid rgba(255,255,255,0.15);padding:10px 32px;"><span style="font-family:${bf};font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${accentColor};">${offerUpper}</span></td></tr></table>` : ''}
  <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
  ${urgency ? `<p style="margin:16px 0 0;font-family:${bf};font-size:11px;font-weight:300;letter-spacing:1px;color:rgba(255,255,255,0.3);">${urgency}</p>` : ''}
</td></tr>`
}

export function ctaBlock_filled({ copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }) {
  const offerUpper = offer ? offer.toUpperCase() : ''
  const hasDiscount = offer && isDiscountEmail
  const urgency = isWelcome && offer ? `Code ${offerUpper} expires in 48 hours` : copy.urgency_line || ''
  const bpv = ds.button.paddingV, bph = ds.button.paddingH, br = ds.buttonRadius
  return `
<tr><td bgcolor="${accentColor}" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;">
  <h2 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${ds.typography.h2}px;font-weight:700;line-height:1.2;color:${accentTextColor};">${copy.cta_headline || ''}</h2>
  ${hasDiscount ? `<div style="display:inline-block;background:rgba(255,255,255,0.2);border:2px dashed rgba(255,255,255,0.4);padding:12px 40px;margin:0 0 ${ds.spacing.md}px;"><span style="font-family:${df};font-size:26px;font-weight:700;letter-spacing:6px;color:${accentTextColor};">${offerUpper}</span></div><br>` : ''}
  <a href="#" style="display:inline-block;background:#ffffff;color:${primaryColor};font-family:${bf};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
  ${urgency ? `<p style="margin:${ds.spacing.sm}px 0 0;font-family:${bf};font-size:12px;color:${accentTextColor};opacity:0.7;">${urgency}</p>` : ''}
</td></tr>`
}

export function ctaBlock_minimal({ copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }) {
  const offerUpper = offer ? offer.toUpperCase() : ''
  const urgency = isWelcome && offer ? `Code ${offerUpper} expires in 48 hours` : copy.urgency_line || ''
  const bpv = ds.button.paddingV, bph = ds.button.paddingH, br = ds.buttonRadius
  return `
<tr><td bgcolor="#faf9f7" style="padding:${ds.spacing.xl}px ${ds.spacing.lg}px;text-align:center;border-top:1px solid #e8e4de;">
  <h2 style="margin:0 0 ${ds.spacing.md}px;font-family:${df};font-size:${ds.typography.h2}px;font-weight:300;line-height:1.2;color:#1a1a1a;">${copy.cta_headline || ''}</h2>
  <a href="#" style="display:inline-block;background:transparent;border:1px solid #1a1a1a;color:#1a1a1a;font-family:${bf};font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;text-decoration:none;padding:${bpv}px ${bph}px;border-radius:${br};">${copy.cta_button || 'SHOP NOW'}</a>
  ${urgency ? `<p style="margin:${ds.spacing.sm}px 0 0;font-family:${bf};font-size:11px;color:#9a8c7e;">${urgency}</p>` : ''}
</td></tr>`
}

// ── DIVIDER BLOCKS ────────────────────────────────────────────────────────────

export function dividerBlock_accent({ accentColor, bgColor = '#faf9f7' }) {
  return `<tr><td bgcolor="${bgColor}" style="padding:0 60px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background:${accentColor};opacity:0.3;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>`
}

export function dividerBlock_subtle({ bgColor = '#ffffff' }) {
  return `<tr><td bgcolor="${bgColor}" style="padding:0 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background:#e8e4de;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>`
}

// ── FOOTER BLOCK ──────────────────────────────────────────────────────────────

export function footerBlock({ brandName, logoUrl, tagline, df, bf }) {
  const logoContent = logoUrl
    ? `<img src="${logoUrl}" height="32" style="display:block;height:32px;width:auto;margin:0 auto 12px;border:0;opacity:0.4;" alt="${brandName}">`
    : `<p style="margin:0 0 12px;font-family:${df};font-size:11px;font-weight:300;letter-spacing:8px;text-transform:uppercase;color:rgba(255,255,255,0.25);">${brandName.toUpperCase()}</p>`
  return `
<tr><td bgcolor="#0f0f0f" style="padding:44px 48px;text-align:center;">
  ${logoContent}
  ${tagline ? `<p style="margin:0 0 20px;font-family:${bf};font-size:11px;font-weight:300;letter-spacing:1px;color:rgba(255,255,255,0.2);">${tagline}</p>` : ''}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
    <tr><td style="height:1px;background:rgba(255,255,255,0.06);font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
  <p style="margin:0 0 10px;font-family:${bf};font-size:9px;font-weight:400;letter-spacing:1px;color:rgba(255,255,255,0.18);">
    <a href="#" style="color:rgba(255,255,255,0.18);text-decoration:none;margin:0 8px;">Shop</a>
    <a href="#" style="color:rgba(255,255,255,0.18);text-decoration:none;margin:0 8px;">About</a>
    <a href="#" style="color:rgba(255,255,255,0.18);text-decoration:none;margin:0 8px;">Contact</a>
  </p>
  <p style="margin:0;font-family:${bf};font-size:10px;font-weight:300;letter-spacing:0.3px;color:rgba(255,255,255,0.15);">
    You received this because you signed up at ${brandName}.<br>
    <a href="{{ unsubscribe_url }}" style="color:rgba(255,255,255,0.2);text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp;
    <a href="{{ manage_preferences_url }}" style="color:rgba(255,255,255,0.2);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`
}

// ─── BLOCK SELECTOR ───────────────────────────────────────────────────────────
export function selectBlocks(emailRole, brandTone, hasOffer) {
  const selections = {
    discount_delivery: { hero: 'editorial', story: 'editorial', products: 'grid3', testimonial: 'editorial', cta: 'accent' },
    education: { hero: 'editorial', story: 'editorial', products: 'grid3', testimonial: 'editorial', cta: 'accent' },
    urgency: { hero: 'impact', story: 'standard', testimonial: 'dark', cta: 'filled' },
    thank_you: { hero: 'warm', story: 'standard', testimonial: 'dark', cta: 'filled' },
    how_to_use: { hero: 'editorial', story: 'editorial', testimonial: 'editorial', cta: 'accent' },
    social_proof: { hero: 'editorial', story: 'standard', products: 'minimal', testimonial: 'editorial', cta: 'accent' },
    remind: { hero: 'impact', story: 'standard', testimonial: 'dark', cta: 'filled' },
    build_trust: { hero: 'editorial', story: 'editorial', testimonial: 'editorial', cta: 'accent' },
    push: { hero: 'impact', story: 'standard', testimonial: 'dark', cta: 'filled' },
    browse_remind: { hero: 'warm', story: 'standard', products: 'featured', testimonial: 'dark', cta: 'filled' },
    browse_desire: { hero: 'editorial', story: 'editorial', products: 'grid3', testimonial: 'editorial', cta: 'accent' },
    browse_push: { hero: 'impact', story: 'standard', testimonial: 'dark', cta: 'filled' },
    checkout_remind: { hero: 'impact', story: 'standard', testimonial: 'dark', cta: 'filled' },
    checkout_trust: { hero: 'editorial', story: 'editorial', testimonial: 'editorial', cta: 'accent' },
    checkout_push: { hero: 'impact', story: 'standard', testimonial: 'dark', cta: 'filled' },
    sub_welcome: { hero: 'warm', story: 'standard', testimonial: 'dark', cta: 'filled' },
    sub_habit: { hero: 'editorial', story: 'editorial', testimonial: 'editorial', cta: 'accent' },
    sub_expectations: { hero: 'editorial', story: 'editorial', testimonial: 'editorial', cta: 'accent' },
    'Welcome email': { hero: 'warm', story: 'standard', products: 'grid3', testimonial: 'dark', cta: 'filled' },
    'Abandoned cart': { hero: 'impact', story: 'standard', testimonial: 'dark', cta: 'filled' },
    'Post-purchase': { hero: 'warm', story: 'standard', testimonial: 'dark', cta: 'filled' },
    'Flash sale': { hero: 'impact', story: 'standard', testimonial: 'dark', cta: 'filled' },
    'Win-back': { hero: 'warm', story: 'editorial', testimonial: 'editorial', cta: 'accent' },
    'Product launch': { hero: 'impact', story: 'editorial', products: 'featured', testimonial: 'editorial', cta: 'accent' },
  }
  const toneOverrides = {
    'Luxury & refined': { hero: 'editorial', cta: 'accent', testimonial: 'editorial' },
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
  // ── Colors ──
  const primaryColor = brandData.primaryColor || '#111111'
  const accentColor = brandData.accentColor || '#c9b99a'
  const bgColor = brandData.backgroundColor || '#ffffff'
  const primaryTextColor = isDark(primaryColor) ? '#ffffff' : '#111111'
  const accentTextColor = isDark(accentColor) ? '#ffffff' : '#111111'
  const accentForLightBg = isDark(accentColor) ? accentColor : darkenColor(accentColor, 0.45)
  const logoUrl = brandData.logoUrl || null
  const brandTone = brandData.brandTone || 'Warm & friendly'
  const heroImageUrl = brandData.heroImageUrl || ''
  const navItems = brandData.navItems || []
  const trustSignals = brandData.trustSignals || {}

  // ── Fonts — uses brand's actual site fonts first ──
  const font = getFontPairing(brandTone, brandData)
  const df = `'${font.display}',Georgia,'Times New Roman',serif`
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`

  // ── Design tokens ──
  const ds = getDesignSystem(brandTone)
  const blockSelection = selectBlocks(emailType, brandTone, !!offer)
  const { variant, config: lv } = getLayoutVariant()

  // ── Testimonial ──
  const quote = realQuote && realQuote.length > 10
    ? realQuote
    : `The ${(brandData.productNames || [])[0] || brandData.productType} completely changed my routine. Unlike anything I've tried before.`
  const rawName = copy.testimonial_name || 'A verified customer'
  const brandLower = brandData.brandName.toLowerCase()
  const attribution = rawName.toLowerCase().includes(brandLower) ? 'A verified customer' : rawName

  // ── Section backgrounds ──
  const storyBg = lv.storyBgLight ? '#f5f3ef' : bgColor
  const isLuxury = brandTone === 'Luxury & refined' || brandTone === 'Minimalist'

  // ── Build sections ──

  // HEADER — always premium with nav
  const header = headerBlock_premium({ brandName: brandData.brandName, logoUrl, primaryColor, primaryTextColor, accentColor, navItems, df, bf })

  // DISCOUNT — welcome emails only
  const discount = isWelcome && offer
    ? (isLuxury
        ? discountBlock_elegant({ offer, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf })
        : discountBlock_bold({ offer, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf }))
    : ''

  // HERO
  const heroProps = { copy, heroImageUrl, primaryColor, primaryTextColor, accentColor, accentTextColor, df, bf, ds }
  let hero
  if (blockSelection.hero === 'impact') hero = heroBlock_impact(heroProps)
  else if (blockSelection.hero === 'warm') hero = heroBlock_warm(heroProps)
  else hero = heroBlock_editorial(heroProps)

  // TRUST BADGES — only renders if real data exists
  const trustBadges = trustBadgeBlock({ trustSignals, accentColor, accentTextColor, bf })

  // SPLIT SECTION — uses first scraped product image if available
  const splitProductImg = (brandData.scrapedImages && brandData.scrapedImages[0])
    ? brandData.scrapedImages[0].src
    : null
  const split = lv.splitSection
    ? splitBlock({ copy, productImage: splitProductImg, bgColor, accentForLightBg, accentColor, accentTextColor, df, bf, ds })
    : ''

  // PULL-QUOTE
  const pullQ = lv.pullQuote
    ? pullQuoteBlock({ copy, accentForLightBg, df, ds })
    : ''

  // STATEMENT
  const statement = lv.showStatement && !lv.splitSection
    ? statementBlock({ copy, accentColor, df, ds })
    : ''

  // STORY
  const storyProps = { copy, bgColor: storyBg, accentForLightBg, df, bf, ds }
  const story = blockSelection.story === 'editorial'
    ? storyBlock_editorial(storyProps)
    : storyBlock_standard(storyProps)

  // PRODUCTS
  let products = ''
  if (showProducts && topProducts && topProducts.length > 0) {
    const productProps = { products: topProducts, copy, bgColor, accentForLightBg, accentColor, accentTextColor, df, bf, ds, productCardBg: lv.productCardBg }
    const productStyle = blockSelection.products || 'grid3'
    if (productStyle === 'featured') products = productBlock_featured(productProps)
    else if (productStyle === 'minimal' || isPostPurchase) products = productBlock_minimal({ ...productProps, ctaLabel: 'LEARN MORE' })
    else products = productBlock_grid3(productProps)
  }

  // TESTIMONIAL
  const testimonialProps = { quote, attribution, accentColor, accentTextColor: isDark(accentColor) ? '#ffffff' : '#111111', primaryColor, df, bf, ds }
  const testimonial = blockSelection.testimonial === 'dark'
    ? testimonialBlock_dark(testimonialProps)
    : testimonialBlock_editorial(testimonialProps)

  // CTA BAND
  const ctaProps = { copy, offer, isWelcome, isDiscountEmail, accentColor, accentTextColor, primaryColor, df, bf, ds }
  let cta
  if (lv.ctaBgStyle === 'dark') cta = ctaBlock_dark(ctaProps)
  else if (blockSelection.cta === 'minimal') cta = ctaBlock_minimal(ctaProps)
  else if (blockSelection.cta === 'accent') cta = ctaBlock_accent(ctaProps)
  else cta = ctaBlock_filled(ctaProps)

  // DIVIDERS
  const useDividers = isLuxury || lv.dividers
  const dividerAccent = useDividers ? dividerBlock_accent({ accentColor, bgColor: primaryColor }) : ''
  const dividerMid = useDividers ? dividerBlock_subtle({ bgColor }) : ''

  // FOOTER
  const footer = footerBlock({ brandName: brandData.brandName, logoUrl, tagline: brandData.tagline, df, bf })

  // ── ASSEMBLY ORDER ────────────────────────────────────────────────────────
  const buildContent = () => {
    let c = ''
    c += trustBadges        // trust badges right after hero — real data only
    c += split              // split section if variant calls for it
    c += statement          // statement block on B/C if no split
    c += pullQ              // pull-quote

    if (lv.storyBeforeProducts) { c += story; c += products }
    else { c += products; c += story }

    if (lv.testimonialBeforeCta) { c += testimonial; c += cta }
    else { c += cta; c += testimonial }
    return c
  }

  let sections = header
  if (isWelcome) {
    sections += dividerAccent + discount + hero + dividerMid + buildContent()
  } else {
    sections += hero + buildContent()
  }
  sections += footer

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
<body style="margin:0;padding:20px 0;background:#e0ddd8;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">
    ${sections}
  </table>
</body>
</html>`
}
