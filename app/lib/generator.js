/**
 * MailForge Email Generator v4
 * Premium agency-quality emails with Google Fonts and dramatic typography.
 */
export async function generateEmail(brandData, emailType, offer, productImages, anthropic) {

  const hasImages = productImages && productImages.length > 0
  const imageList = hasImages
    ? productImages.slice(0, 6).map((img, i) => `Image ${i + 1}: ${img.src}`).join('\n')
    : 'No images available'

  const fontPairing = getFontPairing(brandData.brandTone)

  const systemPrompt = `You are a senior email designer. You output ONLY valid JSON with no extra text before or after. Never use markdown code blocks. Your response must start with { and end with }.`

  const userPrompt = `Design a premium HTML email for ${brandData.brandName}.

BRAND:
Name: ${brandData.brandName}
Tagline: ${brandData.tagline || ''}
Niche: ${brandData.niche}
Product: ${brandData.productType}
Audience: ${brandData.targetAudience}
Tone: ${brandData.brandTone}
USPs: ${(brandData.keySellingPoints || []).join(', ')}
Primary color: ${brandData.primaryColor}
Accent color: ${brandData.accentColor}
Background: ${brandData.backgroundColor || '#ffffff'}
Products: ${(brandData.productNames || []).join(', ')}
Social proof: ${brandData.testimonialHints || ''}
Mission: ${brandData.missionStatement || ''}

EMAIL TYPE: ${emailType}
OFFER: ${offer || 'none'}

AVAILABLE IMAGES:
${imageList}

FONTS TO USE:
Import URL: ${fontPairing.importUrl}
Display font (headlines): ${fontPairing.display}
Body font (paragraphs): ${fontPairing.body}

BUILD THIS EMAIL with exactly these 7 sections:

SECTION 1 — HEADER
Table width=600 bgcolor="${brandData.primaryColor}"
Brand name: font-family:${fontPairing.display},serif; font-size:20px; letter-spacing:5px; color:#ffffff; text-transform:uppercase; text-align:center; padding:24px;

SECTION 2 — HERO  
If Image 1 exists: <img src="IMAGE_1_URL" width="600" style="display:block;border:none;">
Below image (or full section if no image): bgcolor="${brandData.primaryColor}" padding:56px 48px; text-align:center
- Headline: font-family:${fontPairing.display},serif; font-size:56px; line-height:1.1; color:#ffffff; font-weight:700; margin:0 0 16px 0
  Make headline DRAMATIC and SPECIFIC to ${emailType} for ${brandData.brandName}
- Subline: font-family:${fontPairing.body},sans-serif; font-size:18px; color:rgba(255,255,255,0.85); margin:0 0 36px 0
- CTA: <a href="#" style="background:${brandData.accentColor};color:#ffffff;padding:18px 48px;font-family:${fontPairing.body},sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;display:inline-block;border-radius:2px">SHOP NOW</a>
  Replace "SHOP NOW" with a specific CTA for this email type

SECTION 3 — STORY
bgcolor="#ffffff" padding:64px 56px
- Label: font-family:${fontPairing.body},sans-serif; font-size:11px; letter-spacing:4px; text-transform:uppercase; color:${brandData.accentColor}; margin:0 0 20px 0
- Headline: font-family:${fontPairing.display},serif; font-size:36px; line-height:1.2; color:#111111; margin:0 0 28px 0
- 2-3 body paragraphs: font-family:${fontPairing.body},sans-serif; font-size:16px; line-height:1.8; color:#555555; margin:0 0 16px 0
  Copy must be specific to ${brandData.brandName}, ${brandData.productType}, and ${emailType}

SECTION 4 — PRODUCTS
bgcolor="${brandData.backgroundColor || '#f8f8f8'}" padding:56px 40px
- Label: same style as section 3 label, text-align:center
- Headline: font-family:${fontPairing.display},serif; font-size:30px; text-align:center; color:#111; margin:0 0 40px 0
If Image 2 AND Image 3: 2-column table, each 270px, image then product name then price
If Image 2 only: <img src="IMAGE_2_URL" width="520" style="display:block;margin:0 auto;">
If no images: 3 feature boxes in a row — number in accent color, title, description

SECTION 5 — SOCIAL PROOF (DARK)
bgcolor="#111111" padding:64px 48px; text-align:center
- Opening quote: font-family:${fontPairing.display},serif; font-size:72px; color:${brandData.accentColor}; line-height:0.6; margin:0 0 16px 0 — just the character "
- Quote text: font-family:${fontPairing.display},serif; font-size:26px; font-style:italic; color:#ffffff; line-height:1.5; margin:0 0 28px 0
  Make quote SPECIFIC to the product benefit — not generic
- Attribution: font-family:${fontPairing.body},sans-serif; font-size:12px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.5); margin:0 0 16px 0
- Stars: <span style="color:${brandData.accentColor};font-size:22px;">★★★★★</span>
- Rating: font-family:${fontPairing.body},sans-serif; font-size:13px; color:rgba(255,255,255,0.5); margin:12px 0 0 0

SECTION 6 — OFFER CTA
bgcolor="${brandData.accentColor}" padding:64px 48px; text-align:center
- Headline: font-family:${fontPairing.display},serif; font-size:36px; color:#ffffff; margin:0 0 24px 0
If offer exists: white box with discount code: font-family:${fontPairing.display},serif; font-size:28px; letter-spacing:6px; color:#111; background:#fff; padding:16px 40px; display:inline-block; margin:0 0 32px 0
- CTA button: background:#ffffff; color:${brandData.primaryColor}; padding:18px 56px; font-family:${fontPairing.body},sans-serif; font-size:13px; font-weight:700; letter-spacing:3px; text-transform:uppercase; text-decoration:none; display:inline-block; border-radius:2px
- Urgency: font-family:${fontPairing.body},sans-serif; font-size:13px; color:rgba(255,255,255,0.8); margin:20px 0 0 0

SECTION 7 — FOOTER
bgcolor="#0a0a0a" padding:48px 40px; text-align:center
- Brand name: font-family:${fontPairing.display},serif; font-size:22px; letter-spacing:4px; color:#ffffff; text-transform:uppercase; margin:0 0 8px 0
- Tagline: font-family:${fontPairing.body},sans-serif; font-size:13px; color:rgba(255,255,255,0.4); margin:0 0 28px 0
- Divider: <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:0 0 28px 0">
- Socials: Instagram &nbsp;·&nbsp; Facebook &nbsp;·&nbsp; TikTok — font-size:12px; color:rgba(255,255,255,0.4); letter-spacing:2px; text-transform:uppercase; text-decoration:none
- Unsubscribe: font-size:11px; color:rgba(255,255,255,0.25); margin:20px 0 0 0

FULL EMAIL STRUCTURE:
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>@import url('${fontPairing.importUrl}');</style>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;">
<table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;background:#ffffff;">
[ALL 7 SECTIONS AS TABLE ROWS]
</table>
</body>
</html>

Return this JSON object (start with { end with }, no markdown):
{
  "subject_line": "compelling subject under 50 chars for ${emailType}",
  "preview_text": "preview text under 90 chars",
  "html": "THE COMPLETE HTML EMAIL STRING"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = response.content[0].text.trim()

  // Parse JSON response
  try {
    return JSON.parse(raw)
  } catch {}

  // Try stripping any accidental markdown
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(cleaned)
  } catch {}

  // Extract JSON object
  try {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.substring(start, end + 1))
    }
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
      body: 'Source+Sans+3',
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