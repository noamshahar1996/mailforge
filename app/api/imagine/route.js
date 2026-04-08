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

  // Find best product image to remix — prefer ones with real product names
  const referenceImage = productImages.find(img => img.alt && img.alt.trim().length > 2)
    || productImages[0]

  if (!referenceImage) {
    console.log('No reference image found, skipping generation')
    return []
  }

  try {
    // Fetch the product image as binary
    const imageRes = await fetch(referenceImage.src, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MailForgeBot/1.0)' }
    })
    if (!imageRes.ok) throw new Error(`Could not fetch image: ${imageRes.status}`)
    
    const imageBuffer = await imageRes.arrayBuffer()
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' })
    const prompt = buildRemixPrompt(brandData, emailType)

    // Build multipart form for Ideogram remix
    const formData = new FormData()
    formData.append('image_file', imageBlob, 'product.jpg')
    formData.append('prompt', prompt)
    formData.append('aspect_ratio', 'ASPECT_16_9')
    formData.append('model', 'V_2')
    formData.append('magic_prompt_option', 'OFF')
    formData.append('style_type', 'REALISTIC')
    formData.append('image_weight', '50')

    const res = await fetch('https://api.ideogram.ai/remix', {
      method: 'POST',
      headers: { 'Api-Key': apiKey },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Ideogram remix error:', err)
      return []
    }

    const data = await res.json()
    const imageUrl = data?.data?.[0]?.url
    if (imageUrl) return [{ url: imageUrl, type: 'hero' }]
    return []
  } catch (err) {
    console.error('Image generation failed:', err)
    return []
  }
}

function buildRemixPrompt(brand, emailType) {
  const { niche, brandTone } = brand

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
    `Transform this product into a premium lifestyle hero image for a ${niche} brand.`,
    `${mood}.`,
    `Show the product clearly as the hero of the scene.`,
    `Wide 16:9 format. No text, no people, no faces, no logos, no watermarks.`,
    `Professional commercial photography quality. Clean and immersive.`,
  ].join(' ')
}
