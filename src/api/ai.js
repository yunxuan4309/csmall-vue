import gatewayHttp from './request'

// ==================== AI 商品对比 ====================

export function compareProducts(spuIds) {
  return gatewayHttp.post('/ai/compare', spuIds)
}

// ==================== RAG 商品问答 ====================

export function askQuestion(question) {
  return gatewayHttp.post('/ai/ask', { question })
}

// ==================== 流式智能导购 ====================

/**
 * SSE 流式对话
 *
 * 开发环境：直连 mall-ai:10010（绕过 Vite 代理，避免缓冲）
 * 生产环境：走 Gateway
 */
export async function streamChatMessage(sessionId, message, callbacks) {
  const controller = new AbortController()
  const token = localStorage.getItem('mall_token') || localStorage.getItem('admin_token')

  const streamUrl = import.meta.env.DEV
    ? 'http://localhost:10010/ai/chat/stream'
    : '/ai/chat/stream'

  try {
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
      body: JSON.stringify({ sessionId, message }),
      signal: controller.signal
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''

      for (const part of parts) {
        const lines = part.split('\n')
        let eventName = 'message'
        let data = ''

        for (const line of lines) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim()
          else if (line.startsWith('data:')) data = line.slice(5).trim()
        }

        if (!data && eventName === 'message') continue

        switch (eventName) {
          case 'thinking': callbacks.onThinking?.(data); break
          case 'products': try { callbacks.onProducts?.(JSON.parse(data)) } catch {} break
          case 'categories': try { callbacks.onCategories?.(JSON.parse(data)) } catch {} break
          case 'sessionId': callbacks.onSessionId?.(data); break
          case 'chunk':
            // 关键：await 等待打字机延迟完成，再继续下一个 chunk
            await callbacks.onChunk(data)
            break
          case 'done': callbacks.onDone?.(); break
          case 'error': callbacks.onError?.(data); break
        }
      }
    }

    callbacks.onDone?.()
  } catch (err) {
    if (err.name !== 'AbortError') {
      callbacks.onError?.(err.message || '网络错误')
    }
  }

  return controller
}

// ==================== 对话历史 ====================

export function getChatHistory(sessionId) {
  return gatewayHttp.get('/ai/chat/history', { params: { sessionId } })
}
