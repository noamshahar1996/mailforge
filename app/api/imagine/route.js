import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request) {
  try {
    const { brandData, emailType, productImages } = await request.json()
    if (!brandData) return NextResponse.json({ error: 'brandData required' }, { status: 400 })
    const images = await generateBrandImages(brandData, emailType, productImages || [])
    return NextResponse.json({ images })
  } catch (err) {
    console.error('Image generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function generateBrandImages(brandData, emailType, productImages) {
  const apiKey = process.env.IDEOGRAM_API_KEY
  if (!apiKey) throw new Error('IDEOGRAM_API_KEY not configured')

  // Find the best product image to use as remix reference
  // Priority: images with real product alt text, not promotional banners
  const referenceImage = findBestReferenceImage(productImages)

  const results = []

  // HERO IMAGE — remix if we have a product reference, otherwise generate
  try {
    const heroResult = referenceImage
      ? await remixImage(apiKey, referenceImage, buildHeroRemixPrompt(brandData, emailType), 'ASPECT_16_9')
      : await generateImage(apiKey, buildHeroGeneratePrompt(brandData, emailType), 'ASPECT_16_9')

    if (heroResult) results.push({ url: heroResult, type: 'hero' })
  } catch (err) {
    console.error('Hero image failed:', err)
  }

  return results
}

function findBestReferenceImage(productImages) {
  if (!productImages || productImages.length === 0) return null

  // Filter to images that are likely real product photos
  // Exclude: no alt text, gift cards, logos, tracking pixels
  const candidates = productImages.filter(img => {
    if (!img.alt || img.alt.trim().length < 3) return false
    const alt = img.alt.toLowerCase()
    const src = img.src.toLowerCase()
    if (alt.includes('gift card') || alt.includes('logo') || alt.includes('icon')) return false
    if (src.includes('gift') || src.includes('logo') || src.includes('icon') || src.includes('favicon')) return false
    return true
  })

  return candidates.length > 0 ? candidates[0] : null
}

async function remixImage(apiKey, referenceImage, prompt, aspectRatio) {
  // Fetch the product image and convert to binary for Ideogram Remix
  const imageRes = await fetch(referenceImage.src)
  if (!imageRes.ok) throw new Error(`Could not fetch reference image: ${imageRes.status}`)
  const imageBuffer = await imageRes.arrayBuffer()
  const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' })

  // Build multipart form data for Remix endpoint
  const formData = new FormData()
  formData.append('image_file', imageBlob, 'product.jpg')
  formData.append('prompt', prompt)
  formData.append('aspect_ratio', aspectRatio)
  formData.append('model', 'V_2')
  formData.append('magic_prompt_option', 'OFF')
  formData.append('style_type', 'REALISTIC')
  formData.append('image_weight', '40') // 40% original, 60% prompt — good balance

  const res = await fetch('https://api.ideogram.ai/remix', {
    method: 'POST',
    headers: { 'Api-Key': apiKey },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Ideogram remix error:', err)
    return null
  }

  const data = await res.json()
  return data?.data?.[0]?.url || null
}

async function generateImage(apiKey, prompt, aspectRatio) {
  const res = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_request: {
        prompt,
        negative_prompt: 'text, words, letters, watermark, logo, blurry, low quality, generic stock photo',
        aspect_ratio: aspectRatio,
        model: 'V_2',
        magic_prompt_option: 'OFF',
        style_type: 'REALISTIC',
      }
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Ideogram generate error:', err)
    return null
  }

  const data = await res.json()
  return data?.data?.[0]?.url || null
}

function buildHeroRemixPrompt(brand, emailType) {
  const { brandName, niche, targetAudience, brandTone, keySellingPoints } = brand
  const usp = (keySellingPoints || [])[0] || ''

  const moodMap = {
    'Luxury & refined': 'dramatic moody studio lighting, dark sophisticated background, editorial photography',
    'Bold & direct': 'bold high contrast lighting, dynamic powerful composition, striking commercial photography',
    'Warm & friendly': 'warm golden natural workshop lighting, authentic hands-on setting, inviting atmosphere',
    'Playful & fun': 'bright colorful lighting, fun energetic composition, vibrant saturated colors',
    'Scientific & trusted': 'clean precise lighting, minimal professional setting, technical photography',
    'Minimalist': 'soft diffused light, minimal clean background, elegant simple composition',
  }
  const mood = moodMap[brandTone] || moodMap['Warm & friendly']

  const emailContextMap = {
    'Welcome email': 'welcoming lifestyle scene, product being used by craftsperson',
    'Abandoned cart': 'close-up product detail, desire-inducing, showcasing craftsmanship',
    'Post-purchase': 'product in use, successful outcome, satisfied craftsperson',
    'Flash sale': 'product prominently featured, exciting dynamic composition',
    'Win-back': 'warm inviting product shot, nostalgic workshop setting',
    'Product launch': 'dramatic hero product reveal, premium presentation',
  }
  const context = emailContextMap[emailType] || 'professional lifestyle product shot'

  return [
    `Professional email marketing hero banner for ${brandName}, a ${niche} brand.`,
    `Transform this product into a premium lifestyle photograph.`,
    `Scene: ${context} for ${targetAudience}.`,
    `${mood}.`,
    `${usp}.`,
    `Wide 16:9 banner format. No text overlay. No logos. No watermarks. Photorealistic commercial photography quality.`,
  ].join(' ')
}

function buildHeroGeneratePrompt(brand, emailType) {
  const { brandName, niche, productType, brandTone, targetAudience, keySellingPoints, productNames } = brand
  const topProduct = (productNames || [])[0] || productType
  const usp = (keySellingPoints || [])[0] || ''

  const moodMap = {
    'Luxury & refined': 'dramatic moody studio lighting, dark sophisticated background, editorial photography',
    'Bold & direct': 'bold high contrast lighting, dynamic powerful composition, striking commercial photography',
    'Warm & friendly': 'warm golden natural workshop lighting, authentic hands-on setting, inviting atmosphere',
    'Playful & fun': 'bright colorful lighting, fun energetic composition, vibrant saturated colors',
    'Scientific & trusted': 'clean precise lighting, minimal professional setting, technical photography',
    'Minimalist': 'soft diffused light, minimal clean background, elegant simple composition',
  }
  const mood = moodMap[brandTone] || moodMap['Warm & friendly']

  return [
    `Professional email marketing hero banner for ${brandName}, a ${niche} brand.`,
    `Featured product: ${topProduct}.`,
    `Scene: ${targetAudience} using the product in a professional setting.`,
    `${mood}.`,
    `${usp}.`,
    `Wide 16:9 banner format. No text overlay. No logos. Photorealistic commercial photography quality.`,
  ].join(' ')
}
