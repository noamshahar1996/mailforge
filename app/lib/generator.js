/**
 * MailForge Email Generator v9
 * - Logo in header (ogImage, max 60px tall)
 * - Welcome email: correct structure (code → products → brand intro → social proof)
 * - All types: no fake data, real product images, text contrast fix
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
  if (!heroImageUrl && hasScrapedImages) heroImageUrl = productImages[0]?.src
  if (!productImageUrl && hasScrapedImages && productImages.length > 1) productImageUrl = productImages[1]?.src

  const fontPairing = getFontPairing(brandData.brandTone)
  const isWelcome = emailType === 'Welcome email'
  const logoUrl = brandData.logoUrl || null

  // Text contrast: check if a color is dark enough for white text
  function isDark(hex) {
    const h = hex.replace('#', '')
    if (h.length < 6) return true
    const r = parseInt(h.slice(0,2),16)
    const g = parseInt(h.slice(2,4),16)
    const b = parseInt(h.slice(4,6),16)
    return (r * 299 + g * 587 + b * 114) / 1000 < 128
  }

  const primaryIsDark = isDark(brandData.primaryColor || '#000000')
  const accentIsDark = isDark(brandData.accentColor || '#000000')
  const primaryTextColor = primaryIsDark ? '#ffffff' : '#111111'
  const accentTextColor = accentIsDark ? '#ffffff' : '#111111'

  // Build real product list from scraped data
  const realProducts = []
  if (productImages && productImages.length > 0) {
    productImages.slice(0, 3).forEach(img => {
      if (img.alt && img.alt.length > 2) {
        realProducts.push({ src: img.src, name: img.alt })
      }
    })
  }

  const realQuote = brandData.bestTestimonialQuote && brandData.bestTestimonialQuote.length > 10
    ? `USE THIS EXACT REAL CUSTOMER QUOTE: "${brandData.bestTestimonialQuote}"`
    : null

  const systemPrompt = `You are a senior email designer at a top agency. Output ONLY valid JSON. Never use markdown code blocks. Your response must start with { and end with }.
CRITICAL: Write compact HTML. No comments, no blank lines, no unnecessary whitespace. Every byte counts. The entire email must be complete and valid.
CRITICAL: Never invent data. Only use information explicitly provided. No fake addresses, fake review counts, or fabricated statistics.`

  // Build the prompt differently for welcome vs other types
  const emailStructure = isWelcome
    ? buildWelcomeStructure({ brandData, offer, logoUrl, heroImageUrl, realProducts, realQuote, fontPairing, primaryTextColor, accentTextColor })
    : buildStandardStructure({ brandData, emailType, offer, logoUrl, heroImageUrl, productImageUrl, realProducts, realQuote, fontPairing, primaryTextColor, accentTextColor })

  const userPrompt = `Design a premium HTML email for ${brandData.brandName}.

BRAND DATA (only use what is provided here — do not invent anything):
- Name: ${brandData.brandName}
- Tagline: ${brandData.tagline || ''}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Voice: ${brandData.brandVoice || ''}
- USPs: ${(brandData.keySellingPoints || []).join(', ')}
- Primary color: ${brandData.primaryColor} (text on this: ${primaryTextColor})
- Accent color: ${brandData.accentColor} (text on this: ${accentTextColor})
- Background: ${brandData.backgroundColor || '#ffffff'}
- Product names: ${(brandData.productNames || []).join(', ')}
- Mission: ${brandData.missionStatement || ''}
- Avg order value: ${brandData.avgOrderValue || ''}

EMAIL TYPE: ${emailType}
OFFER: ${offer || 'none'}

LOGO URL: ${logoUrl || 'NONE'}
HERO IMAGE URL: ${heroImageUrl || 'NONE'}
PRODUCT IMAGES AVAILABLE: ${realProducts.map(p => `${p.name}: ${p.src}`).join(' | ') || 'none'}

FONTS:
@import url('${fontPairing.importUrl}');
Display font: ${fontPairing.display}
Body font: ${fontPairing.body}

GLOBAL RULES:
1. Wrapper table: <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">
2. All section backgrounds: use bgcolor attribute on <td>, not CSS background-color
3. Headlines: font-family:'${fontPairing.display}',Georgia,serif
4. Body text: font-family:'${fontPairing.body}',Arial,sans-serif
5. NEVER use white text on light backgrounds. NEVER use dark text on dark backgrounds. Always use the text colors specified above.
6. NEVER invent addresses, phone numbers, review counts, or statistics not provided in brand data
7. Hero image: <img src="[URL]" width="600" style="display:block;width:600px;max-width:100%;border:0;" alt="${brandData.brandName}"> inside <td style="padding:0;margin:0;line-height:0;font-size:0;">
8. Logo in header: <img src="[LOGO_URL]" height="60" style="display:block;height:60px;width:auto;margin:0 auto;border:0;" alt="${brandData.brandName}">
9. If logo URL is NONE, use brand name as text instead: 20px, letter-spacing:6px, uppercase

${emailStructure}

Return JSON: {"subject_line":"...","preview_text":"...","html":"..."}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
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
  throw new Error('Could not parse email output. Please try again.')
}

function buildWelcomeStructure({ brandData, offer, logoUrl, heroImageUrl, realProducts, realQuote, fontPairing, primaryTextColor, accentTextColor }) {
  const hasCode = offer && offer.length > 0
  const hasProducts = realProducts.length > 0

  return `EMAIL STRUCTURE — WELCOME EMAIL #1:
This is the first email a subscriber receives after signing up. Primary goal: deliver the discount code and make it easy to shop.

SECTION 1 — HEADER
bgcolor="${brandData.primaryColor}"
padding: 20px 40px
${logoUrl ? `Logo: <img src="${logoUrl}" height="60" style="display:block;height:60px;width:auto;margin:0 auto;border:0;" alt="${brandData.brandName}">` : `Brand name: 20px, letter-spacing:6px, uppercase, color:${primaryTextColor}, centered`}

SECTION 2 — HERO (discount delivery)
${heroImageUrl ? `Row 1: Full-width hero image, NO padding
<tr><td style="padding:0;margin:0;line-height:0;font-size:0;" bgcolor="${brandData.primaryColor}"><img src="${heroImageUrl}" width="600" style="display:block;width:600px;max-width:100%;border:0;" alt="${brandData.brandName}"></td></tr>` : ''}
Row 2: bgcolor="${brandData.primaryColor}", padding:48px 40px, text-align:center
- Small label: 11px, letter-spacing:4px, uppercase, color:${accentTextColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'} — "YOUR WELCOME GIFT"
${hasCode ? `- Discount code box: display:inline-block, background:rgba(255,255,255,0.15), border:2px dashed rgba(255,255,255,0.4), padding:16px 40px, margin:16px 0, font-family:'${fontPairing.display}',Georgia,serif, font-size:36px, color:${primaryTextColor}, letter-spacing:10px — showing: "${offer}"
- Line below code: 13px, color:${primaryTextColor}, opacity:0.7, margin-bottom:28px — "Copy this code — use it at checkout"` : ''}
- Headline: display font, 42px, color:${primaryTextColor}, bold, line-height:1.1, margin:0 0 12px
- Subline: body font, 16px, color:${primaryTextColor}, opacity:0.8, margin:0 0 28px — one sentence max, use real tagline or USP
- CTA button: bgcolor="${brandData.accentColor}", color:${accentTextColor}, padding:16px 48px, body font, 13px, bold, letter-spacing:3px, uppercase, border-radius:2px — "SHOP NOW"

${hasProducts ? `SECTION 3 — FEATURED PRODUCTS
bgcolor="${brandData.backgroundColor || '#f5f5f5'}"
padding:48px 32px, text-align:center
Label: 11px, letter-spacing:4px, uppercase, color:${brandData.accentColor} — "MADE FOR YOUR CRAFT" or similar using brand niche
H2: display font, 28px, #111111 — use a real product category or benefit phrase from the brand data
Product grid: show ${realProducts.length} products side by side in a table row
Each product cell:
- Image: <img src="[product src]" width="${realProducts.length === 1 ? '400' : realProducts.length === 2 ? '240' : '160'}" style="display:block;margin:0 auto 12px;max-width:100%;border:0;" alt="[product name]">
- Product name: body font, 13px, #111111, font-weight:600, margin-bottom:8px — use EXACT name: ${realProducts.map(p => `"${p.name}"`).join(', ')}
- Shop link: body font, 12px, color:${brandData.accentColor}, letter-spacing:2px, uppercase — "SHOP NOW"
Real product image URLs to use in order: ${realProducts.map((p,i) => `${i+1}. ${p.src}`).join(' | ')}` : `SECTION 3 — BRAND INTRO
bgcolor="${brandData.backgroundColor || '#f5f5f5'}"
padding:48px 40px, text-align:center
Label: 11px, letter-spacing:4px, uppercase, color:${brandData.accentColor}
H2: display font, 28px, #111111
2 short paragraphs: body font, 15px, #555555, line-height:1.7
Use ONLY these real USPs: ${(brandData.keySellingPoints || []).join(', ')}`}

SECTION 4 — BRAND INTRO (keep short)
bgcolor="#ffffff"
padding:48px 40px
Label: 11px, letter-spacing:4px, uppercase, color:${brandData.accentColor}
H2: display font, 28px, #111111 — use mission or main USP
2 paragraphs MAX: body font, 15px, #555555, line-height:1.7
ONLY use: tagline "${brandData.tagline}", mission "${brandData.missionStatement}", USPs: ${(brandData.keySellingPoints || []).join(', ')}
Do NOT invent any story, history, or details not listed above.

${realQuote ? `SECTION 5 — SOCIAL PROOF
bgcolor="#111111"
padding:48px 40px, text-align:center
Quote mark: display font, 60px, ${brandData.accentColor}
Quote: display font, 22px, italic, white, line-height:1.5 — ${realQuote}
Stars: ★★★★★ color:${brandData.accentColor}` : ''}

SECTION ${realQuote ? '6' : '5'} — FOOTER
bgcolor="#0a0a0a"
padding:40px 32px, text-align:center
${logoUrl ? `Logo: <img src="${logoUrl}" height="40" style="display:block;height:40px;width:auto;margin:0 auto 12px;border:0;" alt="${brandData.brandName}">` : `Brand name: display font, 18px, white, letter-spacing:5px, uppercase`}
Tagline: body font, 12px, rgba(255,255,255,0.4) — use real tagline: "${brandData.tagline}"
HR: border-top:1px solid rgba(255,255,255,0.1), margin:20px 0
Unsubscribe: 11px, rgba(255,255,255,0.25) — "Unsubscribe · Manage preferences"
DO NOT include any address or contact details.`
}

function buildStandardStructure({ brandData, emailType, offer, logoUrl, heroImageUrl, productImageUrl, realProducts, realQuote, fontPairing, primaryTextColor, accentTextColor }) {
  const isAbandoned = emailType === 'Abandoned cart'
  const isPostPurchase = emailType === 'Post-purchase'
  const isWinback = emailType === 'Win-back'
  const isFlashSale = emailType === 'Flash sale'
  const isLaunch = emailType === 'Product launch'

  const storyGuidance = isAbandoned
    ? `Remind them what they left behind. Use product names: ${(brandData.productNames || []).join(', ')}. Create emotional connection to the craft. No invented details.`
    : isPostPurchase
    ? `Celebrate their purchase. Tell them what to expect. Use real USPs: ${(brandData.keySellingPoints || []).join(', ')}. Invite them into the community.`
    : isWinback
    ? `Honest reconnection. Reference what's new or improved. Use real USPs only. One compelling reason to return.`
    : isFlashSale
    ? `Urgency and value. Offer: "${offer || 'limited time'}". Use real product names. Why now.`
    : isLaunch
    ? `Vision and innovation. What problem does this solve for ${brandData.targetAudience}? Use only real product names.`
    : `Brand story using only: tagline "${brandData.tagline}", mission "${brandData.missionStatement}", USPs: ${(brandData.keySellingPoints || []).join(', ')}`

  return `EMAIL STRUCTURE — ${emailType.toUpperCase()}:

SECTION 1 — HEADER
bgcolor="${brandData.primaryColor}"
padding:20px 40px
${logoUrl ? `Logo: <img src="${logoUrl}" height="60" style="display:block;height:60px;width:auto;margin:0 auto;border:0;" alt="${brandData.brandName}">` : `Brand name: 20px, letter-spacing:6px, uppercase, color:${primaryTextColor}, centered`}

SECTION 2 — HERO
${heroImageUrl ? `Row 1: Full-width hero image, NO padding
<tr><td style="padding:0;margin:0;line-height:0;font-size:0;" bgcolor="${brandData.primaryColor}"><img src="${heroImageUrl}" width="600" style="display:block;width:600px;max-width:100%;border:0;" alt="${brandData.brandName}"></td></tr>
Row 2:` : `Row 1:`} bgcolor="${brandData.primaryColor}", padding:${heroImageUrl ? '48px 48px 56px' : '80px 48px'}, text-align:center
- Headline: display font, 52px, color:${primaryTextColor}, bold, line-height:1.1, margin:0 0 16px
- Subline: body font, 18px, color:${primaryTextColor}, opacity:0.85, margin:0 0 36px
- CTA button: bgcolor="${brandData.accentColor}", color:${accentTextColor}, padding:18px 52px, body font, 13px, bold, letter-spacing:3px, uppercase, border-radius:2px

SECTION 3 — STORY
bgcolor="#ffffff", padding:64px 56px
Label: body font, 11px, letter-spacing:4px, uppercase, color:${brandData.accentColor}
H2: display font, 34px, #111111, bold, line-height:1.2
2-3 paragraphs: body font, 16px, #555555, line-height:1.8
${storyGuidance}

SECTION 4 — PRODUCT
bgcolor="${brandData.backgroundColor || '#f5f5f5'}", padding:56px 40px, text-align:center
Label: same style as section 3
H2: display font, 28px, #111111
${productImageUrl ? `Product image: <img src="${productImageUrl}" width="480" style="display:block;margin:0 auto 24px;max-width:100%;border:0;">` : `3 feature boxes using real USPs: ${(brandData.keySellingPoints || []).slice(0,3).join(' | ')}`}

${realQuote ? `SECTION 5 — SOCIAL PROOF
bgcolor="#111111", padding:64px 56px, text-align:center
Quote mark: display font, 72px, ${brandData.accentColor}, line-height:0.6
${realQuote}
Quote style: display font, 24px, italic, white, line-height:1.5
Stars: ★★★★★ color:${brandData.accentColor}, 20px` : `SECTION 5 — SOCIAL PROOF
bgcolor="#111111", padding:64px 56px, text-align:center
Write a specific fictional quote about a real result from using ${brandData.productType}. Specific outcome, not generic praise. Realistic first name and last initial.
Quote style: display font, 24px, italic, white, line-height:1.5
Stars: ★★★★★ color:${brandData.accentColor}, 20px`}

SECTION 6 — CTA BAND
bgcolor="${brandData.accentColor}", padding:64px 48px, text-align:center
H2: display font, 34px, color:${accentTextColor}, line-height:1.2
${offer ? `Discount code box: background:rgba(255,255,255,0.15), border:2px dashed rgba(255,255,255,0.4), padding:14px 36px, display:inline-block, display font, 28px, color:${accentTextColor}, letter-spacing:6px — "${offer}"` : ''}
CTA button: white bg, color:${brandData.primaryColor}, padding:18px 56px, body font, 13px, bold, letter-spacing:3px, uppercase, border-radius:2px
Urgency line: body font, 13px, color:${accentTextColor}, opacity:0.75

SECTION 7 — FOOTER
bgcolor="#0a0a0a", padding:40px 32px, text-align:center
${logoUrl ? `Logo: <img src="${logoUrl}" height="40" style="display:block;height:40px;width:auto;margin:0 auto 12px;border:0;" alt="${brandData.brandName}">` : `Brand name: display font, 18px, white, letter-spacing:5px, uppercase`}
Tagline: body font, 12px, rgba(255,255,255,0.4) — "${brandData.tagline}"
HR: border-top:1px solid rgba(255,255,255,0.1), margin:20px 0
Social links: Instagram · Facebook · TikTok — rgba(255,255,255,0.4)
Unsubscribe: 11px, rgba(255,255,255,0.25) — "Unsubscribe · Manage preferences"
DO NOT include any address or contact details.`
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
