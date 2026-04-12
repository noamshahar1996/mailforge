/**
 * MailForge Template Registry
 *
 * Simple registry. Always picks a named template.
 * Block system is gone for now — it will come back when we have
 * 3+ stable templates and need variety.
 *
 * TO ADD A NEW TEMPLATE:
 * 1. Build it in app/lib/templates/yourtemplate.js
 * 2. Import it here
 * 3. Add it to TEMPLATES array
 * Done — auto-rotates with existing templates on regenerate
 */

import { renderEditorialTemplate } from './sawinery.js'
import { renderProductShowcaseTemplate } from './template2.js'
import { renderCampaignTemplate } from './template3.js'

const TEMPLATES = [
  {
    id: 'editorial_pillar',
    render: renderEditorialTemplate,
  },
  {
    id: 'product_showcase',
    render: renderProductShowcaseTemplate,
  },
  {
    id: 'campaign_promo',
    render: renderCampaignTemplate,
  },
]

/**
 * Always returns a template. When multiple exist, picks randomly
 * so users see different designs on regenerate.
 */
export function selectTemplate() {
  return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
}

/**
 * Calls the template render function with all data.
 */
export function renderTemplate(template, args) {
  return template.render(args)
}
