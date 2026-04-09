import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { generateEmail, generateFlow } from '../../lib/generator'

export const maxDuration = 120

export async function POST(request) {
  try {
    const { brandData, emailType, offer, selectedImages, generatedImages, mode, flowType } = await request.json()

    if (!brandData) {
      return NextResponse.json({ error: 'brandData is required' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    if (mode === 'flow') {
      if (!flowType) return NextResponse.json({ error: 'flowType is required for flow mode' }, { status: 400 })
      const emails = await generateFlow(brandData, flowType, offer, selectedImages, anthropic, generatedImages)
      return NextResponse.json({ mode: 'flow', emails })
    } else {
      if (!emailType) return NextResponse.json({ error: 'emailType is required' }, { status: 400 })
      const result = await generateEmail(brandData, emailType, offer, selectedImages, anthropic, generatedImages)
      if (!result.html || result.html.length < 100) {
        return NextResponse.json({ error: 'Generated email was empty. Please try again.' }, { status: 500 })
      }
      return NextResponse.json({ mode: 'single', ...result })
    }
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
