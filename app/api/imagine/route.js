import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request) {
  try {
    const { brandData, emailType, productImages, heroImage } = await request.json()
    if (!brandData) return NextResponse.json({ error: 'brandData required' }, { status: 400 })

    // Use homepage hero image directly — no AI generation needed
    if (heroImage && heroImage.src) {
      return NextResponse.json({
        images: [{ url: heroImage.src, type: 'hero' }]
      })
    }

    // Fallback: use first product image as hero
    const firstProduct = productImages?.find(img => img.alt && img.alt.trim().length > 2)
    if (firstProduct) {
      return NextResponse.json({
        images: [{ url: firstProduct.src, type: 'hero' }]
      })
    }

    return NextResponse.json({ images: [] })
  } catch (err) {
    console.error('Image generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
