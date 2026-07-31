import gatewayHttp from './request'

// ==================== AI 语义搜索 ====================

/**
 * AI 语义搜索 — ES 召回 Top-15 → AI 按意图重排序 → 返回 Top-5 + 解释
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise}
 */
export function searchProducts(keyword, page = 1, pageSize = 10) {
  return gatewayHttp.post('/ai/search', { keyword, page, pageSize }, { timeout: 30000 })
}

// ==================== 搜索自动补全 ====================

/**
 * 获取搜索补全建议（ES Completion Suggester，<50ms）
 * @param {string} keyword - 部分搜索词
 * @returns {Promise<{data: {suggestions: string[]}}>}
 */
export function getSearchSuggestions(keyword) {
  return gatewayHttp.get('/ai/search/suggest', { params: { keyword }, timeout: 30000 })
}

// ==================== 相关商品推荐 ====================

/**
 * 相关商品推荐（ES more_like_this，不消耗 AI Token）
 * @param {number} spuId - 当前商品 SPU ID
 * @returns {Promise<{data: RelatedProductVO[]}>}
 */
export function getRelatedProducts(spuId) {
  return gatewayHttp.get(`/ai/product/${spuId}/related`)
}

// ==================== 搜索历史（本地 localStorage） ====================

const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10

export function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch { return [] }
}

export function addSearchHistory(keyword) {
  let list = getSearchHistory()
  list = list.filter(k => k !== keyword)
  list.unshift(keyword)
  if (list.length > MAX_HISTORY) list.pop()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

export function clearSearchHistory() {
  localStorage.setItem(HISTORY_KEY, '[]')
}
