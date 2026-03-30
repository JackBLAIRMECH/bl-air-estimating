export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const apiKey = req.headers.get('x-api-key')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const body = await req.text()

  // Stream the response from Anthropic directly back to the browser
  // This keeps the connection alive and bypasses Vercel's 25s timeout
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body,
  })

  // Pipe Anthropic's response directly back — no buffering, no timeout
  return new Response(response.body, {
    status: response.status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
