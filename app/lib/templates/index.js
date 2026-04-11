/**
 * MailForge Template Registry
 *
 * HOW IT WORKS:
 * - Each named template is a full HTML layout built from Figma/agency designs.
 * - Templates are registered here with metadata: which email roles they suit.
 * - On each generation, the system randomly picks between the block-based engine
 *   (designEngine.js) and a named template, weighted toward templates for roles
 *   where they exist.
 * - As more Figma designs are added, register them here and the system automatically
 *   includes them in the rotation.
 *
 * TO ADD A NEW TEMPLATE:
 * 1. Build the template file in app/lib/templates/yourtemplate.js
 * 2. Import it here
 * 3. Add it to TEMPLATE_REGISTRY with its suitable roles
 */

import { renderEditorialTemplate } from './sawinery.js'

// ─── TEMPLATE REGISTRY ────────────────────────────────────────────────────────
// Each entry defines which email roles the template is suitable for.
// A template is only selected for roles it matches.
// 'weight' controls how often it's picked vs the block system (1 = equal chance).

const TEMPLATE_REGISTRY = [
  {
    id: 'editorial_pillar',
    name: 'Editorial Pillar',
    render: renderEditorialTemplate,
    weight: 1,
    // Best for educational, content-heavy, and trust-building emails
    suitableRoles: [
      'education',
      'how_to_use',
      'social_proof',
      'build_trust',
      'browse_desire',
      'checkout_trust',
      'sub_habit',
      'sub_expectations',
      // Single email types
      'Win-back',
      'Product launch',
    ],
    // Roles where this template can be used but is not ideal
    acceptableRoles: [
      'discount_delivery',
      'thank_you',
      'sub_welcome',
      'remind',
      'Welcome email',
      'Post-purchase',
    ],
  },
  // ── ADD MORE TEMPLATES HERE AS YOU BUILD THEM ──
  // {
  //   id: 'bold_campaign',
  //   name: 'Bold Campaign',
  //   render: renderBoldCampaignTemplate,
  //   weight: 1,
  //   suitableRoles: ['urgency', 'push', 'Flash sale', 'checkout_push'],
  //   acceptableRoles: ['browse_push', 'Abandoned cart'],
  // },
]

// ─── TEMPLATE SELECTOR ────────────────────────────────────────────────────────
/**
 * Decides whether to use a named template or the block-based engine.
 * Returns the template entry if one is selected, or null to use the block system.
 *
 * Selection logic:
 * - If a template is "suitable" for the role, it has a 60% chance of being chosen
 * - If a template is only "acceptable" for the role, it has a 25% chance
 * - If no template matches, always uses the block system
 * - On regenerate, different random rolls = different output each time
 */
export function selectTemplate(emailRole, brandTone) {
  const suitableTemplates  = TEMPLATE_REGISTRY.filter(t => t.suitableRoles.includes(emailRole))
  const acceptableTemplates = TEMPLATE_REGISTRY.filter(t => t.acceptableRoles.includes(emailRole))

  // Try suitable templates first (60% chance each)
  if (suitableTemplates.length > 0) {
    const roll = Math.random()
    if (roll < 0.60) {
      // Pick randomly among suitable templates
      return suitableTemplates[Math.floor(Math.random() * suitableTemplates.length)]
    }
  }

  // Try acceptable templates (25% chance each)
  if (acceptableTemplates.length > 0) {
    const roll = Math.random()
    if (roll < 0.25) {
      return acceptableTemplates[Math.floor(Math.random() * acceptableTemplates.length)]
    }
  }

  // Use block-based engine
  return null
}

// ─── TEMPLATE RENDERER ────────────────────────────────────────────────────────
/**
 * Calls the selected template's render function with all required data.
 * This is the single entry point — generator.js calls this instead of assembleEmail() directly.
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
