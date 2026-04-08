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
  const falKey = process.env.FAL_KEY
  if (!falKey) {
    console.error('FAL_KEY not configured')
    return []
  }

  // Skip banners and promotional images, prefer clean product shots
  const referenceImage = productImages.find(img => {
    if (!img.alt || img.alt.trim().length < 2) return false
    const src = img.src.toLowerCase()
    if (src.includes('hero') || src.includes('banner') || src.includes('phj')) return false
    return true
  }) || productImages.find(img => img.alt && img.alt.trim().length > 2) || productImages[0]

  if (!referenceImage) return []

  const prompt = buildRemixPrompt(brandData, emailType)

  try {
    const res = await fetch('https://fal.run/fal-ai/ideogram/v2/remix', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_url: referenceImage.src,
        image_size: 'landscape_16_9',
        image_weight: 30,
        style_type: 'REALISTIC',
        magic_prompt_option: 'OFF',
        negative_prompt: 'text, words, letters, watermark, logo, blurry, low quality, people, faces, banners, promotional',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('fal API error:', res.status, err)
      return []
    }

    const data = await res.json()
    const imageUrl = data?.images?.[0]?.url
    if (imageUrl) return [{ url: imageUrl, type: 'hero' }]
    return []
  } catch (err) {
    console.error('fal remix failed:', err)
    return []
  }
}

function buildRemixPrompt(brand, emailType) {
  const { niche, brandTone, productNames, keySellingPoints } = brand

  const topProduct = (productNames || [])[0] || ''
  const usp = (keySellingPoints || [])[0] || ''

  const moodMap = {
    'Luxury & refined': 'dramatic moody studio lighting, dark sophisticated background, premium editorial photography',
    'Bold & direct': 'bold high contrast lighting, dynamic powerful composition, striking commercial photography',
    'Warm & friendly': 'warm golden natural light, rustic wooden workbench, cozy authentic workshop atmosphere',
    'Playful & fun': 'bright colorful lighting, clean background, fun energetic composition',
    'Scientific & trusted': 'clean precise lighting, minimal white background, technical product photography',
    'Minimalist': 'soft diffused light, vast negative space, minimal clean composition',
  }
  const mood = moodMap[brandTone] || moodMap['Warm & friendly']

  return [
    `Premium lifestyle product photography for a ${niche} brand.`,
    topProduct ? `Featured product: ${topProduct}.` : '',
    `${mood}.`,
    `Product sits on a clean wooden workbench surrounded by wood shavings and craft tools.`,
    `No text overlays, no promotional banners, no people, no faces, no logos.`,
    `Wide 16:9 cinematic format. Sharp focus on product. Professional commercial photography.`,
    usp ? `Visual mood conveys: ${usp}.` : '',
  ].filter(Boolean).join(' ')
}
