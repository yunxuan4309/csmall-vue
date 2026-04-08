import gatewayHttp from './request'

/**
 * 获取 SKU 列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getSkuList(params) {
  return gatewayHttp.get('/pms/sku/list', { params })
}

/**
 * 获取 SKU 详情
 * @param {number} id - SKU ID
 * @returns {Promise}
 */
export function getSkuDetail(id) {
  return gatewayHttp.get(`/pms/sku/${id}`)
}

/**
 * 根据 SPU ID 获取 SKU 列表
 * @param {number} spuId - SPU ID
 * @returns {Promise}
 */
export function getSkuBySpuId(spuId) {
  return gatewayHttp.get(`/pms/sku/spu/${spuId}`)
}

/**
 * 新增 SKU
 * @param {Object} data - SKU 信息
 * @returns {Promise}
 */
export function addSku(data) {
  return gatewayHttp.post('/pms/sku/add', data)
}

/**
 * 更新 SKU
 * @param {number} id - SKU ID
 * @param {Object} data - SKU 信息
 * @returns {Promise}
 */
export function updateSku(id, data) {
  return gatewayHttp.put(`/pms/sku/update/${id}`, data)
}

/**
 * 删除 SKU
 * @param {number} id - SKU ID
 * @returns {Promise}
 */
export function deleteSku(id) {
  return gatewayHttp.delete(`/pms/sku/delete/${id}`)
}

/**
 * 更新 SKU 库存
 * @param {number} id - SKU ID
 * @param {number} stock - 库存数量
 * @returns {Promise}
 */
export function updateSkuStock(id, stock) {
  return gatewayHttp.put(`/pms/sku/stock/${id}`, { stock })
}
