/**
 * Generates a complete HTML email from brand data + email type.
 * All CSS is inline (ESP-compatible).
 */
export async function generateEmail(brandData, emailType, offer, productImages, anthropic) {
  const imageContext = productImages && productImages.length > 0
    ? `\nProduct/brand images available (use these URLs directly in img tags):\n${productImages.slice(0, 6).map(img => `- ${img.src}${img.alt ? ` (${img.alt})` : ''}`).join('\n')}`
    : '\nNo product images available — use styled colored placeholder divs for image areas.'

  const prompt = `You are a world-class email designer and conversion copywriter. Generate a complete, production-ready HTML email for this brand.

BRAND PROFILE:
- Name: ${brandData.brandName}
- Tagline: ${brandData.tagline}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Brand voice: ${brandData.brandVoice}
- Key selling points: ${brandData.keySellingPoints?.join(', ')}
- Primary color: ${brandData.primaryColor}
- Accent color: ${brandData.accentColor}
- Background: ${brandData.backgroundColor}
- AOV: ${brandData.avgOrderValue}
- Products: ${brandData.productNames?.join(', ')}
- Social proof: ${brandData.testimonialHints}
- Mission: ${brandData.missionStatement}

EMAIL TYPE: ${emailType}
SPECIAL OFFER: ${offer || 'none'}
${imageContext}

DESIGN REQUIREMENTS:
1. Table-based layout, max 600px wide, ALL CSS inline
2. If images are provided, use them as real <img> tags with the exact URLs
3. If no images: use colored <div> placeholders (e.g. 200px tall, brand colors, centered text)
4. Hero section: full-width image or colored hero with large headline
5. Body: conversion-focused copy specific to this brand and email type (NO lorem ipsum)
6. CTA button: inline-styled, accent color background, prominent
7. For welcome emails: introduce brand story + first-purchase offer
8. For abandoned cart: urgency + product reminder + offer
9. For post-purchase: thank you + upsell/cross-sell + review ask
10. For flash sale: bold headline + countdown urgency + offer code
11. For win-back: re-engagement hook + what's new + incentive
12. For product launch: announce + hero image + key benefits + CTA
13. Include: header with brand name, hero, body sections, CTA, footer with unsubscribe
14. The copy must feel like it was written by someone who knows the brand deeply
15. Include social proof if available (e.g. star ratings, customer count)

Return a JSON object:
{
  "subject_line": "compelling subject line under 50 chars",
  "preview_text": "preview text under 100 chars",
  "html": "complete HTML email string"
}

Return ONLY the JSON. No markdown, no code blocks.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text

  // Try to parse as JSON first
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    // Try to extract JSON object
    try {
      const m = raw.match(/\{[\s\S]*\}/)
      if (m) return JSON.parse(m[0])
    } catch {}

    // If Claude returned raw HTML, wrap it
    if (raw.trim().startsWith('<') || raw.includes('<!DOCTYPE') || raw.includes('<html')) {
      return {
        subject_line: 'Your email is ready',
        preview_text: 'Check out what we put together for you',
        html: raw.trim()
      }
    }

    // Try extracting just the HTML block
    const htmlMatch = raw.match(/```html([\s\S]*?)```/)
    if (htmlMatch) {
      return {
        subject_line: 'Your email is ready',
        preview_text: 'Check out what we put together for you',
        html: htmlMatch[1].trim()
      }
    }

    throw new Error('Failed to parse generation output')
  }
}