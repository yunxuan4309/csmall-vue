import gatewayHttp from './request'

/**
 * 获取权限列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getPermissionList(params) {
  return gatewayHttp.get('/permission/list', { params })
}

/**
 * 获取权限树
 * @returns {Promise}
 */
export function getPermissionTree() {
  return gatewayHttp.get('/permission/tree')
}

/**
 * 新增权限
 * @param {Object} data - 权限信息
 * @returns {Promise}
 */
export function addPermission(data) {
  return gatewayHttp.post('/permission/add', data)
}

/**
 * 更新权限
 * @param {number} id - 权限ID
 * @param {Object} data - 权限信息
 * @returns {Promise}
 */
export function updatePermission(id, data) {
  return gatewayHttp.put(`/permission/update/${id}`, data)
}

/**
 * 删除权限
 * @param {number} id - 权限ID
 * @returns {Promise}
 */
export function deletePermission(id) {
  return gatewayHttp.delete(`/permission/delete/${id}`)
}
