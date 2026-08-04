import gatewayHttp from './request'

/**
 * 获取 SKU 详情
 * @param {number} id - SKU ID
 * @returns {Promise}
 */
export function getSkuDetail(id) {
  return gatewayHttp.get(`/pms/sku/${id}`)
}

/**
 * 根据 SPU ID 获取 SKU 列表（分页）
 * @param {number} spuId - SPU ID
 * @param {Object} params - 查询参数 { page, pageSize }
 * @returns {Promise}
 */
export function getSkuBySpuId(spuId, params) {
  return gatewayHttp.get('/pms/sku', { params: { spuId, ...params } })
}

/**
 * 新增 SKU
 * @param {Object} data - SKU 信息
 * @returns {Promise}
 */
export function addSku(data) {
  return gatewayHttp.post('/pms/sku/addnew', data)
}

/**
 * 更新 SKU 完整信息
 * @param {number} id - SKU ID
 * @param {Object} data - SKU 信息
 * @returns {Promise}
 */
export function updateSku(id, data) {
  return gatewayHttp.post(`/pms/sku/${id}/update`, data)
}

/**
 * 删除 SKU
 * @param {number} id - SKU ID
 * @returns {Promise}
 */
export function deleteSku(id) {
  return gatewayHttp.post(`/pms/sku/${id}/delete`)
}

/**
 * 根据属性模板生成 SKU 组合（笛卡尔积）
 * @param {Object} data - { spuId, attributes: [{ attributeId, attributeName, values: [] }] }
 * @returns {Promise}
 */
export function generateSkus(data) {
  return gatewayHttp.post('/pms/sku/generate', data)
}
