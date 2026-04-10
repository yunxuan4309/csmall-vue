import { frontHttp, gatewayHttp } from './request'

/**
 * 获取前台分类树（递归结构）
 * @returns {Promise} 返回 { categories: [] }
 */
export function getFrontCategoryTree() {
  return frontHttp.get('/front/category/all')
}

/**
 * 获取分类列表（后台管理用）
 * @param {number} parentId - 父分类ID，默认0表示根分类
 * @returns {Promise}
 */
export function getCategoryList(parentId = 0) {
  return gatewayHttp.get('/pms/categories/list/children', {
    params: { parentId }
  })
}

/**
 * 获取分类树
 * @returns {Promise}
 */
export function getCategoryTree() {
  return gatewayHttp.get('/pms/categories/tree')
}

/**
 * 新增分类
 * @param {Object} data - 分类信息
 * @returns {Promise}
 */
export function addCategory(data) {
  return gatewayHttp.post('/pms/categories/add/new', data)
}

/**
 * 更新分类
 * @param {number} id - 分类ID
 * @param {Object} data - 分类信息
 * @returns {Promise}
 */
export function updateCategory(id, data) {
  return gatewayHttp.put(`/pms/categories/update/${id}`, data)
}

/**
 * 删除分类
 * @param {number} id - 分类ID
 * @returns {Promise}
 */
export function deleteCategory(id) {
  return gatewayHttp.delete(`/pms/categories/delete/${id}`)
}
