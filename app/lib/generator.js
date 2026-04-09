/**
 * MailForge Email Generator v12
 * Welcome email: no hero image — cleaner, more focused layout.
 * Other email types: hero image from scraped product images.
 */

export async function generateEmail(brandData, emailType, offer, productImages, anthropic, generatedImages) {

  const hasGeneratedImages = generatedImages && generatedImages.length > 0
  const hasScrapedImages = productImages && productImages.length > 0

  let heroImageUrl = null
  let productImageUrl = null

  if (hasGeneratedImages) {
    heroImageUrl = generatedImages.find(i => i.type === 'hero')?.url
    productImageUrl = generatedImages.find(i => i.type === 'product')?.url
  }

  const isWelcome = emailType === 'Welcome email'
  if (!isWelcome) {
    if (!heroImageUrl && hasScrapedImages) heroImageUrl = productImages[0]?.src
  }
  if (!productImageUrl && hasScrapedImages) productImageUrl = productImages[0]?.src

  const fontPairing = getFontPairing(brandData.brandTone)
  const logoUrl = brandData.logoUrl || null

  function isDark(hex) {
    const h = (hex || '#000000').replace('#', '')
    if (h.length < 6) return true
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 < 128
  }

  function darkenColor(hex) {
    const h = (hex || '#000000').replace('#', '')
    if (h.length < 6) return '#111111'
    let r = parseInt(h.slice(0,2),16)
    let g = parseInt(h.slice(2,4),16)
    let b = parseInt(h.slice(4,6),16)
    r = Math.floor(r * 0.45)
    g = Math.floor(g * 0.45)
    b = Math.floor(b * 0.45)
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')
  }

  const primaryColor = brandData.primaryColor || '#111111'
  const accentColor = brandData.accentColor || '#FFD25F'
  const bgColor = brandData.backgroundColor || '#ffffff'
  const primaryTextColor = isDark(primaryColor) ? '#ffffff' : '#111111'
  const accentTextColor = isDark(accentColor) ? '#ffffff' : '#111111'
  const accentForLightBg = isDark(accentColor) ? accentColor : darkenColor(accentColor)

  const realProducts = []
  if (productImages && productImages.length > 0) {
    productImages.forEach(img => {
      if (img.alt && img.alt.trim().length > 2) {
        realProducts.push({ src: img.src, name: img.alt.trim() })
      }
    })
  }
  const topProducts = realProducts.slice(0, 3)

  const copy = await generateCopyWithClaude({
    brandData, emailType, offer, fontPairing,
    primaryColor, accentColor, primaryTextColor, accentTextColor,
    topProducts, isWelcome, anthropic
  })

  const html = assembleEmail({
    brandData, emailType, offer, copy,
    fontPairing, primaryColor, accentColor, bgColor,
    primaryTextColor, accentTextColor, accentForLightBg,
    logoUrl, heroImageUrl, productImageUrl,
    topProducts, isWelcome,
    realQuote: brandData.bestTestimonialQuote || null
  })

  return {
    subject_line: copy.subject_line,
    preview_text: copy.preview_text,
    html,
  }
}

async function generateCopyWithClaude({ brandData, emailType, offer, fontPairing, primaryColor, accentColor, primaryTextColor, accentTextColor, topProducts, isWelcome, anthropic }) {

  const systemPrompt = `You are an expert email copywriter for ecommerce brands. Output ONLY valid JSON. No markdown. Start with { and end with }.`

  const prompt = `Write copy for a ${emailType} email for ${brandData.brandName}.

BRAND:
- Name: ${brandData.brandName}
- Tagline: ${brandData.tagline || ''}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Voice: ${brandData.brandVoice || ''}
- USPs: ${(brandData.keySellingPoints || []).join(', ')}
- Products: ${(brandData.productNames || []).join(', ')}
- Mission: ${brandData.missionStatement || ''}
- Offer: ${offer || 'none'}

RULES:
- Only use information provided above. Never invent facts, statistics, or details.
- Write in the brand voice. Be specific to the niche and products.
- Keep headlines punchy and short (max 8 words).
- Keep paragraphs to 2-3 sentences max.
${isWelcome ? `- Welcome email #1: primary goal is to deliver the discount code and make it easy to shop. Brand intro should be brief.` : ''}

Return this exact JSON:
{
  "subject_line": "...",
  "preview_text": "...",
  "hero_headline": "...",
  "hero_subline": "...",
  "story_label": "...",
  "story_headline": "...",
  "story_p1": "...",
  "story_p2": "...",
  "story_p3": "...",
  "product_label": "...",
  "product_headline": "...",
  "cta_headline": "...",
  "cta_button": "...",
  "urgency_line": "...",
  "testimonial_name": "..."
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text.trim()
  try { return JSON.parse(raw) } catch {}
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(cleaned)
  } catch {}
  try {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start !== -1 && end !== -1) return JSON.parse(raw.substring(start, end + 1))
  } catch {}
  throw new Error('Could not parse copy output. Please try again.')
}

function assembleEmail({ brandData, emailType, offer, copy, fontPairing, primaryColor, accentColor, bgColor, primaryTextColor, accentTextColor, accentForLightBg, logoUrl, heroImageUrl, productImageUrl, topProducts, isWelcome, realQuote }) {

  const df = `'${fontPairing.display}',Georgia,'Times New Roman',serif`
  const bf = `'${fontPairing.body}',Arial,Helvetica,sans-serif`

  function headerBlock() {
    const content = logoUrl
      ? `<img src="${logoUrl}" height="60" style="display:block;height:60px;width:auto;margin:0 auto;border:0;" alt="${brandData.brandName}">`
      : `<span style="font-family:${df};font-size:20px;letter-spacing:6px;text-transform:uppercase;color:${primaryTextColor};">${brandData.brandName}</span>`
    return `<tr><td bgcolor="${primaryColor}" style="padding:20px 40px;text-align:center;">${content}</td></tr>`
  }

  function heroImageBlock() {
    if (!heroImageUrl) return ''
    return `<tr><td style="padding:0;margin:0;line-height:0;font-size:0;" bgcolor="${primaryColor}"><img src="${heroImageUrl}" width="600" style="display:block;width:600px;max-width:100%;border:0;line-height:100%;outline:none;" alt="${brandData.brandName}"></td></tr>`
  }

  function discountBlock() {
    if (!offer) return ''
    return `
<tr><td style="padding:24px 40px 12px;text-align:center;" bgcolor="${primaryColor}">
  <p style="margin:0 0 10px;font-family:${bf};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${primaryTextColor};opacity:0.7;">YOUR WELCOME GIFT</p>
  <div style="display:inline-block;background:rgba(255,255,255,0.15);border:2px dashed rgba(255,255,255,0.45);padding:14px 40px;margin:0 auto 10px;">
    <span style="font-family:${df};font-size:34px;letter-spacing:10px;text-transform:uppercase;color:${primaryTextColor};">${offer}</span>
  </div>
  <p style="margin:8px 0 0;font-family:${bf};font-size:13px;color:${primaryTextColor};opacity:0.7;">Apply this code at checkout</p>
</td></tr>`
  }

  function heroCopyBlock() {
    return `
<tr><td bgcolor="${primaryColor}" style="padding:${isWelcome ? '32px 48px 48px' : '56px 48px'};text-align:center;">
  <h1 style="margin:0 0 14px;font-family:${df};font-size:46px;font-weight:700;line-height:1.1;color:${primaryTextColor};">${copy.hero_headline || ''}</h1>
  <p style="margin:0 0 28px;font-family:${bf};font-size:17px;line-height:1.6;color:${primaryTextColor};opacity:0.85;">${copy.hero_subline || ''}</p>
  <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:16px 48px;border-radius:2px;">${copy.cta_button || 'SHOP NOW'}</a>
</td></tr>`
  }

  function productGridBlock() {
    if (topProducts.length === 0) return ''
    const colWidth = topProducts.length === 1 ? 480 : topProducts.length === 2 ? 260 : 170
    const cells = topProducts.map(p => `
      <td width="${colWidth}" style="padding:8px;text-align:center;vertical-align:top;">
        <img src="${p.src}" width="${colWidth - 16}" style="display:block;margin:0 auto 10px;max-width:100%;border:0;border-radius:4px;" alt="${p.name}">
        <p style="margin:0 0 6px;font-family:${bf};font-size:13px;font-weight:600;color:#111111;">${p.name}</p>
        <a href="#" style="font-family:${bf};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${accentForLightBg};text-decoration:none;">SHOP NOW</a>
      </td>`).join('')

    return `
<tr><td bgcolor="${bgColor}" style="padding:48px 32px;">
  <p style="margin:0 0 8px;font-family:${bf};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};text-align:center;">${copy.product_label || 'FEATURED PRODUCTS'}</p>
  <h2 style="margin:0 0 28px;font-family:${df};font-size:28px;font-weight:700;color:#111111;text-align:center;">${copy.product_headline || ''}</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>${cells}</tr>
  </table>
</td></tr>`
  }

  function storyBlock() {
    return `
<tr><td bgcolor="#ffffff" style="padding:56px 48px;">
  <p style="margin:0 0 10px;font-family:${bf};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};">${copy.story_label || 'OUR STORY'}</p>
  <h2 style="margin:0 0 24px;font-family:${df};font-size:32px;font-weight:700;line-height:1.2;color:#111111;">${copy.story_headline || ''}</h2>
  <p style="margin:0 0 16px;font-family:${bf};font-size:15px;line-height:1.8;color:#555555;">${copy.story_p1 || ''}</p>
  <p style="margin:0 0 16px;font-family:${bf};font-size:15px;line-height:1.8;color:#555555;">${copy.story_p2 || ''}</p>
  ${copy.story_p3 ? `<p style="margin:0;font-family:${bf};font-size:15px;line-height:1.8;color:#555555;">${copy.story_p3}</p>` : ''}
</td></tr>`
  }

  function productImageBlock() {
    if (!productImageUrl) return ''
    return `
<tr><td bgcolor="${bgColor}" style="padding:48px 40px;text-align:center;">
  <img src="${productImageUrl}" width="480" style="display:block;margin:0 auto;max-width:100%;border:0;" alt="${brandData.productType}">
</td></tr>`
  }

  function socialProofBlock() {
    const quote = realQuote && realQuote.length > 10
      ? realQuote
      : `The ${(brandData.productNames || [])[0] || brandData.productType} completely changed my routine. The quality is unlike anything I've tried before.`
    const attribution = copy.testimonial_name || 'Sarah M.'
    return `
<tr><td bgcolor="#111111" style="padding:56px 48px;text-align:center;">
  <p style="margin:0 0 16px;font-family:${df};font-size:64px;line-height:0.6;color:${accentColor};">"</p>
  <p style="margin:0 0 20px;font-family:${df};font-size:22px;font-style:italic;line-height:1.6;color:#ffffff;">${quote}</p>
  <p style="margin:0 0 12px;font-family:${bf};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);">— ${attribution}, VERIFIED CUSTOMER</p>
  <p style="margin:0;font-size:20px;color:${accentColor};">★★★★★</p>
</td></tr>`
  }

  function ctaBandBlock() {
    const hasDiscount = offer && !isWelcome
    const urgency = isWelcome && offer
      ? `Code <strong>${offer}</strong> expires in 48 hours`
      : copy.urgency_line || ''
    return `
<tr><td bgcolor="${accentColor}" style="padding:56px 48px;text-align:center;">
  <h2 style="margin:0 0 24px;font-family:${df};font-size:34px;font-weight:700;line-height:1.2;color:${accentTextColor};">${copy.cta_headline || ''}</h2>
  ${hasDiscount ? `<div style="display:inline-block;background:rgba(255,255,255,0.2);border:2px dashed rgba(255,255,255,0.5);padding:12px 36px;margin:0 0 24px;"><span style="font-family:${df};font-size:28px;letter-spacing:6px;color:${accentTextColor};">${offer}</span></div><br>` : ''}
  <a href="#" style="display:inline-block;background:#ffffff;color:${primaryColor};font-family:${bf};font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:18px 56px;border-radius:2px;">${copy.cta_button || 'SHOP NOW'}</a>
  ${urgency ? `<p style="margin:16px 0 0;font-family:${bf};font-size:13px;color:${accentTextColor};opacity:0.8;">${urgency}</p>` : ''}
</td></tr>`
  }

  function footerBlock() {
    const logoContent = logoUrl
      ? `<img src="${logoUrl}" height="40" style="display:block;height:40px;width:auto;margin:0 auto 10px;border:0;" alt="${brandData.brandName}">`
      : `<p style="margin:0 0 8px;font-family:${df};font-size:18px;letter-spacing:5px;text-transform:uppercase;color:#ffffff;">${brandData.brandName}</p>`
    return `
<tr><td bgcolor="#0a0a0a" style="padding:40px 32px;text-align:center;">
  ${logoContent}
  <p style="margin:0 0 16px;font-family:${bf};font-size:12px;color:rgba(255,255,255,0.4);">${brandData.tagline || ''}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid rgba(255,255,255,0.1);font-size:0;line-height:0;">&nbsp;</td></tr></table>
  <p style="margin:16px 0 0;font-family:${bf};font-size:11px;color:rgba(255,255,255,0.25);">
    <a href="#" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp;
    <a href="#" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Manage preferences</a>
  </p>
</td></tr>`
  }

  let sections = ''
  sections += headerBlock()

  if (isWelcome) {
    sections += discountBlock()
    sections += heroCopyBlock()
    sections += productGridBlock()
    sections += storyBlock()
    sections += socialProofBlock()
    sections += ctaBandBlock()
  } else {
    sections += heroImageBlock()
    sections += heroCopyBlock()
    sections += storyBlock()
    sections += topProducts.length > 0 ? productGridBlock() : productImageBlock()
    sections += socialProofBlock()
    sections += ctaBandBlock()
  }

  sections += footerBlock()

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@import url('${fontPairing.importUrl}');a{text-decoration:none;}img{border:0;}</style></head><body style="margin:0;padding:20px 0;background:#e8e8e8;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">${sections}</table></body></html>`
}

function getFontPairing(tone) {
  const pairings = {
    'Luxury & refined': {
      display: 'Cormorant Garamond',
      body: 'Raleway',
      importUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Raleway:wght@300;400;500&display=swap'
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
