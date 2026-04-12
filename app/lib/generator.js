/**
 * MailForge Email Generator v22
 * Clean architecture — four layers:
 * Layer 1: Data (scraper + user inputs)
 * Layer 2: Normalize (prepareTemplateData)
 * Layer 3: Copy (generateCopyWithClaude)
 * Layer 4: Template (renderTemplate)
 */

import { getFontPairing } from './designEngine.js'
import { selectTemplate, renderTemplate } from './templates/index.js'
import { prepareTemplateData } from './templates/prepareTemplateData.js'

// ─── FLOW GENERATOR ──────────────────────────────────────────────────────────

export async function generateFlow(brandData, flowType, offer, productImages, anthropic, generatedImages) {
  const flowConfigs = {
    'welcome': [
      { role: 'discount_delivery', label: 'Email 1 — Deliver the Code', sendTime: 'Send immediately', isPlainText: false, showProducts: true },
      { role: 'education', label: 'Email 2 — Educate', sendTime: 'Send 1 day later', isPlainText: false, showProducts: false },
      { role: 'founder', label: 'Email 3 — Founder Story', sendTime: 'Send 2 days later', isPlainText: true, showProducts: false },
      { role: 'urgency', label: 'Email 4 — Last Chance', sendTime: 'Send 3 days later', isPlainText: false, showProducts: false },
    ],
    'post-purchase': [
      { role: 'thank_you', label: 'Email 1 — Thank You', sendTime: 'Send right after purchase', isPlainText: false, showProducts: false },
      { role: 'how_to_use', label: 'Email 2 — How To Use It', sendTime: 'Send 1–2 days later', isPlainText: false, showProducts: false },
      { role: 'social_proof', label: 'Email 3 — Social Proof', sendTime: 'Send 3–5 days later', isPlainText: false, showProducts: true },
      { role: 'come_back', label: 'Email 4 — Come Back', sendTime: 'Send 7–14 days later', isPlainText: true, showProducts: false },
    ],
    'abandoned-cart': [
      { role: 'remind', label: 'Email 1 — Remind', sendTime: 'Send 1 hour after abandonment', isPlainText: false, showProducts: false },
      { role: 'build_trust', label: 'Email 2 — Build Trust', sendTime: 'Send 24 hours later', isPlainText: false, showProducts: false },
      { role: 'push', label: 'Email 3 — Push', sendTime: 'Send 48–72 hours later', isPlainText: false, showProducts: false },
    ],
    'browse-abandon': [
      { role: 'browse_remind', label: 'Email 1 — You Were Browsing', sendTime: 'Send 1 hour after browsing', isPlainText: false, showProducts: true },
      { role: 'browse_desire', label: 'Email 2 — Build Desire', sendTime: 'Send 24 hours later', isPlainText: false, showProducts: true },
      { role: 'browse_push', label: 'Email 3 — Final Push', sendTime: 'Send 48 hours later', isPlainText: false, showProducts: false },
    ],
    'checkout-abandon': [
      { role: 'checkout_remind', label: 'Email 1 — Almost There', sendTime: 'Send 30 min after abandonment', isPlainText: false, showProducts: false },
      { role: 'checkout_trust', label: 'Email 2 — Remove Objections', sendTime: 'Send 24 hours later', isPlainText: false, showProducts: false },
      { role: 'checkout_push', label: 'Email 3 — Last Chance', sendTime: 'Send 48 hours later', isPlainText: false, showProducts: false },
    ],
    'subscription-onboarding': [
      { role: 'sub_welcome', label: 'Email 1 — Welcome to Your Subscription', sendTime: 'Send immediately', isPlainText: false, showProducts: false },
      { role: 'sub_habit', label: 'Email 2 — Build the Daily Habit', sendTime: 'Send 1–2 days later', isPlainText: false, showProducts: false },
      { role: 'sub_expectations', label: 'Email 3 — What to Expect', sendTime: 'Send 3–5 days later', isPlainText: false, showProducts: false },
      { role: 'sub_loyalty', label: 'Email 4 — Why Your Subscription Matters', sendTime: 'Send 7–10 days later', isPlainText: true, showProducts: false },
    ],
  }

  const config = flowConfigs[flowType]
  if (!config) throw new Error(`Unknown flow type: ${flowType}`)

  const emails = []
  for (const step of config) {
    const email = step.isPlainText
      ? await generatePlainTextEmail(brandData, flowType, step.role, offer, anthropic)
      : await generateEmail(brandData, step.role, offer, productImages, anthropic, generatedImages, flowType, step.showProducts)

    emails.push({ label: step.label, sendTime: step.sendTime, isPlainText: step.isPlainText, ...email })
  }

  return emails
}

// ─── SINGLE EMAIL GENERATOR ───────────────────────────────────────────────────

export async function generateEmail(brandData, emailType, offer, productImages, anthropic, generatedImages, flowType = null, showProducts = true, overrideCopy = null) {

  // DEBUG: confirm how many images are received before any processing
  console.log('[MailForge] productImages received in generateEmail:', (productImages || []).length)

  const isWelcome       = emailType === 'Welcome email' || emailType === 'discount_delivery'
  const isPostPurchase  = ['Post-purchase', 'thank_you', 'how_to_use', 'social_proof', 'come_back'].includes(emailType)
  const isDiscountEmail = ['push', 'urgency', 'browse_push', 'checkout_push', 'Flash sale', 'Win-back', 'Product launch', 'Abandoned cart'].includes(emailType)

  // ── Layer 3: Copy ──────────────────────────────────────────────────────────
  // Skip Claude if user provided overrideCopy (manual edit)
  const rawCopy = overrideCopy || await generateCopyWithClaude({
    brandData, emailType, offer, productImages, isWelcome, flowType, anthropic
  })

  // DEBUG: confirm pillar count Claude generated
  console.log('[MailForge] pillars generated by Claude:', (rawCopy?.pillars || []).length)

  // Layer 2: Normalize inputs
  const templateData = prepareTemplateData(brandData, rawCopy, productImages || [])

  // DEBUG: confirm counts after normalization
  console.log('[MailForge] templateData.productImages.length:', templateData.productImages.length)
  console.log('[MailForge] templateData.copy.pillars.length:', templateData.copy.pillars.length)

  // ── Layer 4: Template ─────────────────────────────────────────────────────
  const brandTone = brandData.brandTone || 'Warm & friendly'
  const font      = getFontPairing(brandTone, brandData)
  const template  = selectTemplate()

  const html = renderTemplate(template, {
    brandData,
    copy:         templateData.copy,
    topProducts:  templateData.productImages,
    offer,
    isWelcome,
    isPostPurchase,
    isDiscountEmail,
    showProducts,
    font,
    templateData, // full clean data object for templates that use it
  })

  return {
    subject_line: templateData.copy.subject_line,
    preview_text: templateData.copy.preview_text,
    copy:         rawCopy, // return raw copy so UI can populate edit fields
    html,
  }
}

// ─── PLAIN TEXT EMAIL ─────────────────────────────────────────────────────────

async function generatePlainTextEmail(brandData, flowType, role, offer, anthropic) {
  const roleInstructions = {
    'founder': `Plain-text founder email in the welcome flow. Personal Gmail style.
- First person from the founder, max 150 words
- Start with "Hi {{ first_name | default: 'there' }},"
- Brief personal story about why they started the brand
- Reference the welcome offer naturally: ${offer || 'none'}
- End with a realistic founder first name sign-off`,
    'come_back': `Plain-text check-in email 7–14 days after purchase.
- First person from customer success or founder, max 120 words
- Start with "Hi {{ first_name | default: 'there' }},"
- Ask how they're enjoying the product
- Offer help if they have questions
- Subtly mention complementary products: ${(brandData.productNames || []).join(', ')}
- Personal sign-off`,
    'sub_loyalty': `Plain-text loyalty email 7–10 days into a subscription.
- First person from the founder or customer success, max 120 words
- Start with "Hi {{ first_name | default: 'there' }},"
- Thank them for being a subscriber
- Share one surprising benefit of consistent use
- Reinforce their decision to subscribe
- Personal sign-off`,
  }

  const prompt = `Write a plain-text email for ${brandData.brandName}.

BRAND:
- Name: ${brandData.brandName}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Voice: ${brandData.brandVoice || ''}
- Mission: ${brandData.missionStatement || ''}
- Offer: ${offer || 'none'}

INSTRUCTIONS:
${roleInstructions[role] || ''}

Return this exact JSON:
{
  "subject_line": "...",
  "preview_text": "...",
  "body": "..."
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: `You are an expert email copywriter. Output ONLY valid JSON. No markdown. Start with { and end with }.`,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text.trim()
  let copy
  try { copy = JSON.parse(raw) } catch {
    try {
      const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
      copy = JSON.parse(raw.substring(start, end + 1))
    } catch { throw new Error('Could not parse plain text email output') }
  }

  const html = assemblePlainTextEmail({ brandData, copy })
  return { subject_line: copy.subject_line, preview_text: copy.preview_text, copy, html }
}

function assemblePlainTextEmail({ brandData, copy }) {
  const font = getFontPairing(brandData.brandTone || 'Warm & friendly', brandData)
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`
  const body = (copy.body || '').replace(/\n/g, '<br>')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@import url('${font.importUrl}');</style></head><body style="margin:0;padding:20px 0;background:#f5f5f5;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;background:#ffffff;padding:48px 56px;font-family:${bf};font-size:15px;line-height:1.85;color:#333333;"><tr><td>${body}<br><br><p style="margin:28px 0 0;font-size:11px;color:#aaaaaa;border-top:1px solid #eeeeee;padding-top:16px;"><a href="{{ unsubscribe_url }}" style="color:#aaaaaa;text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp; <a href="{{ manage_preferences_url }}" style="color:#aaaaaa;text-decoration:underline;">Manage preferences</a></p></td></tr></table></body></html>`
}

// ─── COPY GENERATION ─────────────────────────────────────────────────────────

async function generateCopyWithClaude({ brandData, emailType, offer, productImages, isWelcome, flowType, anthropic }) {

  const validImages = (productImages || []).filter(img => img && (img.src || img.alt))
  const pillarCount = validImages.length
  const pc = pillarCount // shorthand used in role instructions below

  const topProductNames = validImages
    .slice(0, pillarCount)
    .map(img => (img.alt || img.name || '').trim())
    .filter(Boolean)

  const roleInstructions = {
    'discount_delivery': `Email 1 of welcome flow. Deliver discount code immediately.
- hero_headline: clean short welcome, NO personalization tag, max 6 words. Example: "Here's your exclusive gift"
- story_p1: one sentence about the brand promise
- story_p2: one sentence about what makes them different
- pillars_heading: "WHY WOODWORKERS CHOOSE US" (brand-relevant equivalent)
- pillars: ${pc} objects — title (USP name) + body (1-2 sentences). Use: ${(brandData.keySellingPoints || []).join(', ')}
- cta_button: "SHOP NOW & SAVE"`,

    'education': `Email 2 of welcome flow. Educate about the product. No discount.
- hero_headline: product benefit hook, max 6 words
- story_p1 + story_p2: how the product works and why it's different
- pillars_heading: "THE KEY BENEFITS" (brand-relevant)
- pillars: ${pc} objects — title + body using: ${(brandData.productNames || []).join(', ')}
- cta_button: "SHOP NOW"`,

    'urgency': `Email 4 of welcome flow. Last chance. Urgency.
- hero_headline: urgency about offer expiring, NO personalization tag, max 6 words. Example: "Your discount expires today"
- story_p1: final reminder of key benefit
- cta_button: "CLAIM MY DISCOUNT"
- cta_headline: final push sentence
- urgency_line: "This offer expires today"`,

    'thank_you': `Post-purchase thank you. Warm, celebratory. No discount.
- hero_headline: celebratory confirmation, NO personalization tag, max 6 words. Example: "Your order is confirmed"
- story_p1: welcome them, reassure their choice
- cta_button: "TRACK MY ORDER"`,

    'how_to_use': `How to use the product. Educational. No selling.
- hero_headline: about using the product, max 6 words
- story_p1: intro paragraph
- pillars_heading: "HOW TO GET STARTED"
- pillars: ${pc} step-by-step tips for ${(brandData.productNames || [])[0] || brandData.productType}
- cta_button: "VISIT OUR BLOG"`,

    'social_proof': `Social proof email. Reviews and complementary products.
- hero_headline: social proof hook, max 6 words
- story_p1: what customers are saying
- pillars_heading: "WHAT CUSTOMERS LOVE"
- pillars: ${pc} customer benefit stories
- cta_button: "SHOP MORE"`,

    'remind': `Abandoned cart reminder. No discount. Direct.
- hero_headline: cart reminder, NO personalization tag, max 6 words. Example: "Your cart is waiting"
- story_p1: emotional connection to the product
- cta_button: "COMPLETE MY ORDER"
- urgency_line: "Items in your cart may sell out"`,

    'build_trust': `Abandoned cart — remove doubt. No discount.
- hero_headline: trust-building, max 6 words
- pillars_heading: "WHY CUSTOMERS TRUST US"
- pillars: ${pc} trust reasons using: ${(brandData.keySellingPoints || []).join(', ')}
- cta_button: "COMPLETE MY ORDER"`,

    'push': `Abandoned cart — final push. Reveal discount if exists.
- hero_headline: final urgency, NO personalization tag, max 6 words. Example: "This is your last chance"
- story_p1: final push
- cta_button: "COMPLETE MY ORDER"
- urgency_line: "This is your last reminder"`,

    'browse_remind': `Browse abandon — soft reminder. No pressure.
- hero_headline: soft reminder, NO personalization tag, max 6 words. Example: "Still thinking it over?"
- story_p1: why these products are worth coming back for
- cta_button: "CONTINUE BROWSING"`,

    'browse_desire': `Browse abandon — build desire. No discount.
- hero_headline: desire-building, max 6 words
- pillars_heading: "WHAT CUSTOMERS SAY"
- pillars: ${pc} customer benefit stories
- cta_button: "SHOP NOW"`,

    'browse_push': `Browse abandon — final push.
- hero_headline: urgency, max 6 words
- story_p1: final reason to buy
- cta_button: "SHOP NOW"
- urgency_line: "Don't miss out"`,

    'checkout_remind': `Checkout abandon — very close. Direct.
- hero_headline: almost there, NO personalization tag, max 6 words. Example: "You're one click away"
- story_p1: items saved, reassure them
- cta_button: "COMPLETE MY ORDER"
- urgency_line: "Your order is saved — complete it now"`,

    'checkout_trust': `Checkout abandon — remove final objections.
- hero_headline: trust and security, max 6 words
- pillars_heading: "YOUR ORDER IS PROTECTED"
- pillars: ${pc} items — guarantee, returns, secure payment
- cta_button: "COMPLETE MY ORDER"`,

    'checkout_push': `Checkout abandon — last chance.
- hero_headline: cart expiry urgency, NO personalization tag, max 6 words. Example: "Your cart expires today"
- story_p1: cart expiring, discount reveal
- cta_button: "COMPLETE MY ORDER"
- urgency_line: "This is your final reminder"`,

    'sub_welcome': `Subscription welcome. Set expectations.
- hero_headline: warm welcome, NO personalization tag, max 6 words. Example: "Welcome to the family"
- story_p1 + story_p2: what to expect
- cta_button: "MANAGE MY SUBSCRIPTION"`,

    'sub_habit': `Subscription — build daily habit.
- hero_headline: about building the habit, max 6 words
- pillars_heading: "YOUR DAILY RITUAL"
- pillars: ${pc} daily routine steps
- cta_button: "LEARN MORE TIPS"`,

    'sub_expectations': `Subscription — set realistic expectations.
- hero_headline: what they'll experience, max 6 words
- pillars_heading: "WHAT TO EXPECT"
- pillars: ${pc} milestones (week 1, month 1, month 3)
- cta_button: "TRACK YOUR PROGRESS"`,

    'Welcome email': `Welcome email. Deliver discount.
- hero_headline: clean welcome, NO personalization tag, max 6 words. Example: "Here's your welcome gift"
- story_p1 + story_p2: brief brand intro with real USPs
- pillars_heading: "WHY CUSTOMERS LOVE US"
- pillars: ${pc} USPs from: ${(brandData.keySellingPoints || []).join(', ')}
- cta_button: "SHOP NOW & SAVE"`,

    'Abandoned cart': `Abandoned cart. Mystery offer mechanic.
- hero_headline: cart reminder, NO personalization tag, max 6 words. Example: "Your cart is waiting"
- story_p1: emotional connection
- cta_button: "COMPLETE MY ORDER"`,

    'Post-purchase': `Post-purchase thank you. No discount.
- hero_headline: celebration, NO personalization tag, max 6 words. Example: "Your order is confirmed"
- story_p1: what happens next
- cta_button: "TRACK MY ORDER"`,

    'Flash sale': `Flash sale. Urgent.
- hero_headline: offer or urgency, max 6 words. No personalization.
- story_p1: urgency copy
- cta_button: "SHOP THE SALE"
- urgency_line: "Sale ends soon"`,

    'Win-back': `Win-back for inactive subscribers.
- hero_headline: re-engagement, NO personalization tag, max 6 words. Example: "We've missed you"
- pillars_heading: "WHAT'S NEW SINCE YOU LEFT"
- pillars: ${pc} new things or improvements
- cta_button: "SEE WHAT'S NEW"`,

    'Product launch': `Product launch announcement. No personalization.
- hero_headline: announce new product, max 6 words
- pillars_heading: "WHY THIS CHANGES EVERYTHING"
- pillars: ${pc} key features or benefits
- cta_button: "SHOP THE NEW COLLECTION"`,
  }

  const instructions = roleInstructions[emailType] || roleInstructions['Welcome email']

  const prompt = `Write email copy for ${brandData.brandName}.

BRAND:
- Name: ${brandData.brandName}
- Tagline: ${brandData.tagline || ''}
- Niche: ${brandData.niche}
- Product: ${brandData.productType}
- Audience: ${brandData.targetAudience}
- Tone: ${brandData.brandTone}
- Voice: ${brandData.brandVoice || ''}
- USPs: ${(brandData.keySellingPoints || []).join(', ')}
- Products: ${(brandData.productNames || []).join(', ')}
- Mission: ${brandData.missionStatement || ''}
- Offer: ${offer || 'none'}

EMAIL ROLE: ${emailType}
INSTRUCTIONS:
${instructions}

GLOBAL RULES:
- Only use information provided. Never invent facts.
- Keep headlines max 8 words.
- Paragraphs max 2-3 sentences each.
- Klaviyo variable {{ first_name | default: 'there' }} — use ONLY where instructions say to. Write it exactly as shown.
- If instructions mention pillars, include pillars_heading (string) and pillars (array of {title, body}).
- CRITICAL: If instructions say "pillars: N objects", you MUST return EXACTLY N pillar objects. Not fewer. Not more. Exactly N.
- CRITICAL: hero_headline must NEVER contain {{ first_name | default: 'there' }} or any Klaviyo personalization tag. The template handles personalization separately above the headline. Keep hero_headline short, clean, and direct.

Return this exact JSON (include all fields, use empty string or empty array if not applicable):
{
  "subject_line": "...",
  "preview_text": "...",
  "hero_headline": "...",
  "hero_subline": "...",
  "story_label": "...",
  "story_headline": "...",
  "story_p1": "...",
  "story_p2": "...",
  "story_p3": "...",
  "pillars_heading": "...",
  "pillars": [],
  "cta_button": "...",
  "cta_headline": "...",
  "cta_sub": "...",
  "urgency_line": "..."
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: `You are an expert email copywriter. Output ONLY valid JSON. No markdown. Start with { and end with }.`,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text.trim()

  let parsed
  try { parsed = JSON.parse(raw) } catch {}
  if (!parsed) {
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {}
  }
  if (!parsed) {
    try {
      const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
      if (start !== -1 && end !== -1) parsed = JSON.parse(raw.substring(start, end + 1))
    } catch {}
  }
  if (!parsed) throw new Error('Could not parse copy output. Please try again.')

  // ── ENFORCE PILLAR COUNT ────────────────────────────────────────────────────
  // Claude doesn't always return exactly pc pillars — LLMs default to 3.
  // We enforce the count here so the template always gets exactly what it needs.
  if (pillarCount > 0) {
    const currentPillars = Array.isArray(parsed.pillars) ? parsed.pillars : []

    if (currentPillars.length < pillarCount) {
      // Too few: pad with copies of the last pillar (slightly varied titles)
      const last = currentPillars[currentPillars.length - 1] || { title: 'Our Promise', body: 'Quality you can count on.' }
      while (currentPillars.length < pillarCount) {
        currentPillars.push({ title: last.title, body: last.body })
      }
    }

    // Too many: trim to exact count
    parsed.pillars = currentPillars.slice(0, pillarCount)
  }

  return parsed
}
