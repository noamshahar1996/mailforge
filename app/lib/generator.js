/**
 * MailForge Email Generator v21
 * Now routes through template system in addition to block-based designEngine.
 * All flow logic, copy generation, and plain text emails unchanged.
 */

import { assembleEmail, getFontPairing } from './designEngine.js'
import { selectTemplate, renderTemplate } from './templates/index.js'

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

    emails.push({
      label: step.label,
      sendTime: step.sendTime,
      isPlainText: step.isPlainText,
      ...email,
    })
  }

  return emails
}

// ─── SINGLE EMAIL GENERATOR ───────────────────────────────────────────────────

export async function generateEmail(brandData, emailType, offer, productImages, anthropic, generatedImages, flowType = null, showProducts = true, overrideCopy = null) {

  const isWelcome      = emailType === 'Welcome email' || emailType === 'discount_delivery'
  const isAbandoned    = ['Abandoned cart', 'remind', 'build_trust', 'push', 'browse_remind', 'browse_desire', 'browse_push', 'checkout_remind', 'checkout_trust', 'checkout_push'].includes(emailType)
  const isPostPurchase = ['Post-purchase', 'thank_you', 'how_to_use', 'social_proof', 'come_back'].includes(emailType)
  const isDiscountEmail = ['push', 'urgency', 'browse_push', 'checkout_push', 'Flash sale', 'Win-back', 'Product launch', 'Abandoned cart'].includes(emailType)

  const realProducts = []
  if (productImages && productImages.length > 0) {
    productImages.forEach(img => {
      if (img.alt && img.alt.trim().length > 2) {
        realProducts.push({ src: img.src, name: img.alt.trim() })
      }
    })
  }
  const topProducts = realProducts.slice(0, 3)

  // Generate copy — skip Claude if overrideCopy is provided (user edited manually)
  const copy = overrideCopy || await generateCopyWithClaude({
    brandData, emailType, offer, topProducts, isWelcome, flowType, anthropic
  })

  // ── TEMPLATE ROUTING ──────────────────────────────────────────────────────
  // Check if a named template should be used for this email role.
  // If selected, render the template. Otherwise fall back to the block system.
  const brandTone  = brandData.brandTone || 'Warm & friendly'
  const font       = getFontPairing(brandTone, brandData)
  const template   = selectTemplate(emailType, brandTone)

  let html
  if (template) {
    // Named template selected — use agency-level Figma design
    html = renderTemplate(template, {
      brandData,
      copy,
      topProducts,
      offer,
      isWelcome,
      isDiscountEmail,
      showProducts,
      font,
    })
  } else {
    // Block system — flexible, brand-adaptive assembly
    html = assembleEmail({
      brandData,
      emailType,
      offer,
      copy,
      topProducts,
      showProducts,
      isWelcome,
      isPostPurchase,
      isDiscountEmail,
      realQuote: brandData.bestTestimonialQuote || null,
    })
  }

  return {
    subject_line: copy.subject_line,
    preview_text: copy.preview_text,
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

  const instructions = roleInstructions[role] || ''

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
${instructions}

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
      const start = raw.indexOf('{')
      const end = raw.lastIndexOf('}')
      copy = JSON.parse(raw.substring(start, end + 1))
    } catch {
      throw new Error('Could not parse plain text email output')
    }
  }

  const html = assemblePlainTextEmail({ brandData, copy })
  return { subject_line: copy.subject_line, preview_text: copy.preview_text, html }
}

function assemblePlainTextEmail({ brandData, copy }) {
  const font = getFontPairing(brandData.brandTone || 'Warm & friendly')
  const bf = `'${font.body}',Arial,Helvetica,sans-serif`
  const body = (copy.body || '').replace(/\n/g, '<br>')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@import url('${font.importUrl}');</style></head><body style="margin:0;padding:20px 0;background:#f5f5f5;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="margin:0 auto;max-width:600px;background:#ffffff;padding:48px 56px;font-family:${bf};font-size:15px;line-height:1.85;color:#333333;"><tr><td>${body}<br><br><p style="margin:28px 0 0;font-size:11px;color:#aaaaaa;border-top:1px solid #eeeeee;padding-top:16px;"><a href="#" style="color:#aaaaaa;text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp; <a href="#" style="color:#aaaaaa;text-decoration:underline;">Manage preferences</a></p></td></tr></table></body></html>`
}

// ─── COPY GENERATION ─────────────────────────────────────────────────────────

async function generateCopyWithClaude({ brandData, emailType, offer, topProducts, isWelcome, flowType, anthropic }) {

  const systemPrompt = `You are an expert email copywriter for ecommerce brands. Output ONLY valid JSON. No markdown. Start with { and end with }.`

  const roleInstructions = {
    'discount_delivery': `Email 1 of welcome flow. Send immediately.
- Hero headline: personalized welcome with {{ first_name | default: 'there' }}, max 8 words. Example: "Welcome, {{ first_name | default: 'there' }} — here's your gift"
- Hero subline: one sentence about the brand
- Story: brief brand intro, only real USPs, max 2 paragraphs
- CTA button: "SHOP NOW & SAVE" if offer exists, else "SHOP NOW"`,

    'education': `Email 2 of welcome flow. Send 1 day later.
- Build trust, educate about the product. No discount mention.
- Hero headline: product benefit hook, max 6 words. No personalization needed.
- Story: how it works, why it's different, use product names: ${(brandData.productNames || []).join(', ')}
- pillars_heading: "THE KEY PILLARS" or similar (max 4 words, uppercase)
- pillars: array of 3-4 objects with "title" and "body" (each body max 3 sentences)
- CTA button: "SHOP NOW"`,

    'urgency': `Email 4 of welcome flow. Last chance. Send 3 days later.
- Hero headline: urgency about offer expiring, include {{ first_name | default: 'there' }}, max 8 words. Example: "{{ first_name | default: 'there' }}, your discount expires today"
- Story: last reminder of key benefits
- Offer: ${offer || 'welcome discount'}
- CTA button: "CLAIM MY DISCOUNT"
- Urgency line: "This offer expires today"`,

    'thank_you': `Email 1 of post-purchase flow. Send right after purchase.
- Celebratory, warm, reassuring. No discount.
- Hero headline: celebrate with personalization, max 8 words. Example: "Your order is confirmed, {{ first_name | default: 'there' }}!"
- Story: welcome them, make them feel they made the right choice
- CTA button: "TRACK MY ORDER"`,

    'how_to_use': `Email 2 of post-purchase flow. Send 1–2 days later.
- Teach them how to use the product. NO selling. NO discount.
- Hero headline: about using the product, max 6 words. No personalization needed.
- Story: intro paragraph
- pillars_heading: "HOW TO GET STARTED" or similar (max 4 words, uppercase)
- pillars: array of 3 objects with "title" (short step name) and "body" (1-2 sentences each)
- CTA button: "VISIT OUR BLOG"`,

    'social_proof': `Email 3 of post-purchase flow. Send 3–5 days later.
- Show reviews, suggest complementary products. No discount.
- Hero headline: social proof focused, max 6 words. No personalization needed.
- product_label: "YOU MIGHT ALSO LOVE"
- product_headline: complementary products from: ${(brandData.productNames || []).join(', ')}
- CTA button: "SHOP MORE"`,

    'remind': `Email 1 of abandoned cart flow. Send 1 hour after abandonment.
- Just remind them. No discount. One clear CTA.
- Hero headline: cart is waiting with personalization, max 8 words. Example: "{{ first_name | default: 'there' }}, your cart is waiting"
- Hero subline: name these products: ${topProducts.map(p => p.name).join(', ')}
- Story: 1 short paragraph — emotional connection to the product
- CTA button: "COMPLETE MY ORDER"
- Urgency line: "Items in your cart may sell out"`,

    'build_trust': `Email 2 of abandoned cart flow. Send 24 hours later.
- Remove doubt. Show reviews. Answer objections. NO discount.
- Hero headline: trust-building, max 6 words. No personalization needed.
- pillars_heading: "WHY CUSTOMERS CHOOSE US" or similar
- pillars: array of 3 trust reasons with "title" and "body" (each 1-2 sentences)
- Use real USPs: ${(brandData.keySellingPoints || []).join(', ')}
- CTA button: "COMPLETE MY ORDER"`,

    'push': `Email 3 of abandoned cart flow. Send 48–72 hours later.
- Final push. Reveal discount if one exists.
- Hero headline: urgency with personalization, max 8 words. Example: "{{ first_name | default: 'there' }}, this is your last chance"
- Story: final push with urgency or scarcity
- Offer: ${offer || 'none — use urgency instead'}
- CTA button: "COMPLETE MY ORDER"
- Urgency line: "This is your last reminder"`,

    'browse_remind': `Email 1 of browse abandon flow. Send 1 hour after browsing.
- Soft reminder. No discount, no pressure.
- Hero headline: personalized, max 8 words. Example: "Still thinking it over, {{ first_name | default: 'there' }}?"
- Hero subline: reference what they were browsing: ${(brandData.productNames || []).join(', ')}
- Story: why these products are worth coming back for
- CTA button: "CONTINUE BROWSING"
- Urgency line: "Popular items sell out fast"`,

    'browse_desire': `Email 2 of browse abandon flow. Send 24 hours later.
- Build desire and social proof. No discount.
- Hero headline: desire-building, max 6 words. No personalization needed.
- pillars_heading: "WHAT CUSTOMERS SAY" or similar
- pillars: array of 3 customer benefit stories with "title" and "body"
- Use real USPs: ${(brandData.keySellingPoints || []).join(', ')}
- CTA button: "SHOP NOW"`,

    'browse_push': `Email 3 of browse abandon flow. Send 48 hours later.
- Final push with optional discount.
- Hero headline: urgency or offer, max 6 words. No personalization needed.
- Story: final reason to buy, scarcity or discount reveal
- Offer: ${offer || 'none — use scarcity instead'}
- CTA button: "SHOP NOW"
- Urgency line: "Don't miss out"`,

    'checkout_remind': `Email 1 of checkout abandon flow. Send 30 min after abandonment.
- They almost finished. Super direct.
- Hero headline: personalized, max 8 words. Example: "{{ first_name | default: 'there' }}, you're one click away"
- Hero subline: their order is saved and waiting
- Story: 1 short paragraph — reassure them, their items are held
- CTA button: "COMPLETE MY ORDER"
- Urgency line: "Your order is saved — complete it now"`,

    'checkout_trust': `Email 2 of checkout abandon flow. Send 24 hours later.
- Remove final purchase objections. No discount.
- Hero headline: trust and security focused, max 6 words. No personalization needed.
- pillars_heading: "YOUR ORDER IS PROTECTED" or similar
- pillars: array of 3 objects covering guarantee, returns, payment security
- Use real USPs: ${(brandData.keySellingPoints || []).join(', ')}
- CTA button: "COMPLETE MY ORDER"`,

    'checkout_push': `Email 3 of checkout abandon flow. Send 48 hours later.
- Last chance. Reveal discount now.
- Hero headline: final urgency with personalization, max 8 words. Example: "{{ first_name | default: 'there' }}, your cart expires today"
- Story: last push — discount reveal, cart expiring
- Offer: ${offer || 'none — use cart expiry urgency instead'}
- CTA button: "COMPLETE MY ORDER"
- Urgency line: "This is your final reminder"`,

    'sub_welcome': `Email 1 of subscription onboarding. Send immediately.
- Welcome them to the subscription. Set expectations.
- Hero headline: personalized welcome, max 8 words. Example: "Welcome to the family, {{ first_name | default: 'there' }}!"
- Hero subline: what they can expect from their subscription
- Story: what's coming in their first order, how to get the most out of it
- CTA button: "MANAGE MY SUBSCRIPTION"`,

    'sub_habit': `Email 2 of subscription onboarding. Send 1–2 days later.
- Teach them how to build a daily habit.
- Hero headline: about building the daily habit, max 6 words. No personalization needed.
- pillars_heading: "YOUR DAILY RITUAL" or similar
- pillars: array of 3 steps for building the habit, each with "title" and "body"
- CTA button: "LEARN MORE TIPS"`,

    'sub_expectations': `Email 3 of subscription onboarding. Send 3–5 days later.
- Set realistic results expectations to prevent churn.
- Hero headline: about what they'll experience, max 6 words. No personalization needed.
- pillars_heading: "WHAT TO EXPECT" or similar
- pillars: array of 3 timeline milestones (week 1, month 1, month 3) with "title" and "body"
- Do NOT overpromise.
- CTA button: "TRACK YOUR PROGRESS"`,

    'Welcome email': `Welcome email #1. Deliver discount code.
- Hero headline: personalized welcome, max 8 words. Example: "Welcome, {{ first_name | default: 'there' }} — here's your gift"
- Story: brief brand intro, only real USPs
- CTA button: "SHOP NOW & SAVE" if offer, else "SHOP NOW"`,

    'Abandoned cart': `Abandoned cart. No discount — mystery mechanic.
- Hero headline: personalized, max 8 words. Example: "{{ first_name | default: 'there' }}, your cart is waiting"
- Hero subline: reference: ${topProducts.map(p => p.name).join(', ')}
- Story: emotional connection + mystery offer hint
- CTA button: "COMPLETE MY ORDER"`,

    'Post-purchase': `Post-purchase thank you. No discount.
- Hero headline: personalized celebration, max 8 words. Example: "Your order is confirmed, {{ first_name | default: 'there' }}!"
- Story: what happens next, care tips
- CTA button: "TRACK MY ORDER"`,

    'Flash sale': `Flash sale. Urgent and exciting. No personalization needed.
- Hero headline: offer or urgency, max 6 words
- Offer: ${offer || 'limited time discount'}
- CTA button: "SHOP THE SALE"
- Urgency line: "Sale ends soon"`,

    'Win-back': `Win-back for inactive subscribers.
- Hero headline: personalized, max 8 words. Example: "We've missed you, {{ first_name | default: 'there' }}"
- pillars_heading: "WHAT'S NEW SINCE YOU LEFT" or similar
- pillars: array of 3 new things or improvements with "title" and "body"
- CTA button: "COME BACK & SAVE" if offer, else "SEE WHAT'S NEW"`,

    'Product launch': `Product launch announcement. No personalization needed.
- Hero headline: announce new product, max 6 words
- pillars_heading: "WHY THIS CHANGES EVERYTHING" or similar
- pillars: array of 3 key features or benefits with "title" and "body"
- CTA button: "SHOP THE NEW COLLECTION"`,
  }

  const instructions = roleInstructions[emailType] || ''

  const prompt = `Write copy for a ${emailType} email for ${brandData.brandName}.

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

EMAIL INSTRUCTIONS:
${instructions}

GLOBAL RULES:
- Only use information provided above. Never invent facts or details.
- Write in the brand voice. Be specific to the niche and products.
- Keep headlines punchy and short (max 8 words).
- Keep paragraphs to 2-3 sentences max.
- testimonial_name: realistic customer first name and last initial only (e.g. "James R."). NEVER use the brand name.
- Klaviyo variable {{ first_name | default: 'there' }} — use ONLY where the instructions above say to. Write it exactly as shown.
- If instructions mention "pillars", include a "pillars_heading" string and a "pillars" array of objects with "title" and "body" keys.

Return this exact JSON:
{
  "subject_line": "...",
  "preview_text": "...",
  "hero_headline": "...",
  "hero_subline": "...",
  "hero_eyebrow": "...",
  "story_label": "...",
  "story_headline": "...",
  "story_p1": "...",
  "story_p2": "...",
  "story_p3": "...",
  "pillars_heading": "...",
  "pillars": [],
  "product_label": "...",
  "product_headline": "...",
  "cta_headline": "...",
  "cta_sub": "...",
  "cta_label": "...",
  "cta_button": "...",
  "urgency_line": "...",
  "testimonial_name": "..."
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text.trim()
  try { return JSON.parse(raw) } catch {}
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(cleaned)
  } catch {}
  try {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start !== -1 && end !== -1) return JSON.parse(raw.substring(start, end + 1))
  } catch {}
  throw new Error('Could not parse copy output. Please try again.')
}
