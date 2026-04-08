/**
 * MailForge Email Generator v5
 * Uses AI-generated images + Google Fonts for premium quality output.
 */
export async function generateEmail(brandData, emailType, offer, productImages, anthropic, generatedImages) {

  const hasScrapedImages = productImages && productImages.length > 0
  const hasGeneratedImages = generatedImages && generatedImages.length > 0

  // Prefer AI-generated images, fall back to scraped
  let heroImageUrl = null
  let productImageUrl = null

  if (hasGeneratedImages) {
    heroImageUrl = generatedImages.find(i => i.type === 'hero')?.url
    productImageUrl = generatedImages.find(i => i.type === 'product')?.url
  }

  if (!heroImageUrl && hasScrapedImages) {
    heroImageUrl = productImages[0]?.src
  }
  if (!productImageUrl && hasScrapedImages && productImages.length > 1) {
    productImageUrl = productImages[1]?.src
  }

  const fontPairing = getFontPairing(brandData.brandTone)

  const systemPrompt = `You are a senior email designer. Output ONLY valid JSON. Never use markdown. Start with { end with }.`

  const userPrompt = `Design a stunning premium HTML email for ${brandData.brandName}.

BRAND:
Name: ${brandData.brandName}
Tagline: ${brandData.tagline || ''}
Niche: ${brandData.niche}
Product: ${brandData.productType}
Audience: ${brandData.targetAudience}
Tone: ${brandData.brandTone}
Voice: ${brandData.brandVoice || ''}
USPs: ${(brandData.keySellingPoints || []).join(', ')}
Primary color: ${brandData.primaryColor}
Accent color: ${brandData.accentColor}
Background: ${brandData.backgroundColor || '#ffffff'}
Products: ${(brandData.productNames || []).join(', ')}
Social proof: ${brandData.testimonialHints || ''}
Mission: ${brandData.missionStatement || ''}

EMAIL TYPE: ${emailType}
OFFER: ${offer || 'none'}

IMAGES TO USE:
Hero image URL: ${heroImageUrl || 'NONE — use bold colored section'}
Product image URL: ${productImageUrl || 'NONE — use styled placeholder'}

FONTS:
Import: ${fontPairing.importUrl}
Display (headlines): ${fontPairing.display}
Body (text): ${fontPairing.body}

BUILD THIS EXACT HTML EMAIL STRUCTURE:

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${brandData.brandName}</title>
<style>@import url('${fontPairing.importUrl}');</style>
</head>
<body style="margin:0;padding:20px 0;background:#e8e8e8;">
<table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;background:#ffffff;font-family:Arial,sans-serif;">

<!-- SECTION 1: HEADER -->
<tr><td style="background:${brandData.primaryColor};padding:28px 40px;text-align:center;">
<p style="margin:0;font-family:'${fontPairing.display}',Georgia,serif;font-size:18px;letter-spacing:6px;color:#ffffff;text-transform:uppercase;">${brandData.brandName}</p>
</td></tr>

<!-- SECTION 2: HERO -->
${heroImageUrl ? `
<tr><td style="padding:0;line-height:0;">
<img src="${heroImageUrl}" width="600" alt="${brandData.brandName}" style="display:block;width:100%;border:none;">
</td></tr>
<tr><td style="background:${brandData.primaryColor};padding:52px 48px;text-align:center;">
` : `
<tr><td style="background:${brandData.primaryColor};padding:80px 48px;text-align:center;">
`}
<h1 style="margin:0 0 16px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:52px;line-height:1.1;color:#ffffff;font-weight:700;">
[WRITE POWERFUL HEADLINE FOR ${emailType} — SPECIFIC TO ${brandData.brandName}]
</h1>
<p style="margin:0 0 36px 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:18px;line-height:1.5;color:rgba(255,255,255,0.85);">
[WRITE COMPELLING SUBHEADLINE]
</p>
<a href="#" style="background:${brandData.accentColor};color:#ffffff;padding:18px 52px;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;display:inline-block;border-radius:2px;">
[SPECIFIC CTA FOR EMAIL TYPE]
</a>
</td></tr>

<!-- SECTION 3: STORY -->
<tr><td style="background:#ffffff;padding:64px 56px;">
<p style="margin:0 0 16px 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${brandData.accentColor};">
[SECTION LABEL e.g. "OUR STORY" or "WHY IT MATTERS"]
</p>
<h2 style="margin:0 0 28px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:36px;line-height:1.2;color:#111111;font-weight:700;">
[SECTION HEADLINE — specific to ${emailType}]
</h2>
<p style="margin:0 0 18px 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:16px;line-height:1.8;color:#555555;">
[PARAGRAPH 1 — brand-specific copy for ${emailType}]
</p>
<p style="margin:0 0 18px 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:16px;line-height:1.8;color:#555555;">
[PARAGRAPH 2]
</p>
<p style="margin:0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:16px;line-height:1.8;color:#555555;">
[PARAGRAPH 3]
</p>
</td></tr>

<!-- SECTION 4: PRODUCT -->
<tr><td style="background:${brandData.backgroundColor || '#f5f5f5'};padding:56px 40px;text-align:center;">
<p style="margin:0 0 12px 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${brandData.accentColor};">
[PRODUCT SECTION LABEL]
</p>
<h2 style="margin:0 0 40px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:32px;color:#111111;font-weight:700;">
[PRODUCT SECTION HEADLINE]
</h2>
${productImageUrl ? `
<img src="${productImageUrl}" width="480" alt="Product" style="display:block;margin:0 auto 32px;border:none;max-width:100%;">
` : `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td width="33%" style="padding:0 12px;text-align:center;vertical-align:top;">
<div style="width:64px;height:64px;border-radius:50%;background:${brandData.accentColor};margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
<p style="margin:0;font-family:'${fontPairing.display}',Georgia,serif;font-size:28px;color:#ffffff;font-weight:700;">1</p>
</div>
<p style="margin:0 0 8px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:16px;color:#111;font-weight:700;">[FEATURE 1]</p>
<p style="margin:0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:13px;color:#777;line-height:1.6;">[DESCRIPTION]</p>
</td>
<td width="33%" style="padding:0 12px;text-align:center;vertical-align:top;">
<div style="width:64px;height:64px;border-radius:50%;background:${brandData.accentColor};margin:0 auto 16px;">
<p style="margin:0;padding-top:14px;font-family:'${fontPairing.display}',Georgia,serif;font-size:28px;color:#ffffff;font-weight:700;">2</p>
</div>
<p style="margin:0 0 8px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:16px;color:#111;font-weight:700;">[FEATURE 2]</p>
<p style="margin:0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:13px;color:#777;line-height:1.6;">[DESCRIPTION]</p>
</td>
<td width="33%" style="padding:0 12px;text-align:center;vertical-align:top;">
<div style="width:64px;height:64px;border-radius:50%;background:${brandData.accentColor};margin:0 auto 16px;">
<p style="margin:0;padding-top:14px;font-family:'${fontPairing.display}',Georgia,serif;font-size:28px;color:#ffffff;font-weight:700;">3</p>
</div>
<p style="margin:0 0 8px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:16px;color:#111;font-weight:700;">[FEATURE 3]</p>
<p style="margin:0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:13px;color:#777;line-height:1.6;">[DESCRIPTION]</p>
</td>
</tr>
</table>
`}
</td></tr>

<!-- SECTION 5: SOCIAL PROOF -->
<tr><td style="background:#111111;padding:64px 56px;text-align:center;">
<p style="margin:0 0 8px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:80px;color:${brandData.accentColor};line-height:0.7;">&ldquo;</p>
<p style="margin:24px 0 28px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:26px;font-style:italic;color:#ffffff;line-height:1.5;">
[SPECIFIC CUSTOMER QUOTE about the result they got from ${brandData.productType}]
</p>
<p style="margin:0 0 16px 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.5);">
[CUSTOMER NAME] &nbsp;·&nbsp; [CITY, STATE]
</p>
<p style="margin:0 0 12px 0;font-size:22px;color:${brandData.accentColor};">★★★★★</p>
<p style="margin:0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.4);">
[RATING e.g. "Rated 4.9/5 from 2,400+ verified customers"]
</p>
</td></tr>

<!-- SECTION 6: CTA -->
<tr><td style="background:${brandData.accentColor};padding:64px 48px;text-align:center;">
<h2 style="margin:0 0 ${offer ? '28px' : '36px'} 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:36px;color:#ffffff;font-weight:700;line-height:1.2;">
[CTA SECTION HEADLINE for ${emailType}]
</h2>
${offer ? `
<div style="display:inline-block;background:#ffffff;padding:16px 40px;margin:0 0 32px 0;">
<p style="margin:0;font-family:'${fontPairing.display}',Georgia,serif;font-size:26px;letter-spacing:6px;color:#111111;font-weight:700;">${offer}</p>
</div>
<br>
` : ''}
<a href="#" style="background:#ffffff;color:${brandData.primaryColor};padding:18px 56px;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;display:inline-block;border-radius:2px;">
[FINAL CTA BUTTON TEXT]
</a>
<p style="margin:20px 0 0 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.75);">
[URGENCY OR TRUST LINE e.g. "Free shipping · 30-day returns · 4.9★ rated"]
</p>
</td></tr>

<!-- SECTION 7: FOOTER -->
<tr><td style="background:#0a0a0a;padding:48px 40px;text-align:center;">
<p style="margin:0 0 8px 0;font-family:'${fontPairing.display}',Georgia,serif;font-size:20px;letter-spacing:5px;color:#ffffff;text-transform:uppercase;">${brandData.brandName}</p>
<p style="margin:0 0 28px 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.4);">${brandData.tagline || ''}</p>
<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:0 0 28px 0;">
<p style="margin:0 0 20px 0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);">
<a href="#" style="color:rgba(255,255,255,0.4);text-decoration:none;">Instagram</a> &nbsp;·&nbsp;
<a href="#" style="color:rgba(255,255,255,0.4);text-decoration:none;">Facebook</a> &nbsp;·&nbsp;
<a href="#" style="color:rgba(255,255,255,0.4);text-decoration:none;">TikTok</a>
</p>
<p style="margin:0;font-family:'${fontPairing.body}',Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.25);">
You're receiving this because you signed up at ${brandData.brandName}.
<a href="#" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Unsubscribe</a>
</p>
</td></tr>

</table>
</body>
</html>

IMPORTANT INSTRUCTIONS:
1. Replace ALL [BRACKET PLACEHOLDERS] with real, specific, brand-appropriate content
2. Headlines must be LARGE and DRAMATIC — not generic
3. Copy must sound like it was written by someone who deeply knows ${brandData.brandName}
4. The quote in section 5 must be specific to the product benefit
5. Keep ALL inline styles exactly as written
6. Do NOT add or remove any sections
7. Return ONLY JSON — no markdown

{"subject_line": "compelling subject for ${emailType}", "preview_text": "preview text", "html": "COMPLETE_HTML_HERE"}`

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