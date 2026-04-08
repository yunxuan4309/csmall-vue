import gatewayHttp from './request'

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getRoleList(params) {
  return gatewayHttp.get('/role/list', { params })
}

/**
 * 获取角色详情
 * @param {number} id - 角色ID
 * @returns {Promise}
 */
export function getRoleDetail(id) {
  return gatewayHttp.get(`/role/${id}`)
}

/**
 * 新增角色
 * @param {Object} data - 角色信息
 * @returns {Promise}
 */
export function addRole(data) {
  return gatewayHttp.post('/role/add', data)
}

/**
 * 更新角色
 * @param {number} id - 角色ID
 * @param {Object} data - 角色信息
 * @returns {Promise}
 */
export function updateRole(id, data) {
  return gatewayHttp.put(`/role/update/${id}`, data)
}

/**
 * 删除角色
 * @param {number} id - 角色ID
 * @returns {Promise}
 */
export function deleteRole(id) {
  return gatewayHttp.delete(`/role/delete/${id}`)
}
