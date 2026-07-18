import gatewayHttp from './request'

/**
 * RAG 智能问答
 * @param {string} question - 用户问题
 * @param {number} topK - 返回相关商品数量，默认5
 * @returns {Promise}
 */
export function askAI(question, topK = 5) {
  return gatewayHttp.post('/ai/ask', { question, topK })
}

/**
 * AI 商品对比
 * @param {number[]} spuIds - 商品ID数组（2-4个）
 * @param {string[]} dimensions - 对比维度，可选
 * @returns {Promise}
 */
export function compareProducts(spuIds, dimensions) {
  return gatewayHttp.post('/ai/compare', { spuIds, dimensions })
}

/**
 * 全量同步商品数据到ES（管理员使用）
 * @returns {Promise}
 */
export function syncAllProducts() {
  return gatewayHttp.post('/ai/sync')
}

/**
 * 增量同步单个商品到ES（管理员使用）
 * @param {number} spuId - 商品ID
 * @returns {Promise}
 */
export function syncProduct(spuId) {
  return gatewayHttp.post(`/ai/sync/${spuId}`)
}

// ==================== 多轮对话接口 ====================

/**
 * 创建多轮对话会话
 * @returns {Promise} 返回 { sessionId, reply, preferences, relatedProducts }
 */
export function createChatSession() {
  return gatewayHttp.post('/ai/chat/session')
}

/**
 * 发送多轮对话消息
 * @param {string} sessionId - 会话ID（首次可传 null）
 * @param {string} message - 用户消息
 * @returns {Promise} 返回 { sessionId, reply, preferences, relatedProducts }
 */
export function sendChatMessage(sessionId, message) {
  return gatewayHttp.post('/ai/chat/send', { sessionId, message })
}

/**
 * 获取多轮对话历史
 * @param {string} sessionId - 会话ID
 * @returns {Promise} 返回 { sessionId, messages, preferences }
 */
export function getChatHistory(sessionId) {
  return gatewayHttp.get('/ai/chat/history', { params: { sessionId } })
}

/**
 * 流式发送消息（SSE）
 * @param {string} sessionId - 会话ID
 * @param {string} message - 用户消息
 * @param {object} callbacks - { onThinking, onChunk, onProducts, onSessionId, onCategories, onDone, onError }
 * @returns {AbortController} 用于取消请求
 */
export function streamChatMessage(sessionId, message, callbacks) {
  const controller = new AbortController()
  // token 已由 store 层添加了 Bearer 前缀（如 "Bearer eyJ..."），直接用
  const token = localStorage.getItem('mall_token') || localStorage.getItem('admin_token')

  fetch(`${import.meta.env.VITE_API_GATEWAY}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token || ''
    },
    body: JSON.stringify({ sessionId, message }),
    signal: controller.signal
  }).then(async response => {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent = 'message'

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // 按空行分割 SSE 事件块
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''

      for (const part of parts) {
        const lines = part.split('\n')
        let eventName = 'message'
        let data = ''

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            data = line.slice(5).trim()
          }
        }

        if (!data && eventName === 'done') {
          callbacks.onDone?.()
        } else if (!data && eventName === 'message') {
          continue
        }

        switch (eventName) {
          case 'thinking':
            callbacks.onThinking?.(data)
            break
          case 'chunk':
          case 'message':
            callbacks.onChunk?.(data)
            break
          case 'products':
            try { callbacks.onProducts?.(JSON.parse(data)) } catch {}
            break
          case 'categories':
            try { callbacks.onCategories?.(JSON.parse(data)) } catch {}
            break
          case 'sessionId':
            callbacks.onSessionId?.(data)
            break
          case 'done':
            callbacks.onDone?.()
            break
          case 'error':
            callbacks.onError?.(data)
            break
        }
      }
    }
  }).catch(err => {
    if (err.name !== 'AbortError') {
      callbacks.onError?.(err.message || '网络错误')
    }
  })

  return controller
}
