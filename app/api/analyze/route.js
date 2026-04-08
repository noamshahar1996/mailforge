import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { scrapeWebsite, analyzeBrandWithAI } from '../../lib/scraper'

export const maxDuration = 30

export async function POST(request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    let scraped
    try {
      scraped = await scrapeWebsite(url)
    } catch (err) {
      return NextResponse.json({ error: `Scraping failed: ${err.message}` }, { status: 422 })
    }

    let brandData
    try {
      brandData = await analyzeBrandWithAI(scraped, anthropic)
    } catch (err) {
      return NextResponse.json({ error: `Brand analysis failed: ${err.message}` }, { status: 500 })
    }

    // Homepage hero: first large image scraped, skip logos/icons only
    const homepageHero = scraped.images.find(img => {
      const src = img.src.toLowerCase()
      if (src.includes('logo') || src.includes('icon') || src.includes('favicon') || src.includes('pixel')) return false
      if (!src.includes('.jpg') && !src.includes('.jpeg') && !src.includes('.png') && !src.includes('.webp')) return false
      return true
    }) || null

    // Product images: images with real product names as alt text
    const usableImages = scraped.images.filter(img => {
      const src = img.src.toLowerCase()
      if (!img.alt || img.alt.trim().length < 2) return false
      if (src.includes('logo') || src.includes('icon') || src.includes('favicon') || src.includes('pixel')) return false
      if (!src.includes('.jpg') && !src.includes('.jpeg') && !src.includes('.png') && !src.includes('.webp')) return false
      return true
    }).slice(0, 12)

    return NextResponse.json({
      brandData: { ...brandData, logoUrl: scraped.meta.ogImage || null },
      images: usableImages,
      heroImage: homepageHero,
      rawMeta: scraped.meta,
      pagesScraped: scraped.pagesScraped,
      testimonials: scraped.testimonials,
    })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
