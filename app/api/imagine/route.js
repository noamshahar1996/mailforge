import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request) {
  try {
    const { brandData, emailType } = await request.json()
    if (!brandData) return NextResponse.json({ error: 'brandData required' }, { status: 400 })

    const images = await generateBrandImages(brandData, emailType)
    return NextResponse.json({ images })
  } catch (err) {
    console.error('Image generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function generateBrandImages(brandData, emailType) {
  const apiKey = process.env.IDEOGRAM_API_KEY
  if (!apiKey) throw new Error('IDEOGRAM_API_KEY not configured')

  // Build image prompts based on brand
  const prompts = buildImagePrompts(brandData, emailType)
  const results = []

  for (const prompt of prompts) {
    try {
      const res = await fetch('https://api.ideogram.ai/generate', {
        method: 'POST',
        headers: {
          'Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_request: {
            prompt: prompt.prompt,
            aspect_ratio: prompt.aspect_ratio || 'ASPECT_16_9',
            model: 'V_2',
            magic_prompt_option: 'AUTO',
            style_type: prompt.style || 'REALISTIC',
          }
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('Ideogram error:', err)
        continue
      }

      const data = await res.json()
      const imageUrl = data?.data?.[0]?.url
      if (imageUrl) {
        results.push({ url: imageUrl, type: prompt.type })
      }
    } catch (err) {
      console.error('Image generation failed for prompt:', err)
    }
  }

  return results
}

function buildImagePrompts(brand, emailType) {
  const { brandName, niche, productType, brandTone, primaryColor, targetAudience, keySellingPoints } = brand
  const usp = (keySellingPoints || [])[0] || ''

  // Determine visual style from brand tone
  const styleMap = {
    'Luxury & refined': { style: 'REALISTIC', mood: 'dark moody luxury, dramatic lighting, editorial photography, black marble, gold accents, sophisticated' },
    'Bold & direct': { style: 'REALISTIC', mood: 'bold vibrant, high contrast, dynamic energy, powerful composition, striking colors' },
    'Warm & friendly': { style: 'REALISTIC', mood: 'warm natural light, inviting lifestyle, authentic people, golden hour, approachable and genuine' },
    'Playful & fun': { style: 'RENDER_3D', mood: 'colorful vibrant, playful 3D render, fun composition, bright saturated colors, energetic' },
    'Scientific & trusted': { style: 'REALISTIC', mood: 'clean clinical white, precise scientific aesthetic, trustworthy professional, minimal sharp' },
    'Minimalist': { style: 'REALISTIC', mood: 'ultra minimal, vast negative space, single hero element, muted tones, zen-like calm' },
  }

  const { style, mood } = styleMap[brandTone] || styleMap['Warm & friendly']

  const prompts = []

  // Hero image — full width email banner
  prompts.push({
    type: 'hero',
    aspect_ratio: 'ASPECT_16_9',
    style,
    prompt: `Email marketing hero banner for ${brandName}, ${niche} brand. ${productType}. ${mood}. Professional email design visual, 600px wide banner. Target audience: ${targetAudience}. ${usp}. No text overlay. Photorealistic product lifestyle shot. High end commercial photography quality.`
  })

  // Product/lifestyle image — square
  prompts.push({
    type: 'product',
    aspect_ratio: 'ASPECT_1_1',
    style,
    prompt: `Product lifestyle photo for ${brandName}, ${niche}. ${productType} shown beautifully. ${mood}. Clean background, professional product photography. Commercial quality. No text. Perfect for email marketing.`
  })

  return prompts
}