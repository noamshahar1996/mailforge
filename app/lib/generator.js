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

  // For non-welcome emails only, use scraped images as hero fallback
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
- Tone: ${brand
