import gatewayHttp from './request'

/**
 * 获取订单列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.status - 订单状态（可选）
 * @returns {Promise} 返回分页数据
 */
export function getOrderList(params) {
  return gatewayHttp.get('/oms/order/list', { params })
}

/**
 * 获取订单详情
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function getOrderDetail(id) {
  return gatewayHttp.get('/oms/order/detail', { params: { id } })
}

/**
 * 提交订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export function createOrder(data) {
  return gatewayHttp.post('/oms/order/add', data)
}

/**
 * 取消订单
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function cancelOrder(id) {
  return gatewayHttp.post('/oms/order/update/state', { id, state: 2 })
}

/**
 * 确认收货
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function confirmReceive(id) {
  return gatewayHttp.post('/oms/order/update/state', { id, state: 4 })
}

/**
 * 删除订单
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function deleteOrder(id) {
  return gatewayHttp.delete(`/oms/order/delete/${id}`)
}

/**
 * 获取订单物流信息
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function getOrderLogistics(id) {
  return gatewayHttp.get(`/oms/order/logistics/${id}`)
}
