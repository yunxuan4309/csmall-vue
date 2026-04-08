import gatewayHttp from './request'

/**
 * 获取品牌列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getBrandList(params) {
  return gatewayHttp.get('/pms/brand/list', { params })
}

/**
 * 新增品牌
 * @param {Object} data - 品牌信息
 * @returns {Promise}
 */
export function addBrand(data) {
  return gatewayHttp.post('/pms/brand/add', data)
}

/**
 * 更新品牌
 * @param {number} id - 品牌ID
 * @param {Object} data - 品牌信息
 * @returns {Promise}
 */
export function updateBrand(id, data) {
  return gatewayHttp.put(`/pms/brand/update/${id}`, data)
}

/**
 * 删除品牌
 * @param {number} id - 品牌ID
 * @returns {Promise}
 */
export function deleteBrand(id) {
  return gatewayHttp.delete(`/pms/brand/delete/${id}`)
}
