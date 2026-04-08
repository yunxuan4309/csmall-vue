import gatewayHttp from './request'

/**
 * 获取管理员列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 搜索关键词（可选）
 * @returns {Promise} 返回分页数据 { page, pageSize, totalPage, total, list }
 */
export function getAdminList(params) {
  return gatewayHttp.get('/admin/list', { params })
}

/**
 * 获取管理员详情
 * @param {number} id - 管理员ID
 * @returns {Promise}
 */
export function getAdminDetail(id) {
  return gatewayHttp.get(`/admin/${id}`)
}

/**
 * 新增管理员
 * @param {Object} data - 管理员信息
 * @returns {Promise}
 */
export function addAdmin(data) {
  return gatewayHttp.post('/admin/add', data)
}

/**
 * 更新管理员信息
 * @param {number} id - 管理员ID
 * @param {Object} data - 管理员信息
 * @returns {Promise}
 */
export function updateAdmin(id, data) {
  return gatewayHttp.put(`/admin/update/${id}`, data)
}

/**
 * 删除管理员
 * @param {number} id - 管理员ID
 * @returns {Promise}
 */
export function deleteAdmin(id) {
  return gatewayHttp.delete(`/admin/delete/${id}`)
}

/**
 * 批量删除管理员
 * @param {Array<number>} ids - 管理员ID数组
 * @returns {Promise}
 */
export function batchDeleteAdmin(ids) {
  return gatewayHttp.post('/admin/batch-delete', { ids })
}
