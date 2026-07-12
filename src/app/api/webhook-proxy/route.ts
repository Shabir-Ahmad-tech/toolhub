import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { url, method, headers, body } = data

    if (!url) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 })
    }

    // Prepare request options for backend fetch
    const requestOptions: RequestInit = {
      method: method || 'POST',
      headers: headers || {},
      body: ['GET', 'HEAD'].includes(method) ? undefined : body,
    }

    const startTime = performance.now()
    const response = await fetch(url, requestOptions)
    const endTime = performance.now()

    const text = await response.text()
    
    // Copy response headers
    const responseHeadersObj: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeadersObj[key] = value
    })

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeadersObj,
      body: text,
      timeMs: Math.round(endTime - startTime),
    })
  } catch (err: any) {
    return NextResponse.json({
      status: null,
      statusText: 'Proxy Request Failed',
      headers: {},
      body: '',
      errorDetails: err.message || 'Error occurred while forwarding the webhook request',
    }, { status: 502 }) // 502 Bad Gateway
  }
}
