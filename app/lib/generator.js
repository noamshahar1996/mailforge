/**
 * MailForge Email Generator v8
 * Welcome email: discount code in hero section, above CTA.
 * Other email types: unchanged behavior.
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

  const realQuote = brandData.bestTestimonialQuote && brandData.bestTestimonialQuote.length > 10
    ? `USE THIS REAL CUSTOMER QUOTE EXACTLY AS WRITTEN: "${brandData.bestTestimonialQuote}"`
    : `Write a highly specific fictional quote about a real result the customer got from using ${brandData.productType}. Make it feel earned and specific, not generic.`

  const welcomeDiscountInstructions = isWelcome && offer ? `
CRITICAL FOR WELCOME EMAIL — The discount code must appear in the HERO SECTION (section 2), above the CTA button. Layout inside the hero text band:
1. Small label: body font, 11px, letter-spacing:4px, uppercase, rgba(255,255,255,0.7) — e.g. "YOUR WELCOME GIFT"
2. Discount code box: display:inline-block, background:rgba(255,255,255,0.15), border:2px dashed rgba(255,255,255,0.5), padding:14px 36px, display font, 32px, white, letter-spacing:8px, uppercase — showing the code: "${offer}"
3. Savings line: body font, 13px, rgba(255,255,255,0.7), margin:8px 0 28px — e.g. "Apply at checkout to save"
4. Then the CTA button below that
Do NOT put another discount box in section 6 for welcome emails.` : ''

  const systemPrompt = `You are a senior email designer at a top agency. Output ONLY valid JSON. Never use markdown code blocks. Your response must start with { and end with }.`

  const userPrompt = `Design a premium HTML email for ${brandData.brandName}.

BRAND:
- Name: ${brandData.brandName}
- Tagline: ${brandData.tagline || ''}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Voice: ${brandData.brandVoice || ''}
- USPs: ${(brandData.keySellingPoints || []).join(', ')}
- Primary color: ${brandData.primaryColor}
- Accent color: ${brandData.accentColor}
- Background: ${brandData.backgroundColor || '#ffffff'}
- Products: ${(brandData.productNames || []).join(', ')}
- Social proof: ${brandData.testimonialHints || ''}
- Mission: ${brandData.missionStatement || ''}

EMAIL TYPE: ${emailType}
OFFER: ${offer || 'none'}

HERO IMAGE URL: ${heroImageUrl || 'NONE'}
PRODUCT IMAGE URL: ${productImageUrl || 'NONE'}

FONTS:
@import url('${fontPairing.importUrl}');
Display font: ${fontPairing.display}
Body font: ${fontPairing.body}

Generate the complete HTML email. Follow these rules EXACTLY:

1. HERO IMAGE must be: <img src="${heroImageUrl || ''}" width="600" style="display:block;width:600px;max-width:100%;border:0;line-height:100%;outline:none;text-decoration:none;" alt="${brandData.brandName}">
   - It must be the FIRST thing inside the <td> with NO padding around it
   - The <td> must have style="padding:0;margin:0;line-height:0;font-size:0;"

2. PRODUCT IMAGE must be: <img src="${productImageUrl || ''}" width="480" style="display:block;margin:0 auto;max-width:100%;border:0;" alt="Product">

3. ALL section backgrounds must use bgcolor attribute on <td>, not CSS background

4. Font stacks: use font-family:'${fontPairing.display}',Georgia,'Times New Roman',serif for headlines
   and font-family:'${fontPairing.body}',Arial,Helvetica,sans-serif for body text

5. The email wrapper table must be: <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;">

${welcomeDiscountInstructions}

Now write the complete email with these 7 sections:

SECTION 1 - HEADER
bgcolor="${brandData.primaryColor}"
Brand name: 20px, letter-spacing:6px, uppercase, white, centered, padding:24px 40px
Font: display font

SECTION 2 - HERO
${heroImageUrl ? `
Row 1: Full-width hero image (NO padding, no margin)
<tr><td style="padding:0;margin:0;line-height:0;font-size:0;" bgcolor="${brandData.primaryColor}">
<img src="${heroImageUrl}" width="600" style="display:block;width:600px;max-width:100%;border:0;" alt="${brandData.brandName}">
</td></tr>
Row 2: Text band below image
<tr><td bgcolor="${brandData.primaryColor}" style="padding:48px 48px 56px;text-align:center;">` : `
<tr><td bgcolor="${brandData.primaryColor}" style="padding:80px 48px;text-align:center;">`}
Headline: display font, 54px, white, bold, line-height:1.1, margin:0 0 16px
Subline: body font, 18px, rgba(255,255,255,0.85), margin:0 0 ${isWelcome && offer ? '28px' : '36px'}
${isWelcome && offer ? `[INSERT DISCOUNT CODE BLOCK HERE as described above]` : ''}
CTA button: bgcolor="${brandData.accentColor}", white text, padding:18px 52px, body font, 13px, bold, letter-spacing:3px, uppercase, border-radius:2px
${heroImageUrl ? '</td></tr>' : '</td></tr>'}

SECTION 3 - STORY
bgcolor="#ffffff"
padding:64px 56px
Label: body font, 11px, letter-spacing:4px, uppercase, color:${brandData.accentColor}, margin-bottom:16px
H2: display font, 36px, #111111, bold, line-height:1.2, margin-bottom:28px
3 paragraphs: body font, 16px, #555555, line-height:1.8
Write REAL copy specific to ${brandData.brandName} and ${emailType}:
- Welcome: brief brand intro, founder vision, what makes the product special. DO NOT mention the discount again here.
- Abandoned cart: emotional connection to what they almost bought
- Post-purchase: celebration, what to expect, community invitation
- Flash sale: urgency, what they gain, why now
- Win-back: honest reconnection, what changed, compelling reason to return
- Product launch: vision, innovation, why this changes everything

SECTION 4 - PRODUCT
bgcolor="${brandData.backgroundColor || '#f5f5f5'}"
padding:56px 40px, text-align:center
Label: same style as section 3
H2: display font, 30px, #111111
${productImageUrl ? `Product image: <img src="${productImageUrl}" width="480" style="display:block;margin:0 auto 32px;max-width:100%;border:0;">` : `3 feature boxes in a row with numbered circles in ${brandData.accentColor}`}

SECTION 5 - SOCIAL PROOF (DARK)
bgcolor="#111111"
padding:64px 56px, text-align:center
Opening quote mark: display font, 72px, ${brandData.accentColor}, line-height:0.6
${realQuote}
Quote style: display font, 26px, italic, white, line-height:1.5
Attribution: body font, 12px, letter-spacing:3px, uppercase, rgba(255,255,255,0.5) — use a realistic first name and last initial
Stars: ★★★★★ in ${brandData.accentColor}, 22px
Rating summary line: body font, 13px, rgba(255,255,255,0.4)

SECTION 6 - CTA BAND
bgcolor="${brandData.accentColor}"
padding:64px 48px, text-align:center
H2: display font, 36px, white, line-height:1.2
${offer && !isWelcome ? `Discount box: white bg, display font, 28px, letter-spacing:6px, dark text, padding:16px 40px, inline-block` : ''}
CTA button: white bg, color:${brandData.primaryColor}, padding:18px 56px, body font, 13px, bold, letter-spacing:3px, uppercase, border-radius:2px
${isWelcome && offer ? `Urgency line below button: body font, 13px, rgba(255,255,255,0.85) — "Your code ${offer} expires in 48 hours"` : `Urgency line: body font, 13px, rgba(255,255,255,0.75)`}

SECTION 7 - FOOTER
bgcolor="#0a0a0a"
padding:48px 40px, text-align:center
Brand name: display font, 20px, white, letter-spacing:5px, uppercase
Tagline: body font, 13px, rgba(255,255,255,0.4)
HR: border-top:1px solid rgba(255,255,255,0.1)
Social links: Instagram · Facebook · TikTok in rgba(255,255,255,0.4)
Unsubscribe: 11px, rgba(255,255,255,0.25)

WRAP EVERYTHING in:
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@import url('${fontPairing.importUrl}');</style></head><body style="margin:0;padding:20px 0;background:#e8e8e8;">
[email table]
</body></html>

CRITICAL: Replace ALL placeholder text with real brand-specific content. No generic copy.

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
