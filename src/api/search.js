import gatewayHttp from './request'

/**
 * 搜索商品
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.categoryId - 分类ID（可选）
 * @param {number} params.brandId - 品牌ID（可选）
 * @param {string} params.sort - 排序方式（可选）
 * @returns {Promise} 返回搜索结果
 */
export function searchProducts(params) {
  return gatewayHttp.get('/search/products', { params })
}

/**
 * 获取搜索建议
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function getSearchSuggestions(keyword) {
  return gatewayHttp.get('/search/suggestions', {
    params: { keyword }
  })
}

/**
 * 获取热门搜索词
 * @returns {Promise}
 */
export function getHotSearchKeywords() {
  return gatewayHttp.get('/search/hot-keywords')
}

/**
 * 获取搜索历史记录
 * @returns {Promise}
 */
export function getSearchHistory() {
  return gatewayHttp.get('/search/history')
}

/**
 * 清除搜索历史记录
 * @returns {Promise}
 */
export function clearSearchHistory() {
  return gatewayHttp.delete('/search/history')
}
