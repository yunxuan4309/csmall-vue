import { seckillHttp, gatewayHttp } from './request'

// ==================== 前台秒杀接口 ====================

/**
 * 获取秒杀商品列表（分页）
 * @param {Object} params - 查询参数 { page, pageSize }
 * @returns {Promise} 返回分页数据
 */
export function getSeckillSpuList(params) {
  return seckillHttp.get('/seckill/spu/list', { params })
}

/**
 * 获取秒杀商品详情
 * @param {number} spuId - SPU ID
 * @returns {Promise}
 */
export function getSeckillSpuDetail(spuId) {
  return seckillHttp.get(`/seckill/spu/${spuId}`)
}

/**
 * 获取秒杀商品详情页（富文本）
 * @param {number} spuId - SPU ID
 * @returns {Promise}
 */
export function getSeckillSpuPageDetail(spuId) {
  return seckillHttp.get(`/seckill/spu/${spuId}/detail`)
}

/**
 * 获取秒杀SKU列表
 * @param {number} spuId - SPU ID
 * @returns {Promise}
 */
export function getSeckillSkuList(spuId) {
  return seckillHttp.get(`/seckill/sku/list/${spuId}`)
}

/**
 * 提交秒杀订单
 * @param {string} randCode - 随机码（从秒杀商品详情的 url 字段获取）
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export function submitSeckillOrder(randCode, data) {
  return seckillHttp.post(`/seckill/${randCode}`, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// ==================== 后台管理秒杀接口 ====================

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
