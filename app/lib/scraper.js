import * as cheerio from 'cheerio'

/**
 * Fetches and parses a website URL.
 * Returns raw extracted data: text, images, colors, meta.
 * Designed to work on Vercel serverless (no Playwright needed).
 */
export async function scrapeWebsite(url) {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  let html
  try {
    const res = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MailForgeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (err) {
    clearTimeout(timeout)
    throw new Error(`Could not fetch website: ${err.message}`)
  }

  const $ = cheerio.load(html)

  // --- Meta ---
  const title = $('title').first().text().trim() || ''
  const metaDesc = $('meta[name="description"]').attr('content') || ''
  const ogTitle = $('meta[property="og:title"]').attr('content') || ''
  const ogDesc = $('meta[property="og:description"]').attr('content') || ''
  const ogImage = $('meta[property="og:image"]').attr('content') || ''
  const twitterImage = $('meta[name="twitter:image"]').attr('content') || ''

  // --- Headings ---
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 5)
  const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 8)
  const h3s = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 8)

  // --- Body text paragraphs ---
  const paragraphs = $('p').map((_, el) => $(el).text().trim()).get()
    .filter(t => t.length > 40)
    .slice(0, 15)

  // --- Images (src + alt) ---
  const images = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || ''
    const alt = $(el).attr('alt') || ''
    if (src && !src.startsWith('data:') && src.length > 5) {
      // Resolve relative URLs
      let fullSrc = src
      try {
        fullSrc = new URL(src, normalizedUrl).href
      } catch {}
      images.push({ src: fullSrc, alt })
    }
  })

  // --- Colors from inline styles + style tags ---
  const colorSet = new Set()
  const colorRegex = /#([0-9a-fA-F]{3,6})\b/g
  const styleContent = $('style').map((_, el) => $(el).html()).get().join(' ')
  let match
  while ((match = colorRegex.exec(styleContent)) !== null) {
    colorSet.add('#' + match[1])
  }
  // Also grab from inline style attributes
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || ''
    let m
    const re = /#([0-9a-fA-F]{3,6})\b/g
    while ((m = re.exec(style)) !== null) colorSet.add('#' + m[1])
  })
  const colors = [...colorSet]
    .filter(c => c.length === 4 || c.length === 7) // only valid hex
    .slice(0, 20)

  // --- Buttons / CTAs ---
  const ctas = $('button, a.btn, a[class*="button"], a[class*="cta"]')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(t => t.length > 1 && t.length < 50)
    .slice(0, 10)

  // --- Nav items (reveal site sections) ---
  const navItems = $('nav a, header a')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(t => t.length > 1 && t.length < 40)
    .slice(0, 12)

  // --- Prices ---
  const priceRegex = /\$[\d,]+(?:\.\d{2})?/g
  const bodyText = $('body').text()
  const prices = [...new Set(bodyText.match(priceRegex) || [])].slice(0, 8)

  return {
    url: normalizedUrl,
    meta: { title, metaDesc, ogTitle, ogDesc, ogImage, twitterImage },
    headings: { h1s, h2s, h3s },
    paragraphs,
    images: images.slice(0, 30),
    colors,
    ctas,
    navItems,
    prices,
  }
}

/**
 * Takes raw scraped data and asks Claude to interpret it into
 * a structured brand profile ready for email generation.
 */
export async function analyzeBrandWithAI(scrapedData, anthropic) {
  const prompt = `You are a brand strategist and email marketing expert. Analyze this website data and extract a structured brand profile.

SCRAPED WEBSITE DATA:
URL: ${scrapedData.url}

Meta:
- Title: ${scrapedData.meta.title}
- Description: ${scrapedData.meta.metaDesc}
- OG Title: ${scrapedData.meta.ogTitle}
- OG Description: ${scrapedData.meta.ogDesc}

Headings:
H1s: ${JSON.stringify(scrapedData.headings.h1s)}
H2s: ${JSON.stringify(scrapedData.headings.h2s)}
H3s: ${JSON.stringify(scrapedData.headings.h3s)}

Body paragraphs (first 15):
${scrapedData.paragraphs.slice(0, 15).join('\n')}

Navigation items: ${JSON.stringify(scrapedData.navItems)}
CTA buttons: ${JSON.stringify(scrapedData.ctas)}
Prices found: ${JSON.stringify(scrapedData.prices)}
Colors found in CSS: ${JSON.stringify(scrapedData.colors.slice(0, 10))}

Image alt texts: ${JSON.stringify(scrapedData.images.slice(0, 10).map(i => i.alt).filter(Boolean))}

Based on all this, return a JSON object with this exact structure:
{
  "brandName": "string — the actual brand/business name",
  "tagline": "string — their main tagline or value proposition",
  "niche": "string — specific industry (e.g. 'Premium skincare', 'Gaming platform', 'Men's grooming')",
  "productType": "string — what they primarily sell",
  "targetAudience": "string — who they sell to, with demographics if clear",
  "brandTone": "string — one of: Luxury & refined | Bold & direct | Warm & friendly | Playful & fun | Scientific & trusted | Minimalist",
  "brandVoice": "string — 1-2 sentences describing how they communicate",
  "keySellingPoints": ["array of 3-5 main USPs extracted from the content"],
  "primaryColor": "string — most likely primary brand hex color (pick from colors found or infer from brand feel)",
  "accentColor": "string — secondary/accent hex color",
  "backgroundColor": "string — background hex color (likely #ffffff or light neutral)",
  "avgOrderValue": "string — estimated price point based on prices found (e.g. '$49', '$150+', 'unknown')",
  "hasSubscription": boolean,
  "productNames": ["array of up to 5 specific product names found"],
  "testimonialHints": "string — any social proof signals found (reviews, ratings, customer count)",
  "missionStatement": "string — their why/mission if detectable",
  "confidence": "high | medium | low — how confident you are in this analysis"
}

Return ONLY the JSON object. No markdown, no explanation.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error('Failed to parse brand analysis')
  }
}
