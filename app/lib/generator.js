/**
 * MailForge Email Generator v17
 * Fixed: discount code only appears in emails where it belongs.
 */

// ─── FLOW GENERATOR ──────────────────────────────────────────────────────────

export async function generateFlow(brandData, flowType, offer, productImages, anthropic, generatedImages) {
  const flowConfigs = {
    'welcome': [
      { role: 'discount_delivery', label: 'Email 1 — Deliver the Code', sendTime: 'Send immediately', isPlainText: false, showProducts: true },
      { role: 'education', label: 'Email 2 — Educate', sendTime: 'Send 1 day later', isPlainText: false, showProducts: false },
      { role: 'founder', label: 'Email 3 — Founder Story', sendTime: 'Send 2 days later', isPlainText: true, showProducts: false },
      { role: 'urgency', label: 'Email 4 — Last Chance', sendTime: 'Send 3 days later', isPlainText: false, showProducts: false },
    ],
    'post-purchase': [
      { role: 'thank_you', label: 'Email 1 — Thank You', sendTime: 'Send right after purchase', isPlainText: false, showProducts: false },
      { role: 'how_to_use', label: 'Email 2 — How To Use It', sendTime: 'Send 1–2 days later', isPlainText: false, showProducts: false },
      { role: 'social_proof', label: 'Email 3 — Social Proof', sendTime: 'Send 3–5 days later', isPlainText: false, showProducts: true },
      { role: 'come_back', label: 'Email 4 — Come Back', sendTime: 'Send 7–14 days later', isPlainText: true, showProducts: false },
    ],
    'abandoned-cart': [
      { role: 'remind', label: 'Email 1 — Remind', sendTime: 'Send 1 hour after abandonment', isPlainText: false, showProducts: false },
      { role: 'build_trust', label: 'Email 2 — Build Trust', sendTime: 'Send 24 hours later', isPlainText: false, showProducts: false },
      { role: 'push', label: 'Email 3 — Push', sendTime: 'Send 48–72 hours later', isPlainText: false, showProducts: false },
    ],
  }

  const config = flowConfigs[flowType]
  if (!config) throw new Error(`Unknown flow type: ${flowType}`)

  const emails = []
  for (const step of config) {
    const email = step.isPlainText
      ? await generatePlainTextEmail(brandData, flowType, step.role, offer, anthropic)
      : await generateEmail(brandData, step.role, offer, productImages, anthropic, generatedImages, flowType, step.showProducts)

    emails.push({
      label: step.label,
      sendTime: step.sendTime,
      isPlainText: step.isPlainText,
      ...email,
    })
  }

  return emails
}

// ─── SINGLE EMAIL GENERATOR ───────────────────────────────────────────────────

export async function generateEmail(brandData, emailType, offer, productImages, anthropic, generatedImages, flowType = null, showProducts = true) {

  const isWelcome = emailType === 'Welcome email' || emailType === 'discount_delivery'
  const isAbandoned = emailType === 'Abandoned cart' || emailType === 'remind' || emailType === 'build_trust' || emailType === 'push'
  const isPostPurchase = emailType === 'Post-purchase' || emailType === 'thank_you' || emailType === 'how_to_use' || emailType === 'social_proof' || emailType === 'come_back'

  // Emails where discount code should appear in CTA band
  const isDiscountEmail = [
    'push', 'urgency', 'Flash sale', 'Win-back', 'Product launch', 'Abandoned cart'
  ].includes(emailType)

  let productImageUrl = null
  const cleanProductImage = productImages?.find(img => img.alt && img.alt.trim().length > 2)
  if (cleanProductImage) productImageUrl = cleanProductImage.src

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
    brandData, emailType, offer, topProducts, isWelcome, flowType, anthropic
  })

  const html = assembleEmail({
    brandData, emailType, offer, copy,
    fontPairing, primaryColor, accentColor, bgColor,
    primaryTextColor, accentTextColor, accentForLightBg,
    logoUrl, productImageUrl,
    topProducts, isWelcome, isAbandoned, isPostPurchase,
    showProducts, isDiscountEmail,
    realQuote: brandData.bestTestimonialQuote || null
  })

  return {
    subject_line: copy.subject_line,
    preview_text: copy.preview_text,
    html,
  }
}

// ─── PLAIN TEXT EMAIL ─────────────────────────────────────────────────────────

async function generatePlainTextEmail(brandData, flowType, role, offer, anthropic) {
  const roleInstructions = {
    'founder': `This is a plain-text founder email in the welcome flow. Looks like a personal Gmail.
- No design, no images, no buttons
- Write in first person from the founder
- Short, personal, authentic — max 150 words
- Tell a brief personal story about why they started the brand
- Reference the welcome offer naturally if it exists: ${offer || 'none'}
- End with a personal sign-off using a realistic founder first name`,

    'come_back': `This is a plain-text check-in email sent 7–14 days after purchase.
- No design, no images, no buttons
- Write in first person from customer success or the founder
- Short, caring, not salesy — max 120 words
- Ask how they're enjoying the product
- Offer help if they have questions
- Subtly mention complementary products: ${(brandData.productNames || []).join(', ')}
- End with a personal sign-off`,
  }

  const instructions = roleInstructions[role] || ''

  const prompt = `Write a plain-text email for ${brandData.brandName}.

BRAND:
- Name: ${brandData.brandName}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Voice: ${brandData.brandVoice || ''}
- Mission: ${brandData.missionStatement || ''}
- Offer: ${offer || 'none'}

INSTRUCTIONS:
${instructions}

Return this exact JSON:
{
  "subject_line": "...",
  "preview_text": "...",
  "body": "..."
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: `You are an expert email copywriter. Output ONLY valid JSON. No markdown. Start with { and end with }.`,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text.trim()
  let copy
  try { copy = JSON.parse(raw) } catch {
    try {
      const start = raw.indexOf('{')
      const end = raw.lastIndexOf('}')
      copy = JSON.parse(raw.substring(start, end + 1))
    } catch {
      throw new Error('Could not parse plain text email output')
    }
  }

  const html = assemblePlainTextEmail({ brandData, copy })
  return { subject_line: copy.subject_line, preview_text: copy.preview_text, html }
}

function assemblePlainTextEmail({ brandData, copy }) {
  const body = (copy.body || '').replace(/\n/g, '<br>')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:20px 0;background:#f5f5f5;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;background:#ffffff;padding:40px 48px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:#333333;"><tr><td>${body}<br><br><p style="margin:24px 0 0;font-size:12px;color:#aaaaaa;border-top:1px solid #eeeeee;padding-top:16px;"><a href="#" style="color:#aaaaaa;text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp; <a href="#" style="color:#aaaaaa;text-decoration:underline;">Manage preferences</a></p></td></tr></table></body></html>`
}

// ─── COPY GENERATION ─────────────────────────────────────────────────────────

async function generateCopyWithClaude({ brandData, emailType, offer, topProducts, isWelcome, flowType, anthropic }) {

  const systemPrompt = `You are an expert email copywriter for ecommerce brands. Output ONLY valid JSON. No markdown. Start with { and end with }.`

  const roleInstructions = {
    'discount_delivery': `
Email 1 of the welcome flow. Send immediately after signup.
- Deliver the discount code prominently
- Hero headline: warm welcome, max 6 words
- Hero subline: one sentence about the brand
- Story: brief brand intro, max 2 paragraphs, only real USPs
- CTA button: "SHOP NOW & SAVE" if offer exists, else "SHOP NOW"`,

    'education': `
Email 2 of the welcome flow. Send 1 day later.
- Goal: build trust and educate about the product
- No discount mention
- Hero headline: product benefit or education hook, max 6 words
- Story: product education, how it works, why it's different
- Use real product names: ${(brandData.productNames || []).join(', ')}
- CTA button: "SHOP NOW"`,

    'urgency': `
Email 4 of the welcome flow. Last chance. Send 3 days later.
- The discount is expiring — create urgency
- Hero headline: urgency about the offer expiring, max 6 words
- Hero subline: remind them what they'll lose
- Story: last reminder of key benefits, why they should buy now
- Offer: ${offer || 'welcome discount'}
- CTA button: "CLAIM MY DISCOUNT"
- Urgency line: "This offer expires today"`,

    'thank_you': `
Email 1 of the post-purchase flow. Send right after purchase.
- Tone: celebratory, warm, reassuring
- Hero headline: celebrate, max 6 words
- Story: welcome them, tell brand story briefly, make them feel they made the right choice
- CTA button: "TRACK MY ORDER"
- No discount code anywhere in this email`,

    'how_to_use': `
Email 2 of the post-purchase flow. Send 1–2 days later.
- Goal: teach them how to use the product. NO selling. NO discount.
- Hero headline: about using the product, max 6 words
- Story: 2-3 specific tips on how to use ${(brandData.productNames || [])[0] || brandData.productType}
- CTA button: "VISIT OUR BLOG"`,

    'social_proof': `
Email 3 of the post-purchase flow. Send 3–5 days later.
- Show real reviews and suggest complementary products. NO discount.
- Hero headline: social proof focused, max 6 words
- Story: reviews and community
- product_label: "YOU MIGHT ALSO LOVE"
- product_headline: complementary products from: ${(brandData.productNames || []).join(', ')}
- CTA button: "SHOP MORE"`,

    'remind': `
Email 1 of the abandoned cart flow. Send 1 hour after abandonment.
- Just remind them. No discount. One clear CTA.
- Hero headline: cart is waiting, max 6 words
- Hero subline: name these specific products: ${topProducts.map(p => p.name).join(', ')}
- Story: 1 short paragraph — emotional connection to the product
- CTA button: "COMPLETE MY ORDER"
- Urgency line: "Items in your cart may sell out"`,

    'build_trust': `
Email 2 of the abandoned cart flow. Send 24 hours later.
- Remove doubt. Show reviews. Answer objections. NO discount.
- Hero headline: trust-building, max 6 words
- Story: address common objections, show social proof
- Use real USPs: ${(brandData.keySellingPoints || []).join(', ')}
- CTA button: "COMPLETE MY ORDER"`,

    'push': `
Email 3 of the abandoned cart flow. Send 48–72 hours later.
- Final push with urgency. Now reveal the discount if one exists.
- Hero headline: urgency, max 6 words
- Story: final push — urgency, scarcity, discount reveal
- Offer: ${offer || 'none — use urgency instead'}
- CTA button: "COMPLETE MY ORDER"
- Urgency line: "This is your last reminder"`,

    'Welcome email': `
Welcome email #1.
- Deliver the discount code prominently
- Hero headline: warm welcome, max 6 words
- Story: brief brand intro using only real USPs
- CTA button: "SHOP NOW & SAVE" if offer exists, else "SHOP NOW"`,

    'Abandoned cart': `
Abandoned cart email. Send 30 minutes after abandonment.
- No discount — mystery mechanic
- Hero headline: cart is waiting, max 6 words
- Hero subline: reference these products: ${topProducts.map(p => p.name).join(', ')}
- Story: emotional connection + mystery offer hint
- CTA button: "COMPLETE MY ORDER"`,

    'Post-purchase': `
Post-purchase thank you email.
- Tone: celebratory, warm. No discount.
- Hero headline: celebrate purchase, max 6 words
- Story: what happens next, care tips
- CTA button: "TRACK MY ORDER"`,

    'Flash sale': `
Flash sale promotional email.
- Tone: urgent, exciting
- Hero headline: offer or urgency, max 6 words
- Offer: ${offer || 'limited time discount'}
- CTA button: "SHOP THE SALE"
- Urgency line: "Sale ends soon"`,

    'Win-back': `
Win-back email for inactive subscribers.
- Tone: honest, warm
- Hero headline: acknowledge time away, max 6 words
- Story: what's changed, reason to return
- CTA button: "COME BACK & SAVE" if offer, else "SEE WHAT'S NEW"`,

    'Product launch': `
Product launch announcement.
- Tone: excited, visionary
- Hero headline: announce new product, max 6 words
- Story: vision, what makes it different
- CTA button: "SHOP THE NEW COLLECTION"`,
  }

  const instructions = roleInstructions[emailType] || ''

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

EMAIL INSTRUCTIONS:
${instructions}

GLOBAL RULES:
- Only use information provided above. Never invent facts or details.
- Write in the brand voice. Be specific to the niche and products.
- Keep headlines punchy and short (max 8 words).
- Keep paragraphs to 2-3 sentences max.
- testimonial_name must be a realistic customer first name and last initial only (e.g. "James R."). NEVER use the brand name.

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

// ─── EMAIL ASSEMBLY ───────────────────────────────────────────────────────────

function assembleEmail({ brandData, emailType, offer, copy, fontPairing, primaryColor, accentColor, bgColor, primaryTextColor, accentTextColor, accentForLightBg, logoUrl, productImageUrl, topProducts, isWelcome, isAbandoned, isPostPurchase, showProducts, isDiscountEmail, realQuote }) {

  const df = `'${fontPairing.display}',Georgia,'Times New Roman',serif`
  const bf = `'${fontPairing.body}',Arial,Helvetica,sans-serif`
  const offerUpper = offer ? offer.toUpperCase() : ''

  function headerBlock() {
    const content = logoUrl
      ? `<img src="${logoUrl}" height="60" style="display:block;height:60px;width:auto;margin:0 auto;border:0;" alt="${brandData.brandName}">`
      : `<span style="font-family:${df};font-size:20px;letter-spacing:6px;text-transform:uppercase;color:${primaryTextColor};">${brandData.brandName}</span>`
    return `<tr><td bgcolor="${primaryColor}" style="padding:20px 40px;text-align:center;">${content}</td></tr>`
  }

  function discountBlock() {
    if (!offer) return ''
    return `
<tr><td style="padding:24px 40px 12px;text-align:center;" bgcolor="${primaryColor}">
  <p style="margin:0 0 10px;font-family:${bf};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${primaryTextColor};opacity:0.7;">YOUR WELCOME GIFT</p>
  <div style="display:inline-block;background:rgba(255,255,255,0.15);border:2px dashed rgba(255,255,255,0.45);padding:14px 40px;margin:0 auto 10px;">
    <span style="font-family:${df};font-size:34px;letter-spacing:10px;text-transform:uppercase;color:${primaryTextColor};">${offerUpper}</span>
  </div>
  <p style="margin:8px 0 0;font-family:${bf};font-size:13px;color:${primaryTextColor};opacity:0.7;">Apply this code at checkout</p>
</td></tr>`
  }

  function heroCopyBlock() {
    const padding = isWelcome ? '32px 48px 48px' : '56px 48px'
    return `
<tr><td bgcolor="${primaryColor}" style="padding:${padding};text-align:center;">
  <h1 style="margin:0 0 14px;font-family:${df};font-size:46px;font-weight:700;line-height:1.1;color:${primaryTextColor};">${copy.hero_headline || ''}</h1>
  <p style="margin:0 0 28px;font-family:${bf};font-size:17px;line-height:1.6;color:${primaryTextColor};opacity:0.85;">${copy.hero_subline || ''}</p>
  <a href="#" style="display:inline-block;background:${accentColor};color:${accentTextColor};font-family:${bf};font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:16px 48px;border-radius:2px;">${copy.cta_button || 'SHOP NOW'}</a>
</td></tr>`
  }

  function productGridBlock() {
    if (!showProducts || topProducts.length === 0) return ''
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
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${cells}</tr></table>
</td></tr>`
  }

  function postPurchaseProductBlock() {
    if (!showProducts || topProducts.length === 0) return ''
    const colWidth = topProducts.length === 1 ? 480 : topProducts.length === 2 ? 260 : 170
    const cells = topProducts.map(p => `
      <td width="${colWidth}" style="padding:8px;text-align:center;vertical-align:top;">
        <img src="${p.src}" width="${colWidth - 16}" style="display:block;margin:0 auto 10px;max-width:100%;border:0;border-radius:4px;" alt="${p.name}">
        <p style="margin:0 0 6px;font-family:${bf};font-size:13px;font-weight:600;color:#111111;">${p.name}</p>
        <a href="#" style="font-family:${bf};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${accentForLightBg};text-decoration:none;">LEARN MORE</a>
      </td>`).join('')
    return `
<tr><td bgcolor="${bgColor}" style="padding:48px 32px;">
  <p style="margin:0 0 8px;font-family:${bf};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${accentForLightBg};text-align:center;">${copy.product_label || 'YOU MIGHT ALSO LOVE'}</p>
  <h2 style="margin:0 0 28px;font-family:${df};font-size:28px;font-weight:700;color:#111111;text-align:center;">${copy.product_headline || 'Complete Your Collection'}</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${cells}</tr></table>
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

  function socialProofBlock() {
    const quote = realQuote && realQuote.length > 10
      ? realQuote
      : `The ${(brandData.productNames || [])[0] || brandData.productType} completely changed my routine. The quality is unlike anything I've tried before.`
    const rawName = copy.testimonial_name || 'James R.'
    const brandLower = brandData.brandName.toLowerCase()
    const attribution = rawName.toLowerCase().includes(brandLower) ? 'James R.' : rawName
    return `
<tr><td bgcolor="#111111" style="padding:56px 48px;text-align:center;">
  <p style="margin:0 0 16px;font-family:${df};font-size:64px;line-height:0.6;color:${accentColor};">"</p>
  <p style="margin:0 0 20px;font-family:${df};font-size:22px;font-style:italic;line-height:1.6;color:#ffffff;">${quote}</p>
  <p style="margin:0 0 12px;font-family:${bf};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);">— ${attribution}, VERIFIED CUSTOMER</p>
  <p style="margin:0;font-size:20px;color:${accentColor};">★★★★★</p>
</td></tr>`
  }

  function ctaBandBlock() {
    const hasDiscount = offer && isDiscountEmail
    const urgency = isWelcome && offer
      ? `Code <strong>${offerUpper}</strong> expires in 48 hours`
      : copy.urgency_line || ''
    return `
<tr><td bgcolor="${accentColor}" style="padding:56px 48px;text-align:center;">
  <h2 style="margin:0 0 24px;font-family:${df};font-size:34px;font-weight:700;line-height:1.2;color:${accentTextColor};">${copy.cta_headline || ''}</h2>
  ${hasDiscount ? `<div style="display:inline-block;background:rgba(255,255,255,0.2);border:2px dashed rgba(255,255,255,0.5);padding:12px 36px;margin:0 0 24px;"><span style="font-family:${df};font-size:28px;letter-spacing:6px;color:${accentTextColor};">${offerUpper}</span></div><br>` : ''}
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
  } else if (isPostPurchase) {
    sections += heroCopyBlock()
    sections += storyBlock()
    sections += postPurchaseProductBlock()
    sections += socialProofBlock()
    sections += ctaBandBlock()
  } else {
    sections += heroCopyBlock()
    sections += storyBlock()
    sections += productGridBlock()
    sections += socialProofBlock()
    sections += ctaBandBlock()
  }

  sections += footerBlock()

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@import url('${fontPairing.importUrl}');a{text-decoration:none;}img{border:0;}</style></head><body style="margin:0;padding:20px 0;background:#e8e8e8;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">${sections}</table></body></html>`
}

// ─── FONT PAIRINGS ────────────────────────────────────────────────────────────

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
