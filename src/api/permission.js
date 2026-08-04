import gatewayHttp from './request'

/**
 * 获取权限列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getPermissionList(params) {
  return gatewayHttp.get('/ams/permission/list', { params })
}

/**
 * 新增权限
 * @param {Object} data - 权限信息
 * @returns {Promise}
 */
export function addPermission(data) {
  return gatewayHttp.post('/ams/permission/save', data)
}

/**
 * 更新权限
 * @param {Object} data - 权限信息（含 id）
 * @returns {Promise}
 */
export function updatePermission(data) {
  return gatewayHttp.post('/ams/permission/update', data)
}

/**
 * 删除权限
 * @param {number} id - 权限ID
 * @returns {Promise}
 */
export function deletePermission(id) {
  return gatewayHttp.post('/ams/permission/delete', null, { params: { id } })
}
