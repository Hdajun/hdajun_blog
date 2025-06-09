import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: body.messages || [],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
        ...body
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('DeepSeek API Error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    // 创建一个 TransformStream 来处理流式响应
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk)
        // 处理 SSE 格式的数据
        const lines = text.split('\n').filter(line => line.trim() !== '')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              continue
            }
            try {
              // 保持原始的 SSE 格式
              controller.enqueue(encoder.encode(`${line}\n\n`))
            } catch (error) {
              console.error('Error parsing JSON:', error)
            }
          }
        }
      }
    })

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Error calling DeepSeek API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch from DeepSeek API', 
      details: error?.message || String(error)
    }, { status: 500 })
  }
}