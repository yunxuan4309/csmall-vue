import gatewayHttp from './request'

/**
 * 获取购物车列表
 * @returns {Promise}
 */
export function getCartList() {
  return gatewayHttp.get('/oms/cart/list')
}

/**
 * 新增商品到购物车
 * @param {Object} data - 购物车数据
 * @param {number} data.skuId - SKU ID
 * @param {string} data.title - 商品标题
 * @param {string} data.mainPicture - 商品主图URL
 * @param {number} data.price - 商品单价
 * @param {number} data.quantity - 购买数量
 * @returns {Promise}
 */
export function addToCart(data) {
  return gatewayHttp.post('/oms/cart/add', data)
}

/**
 * 修改购物车商品数量
 * @param {Object} data - 更新数据
 * @param {number} data.id - 购物车记录ID
 * @param {number} data.quantity - 新的数量
 * @returns {Promise}
 */
export function updateCartQuantity(data) {
  return gatewayHttp.post('/oms/cart/update/quantity', data)
}

/**
 * 删除购物车商品(批量)
 * @param {Array<number>} ids - 购物车记录ID数组
 * @returns {Promise}
 */
export function deleteCartItem(ids) {
  // 支持单个ID或数组
  const idArray = Array.isArray(ids) ? ids : [ids]
  return gatewayHttp.post('/oms/cart/delete', null, {
    params: { ids: idArray }
  })
}

/**
 * 清空购物车
 * @returns {Promise}
 */
export function clearCart() {
  return gatewayHttp.post('/oms/cart/delete/all')
}
