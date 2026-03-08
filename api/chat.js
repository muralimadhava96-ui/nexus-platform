// Vercel serverless function to proxy Anthropic API requests
// This protects your API key by keeping it server-side

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variable
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return res.status(500).json({ 
      error: 'Server configuration error - API key not configured' 
    });
  }

  const { messages, system } = req.body;

  // Validate request body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request - messages array required' });
  }

  try {
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: system || '',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return res.status(response.status).json({ 
        error: errorData?.error?.message || `API error: ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Extract text content from response
    const content = data.content?.[0]?.text || '';
    
    return res.status(200).json({ content });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to connect to AI service',
      details: error.message 
    });
  }
}
