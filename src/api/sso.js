import { ssoHttp, gatewayHttp } from './request'

/**
 * 管理员登录
 * @param {string} username - 用户名（4~16位字母数字，首字符必须为字母）
 * @param {string} password - 密码（4~16位可打印ASCII字符）
 * @returns {Promise} 返回 { tokenHeader, tokenValue }
 */
export function adminLogin(username, password) {
  return ssoHttp.post('/admin/sso/login', { username, password })
}

/**
 * 管理员登出
 * @returns {Promise}
 */
export function adminLogout() {
  return ssoHttp.post('/admin/sso/logout')
}

/**
 * 前台用户登录
 * @param {string} username - 用户名（4~16位字母数字，首字符必须为字母）
 * @param {string} password - 密码（4~16位可打印ASCII字符）
 * @returns {Promise} 返回 { tokenHeader, tokenValue }
 */
export function userLogin(username, password) {
  return ssoHttp.post('/user/sso/login', { username, password })
}

/**
 * 前台用户登出
 * @returns {Promise}
 */
export function userLogout() {
  return ssoHttp.post('/user/sso/logout')
}

/**
 * 获取当前登录用户信息
 * @returns {Promise} 返回 { userId, username, nickname, phone }
 */
export function getUserInfo() {
  return ssoHttp.get('/user/info/sso/')
}

/**
 * 获取管理员仪表盘数据
 * @returns {Promise} 返回 { todayNewUsers, totalUsers, todayOrders, todayRevenue, pendingOrders, weeklyTrend }
 */
export function getDashboard() {
  return ssoHttp.get('/admin/dashboard')
}

// ==================== 后台管理 AMS API ====================

/** 管理员列表（分页） */
export function getAdminList(params) {
  return gatewayHttp.get('/ams/admin', { params })
}

/** 搜索管理员 */
export function queryAdmins(params) {
  return gatewayHttp.get('/ams/admin/query', { params })
}

/** 删除管理员 */
export function deleteAdmin(id) {
  return gatewayHttp.post('/ams/admin/delete', null, { params: { id } })
}

/** 角色列表（分页） */
export function getRoleList(params) {
  return gatewayHttp.get('/ams/role/list', { params })
}

/** 权限列表（分页） */
export function getPermissionList(params) {
  return gatewayHttp.get('/ams/permission/list', { params })
}
