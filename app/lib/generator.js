/**
 * MailForge Email Generator v3
 * Produces premium, agency-quality HTML emails with Google Fonts,
 * dramatic typography, and rich visual sections.
 */
export async function generateEmail(brandData, emailType, offer, productImages, anthropic) {

  const hasImages = productImages && productImages.length > 0
  const imageList = hasImages
    ? productImages.slice(0, 6).map((img, i) => `Image ${i + 1}: ${img.src}`).join('\n')
    : 'No images — use bold colored sections'

  // Pick font pairing based on brand tone
  const fontPairing = getFontPairing(brandData.brandTone)

  const prompt = `You are a senior email designer at a top Klaviyo agency. You design emails for brands like Beardbrand, Sherazade, AG1, Dr. Squatch. Your emails are visually stunning, immersive, and convert.

BRAND:
- Name: ${brandData.brandName}
- Tagline: ${brandData.tagline || ''}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Voice: ${brandData.brandVoice || ''}
- USPs: ${(brandData.keySellingPoints || []).join(' | ')}
- Primary color: ${brandData.primaryColor}
- Accent color: ${brandData.accentColor}
- Background: ${brandData.backgroundColor}
- AOV: ${brandData.avgOrderValue}
- Products: ${(brandData.productNames || []).join(', ')}
- Social proof: ${brandData.testimonialHints || ''}
- Mission: ${brandData.missionStatement || ''}

EMAIL TYPE: ${emailType}
OFFER: ${offer || 'none'}

IMAGES:
${imageList}

FONT PAIRING TO USE:
Display font: ${fontPairing.display} (for all headlines)
Body font: ${fontPairing.body} (for all body text)
Google Fonts import URL: ${fontPairing.importUrl}

DESIGN REQUIREMENTS — follow these exactly:

The email must start with this in the <head>:
<style>@import url('${fontPairing.importUrl}');</style>

SECTION 1 — HEADER (height: 70px)
- Background: ${brandData.primaryColor}
- Brand name centered, font: ${fontPairing.display}, font-size: 22px, letter-spacing: 4px, color: white, text-transform: uppercase
- No navigation links — just the brand name

SECTION 2 — HERO (min-height: 400px)
- If Image 1 available: use it as <img width="600"> then immediately below it a color band (background: ${brandData.primaryColor}, padding: 50px 40px) with headline text
- If no image: full section with background: ${brandData.primaryColor}, min-height: 420px, display flex center
- Headline: font-family: ${fontPairing.display}, font-size: 58px, line-height: 1.1, color: white, font-weight: 700, margin-bottom: 16px
- Make the headline dramatic and specific to the email type — NOT generic
- Subline: font-family: ${fontPairing.body}, font-size: 18px, color: rgba(255,255,255,0.85), margin-bottom: 32px
- CTA button: background: ${brandData.accentColor}, color: white OR dark (whichever contrasts), padding: 18px 48px, font-size: 15px, font-weight: 700, letter-spacing: 2px, text-transform: uppercase, border-radius: 2px, text-decoration: none, display: inline-block

SECTION 3 — STORY (padding: 60px 48px, background: white)
- Small label above: font-size: 11px, letter-spacing: 3px, text-transform: uppercase, color: ${brandData.accentColor}, font-family: ${fontPairing.body}, margin-bottom: 16px
- Section headline: font-family: ${fontPairing.display}, font-size: 38px, color: #111, line-height: 1.2, margin-bottom: 24px
- Body text: font-family: ${fontPairing.body}, font-size: 16px, line-height: 1.8, color: #444, margin-bottom: 16px
- Write 2-3 paragraphs of REAL copy — specific to brand, product, email type
- Welcome: brand origin story + promise
- Abandoned cart: what they are missing + emotional hook
- Post-purchase: celebration + what to expect + community
- Flash sale: urgency + what is at stake + scarcity
- Win-back: honest acknowledgment + what changed + reason to return
- Product launch: vision + what makes this different + early access

SECTION 4 — PRODUCT SHOWCASE (background: ${brandData.backgroundColor || '#f8f8f8'}, padding: 48px 32px)
- Section label: font-size: 11px, letter-spacing: 3px, text-transform: uppercase, color: ${brandData.accentColor}, text-align: center, margin-bottom: 12px
- Section headline: font-family: ${fontPairing.display}, font-size: 32px, text-align: center, margin-bottom: 40px, color: #111
- If Image 2 AND Image 3 available: 2-column table, each image 270px wide, below each: product name in ${fontPairing.display} 18px, price in ${fontPairing.body} 14px color: ${brandData.accentColor}
- If Image 2 only: full-width image 560px, product info below
- If no images: 3 feature boxes — each with a large colored number (font: ${fontPairing.display}, font-size: 48px, color: ${brandData.accentColor}), feature title (${fontPairing.display}, 18px), feature description (${fontPairing.body}, 14px, color: #666)

SECTION 5 — SOCIAL PROOF (background: #111 OR very dark version of primary, padding: 60px 48px)
- Everything white text on dark background
- Opening quote mark: font-size: 80px, font-family: ${fontPairing.display}, color: ${brandData.accentColor}, line-height: 0.5
- Pull quote: font-family: ${fontPairing.display}, font-size: 28px, line-height: 1.4, color: white, font-style: italic, margin-bottom: 24px
- Make this quote SPECIFIC to the product and result — not generic
- Attribution: font-family: ${fontPairing.body}, font-size: 13px, color: rgba(255,255,255,0.6), letter-spacing: 2px, text-transform: uppercase
- Star rating below: ★★★★★ in ${brandData.accentColor}, font-size: 20px
- Small stat line: e.g. "Rated 4.9/5 by 3,200+ customers" in white, font-size: 13px

SECTION 6 — CTA BAND (background: ${brandData.accentColor}, padding: 60px 40px, text-align: center)
- If offer: show discount code in a white box, font-family: ${fontPairing.display}, font-size: 28px, letter-spacing: 6px, padding: 16px 32px
- Headline above CTA: font-family: ${fontPairing.display}, font-size: 36px, color: white
- CTA button: white background, color: ${brandData.accentColor} OR ${brandData.primaryColor}, padding: 18px 56px, font-size: 14px, font-weight: 700, letter-spacing: 3px, text-transform: uppercase, border-radius: 2px
- Urgency line below: font-family: ${fontPairing.body}, font-size: 13px, color: rgba(255,255,255,0.8)

SECTION 7 — FOOTER (background: #0a0a0a, padding: 48px 40px)
- Brand name: font-family: ${fontPairing.display}, font-size: 24px, color: white, letter-spacing: 4px, text-transform: uppercase, text-align: center, margin-bottom: 8px
- Tagline: font-family: ${fontPairing.body}, font-size: 13px, color: rgba(255,255,255,0.5), text-align: center, margin-bottom: 24px
- Divider: 1px solid rgba(255,255,255,0.1), margin: 24px 0
- Social links: Instagram · Facebook · TikTok — font-family: ${fontPairing.body}, font-size: 12px, color: rgba(255,255,255,0.5), letter-spacing: 2px, text-transform: uppercase
- Unsubscribe: font-size: 11px, color: rgba(255,255,255,0.3)

TECHNICAL RULES:
- Max width 600px, centered with margin: 0 auto, background: white
- ALL CSS inline EXCEPT the Google Fonts @import which goes in a <style> tag in <head>
- The <style> tag with @import is the ONE exception to inline CSS rule — Gmail supports it
- Table-based layout for all multi-column sections
- img tags must have width attribute set, border: none, display: block
- No lorem ipsum anywhere — all copy real and brand-specific
- Headlines must be LARGE and DRAMATIC — not timid
- Generous whitespace between sections
- The overall email should feel like it belongs to a premium brand

Return ONLY this JSON (no markdown, no code blocks):
{
  "subject_line": "under 50 chars — punchy and specific",
  "preview_text": "under 90 chars — adds intrigue",
  "html": "complete HTML email"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {}

  try {
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
  } catch {}

  if (raw.trim().startsWith('<') || raw.includes('<!DOCTYPE') || raw.includes('<html')) {
    return {
      subject_line: `${brandData.brandName} — ${emailType}`,
      preview_text: `A message from ${brandData.brandName}`,
      html: raw.trim()
    }
  }

  const htmlMatch = raw.match(/```html([\s\S]*?)```/)
  if (htmlMatch) {
    return {
      subject_line: `${brandData.brandName} — ${emailType}`,
      preview_text: `A message from ${brandData.brandName}`,
      html: htmlMatch[1].trim()
    }
  }

  throw new Error('Failed to parse generation output')
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
      body: 'Source Sans Pro',
      importUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+Pro:wght@300;400;600&display=swap'
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
      importUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap'
    },
    'Minimalist': {
      display: 'Libre Baskerville',
      body: 'Jost',
      importUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500&display=swap'
    },
  }
  return pairings[tone] || pairings['Warm & friendly']
}