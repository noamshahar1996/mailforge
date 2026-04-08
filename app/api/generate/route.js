import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { generateEmail } from '../../lib/generator'

export const maxDuration = 60

export async function POST(request) {
  try {
    const { brandData, emailType, offer, selectedImages } = await request.json()

    if (!brandData || !emailType) {
      return NextResponse.json({ error: 'brandData and emailType are required' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const result = await generateEmail(brandData, emailType, offer, selectedImages, anthropic)

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
