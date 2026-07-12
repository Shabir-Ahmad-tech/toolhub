import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool } = body

    if (!tool || typeof tool !== 'string') {
      return NextResponse.json({ error: 'Tool slug required' }, { status: 400 })
    }

    // In production, this would log to the tool_usage table in Supabase
    // For now, we silently accept the tracking data
    console.log(`[Tool Usage] ${tool} — ${new Date().toISOString()}`)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}