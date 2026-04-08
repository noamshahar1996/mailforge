/**
 * Generates a rich, visually impressive HTML email from brand data.
 * Produces multi-section layouts matching professional email design quality.
 */
export async function generateEmail(brandData, emailType, offer, productImages, anthropic) {

  const hasImages = productImages && productImages.length > 0
  const imageList = hasImages
    ? productImages.slice(0, 6).map((img, i) => `Image ${i + 1}: ${img.src}`).join('\n')
    : 'No images available — use rich colored sections instead'

  const prompt = `You are a world-class email designer. Your emails look like they were designed by a senior Klaviyo agency — rich, immersive, conversion-focused. Think Beardbrand, AG1, Dr. Squatch level quality.

BRAND PROFILE:
- Name: ${brandData.brandName}
- Tagline: ${brandData.tagline || ''}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Voice: ${brandData.brandVoice || ''}
- Key USPs: ${(brandData.keySellingPoints || []).join(' | ')}
- Primary color: ${brandData.primaryColor}
- Accent color: ${brandData.accentColor}
- Background: ${brandData.backgroundColor}
- Price point: ${brandData.avgOrderValue}
- Products: ${(brandData.productNames || []).join(', ')}
- Social proof: ${brandData.testimonialHints || ''}
- Mission: ${brandData.missionStatement || ''}

EMAIL TYPE: ${emailType}
SPECIAL OFFER: ${offer || 'none'}

AVAILABLE IMAGES:
${imageList}

DESIGN INSTRUCTIONS:
Generate a COMPLETE self-contained HTML email with these exact sections in order:

1. HEADER
   - Brand name in large styled typography
   - Navigation links (Shop | About | Reviews)
   - Background: primary color, text: white or contrasting color

2. HERO SECTION
   - If images available: use Image 1 as <img> tag (width=600), then overlay text below it on a colored band
   - If no images: bold full-width colored section (600px wide, 340px tall, background: primary color) with large white headline text centered
   - Hero headline: powerful, specific to email type and brand
   - Subheadline: 1 supporting sentence
   - CTA button: accent color background, white text, rounded

3. STORY/BODY SECTION
   - White background, 40px padding
   - Compelling 2-3 paragraph narrative — specific to brand voice and email type
   - Welcome: brand story + what makes it different
   - Abandoned cart: urgency + what they are missing out on
   - Post-purchase: celebrate + set expectations + what comes next
   - Flash sale: lead with offer + scarcity + FOMO
   - Win-back: acknowledge + show what is new + incentive
   - Product launch: build excitement + curiosity + early access feel

4. PRODUCT/FEATURE BLOCK
   - If images: show Image 2 and Image 3 side by side in a 2-column table (each 280px wide), product name + price below each
   - If no images: 3 feature boxes in a row — colored circle placeholder (60px), bold feature name, 1-line description
   - Section title above: e.g. "Why [Brand] Works" or "What You Get"

5. SOCIAL PROOF
   - Light gray background (#f7f7f7), 40px padding
   - Section heading: "What Our Customers Say"
   - 2 testimonial blocks with: star rating (★★★★★), quote text, customer name + location
   - Make quotes specific to the product/niche — not generic
   - Summary line: e.g. "Rated 4.8/5 from over 2,000 verified reviews"

6. OFFER/CTA SECTION
   - Bold background (accent color or primary color)
   - If offer exists: show code in a white rounded box, bold text
   - Large white CTA button
   - Urgency text below: e.g. "Free shipping on all orders" or "Limited time offer"

7. FOOTER
   - Dark background (#1a1a1a or very dark brand color)
   - Brand name + tagline in white
   - Social links as text: Instagram | Facebook | TikTok
   - Small legal text and unsubscribe link in gray

TECHNICAL RULES:
- Max width 600px centered
- ALL CSS inline only — no style tags
- Table-based for columns
- web-safe fonts: Georgia for headlines, Arial for body
- Body text: 16px, line-height 1.6, color #333333
- CTA buttons: display:inline-block, padding:16px 40px, border-radius:4px, font-size:16px, font-weight:bold, text-decoration:none
- NO lorem ipsum anywhere
- All copy specific to this exact brand

Return JSON only:
{
  "subject_line": "compelling subject under 50 chars",
  "preview_text": "preview text under 90 chars",
  "html": "complete HTML string"
}

Start response with { and end with }`

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