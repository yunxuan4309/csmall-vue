import gatewayHttp from './request'

/**
 * 获取购物车列表
 * @returns {Promise}
 */
export function getCartList() {
  return gatewayHttp.get('/oms/cart/list')
}

/**
 * 添加商品到购物车
 * @param {Object} data - 购物车数据
 * @param {number} data.skuId - SKU ID
 * @param {number} data.quantity - 数量
 * @returns {Promise}
 */
export function addToCart(data) {
  return gatewayHttp.post('/oms/cart/add', data)
}

/**
 * 更新购物车商品数量
 * @param {number} id - 购物车项ID
 * @param {number} quantity - 数量
 * @returns {Promise}
 */
export function updateCartQuantity(id, quantity) {
  return gatewayHttp.put(`/oms/cart/update/${id}`, { quantity })
}

/**
 * 删除购物车商品
 * @param {number} id - 购物车项ID
 * @returns {Promise}
 */
export function deleteCartItem(id) {
  return gatewayHttp.delete(`/oms/cart/delete/${id}`)
}

/**
 * 批量删除购物车商品
 * @param {Array<number>} ids - 购物车项ID数组
 * @returns {Promise}
 */
export function batchDeleteCartItem(ids) {
  return gatewayHttp.post('/oms/cart/batch-delete', { ids })
}

/**
 * 选中/取消选中购物车商品
 * @param {number} id - 购物车项ID
 * @param {boolean} checked - 是否选中
 * @returns {Promise}
 */
export function toggleCartItemChecked(id, checked) {
  return gatewayHttp.put(`/oms/cart/checked/${id}`, { checked })
}
