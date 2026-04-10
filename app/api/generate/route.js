import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { generateEmail, generateFlow } from '../../lib/generator'

export const maxDuration = 120

// Retries a function up to `retries` times when Anthropic returns a 529 overloaded error.
// Waits longer between each attempt (2s, 4s, 6s).
// Any other error fails immediately without retrying.
async function withRetry(fn, retries = 3, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      const isOverloaded =
        err?.status === 529 ||
        err?.message?.includes('overloaded') ||
        err?.message?.includes('529')
      if (isOverloaded && i < retries - 1) {
        await new Promise(res => setTimeout(res, delayMs * (i + 1)))
        continue
      }
      throw err
    }
  }
}

export async function POST(request) {
  try {
    const { brandData, emailType, offer, selectedImages, generatedImages, mode, flowType } = await request.json()

    if (!brandData) {
      return NextResponse.json({ error: 'brandData is required' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    if (mode === 'flow') {
      if (!flowType) return NextResponse.json({ error: 'flowType is required for flow mode' }, { status: 400 })

      const emails = await withRetry(() =>
        generateFlow(brandData, flowType, offer, selectedImages, anthropic, generatedImages)
      )
      return NextResponse.json({ mode: 'flow', emails })

    } else {
      if (!emailType) return NextResponse.json({ error: 'emailType is required' }, { status: 400 })

      const result = await withRetry(() =>
        generateEmail(brandData, emailType, offer, selectedImages, anthropic, generatedImages)
      )

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
