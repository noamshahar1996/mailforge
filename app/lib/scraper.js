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

// ─── FONT DETECTION ───────────────────────────────────────────────────────────
function detectFonts(html) {
  const $ = cheerio.load(html)
  const fonts = new Set()

  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const familyMatches = href.match(/family=([^&:?|]+)/g) || []
    familyMatches.forEach(match => {
      const name = match.replace('family=', '').split(':')[0].split('|')[0].replace(/\+/g, ' ').trim()
      if (name && name.length > 1) fonts.add(name)
    })
  })

  $('style').each((_, el) => {
    const css = $(el).html() || ''
    const importMatches = css.match(/fonts\.googleapis\.com\/css[^"')]+/g) || []
    importMatches.forEach(importUrl => {
      const familyMatches = importUrl.match(/family=([^&:?|"')]+)/g) || []
      familyMatches.forEach(match => {
        const name = match.replace('family=', '').split(':')[0].split('|')[0].replace(/\+/g, ' ').trim()
        if (name && name.length > 1) fonts.add(name)
      })
    })
  })

  $('style').each((_, el) => {
    const css = $(el).html() || ''
    const fontFaceMatches = css.match(/font-family\s*:\s*['"]?([^;'"]+)['"]?\s*;/gi) || []
    fontFaceMatches.forEach(match => {
      const name = match.replace(/font-family\s*:\s*/i, '').replace(/[;'"]/g, '').trim()
      if (name && name.length > 1 && !name.includes('inherit') && !name.includes('sans-serif') && !name.includes('serif') && !name.includes('monospace')) {
        fonts.add(name)
      }
    })
  })

  return [...fonts].slice(0, 4)
}

// ─── TRUST SIGNAL EXTRACTION ──────────────────────────────────────────────────
// Scans page text for real trust signals — shipping, returns, reviews, guarantees.
// Only extracts what actually exists on the page. Never invents data.
function extractTrustSignals(html) {
  const $ = cheerio.load(html)
  const pageText = $('body').text().replace(/\s+/g, ' ').toLowerCase()
  const signals = {}

  // FREE SHIPPING — looks for "free shipping on orders over $X" or "free shipping over $X"
  const shippingPatterns = [
    /free shipping on orders over \$?([\d,]+)/i,
    /free shipping over \$?([\d,]+)/i,
    /free shipping on \$?([\d,]+)\+/i,
    /free shipping for orders over \$?([\d,]+)/i,
    /orders over \$?([\d,]+) ship free/i,
    /complimentary shipping on orders over \$?([\d,]+)/i,
  ]
  for (const pattern of shippingPatterns) {
    const match = pageText.match(pattern)
    if (match) {
      signals.freeShipping = `Free Shipping $${match[1].replace(',', '')}+`
      break
    }
  }
  // Also check for unconditional free shipping
  if (!signals.freeShipping) {
    if (/free shipping on all orders|always free shipping|free standard shipping/.test(pageText)) {
      signals.freeShipping = 'Free Shipping'
    }
  }

  // RETURNS — looks for "X-day returns", "X-day money back", "lifetime guarantee"
  const returnPatterns = [
    /(\d+)[\s-]day\s+(return|money.?back|refund|guarantee)/i,
    /(lifetime|satisfaction)\s+guarantee/i,
    /hassle.?free returns/i,
    /free returns/i,
  ]
  for (const pattern of returnPatterns) {
    const match = pageText.match(pattern)
    if (match) {
      if (match[1] && /^\d+$/.test(match[1])) {
        signals.returns = `${match[1]}-Day Returns`
      } else if (/lifetime/i.test(match[0])) {
        signals.returns = 'Lifetime Guarantee'
      } else if (/satisfaction/i.test(match[0])) {
        signals.returns = 'Satisfaction Guarantee'
      } else {
        signals.returns = 'Free Returns'
      }
      break
    }
  }

  // REVIEW COUNT — looks for "X reviews", "X+ reviews", "X customers"
  const reviewPatterns = [
    /([\d,]+)\+?\s+(?:5-star\s+)?(?:reviews|ratings)/i,
    /([\d,]+)\+?\s+happy customers/i,
    /([\d,]+)\+?\s+customers/i,
    /rated by ([\d,]+)/i,
    /over ([\d,]+) reviews/i,
  ]
  for (const pattern of reviewPatterns) {
    const match = pageText.match(pattern)
    if (match) {
      const count = match[1].replace(',', '')
      const num = parseInt(count)
      if (num > 10) {
        // Format nicely: 12400 → "12,400+" or "12K+"
        if (num >= 1000) {
          const formatted = num >= 10000
            ? `${Math.floor(num / 1000)}K+`
            : `${num.toLocaleString()}+`
          signals.reviews = `${formatted} Reviews`
        } else {
          signals.reviews = `${num}+ Reviews`
        }
        break
      }
    }
  }

  // STAR RATING — looks for "4.8 stars", "4.9 out of 5"
  const ratingPatterns = [
    /(\d\.\d)\s*(?:out of\s*5\s*)?stars?/i,
    /rated\s+(\d\.\d)\s*\/\s*5/i,
    /(\d\.\d)\s*average rating/i,
  ]
  for (const pattern of ratingPatterns) {
    const match = pageText.match(pattern)
    if (match) {
      const rating = parseFloat(match[1])
      if (rating >= 4.0 && rating <= 5.0) {
        signals.rating = `${rating} / 5 Stars`
        break
      }
    }
  }

  // SUSTAINABILITY / CLEAN / NATURAL — qualitative trust signals
  const cleanPatterns = [
    /cruelty.?free/i,
    /certified organic/i,
    /clinically tested/i,
    /dermatologist.?tested/i,
    /made in (?:the )?usa/i,
    /sustainably sourced/i,
    /non.?toxic/i,
    /clean formula/i,
    /vegan formula/i,
    /fda.?registered/i,
  ]
  for (const pattern of cleanPatterns) {
    const match = pageText.match(pattern)
    if (match) {
      // Clean up the match text
      let label = match[0].trim()
      label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
      label = label.replace(/-/g, ' ').replace(/\s+/g, ' ')
      signals.quality = label
      break
    }
  }

  return signals
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
    h1s: [], h2s: [], h3s: [], paragraphs: [],
    images: [], colors: [], prices: [], productNames: [], testimonials: [],
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

function selectHeroImage(meta, images) {
  if (meta.ogImage && meta.ogImage.startsWith('http')) return meta.ogImage
  if (meta.twitterImage && meta.twitterImage.startsWith('http')) return meta.twitterImage
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
  let detectedFonts = []
  let trustSignals = {}

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

    detectedFonts = detectFonts(homepageHtml)

    // Extract trust signals from homepage first, then check other pages
    trustSignals = extractTrustSignals(homepageHtml)
  }

  // If homepage didn't have all signals, check other pages too
  for (let i = 1; i < htmlResults.length; i++) {
    if (htmlResults[i].status === 'fulfilled' && htmlResults[i].value) {
      const pageTrust = extractTrustSignals(htmlResults[i].value)
      // Merge — only add if not already found
      if (!trustSignals.freeShipping && pageTrust.freeShipping) trustSignals.freeShipping = pageTrust.freeShipping
      if (!trustSignals.returns && pageTrust.returns) trustSignals.returns = pageTrust.returns
      if (!trustSignals.reviews && pageTrust.reviews) trustSignals.reviews = pageTrust.reviews
      if (!trustSignals.rating && pageTrust.rating) trustSignals.rating = pageTrust.rating
      if (!trustSignals.quality && pageTrust.quality) trustSignals.quality = pageTrust.quality
    }
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
    detectedFonts,
    trustSignals,
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

FONTS DETECTED ON WEBSITE: ${JSON.stringify(scrapedData.detectedFonts)}
Use these for displayFont and bodyFont if they are Google Fonts. Otherwise choose appropriate Google Fonts matching the brand tone.

TRUST SIGNALS DETECTED ON WEBSITE: ${JSON.stringify(scrapedData.trustSignals)}
These are extracted directly from the website text. Only include in trustSignals what was actually found.

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
  "testimonialHints": "string",
  "bestTestimonialQuote": "string — exact quote if found, else empty string",
  "missionStatement": "string",
  "confidence": "high | medium | low",
  "displayFont": "string — exact Google Fonts name for headlines",
  "bodyFont": "string — exact Google Fonts name for body text",
  "trustSignals": {
    "freeShipping": "string or null — only if found on site, e.g. 'Free Shipping $75+'",
    "returns": "string or null — only if found on site, e.g. '30-Day Returns'",
    "reviews": "string or null — only if found on site, e.g. '12,400+ Reviews'",
    "rating": "string or null — only if found on site, e.g. '4.9 / 5 Stars'",
    "quality": "string or null — only if found on site, e.g. 'Cruelty-Free'"
  }
}

CRITICAL: The trustSignals values must be based ONLY on what was detected on the website. If a signal was not detected, set it to null. Never invent or assume trust signals.

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

  // Ensure trustSignals exists and clean out any nulls for easy checking
  if (!brandData.trustSignals) brandData.trustSignals = {}

  // Attach image data
  brandData.heroImageUrl = selectHeroImage(scrapedData.meta, scrapedData.images)
  brandData.scrapedImages = selectProductImages(scrapedData.images)

  return brandData
}
