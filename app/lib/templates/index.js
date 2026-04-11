/**
 * MailForge Template Registry
 *
 * HOW IT WORKS:
 * - Every email always uses a named template from this registry when one is available.
 * - The block system (designEngine.js) is the fallback only when no template covers the role.
 * - When multiple templates cover the same role, one is picked randomly — giving users
 *   variety on each regenerate without needing to change any other code.
 *
 * TO ADD A NEW TEMPLATE:
 * 1. Build the template file in app/lib/templates/yourtemplate.js
 * 2. Import it here
 * 3. Add it to TEMPLATE_REGISTRY with its suitableRoles
 * 4. Done — the system automatically includes it in rotation
 */

import { renderEditorialTemplate } from './sawinery.js'

// ─── TEMPLATE REGISTRY ────────────────────────────────────────────────────────

const TEMPLATE_REGISTRY = [
  {
    id: 'editorial_pillar',
    name: 'Editorial Pillar',
    render: renderEditorialTemplate,
    // All email roles this template can handle.
    // Right now this covers everything — when Template 2 is added,
    // move shared roles there too so users get variety.
    suitableRoles: [
      // Welcome flow
      'discount_delivery',
      'education',
      'urgency',
      // Post-purchase flow
      'thank_you',
      'how_to_use',
      'social_proof',
      // Abandoned cart flow
      'remind',
      'build_trust',
      'push',
      // Browse abandon flow
      'browse_remind',
      'browse_desire',
      'browse_push',
      // Checkout abandon flow
      'checkout_remind',
      'checkout_trust',
      'checkout_push',
      // Subscription flow
      'sub_welcome',
      'sub_habit',
      'sub_expectations',
      // Single emails
      'Welcome email',
      'Abandoned cart',
      'Post-purchase',
      'Flash sale',
      'Win-back',
      'Product launch',
    ],
    acceptableRoles: [],
  },

  // ── ADD MORE TEMPLATES HERE AS YOU BUILD THEM ──────────────────────────────
  // Example — once you have a second Figma design ready:
  //
  // {
  //   id: 'bold_campaign',
  //   name: 'Bold Campaign',
  //   render: renderBoldCampaignTemplate,
  //   suitableRoles: [
  //     'urgency', 'push', 'Flash sale', 'checkout_push',
  //     'browse_push', 'Abandoned cart',
  //   ],
  //   acceptableRoles: [],
  // },
]

// ─── TEMPLATE SELECTOR ────────────────────────────────────────────────────────
/**
 * Always returns a named template when one covers the email role.
 * Falls back to null (block system) only when no template matches.
 *
 * When multiple templates cover the same role, one is picked randomly —
 * so users see different designs on each regenerate automatically.
 */
export function selectTemplate(emailRole, brandTone) {
  const available = TEMPLATE_REGISTRY.filter(t =>
    t.suitableRoles.includes(emailRole) ||
    t.acceptableRoles.includes(emailRole)
  )

  if (available.length === 0) return null

  // Single template = always chosen
  // Multiple templates = random pick for variety
  return available[Math.floor(Math.random() * available.length)]
}

// ─── TEMPLATE RENDERER ────────────────────────────────────────────────────────
/**
 * Calls the selected template's render function with all required data.
 * generator.js calls this — it never needs to know which template was picked.
 */
export function renderTemplate(template, {
  brandData,
  copy,
  topProducts,
  offer,
  isWelcome,
  isDiscountEmail,
  showProducts,
  font,
}) {
  return template.render({
    brandData,
    copy,
    topProducts,
    offer,
    isWelcome,
    isDiscountEmail,
    showProducts,
    font,
  })
}
