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

const TEMPLATES = [
  {
    id: 'editorial_pillar',
    render: renderEditorialTemplate,
  },
  // Add more here as they are built and tested:
  // { id: 'bold_campaign', render: renderBoldCampaignTemplate },
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
