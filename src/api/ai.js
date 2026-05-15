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
