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
            negative_prompt: prompt.negative_prompt || '',
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
  const {
    brandName,
    niche,
    productType,
    brandTone,
    primaryColor,
    accentColor,
    targetAudience,
    keySellingPoints,
    productNames,
  } = brand

  // Pick the top 2 most specific product names
  const topProducts = (productNames || []).slice(0, 2)
  const primaryProduct = topProducts[0] || productType
  const secondProduct = topProducts[1] || ''
  const usp = (keySellingPoints || [])[0] || ''

  // Visual style from brand tone
  const styleMap = {
    'Luxury & refined': {
      style: 'REALISTIC',
      lighting: 'dramatic moody studio lighting, dark background, gold accents',
      setting: 'luxury editorial setting, dark marble surface, sophisticated composition',
      quality: 'high-end commercial photography, fashion magazine quality',
    },
    'Bold & direct': {
      style: 'REALISTIC',
      lighting: 'bold high contrast lighting, strong shadows, dynamic angle',
      setting: 'clean industrial setting, bold composition, powerful visual energy',
      quality: 'advertising campaign photography, striking commercial quality',
    },
    'Warm & friendly': {
      style: 'REALISTIC',
      lighting: 'warm golden natural light, soft shadows, inviting atmosphere',
      setting: 'authentic lifestyle setting, natural wood surfaces, human hands in frame',
      quality: 'lifestyle photography, warm and approachable, editorial quality',
    },
    'Playful & fun': {
      style: 'RENDER_3D',
      lighting: 'bright colorful lighting, vibrant saturated colors, fun energy',
      setting: 'clean colorful background, playful composition, energetic layout',
      quality: '3D render commercial quality, vibrant and eye-catching',
    },
    'Scientific & trusted': {
      style: 'REALISTIC',
      lighting: 'clean clinical white lighting, precise shadows, technical feel',
      setting: 'minimal white background, precise product placement, clean and professional',
      quality: 'technical product photography, clinical precision, trustworthy',
    },
    'Minimalist': {
      style: 'REALISTIC',
      lighting: 'soft diffused light, minimal shadows, calm atmosphere',
      setting: 'vast negative space, single surface, zen-like minimal composition',
      quality: 'ultra-minimal commercial photography, elegant simplicity',
    },
  }

  const visual = styleMap[brandTone] || styleMap['Warm & friendly']

  // Email type context
  const emailContextMap = {
    'Welcome email': 'brand introduction, inviting and warm, showing the product in use',
    'Abandoned cart': 'product close-up, desire-inducing, showing craftsmanship detail',
    'Post-purchase': 'product in use, satisfied customer, successful outcome',
    'Flash sale': 'urgent and exciting, product prominently featured, sale energy',
    'Win-back': 'nostalgic and inviting, product reminder, emotional reconnection',
    'Product launch': 'dramatic reveal, hero product shot, excitement and newness',
  }
  const emailContext = emailContextMap[emailType] || 'lifestyle product shot'

  const negativePrompt = 'text, words, letters, watermark, logo, blurry, low quality, distorted, ugly, bad composition, generic stock photo'

  const prompts = []

  // HERO IMAGE — 16:9, shows primary product in lifestyle context
  prompts.push({
    type: 'hero',
    aspect_ratio: 'ASPECT_16_9',
    style: visual.style,
    negative_prompt: negativePrompt,
    prompt: [
      `Professional email marketing hero banner for ${brandName}.`,
      `Product featured: ${primaryProduct}${secondProduct ? ` alongside ${secondProduct}` : ''}.`,
      `${niche} brand targeting ${targetAudience}.`,
      `Scene: ${emailContext}.`,
      `Lighting: ${visual.lighting}.`,
      `Setting: ${visual.setting}.`,
      `Key detail: ${usp}.`,
      `${visual.quality}.`,
      `Wide 16:9 banner format. No text overlay. No logos. Photorealistic.`,
    ].join(' ')
  })

  // PRODUCT IMAGE — 1:1, tight on the specific product
  prompts.push({
    type: 'product',
    aspect_ratio: 'ASPECT_1_1',
    style: visual.style,
    negative_prompt: negativePrompt,
    prompt: [
      `Product photography for ${brandName}.`,
      `Subject: ${primaryProduct} — a ${productType} for ${targetAudience}.`,
      `${visual.lighting}.`,
      `Clean background, tight composition focused on the product itself.`,
      `Show the product being used or held by hands in a ${niche.toLowerCase()} context.`,
      `${visual.quality}.`,
      `Square format. No text. No logos. Commercial product photography.`,
    ].join(' ')
  })

  return prompts
}
