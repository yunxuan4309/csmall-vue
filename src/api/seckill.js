import gatewayHttp from './request'

/**
 * 获取秒杀活动列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getSeckillList(params) {
  return gatewayHttp.get('/seckill/activity/list', { params })
}

/**
 * 获取秒杀活动详情
 * @param {number} id - 活动ID
 * @returns {Promise}
 */
export function getSeckillDetail(id) {
  return gatewayHttp.get(`/seckill/activity/${id}`)
}

/**
 * 获取秒杀商品列表
 * @param {number} activityId - 活动ID
 * @returns {Promise}
 */
export function getSeckillProductList(activityId) {
  return gatewayHttp.get(`/seckill/product/list/${activityId}`)
}

/**
 * 参与秒杀
 * @param {Object} data - 秒杀数据
 * @param {number} data.activityId - 活动ID
 * @param {number} data.productId - 商品ID
 * @returns {Promise}
 */
export function participateSeckill(data) {
  return gatewayHttp.post('/seckill/participate', data)
}

/**
 * 获取我的秒杀订单
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMySeckillOrders(params) {
  return gatewayHttp.get('/seckill/order/my', { params })
}
