import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { scrapeWebsite, analyzeBrandWithAI } from '../../lib/scraper'

export const maxDuration = 30

export async function POST(request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Step 1: Scrape
    let scraped
    try {
      scraped = await scrapeWebsite(url)
    } catch (err) {
      return NextResponse.json({ error: `Scraping failed: ${err.message}` }, { status: 422 })
    }

    // Step 2: AI analysis
    let brandData
    try {
      brandData = await analyzeBrandWithAI(scraped, anthropic)
    } catch (err) {
      return NextResponse.json({ error: `Brand analysis failed: ${err.message}` }, { status: 500 })
    }

    // Filter usable images
    const usableImages = scraped.images.filter(img => {
      const src = img.src.toLowerCase()
      return (
        !src.includes('logo') &&
        !src.includes('icon') &&
        !src.includes('favicon') &&
        !src.includes('pixel') &&
        !src.includes('tracking') &&
        (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp'))
      )
    }).slice(0, 12)

    return NextResponse.json({
      brandData,
      images: usableImages,
      rawMeta: scraped.meta,
      pagesScraped: scraped.pagesScraped,
      testimonials: scraped.testimonials,
    })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
