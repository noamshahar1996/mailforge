import * as cheerio from 'cheerio'

const FETCH_TIMEOUT_MS = 10000

async function fetchPage(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MailForgeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return await res.text()
  } catch {
    clearTimeout(timeout)
    return null
  }
}

function parsePage(html, baseUrl) {
  const $ = cheerio.load(html)

  const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean)
  const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean)
  const h3s = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean)

  const paragraphs = $('p')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(t => t.length > 40)

  const images = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || ''
    const alt = $(el).attr('alt') || ''
    if (src && !src.startsWith('data:') && src.length > 5) {
      try {
        images.push({ src: new URL(src, baseUrl).href, alt })
      } catch {}
    }
  })

  const colorSet = new Set()
  const colorRegex = /#([0-9a-fA-F]{3,6})\b/g
  const styleContent = $('style').map((_, el) => $(el).html()).get().join(' ')
  let match
  while ((match = colorRegex.exec(styleContent)) !== null) colorSet.add('#' + match[1])
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || ''
    let m
    const re = /#([0-9a-fA-F]{3,6})\b/g
    while ((m = re.exec(style)) !== null) colorSet.add('#' + m[1])
  })

  const priceRegex = /\$[\d,]+(?:\.\d{2})?/g
  const prices = [...new Set(($('body').text().match(priceRegex) || []))]

  const productNames = []
  $('h1, h2, h3, .product-title, .product__title, [class*="product-name"], [class*="product__name"]').each((_, el) => {
    const t = $(el).text().trim()
    if (t.length > 2 && t.length < 80) productNames.push(t)
  })

  const testimonials = []
  $('[class*="review"], [class*="testimonial"], [class*="quote"], blockquote').each((_, el) => {
    const t = $(el).text().trim()
    if (t.length > 20 && t.length < 400) testimonials.push(t)
  })

  return { h1s, h2s, h3s, paragraphs, images, colors: [...colorSet], prices, productNames, testimonials }
}

function unique(arr) {
  return [...new Set(arr)]
}

function mergePageData(pages) {
  const merged = {
    h1s: [],
    h2s: [],
    h3s: [],
    paragraphs: [],
    images: [],
    colors: [],
    prices: [],
    productNames: [],
    testimonials: [],
  }
  for (const p of pages) {
    merged.h1s.push(...p.h1s)
    merged.h2s.push(...p.h2s)
    merged.h3s.push(...p.h3s)
    merged.paragraphs.push(...p.paragraphs)
    merged.images.push(...p.images)
    merged.colors.push(...p.colors)
    merged.prices.push(...p.prices)
    merged.productNames.push(...p.productNames)
    merged.testimonials.push(...p.testimonials)
  }
  return {
    h1s: unique(merged.h1s).slice(0, 8),
    h2s: unique(merged.h2s).slice(0, 12),
    h3s: unique(merged.h3s).slice(0, 12),
    paragraphs: unique(merged.paragraphs).slice(0, 20),
    images: merged.images.slice(0, 40),
    colors: unique(merged.colors).filter(c => c.length === 4 || c.length === 7).slice(0, 20),
    prices: unique(merged.prices).slice(0, 10),
    productNames: unique(merged.productNames).slice(0, 8),
    testimonials: unique(merged.testimonials).slice(0, 5),
  }
}

// ─── HERO IMAGE SELECTION ─────────────────────────────────────────────────────
// Picks the best available image to use as the email hero.
// Priority: OG image → Twitter image → first large scraped image → empty string
function selectHeroImage(meta, images) {
  // OG and Twitter images are specifically chosen by the brand for social previews
  // so they are almost always high-quality lifestyle or product hero shots
  if (meta.ogImage && meta.ogImage.startsWith('http')) return meta.ogImage
  if (meta.twitterImage && meta.twitterImage.startsWith('http')) return meta.twitterImage

  // Fall back to first scraped image that looks like a real photo (not an icon or logo)
  // Filter out tiny images and common UI assets
  const skipKeywords = ['logo', 'icon', 'favicon', 'badge', 'star', 'arrow', 'sprite', 'pixel', 'track']
  const candidate = images.find(img => {
    const srcLower = img.src.toLowerCase()
    const altLower = (img.alt || '').toLowerCase()
    const isSkipped = skipKeywords.some(k => srcLower.includes(k) || altLower.includes(k))
    const hasImageExtension = /\.(jpg|jpeg|png|webp)/i.test(srcLower)
    return !isSkipped && hasImageExtension
  })

  return candidate ? candidate.src : ''
}

// ─── PRODUCT IMAGE SELECTION ──────────────────────────────────────────────────
// Returns up to 6 product images from the scraped image pool.
// These are used in the product grid section of the email.
function selectProductImages(images) {
  const skipKeywords = ['logo', 'icon', 'favicon', 'badge', 'star', 'arrow', 'sprite', 'pixel', 'track', 'banner', 'hero', 'bg', 'background']
  return images
    .filter(img => {
      const srcLower = img.src.toLowerCase()
      const altLower = (img.alt || '').toLowerCase()
      const isSkipped = skipKeywords.some(k => srcLower.includes(k) || altLower.includes(k))
      const hasImageExtension = /\.(jpg|jpeg|png|webp)/i.test(srcLower)
      return !isSkipped && hasImageExtension
    })
    .slice(0, 6)
}

export async function scrapeWebsite(url) {
  const baseUrl = url.startsWith('http') ? url : `https://${url}`
  const origin = new URL(baseUrl).origin

  const pagePaths = ['', '/about', '/products', '/collections', '/collections/all']
  const pageUrls = pagePaths.map(p => origin + p)

  const htmlResults = await Promise.allSettled(pageUrls.map(u => fetchPage(u)))

  const parsedPages = []
  for (let i = 0; i < htmlResults.length; i++) {
    if (htmlResults[i].status === 'fulfilled' && htmlResults[i].value) {
      parsedPages.push(parsePage(htmlResults[i].value, pageUrls[i]))
    }
  }

  if (parsedPages.length === 0) throw new Error('Could not fetch any pages from this website')

  const homepageHtml = htmlResults[0].status === 'fulfilled' ? htmlResults[0].value : null
  let meta = { title: '', metaDesc: '', ogTitle: '', ogDesc: '', ogImage: '', twitterImage: '' }
  let ctas = []
  let navItems = []

  if (homepageHtml) {
    const $ = cheerio.load(homepageHtml)
    meta = {
      title: $('title').first().text().trim() || '',
      metaDesc: $('meta[name="description"]').attr('content') || '',
      ogTitle: $('meta[property="og:title"]').attr('content') || '',
      ogDesc: $('meta[property="og:description"]').attr('content') || '',
      ogImage: $('meta[property="og:image"]').attr('content') || '',
      twitterImage: $('meta[name="twitter:image"]').attr('content') || '',
    }
    ctas = $('button, a.btn, a[class*="button"], a[class*="cta"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(t => t.length > 1 && t.length < 50)
      .slice(0, 10)
    navItems = $('nav a, header a')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(t => t.length > 1 && t.length < 40)
      .slice(0, 12)
  }

  const merged = mergePageData(parsedPages)

  return {
    url: baseUrl,
    pagesScraped: parsedPages.length,
    meta,
    headings: { h1s: merged.h1s, h2s: merged.h2s, h3s: merged.h3s },
    paragraphs: merged.paragraphs,
    images: merged.images,
    colors: merged.colors,
    ctas,
    navItems,
    prices: merged.prices,
    productNames: merged.productNames,
    testimonials: merged.testimonials,
  }
}

export async function analyzeBrandWithAI(scrapedData, anthropic) {
  const prompt = `You are a brand strategist and email marketing expert. Analyze this website data and extract a structured brand profile.

SCRAPED WEBSITE DATA (from ${scrapedData.pagesScraped} pages):
URL: ${scrapedData.url}

Meta:
- Title: ${scrapedData.meta.title}
- Description: ${scrapedData.meta.metaDesc}
- OG Title: ${scrapedData.meta.ogTitle}
- OG Description: ${scrapedData.meta.ogDesc}

Headings across all pages:
H1s: ${JSON.stringify(scrapedData.headings.h1s)}
H2s: ${JSON.stringify(scrapedData.headings.h2s)}
H3s: ${JSON.stringify(scrapedData.headings.h3s)}

Body paragraphs:
${scrapedData.paragraphs.slice(0, 20).join('\n')}

Navigation: ${JSON.stringify(scrapedData.navItems)}
CTAs: ${JSON.stringify(scrapedData.ctas)}
Prices found: ${JSON.stringify(scrapedData.prices)}
Colors found: ${JSON.stringify(scrapedData.colors.slice(0, 10))}
Product names found: ${JSON.stringify(scrapedData.productNames)}
Customer testimonials found: ${JSON.stringify(scrapedData.testimonials)}
Image alt texts: ${JSON.stringify(scrapedData.images.slice(0, 15).map(i => i.alt).filter(Boolean))}

Return a JSON object with this exact structure:
{
  "brandName": "string",
  "tagline": "string",
  "niche": "string",
  "productType": "string",
  "targetAudience": "string",
  "brandTone": "Luxury & refined | Bold & direct | Warm & friendly | Playful & fun | Scientific & trusted | Minimalist",
  "brandVoice": "string — 1-2 sentences",
  "keySellingPoints": ["3-5 USPs"],
  "primaryColor": "string hex",
  "accentColor": "string hex",
  "backgroundColor": "string hex",
  "avgOrderValue": "string",
  "hasSubscription": boolean,
  "productNames": ["up to 5 specific product names"],
  "testimonialHints": "string — best social proof signal found",
  "bestTestimonialQuote": "string — exact quote if found, else empty string",
  "missionStatement": "string",
  "confidence": "high | medium | low"
}

Return ONLY the JSON object. No markdown, no explanation.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text
  let brandData
  try {
    brandData = JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) brandData = JSON.parse(m[0])
    else throw new Error('Failed to parse brand analysis')
  }

  // ── Attach image data to brandData ────────────────────────────────────────
  // These are selected here so the design engine can use them directly
  // without needing access to the raw scraped data.
  brandData.heroImageUrl = selectHeroImage(scrapedData.meta, scrapedData.images)
  brandData.scrapedImages = selectProductImages(scrapedData.images)

  return brandData
}
