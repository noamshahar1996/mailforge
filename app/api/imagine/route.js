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

  const prompt = buildHeroPrompt(brandData, emailType)
  
  try {
    const res = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_request: {
          prompt,
          negative_prompt: 'text, words, letters, watermark, logo, blurry, low quality, distorted, people, faces, humans',
          aspect_ratio: 'ASPECT_16_9',
          model: 'V_2',
          magic_prompt_option: 'OFF',
          style_type: 'REALISTIC',
        }
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Ideogram error:', err)
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

function buildHeroPrompt(brand, emailType) {
  const { niche, brandTone, keySellingPoints, productNames } = brand

  const topProducts = (productNames || []).slice(0, 3).join(', ')
  const usp = (keySellingPoints || [])[0] || ''

  const moodMap = {
    'Luxury & refined': 'dramatic moody studio lighting, dark sophisticated background, premium editorial photography',
    'Bold & direct': 'bold high contrast lighting, dynamic composition, striking commercial photography',
    'Warm & friendly': 'warm golden natural light, rustic wooden workbench, cozy workshop atmosphere',
    'Playful & fun': 'bright colorful lighting, clean background, fun energetic composition',
    'Scientific & trusted': 'clean precise lighting, minimal white background, technical product photography',
    'Minimalist': 'soft diffused light, vast negative space, single surface, minimal composition',
  }
  const mood = moodMap[brandTone] || moodMap['Warm & friendly']

  return [
    `Professional product lineup photography for a ${niche} brand.`,
    topProducts ? `Products shown: ${topProducts}, carefully arranged on a wooden workbench.` : '',
    `${mood}.`,
    usp ? `Style conveys: ${usp}.` : '',
    `Clean hero image for email marketing, 16:9 wide format.`,
    `No text, no people, no faces, no logos. Pure product and environment only.`,
    `Commercial photography quality, sharp focus on products.`,
  ].filter(Boolean).join(' ')
}
