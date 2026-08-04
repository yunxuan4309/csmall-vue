import gatewayHttp from './request'

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getRoleList(params) {
  return gatewayHttp.get('/ams/role/list', { params })
}

/**
 * 新增角色
 * @param {Object} data - 角色信息
 * @returns {Promise}
 */
export function addRole(data) {
  return gatewayHttp.post('/ams/role/save', data)
}

/**
 * 更新角色
 * @param {Object} data - 角色信息（含 id）
 * @returns {Promise}
 */
export function updateRole(data) {
  return gatewayHttp.post('/ams/role/update', data)
}

/**
 * 删除角色
 * @param {number} id - 角色ID
 * @returns {Promise}
 */
export function deleteRole(id) {
  return gatewayHttp.post('/ams/role/delete', null, { params: { id } })
}
