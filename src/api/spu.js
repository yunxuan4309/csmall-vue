import gatewayHttp from './request'

/**
 * 获取 SPU 列表（分页）
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回分页数据
 */
export function getSpuList(params) {
  return gatewayHttp.get('/pms/spu/list', { params })
}

/**
 * 获取 SPU 详情
 * @param {number} id - SPU ID
 * @returns {Promise}
 */
export function getSpuDetail(id) {
  return gatewayHttp.get(`/pms/spu/${id}`)
}

/**
 * 新增 SPU
 * @param {Object} data - SPU 信息
 * @returns {Promise}
 */
export function addSpu(data) {
  return gatewayHttp.post('/pms/spu/add', data)
}

/**
 * 更新 SPU
 * @param {number} id - SPU ID
 * @param {Object} data - SPU 信息
 * @returns {Promise}
 */
export function updateSpu(id, data) {
  return gatewayHttp.put(`/pms/spu/update/${id}`, data)
}

/**
 * 删除 SPU
 * @param {number} id - SPU ID
 * @returns {Promise}
 */
export function deleteSpu(id) {
  return gatewayHttp.delete(`/pms/spu/delete/${id}`)
}

/**
 * 上架/下架 SPU
 * @param {number} id - SPU ID
 * @param {number} status - 状态：1上架 0下架
 * @returns {Promise}
 */
export function updateSpuStatus(id, status) {
  return gatewayHttp.put(`/pms/spu/status/${id}`, { status })
}
